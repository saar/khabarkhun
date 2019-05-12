const config = require('../../config');
const logger = require('../utils/logger');

const Queue = require('bull');
const { getStatsDClient } = require('../utils/statsd');

const rssQueue = new Queue('rss', config.cache.uri, {
	settings: {
		lockDuration: 90000,
		stalledInterval: 75000,
		maxStalledCount: 2,
	},
});

function makeMetricKey(queue, event) {
	return ['khabarkhun', 'bull', queue.name, event].join('.');
}

async function trackQueueSize(statsd, queue) {
	let queueStatus = await queue.getJobCounts();
	statsd.gauge(makeMetricKey(queue, 'waiting'), queueStatus.waiting);
	statsd.gauge(makeMetricKey(queue, 'active'), queueStatus.active);
}

function AddQueueTracking(queue) {
	const statsD = getStatsDClient();

	queue.on('error', function(err) {
		statsD.increment(makeMetricKey(queue, 'error'));
		logger.warn(
			`Queue ${queue.name} encountered an unexpected error: ${err.message}`,
		);
	});

	queue.on('active', function() {
		statsD.increment(makeMetricKey(queue, 'active'));
	});

	queue.on('completed', function(job) {
		statsD.timing(makeMetricKey(queue, 'elapsed'), new Date() -
			job.timestamp);
		statsD.increment(makeMetricKey(queue, 'completed'));
	});

	queue.on('stalled', function(job) {
		statsD.increment(makeMetricKey(queue, 'stalled'));
		logger.warn(
			`Queue ${queue.name} job stalled: '${JSON.stringify(job)}'`);
	});

	queue.on('failed', function(job, err) {
		statsD.increment(makeMetricKey(queue, 'failed'));
		logger.warn(
			`Queue ${queue.name} failed to process job '${JSON.stringify(
				job)}': ${ err.message }`);
	});

	queue.on('paused', function() {
		statsD.increment(makeMetricKey(queue, 'paused'));
	});

	queue.on('resumed', function() {
		statsD.increment(makeMetricKey(queue, 'resumed'));
	});

	setInterval(trackQueueSize, 30000, statsD, queue);
}

const currentEnvironment = process.env.NODE_ENV || 'development';
if (currentEnvironment !== 'test') {
	AddQueueTracking(rssQueue);
}

const RssQueueAdd = rssQueue.add.bind(rssQueue);

function ProcessRssQueue() {
	getStatsDClient().increment(makeMetricKey(rssQueue, 'started'));
	return rssQueue.process(...arguments);
}

function ShutDownRssQueue() {
	getStatsDClient().increment(makeMetricKey(rssQueue, 'stopped'));
	return rssQueue.close(...arguments);
}

module.exports.rssQueue = rssQueue;
module.exports.RssQueueAdd = RssQueueAdd;
module.exports.ProcessRssQueue = ProcessRssQueue;
module.exports.ShutDownRssQueue = ShutDownRssQueue;