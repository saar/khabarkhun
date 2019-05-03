const moment = require('moment');
const mongoose = require('mongoose');

const RSS = require('../components/rss');
const logger = require('../utils/logger');

const { weightedRandom } = require('../utils/random');

const { RssQueueAdd } = require('../task/asyncTasks');
const { isURL } = require('../utils/validation');
const { startSampling } = require('../utils/watchdog');
const { tryAddToQueueFlagSet, getQueueFlagSetMembers } = require(
	'../utils/queue');

const conductorInterval = 60;
const popularScrapeInterval = 2;
const defaultScrapeInterval = 25;

let timeout;

require('../utils/db');

function forever() {
	conduct().then(() => {
		logger.info('Conductor iteration completed...');
	}).catch((err) => {
		logger.error('Conductor broke down', { err });
	});
	timeout = setTimeout(forever, conductorInterval * 1000);
}

if (require.main === module) {
	logger.info(
		`Starting the conductor... will conduct every ${conductorInterval} seconds`,
	);

	forever();

	startSampling('khabarkhun.event_loop.conductor.delay');
}

async function getPublications(
	schema,
	interval,
	limit,
) {
	const busy = await getQueueFlagSetMembers('rss');
	const ids = busy.map((v) => v.split(':')[0]);
	const time = moment().subtract(interval, 'minutes').toDate();

	return await schema.find({
		_id: { $nin: ids },
		valid: true,
		duplicateOf: { $exists: false },
		lastScraped: { $lte: time },
		consecutiveScrapeFailures: { $lt: weightedRandom() },
	}).limit(limit);
}

async function conduct() {
	const publicationOptions = { removeOnComplete: true, removeOnFail: true };
	const type = 'rss';

	const total = await RSS.count();
	const scrapeInterval =
		total < 1000 ? popularScrapeInterval : defaultScrapeInterval;
	// never schedule more than 1/15 per minute interval
	const maxToSchedule = Math.max(1, Math.floor(total / 15));
	logger.info(
		`conductor will schedule at most ${maxToSchedule} of type ${type} ` +
		`to scrape per ${conductorInterval} seconds`,
	);
	// find the publications that we need to update
	const limit = Math.max(1, maxToSchedule / 2);
	const publications = await getPublications(
		RSS,
		scrapeInterval,
		limit,
	);
	logger.info(
		`found ${publications.length} publications of type ${type} that ` +
		`we scrape every ${scrapeInterval} minutes`,
	);
	const updated = await Promise.all(
		publications.map((p) => tryAddToQueueFlagSet(type, type, p._id)),
	);
	logger.info(
		`marked ${ updated.filter(
			(u) => !!u).length } of type ${type} publications as isParsing`);
	logger.info(
		`conductor found ${publications.length} of type ${type} to scrape`);
	const validPublications = publications.filter((p) => isURL(p.feedUrl));
	await Promise.all(
		validPublications.map((publication) => {
			const job = {
				[type]: publication._id,
				url: publication.feedUrl,
			};
			return RssQueueAdd(job, publicationOptions);
		}),
	);
	logger.info(
		`Processing complete! Will try again in ${conductorInterval} seconds...`,
	);
}

function shutdown(signal) {
	logger.info(`Received ${signal}. Shutting down.`);
	try {
		clearTimeout(timeout);
		mongoose.connection.close();
	} catch (err) {
		logger.error(
			`Failure during Conductor worker shutdown: ${err.message}`);
		process.exit(1);
	}
	process.exit(0);
}

function failure(reason, err) {
	logger.error(
		`Unhandled ${reason}: ${err.stack}. Shutting down Conductor worker.`);
	try {
		clearTimeout(timeout);
		mongoose.connection.close();
	} catch (err) {
		logger.error(
			`Failure during Conductor worker shutdown: ${err.message}`);
	}
	process.exit(1);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', failure.bind(null, 'promise rejection'));
process.on('uncaughtException', failure.bind(null, 'exception'));

module.exports.conduct = conduct;