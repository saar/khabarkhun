const { getStatsDClient } = require('../statsd');

const defaultSampleInterval = 60;

function startSampling(
	metricName, sampleInterval = defaultSampleInterval) {
	const statsD = getStatsDClient();

	function updateMetric(diff) {
		const elapsed = diff[0] * 1000 + diff[1] / 1000000 - sampleInterval;
		statsD.timing(metricName, elapsed);
	}

	function loop() {
		let time = process.hrtime();

		setTimeout(() => {
			const diff = process.hrtime(time);

			//XXX: scheduling statsD metric update to avoid disrupting measuring loop
			process.nextTick(() => updateMetric(diff));

			time = process.hrtime();

			loop();
		}, sampleInterval);
	}

	loop();
}

module.exports.startSampling = startSampling;