const { ProcessArticleQueue, ShutDownArticleQueue } = require(
	'../task/asyncTasks');
const { removeFromQueueFlagSet } = require('../utils/queue');

const logger = require('../utils/logger');
const mongoose = require('mongoose');
const timeIt = require('../utils/statsd').timeIt;
const { ensureEncoded } = require('../utils/networkUtils');
const { getStatsDClient } = require('../utils/statsd');

const joi = require('joi');
const moment = require('moment');
const { EventEmitter } = require('events');

const Article = require('../components/article/article');

const { startSampling } = require('../utils/watchdog');
const statsD = getStatsDClient();

require('../utils/db');

if (require.main === module) {
	EventEmitter.defaultMaxListeners = 128;

	logger.info('Starting the Article worker');
	ProcessArticleQueue(35, articleProcessor);

	startSampling('khabarkhun.event_loop.article.delay');
}

async function articleProcessor(job) {
	logger.info(`Processing ${job.data.article}`);
	try {
		await handleArticle(job);
	} catch (err) {
		let tags = { queue: 'article' };
		let extra = {
			JobArticle: job.data.article,
		};

		logger.error('Article job encountered an error', { err, tags, extra });
		statsD.increment('khabarkhun.handle_article.result.error');
	}

	logger.info(`Completed scraping for ${job.data.article}`);

}

const joiObjectId = joi.alternatives().try(
	joi.string().length(12),
	joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/),
);

const schema = joi.object().keys({
	article: joiObjectId.required(),
});

async function handleArticle(job) {

	const articleID = job.data.article;

	const validation = joi.validate(job.data, schema);

	if (validation.error) {
		logger.warn(
			`Article job validation failed: ${validation.error.message} for '${JSON.stringify(
				job.data,
			)}'`,
		);
		statsD.increment('khabarkhun.handle_article.result.validation_failed');
		await Article.incrScrapeFailures(articleID);
		return;
	}

	const article = await timeIt('khabarkhun.handle_article.get_article',
		() => {
			logger.debug(`Fetching article with ID ${articleID}`);
			return Article.findOne({ _id: articleID });
		});

	if (!article) {
		logger.warn(`Article with ID ${articleID} does not exist`);
		statsD.increment(
			'khabarkhun.handle_article.result.model_instance_absent');
		return;
	}

	await timeIt('khabarkhun.handle_article.ack', () => {
		return markDone(articleID);
	});

	logger.info(`Marked ${articleID} as done`);
	let articleContent;
	try {
		logger.info(`Attempting to parse Article with ID  ${article._id}`);
		// articleContent = await

		const start = new Date();
		articleContent = await article.getParsedArticle();

		statsD.timing(
			'khabarkhun.parsers.article.finished_parsing', new Date() -
			start);

		await Article.resetScrapeFailures(articleID);
	} catch (err) {
		await Article.incrScrapeFailures(articleID);
		logger.warn(
			`Scraped failed for Article with ID ${job.data.article}: ${err.message}`);
	}

	if (!articleContent || !articleContent.content) {
		logger.debug(`Article's content with ID ${articleID} is empty`);
		statsD.increment('khabarkhun.handle_article.result.no_content');

		return;
	}

	logger.debug(
		`Starting the upsertManyPosts for Article with ID ${articleID}`);

	statsD.increment('khabarkhun.handle_article.result.updates');
}

async function markDone(articleID) {
	await removeFromQueueFlagSet('article', 'article', articleID);
	return await Article.update({ _id: articleID },
		{ lastScraped: moment().toISOString() });
}

async function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		await ShutDownArticleQueue();
		mongoose.connection.close();
	} catch (err) {
		logger.error(`Failure during Article worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

async function failure(source, err) {
	logger.error(
		`Unhandled ${source}: ${err.stack}. Shutting down Article worker.`);
	try {
		await ShutDownArticleQueue();
		mongoose.connection.close();
		statsD.increment('khabarkhun.handle_article.result.error');
	} catch (err) {
		logger.error(`Failure during Article worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));

module.exports.handleArticle = handleArticle;
module.exports.articleProcessor = articleProcessor;
