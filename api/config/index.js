const dotenv = require('dotenv');
const path = require('path');

const configs = {
	development: { config: 'dev' },
	production: { config: 'prod' },
	test: { config: 'test' },
};

const currentEnvironment = process.env.NODE_ENV || 'development';

const envPath = path.resolve(__dirname, '..', configs[currentEnvironment]?`.env.${configs[currentEnvironment].config}`:'.env');


console.log(`Loading .env from '${envPath}'`);
dotenv.config({ path: envPath });

const _default = {
	product: {
		url: process.env.PRODUCT_URL,
		name: process.env.PRODUCT_NAME,
		author: process.env.PRODUCT_AUTHOR,
	},
	server: {
		port: process.env.API_PORT,
	},
	database: {
		uri: process.env.DATABASE_URI,
	},
	cache: {
		uri: process.env.CACHE_URI,
	},
	logger: {
		level: process.env.LOGGER_LEVEL || 'warn',
		host: process.env.LOGGER_HOST,
		port: process.env.LOGGER_PORT,
	},
	url: process.env.BASE_URL,

	statsd: {
		host: process.env.STATSD_HOST || 'localhost',
		port: process.env.STATSD_PORT || 8125,
		prefix: process.env.STATSD_PREFIX || '',
	},
	social: {
		reddit: {
			username: process.env.REDDIT_USERNAME,
			password: process.env.REDDIT_PASSWORD,
			key: process.env.REDDIT_APP_ID,
			secret: process.env.REDDIT_APP_SECRET,
		},
	},
};

const config = require(`./${configs[currentEnvironment].config}`);

module.exports = Object.assign({ env: currentEnvironment }, _default, config);
