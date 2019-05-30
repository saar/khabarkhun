const { checkHeaders, readURL, requestTTL } = require('../utils/networkUtils');
const { sleep } = require('../utils');

const Mercury = require('@postlight/mercury-parser');

const logger = require('../utils/logger');

async function parseContent(
	url, ttl = requestTTL, retries = 2, backoffDelay = 100) {
	logger.debug(
		`Parse Article Content: ttl=${ttl}, retries=${retries}, backoffDelay=${backoffDelay} `);
	Mercury.addExtractor(require('./extractors/www.varzesh3.com'));
	Mercury.addExtractor(require('./extractors/www.yjc.ir'));
	Mercury.addExtractor(require('./extractors/www.tasnimnews.com'));
	Mercury.addExtractor(require('./extractors/www.isna.ir'));
	const html = await fetchHtml(url, ttl, retries, backoffDelay);

	let result = await Mercury.parse(url, {
		html, fallback: false,
	});
	return result;
}

async function fetchHtml(
	url, ttl = requestTTL, retries = 2, backoffDelay = 100) {
	return await Promise.race([
		new Promise((resolve, reject) =>
			setTimeout(reject, 2 * ttl, new Error('Request timed out')),
		), new Promise(async (resolve, reject) => {
			let chunks = [];
			let stream = await getConnectionStream(url, retries, backoffDelay);
			stream.on('data', chunk => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		})]);
}

// Read the given feed URL and return a Stream
async function getConnectionStream(url, retries = 2, backoffDelay = 100) {
	let currentDelay = 0,
		nextDelay = backoffDelay;
	for (; ;) {
		try {
			await sleep(currentDelay);
			return await checkHeaders(readURL(url), url, true);
		} catch (err) {
			logger.warn(
				`Failed to read url ${url}: ${err.message}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

module.exports.parseContent = parseContent;
