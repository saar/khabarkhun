const winston = require('winston');

const { join } = require('path');

const { inspect } = require('util');

require('winston-daily-rotate-file');
const config = require('../../../config');

const { format } = winston;

function isError(e) {
	return e && e.stack && e.message;
}

const warnAboutWinston = format((info) => {
	if (isError(info)) {
		console.log(
			'You should use logger.error(err). Please use logger.error({err}) instead.',
		);
		return false;
	}
	return info;
});
const sillyWinstonConsoleFormatter = format.printf((info) => {
	let message = info.message;
	if (isError(message)) {
		message = `${message.stack}`;
	} else if (isError(info.err)) {
		message = `${message} ${info.err.stack}`;
	} else if (message && isError(message.err)) {
		message = `${message} ${message.err.stack}`;
	}
	const meta = info.meta !== undefined
		? inspect(info.meta, { depth: null })
		: '';
	return `[${info.timestamp}] ${info.level}: ${message} ${meta}`;
});
// Ignore log messages if they have { private: true }
const ignorePrivate = format((info, opts) => {
	if (info.private) {
		return false;
	}
	return info;
});

const logger = winston.createLogger({
	level: config.logger.level,
	format: format.combine(
		ignorePrivate(),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SS' }),
		winston.format.prettyPrint(),
		// winston.format.colorize({ all: true }),
		warnAboutWinston(),
		// winston.format.align(),

		// betterWinstonConsoleFormatter(),
	),
	transports: [new winston.transports.Console(),
	],
});
logger.add(new (winston.transports.DailyRotateFile)({
	filename: join(__dirname, '../../../../log/application-%DATE%.log'),
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d',
}));


module.exports = exports = logger;