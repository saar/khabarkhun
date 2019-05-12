const { sleep } = require('../utils');
const { ProcessRssQueue, ShutDownRssQueue } = require('../task/asyncTasks');
const { removeFromQueueFlagSet } = require('../utils/queue');

const logger = require('../utils/logger');
const mongoose = require('mongoose');
const timeIt = require('../utils/statsd').timeIt;
const { ensureEncoded } = require('../utils/networkUtils');
const { getStatsDClient } = require('../utils/statsd');

const joi = require('joi');
const moment = require('moment');
const { EventEmitter } = require('events');

const RSS = require('../components/rss');
const Article = require('../components/article/article');
const { parseFeed, checkGuidStability, createFingerPrints } = require(
	'../services/rss');

const { startSampling } = require('../utils/watchdog');
const { upsertManyPosts } = require('../utils/upsert');

const statsD = getStatsDClient();
const secondaryCheckDelay = 240000; // 4 minutes

require('../utils/db');

if (require.main === module) {
	EventEmitter.defaultMaxListeners = 128;

	logger.info('Starting the RSS worker');
	ProcessRssQueue(35, rssProcessor);

	startSampling('khabarkhun.event_loop.rss.delay');
}

async function rssProcessor(job) {
	logger.info(`Processing ${job.data.url}`);
	try {
		await handleRSS(job);
	} catch (err) {
		let tags = { queue: 'rss' };
		let extra = {
			JobRSS: job.data.rss,
			JobURL: job.data.url,
		};

		logger.error('RSS job encountered an error', { err, tags, extra });
		statsD.increment('khabarkhun.handle_rss.result.error');
	}

	logger.info(`Completed scraping for ${job.data.url}`);

}

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/),
);
const joiUrl = joi.string().
	uri({ scheme: ['http', 'https'], allowQuerySquareBrackets: true });

const schema = joi.object().keys({
	rss: joiObjectId.required(),
	url: joiUrl.required(),
});

async function handleRSS(job) {
	try {
		// best effort at escaping urls found in the wild
		job.data.url = ensureEncoded(job.data.url);
	} catch (_) {
		/*ignored*/
	}

	const rssID = job.data.rss;

	const validation = joi.validate(job.data, schema);

	if (validation.error) {
		logger.warn(
			`RSS job validation failed: ${validation.error.message} for '${JSON.stringify(
				job.data,
			)}'`,
		);
		statsD.increment('khabarkhun.handle_rss.result.validation_failed');
		await RSS.incrScrapeFailures(rssID);
		return;
	}

	const rss = await timeIt('khabarkhun.handle_rss.get_rss', () => {
		return RSS.findOne({ _id: rssID });

	});

	if (!rss) {
		logger.warn(`RSS with ID ${rssID} does not exist`);
		statsD.increment('khabarkhun.handle_rss.result.model_instance_absent');
		return;
	}

	if (rss.duplicateOf) {
		logger.warn(
			`RSS with ID ${rssID} is a duplicate of ${rss.duplicateOf}. Skipping`,
		);
		statsD.increment(
			'khabarkhun.handle_rss.result.model_instance_duplicate');
		return;
	}

	await timeIt('khabarkhun.handle_rss.ack', () => {
		return markDone(rssID);
	});

	logger.info(`Marked ${rssID} as done`);

	let rssContent, guidStability;
	try {
		rssContent = await parseFeed(job.data.url, rss.guidStability);
		if (!rss.guidStability || rss.guidStability === 'UNCHECKED') {
			//XXX: waiting a bit to increase the chances of catching time-dependent GUIDs
			await sleep(secondaryCheckDelay);
			const controlRssContent = await parseFeed(job.data.url,
				rss.guidStability);
			guidStability = checkGuidStability(
				rssContent.articles,
				controlRssContent.articles,
			);
			rssContent.articles = createFingerPrints(rssContent.articles,
				guidStability);
		}
		await RSS.resetScrapeFailures(rssID);
	} catch (err) {
		await RSS.incrScrapeFailures(rssID);
		logger.warn(
			`HTTP request failed for url ${job.data.url}: ${err.message}`);
	}

	if (!rssContent || rssContent.articles.length === 0) {
		logger.debug(`RSS with ID ${rssID} is empty`);
		statsD.increment('khabarkhun.handle_rss.result.no_content');

		if (rss.guidStability !== guidStability) {
			await RSS.update(
				{ _id: rssID },
				{
					guidStability: guidStability || rss.guidStability,
				},
			);
		}
		return;
	}

	if (rssContent.fingerprint && rssContent.fingerprint === rss.fingerprint) {
		logger.debug(
			`RSS with ID ${rssID} has same fingerprint as registered before`);
		statsD.increment('khabarkhun.handle_rss.result.same_content');

		if (rss.guidStability !== guidStability) {
			await RSS.update(
				{ _id: rssID },
				{
					guidStability: guidStability || rss.guidStability,
				},
			);
		}
		return;
	}

	logger.debug(
		`Updating ${rssContent.articles.length} articles for feed ${rssID}`);

	statsD.increment('khabarkhun.handle_rss.articles.parsed',
		rssContent.articles.length);

	for (const article of rssContent.articles) {
		article.rss = rssID;
	}

	logger.debug(`Starting the upsertManyPosts for RSS with ID ${rssID}`);
	const operationMap = await upsertManyPosts(rssID, rssContent.articles,
		'rss');
	const updatedArticles = operationMap.new.concat(operationMap.changed).
		filter((a) => !!a.url);
	logger.info(
		`Finished updating. ${updatedArticles.length} out of ${ rssContent.articles.length } changed for RSS with ID ${rssID}`,
	);

	await RSS.update(
		{ _id: rssID },
		{
			postCount: await Article.count({ rss: rssID }),
			fingerprint: rssContent.fingerprint,
			guidStability: guidStability || rss.guidStability,
		},
	);

	statsD.increment('khabarkhun.handle_rss.articles.upserted',
		updatedArticles.length);

	if (!updatedArticles.length) {
		statsD.increment('khabarkhun.handle_rss.result.no_updates');
		return;
	}

	statsD.increment('khabarkhun.handle_rss.result.updates');
}

async function markDone(rssID) {
	await removeFromQueueFlagSet('rss', 'rss', rssID);
	return await RSS.update({ _id: rssID },
		{ lastScraped: moment().toISOString() });
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownRssQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during RSS worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

async function failure(source, err) {
	logger.error(
		`Unhandled ${source}: ${err.stack}. Shutting down RSS worker.`);
	try {
		await ShutDownRssQueue();
		mongoose.connection.close();
		statsD.increment('khabarkhun.handle_rss.result.error');
	} catch (err) {
		logger.error(`Failure during RSS worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));

module.exports.handleRSS = handleRSS;
module.exports.rssProcessor = rssProcessor;
