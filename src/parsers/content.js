const Mercury = require('@postlight/mercury-parser');
async function parseContent(url) {

	return await Mercury.parse(url);
}
module.exports.parseContent = parseContent;
