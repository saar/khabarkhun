const normalizeUrl = require('normalize-url');
const validator = require('validator');
const logger = require('../logger');

function isURL(url) {
	if (!url) {
		return false;
	}
	if (typeof url !== 'string') {
		return false;
	}
	if (url.indexOf('newsletter:') === 0) {
		return false;
	}
	// make sure that mysubdomain-.google.com works and myurl.com/?q=hello world also works
	let variations = [url, url.replace(' ', '+'), url.replace('-.', '-a.')];
	try {
		variations.push(normalizeUrl(url));
	} catch (e) {
		logger.info(`normalization failed for url ${url}`);
	}
	return variations.some((v) => {
		return validator.isURL(v, {
			allow_underscores: true,
			allow_trailing_dot: true,
		});
	});
}

module.exports.isURL = isURL;