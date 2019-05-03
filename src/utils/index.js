function sleep(time) {
	if (time <= 0) {
		return Promise.resolve();
	}
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports.sleep = sleep;