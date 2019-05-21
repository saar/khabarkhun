function sleep(time) {
	if (time <= 0) {
		return Promise.resolve();
	}
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports.convertNumbersToEnglish = (string) => {
	return string.replace(/[\u0660-\u0669]/g, function(c) {
		return c.charCodeAt(0) - 0x0660;
	}).replace(/[\u06f0-\u06f9]/g, function(c) {
		return c.charCodeAt(0) - 0x06f0;
	});
};
module.exports.convertLettersToPersian = (string) => {
	return string
	.replace(/\u064A/g, '\u06CC')
	.replace(/\u0643/g, '\u06A9')

};
module.exports.sleep = sleep;