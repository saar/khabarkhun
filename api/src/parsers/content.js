const { checkHeaders, readURL, requestTTL } = require('../utils/networkUtils');
const { sleep } = require('../utils');

const Mercury = require('@postlight/mercury-parser');
const axios = require('axios');

const logger = require('../utils/logger');

async function parseContent(url) {

	Mercury.addExtractor(require('./extractors/www.varzesh3.com'));
	Mercury.addExtractor(require('./extractors/www.yjc.ir'));
	Mercury.addExtractor(require('./extractors/www.tasnimnews.com'));
	const html = await fetchHtml(url);

	return await Mercury.parse(url, {
		html, fallback: false,
	});
}

async function fetchData(url, redirectCount = 0, maxRedirects = 5) {
	let uri = new URL(url);
	try {
		let result = await axios.head(uri.toString(), { maxRedirects: 0 });
		return url.toString();
	} catch (e) {
		if (redirectCount < maxRedirects &&
			e.response &&
			e.response.status % 300 < 100) {/*follow redirects*/
			try {
				let redirectUrl = new URL(e.response.headers.location);
				return await fetchData(redirectUrl, redirectCount + 1);
			} catch (urlException) {
				uri.pathname = e.response.headers.location;
				return await fetchData(uri.toString(), redirectCount + 1);
			}
		}
	}
}

async function fetchHtml(url) {
	return await Promise.race([
		new Promise((resolve, reject) =>
			setTimeout(reject, 2 * requestTTL, new Error('Request timed out')),
		), new Promise(async (resolve, reject) => {
			let chunks = [];
			let stream = await getConnectionStream(url);
			stream.on('data', chunk => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks).toString()));
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
