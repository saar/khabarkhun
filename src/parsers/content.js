const Mercury = require('@postlight/mercury-parser');

async function parseContent(url) {

	Mercury.addExtractor(require('./extractors/www.varzesh3.com'));

	return await Mercury.parse(url);
}

module.exports.parseContent = parseContent;
