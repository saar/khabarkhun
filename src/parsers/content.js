const Mercury = require('@postlight/mercury-parser');
const axios = require('axios');

async function parseContent(url) {

	Mercury.addExtractor(require('./extractors/www.varzesh3.com'));

	url = await fetchData(url);

	return await Mercury.parse(url);
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

module.exports.parseContent = parseContent;
