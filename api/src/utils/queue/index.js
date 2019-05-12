const Redis = require('ioredis');

const config = require('../../../config');
const logger = require('../logger');

const redis = new Redis(config.cache.uri);

const TTL = 3600; // 1 hour in seconds

redis.defineCommand('getQueueFlagSetMembers', {
	numberOfKeys: 1,
	lua: `
		local set = KEYS[1]

		redis.replicate_commands()

		local time = redis.call('TIME')
		local now = tonumber(time[1])

		redis.call('ZREMRANGEBYSCORE', set, 0, now)
		return redis.call('ZRANGE', set, 0, -1)
	`,
});

redis.defineCommand('tryAddToQueueFlagSet', {
	numberOfKeys: 1,
	lua: `
		local key = ARGV[1]
		local TTL = ARGV[2]
		local set = KEYS[1]

		redis.replicate_commands()

		local time = redis.call('TIME')
		local now = tonumber(time[1])

		local exists = redis.call('ZSCORE', set, key)
		if not exists then
			return redis.call('ZADD', set, now + TTL, key)
		end
		return nil
	`,
});

redis.defineCommand('tryCreateQueueFlag', {
	numberOfKeys: 1,
	lua: `
		local key = KEYS[1]
		local TTL = ARGV[1]

		redis.replicate_commands()

		local exists = redis.call('EXISTS', key)
		if exists == 0 then
			return redis.call('SETEX', key, TTL, 1)
		end
		return nil
	`,
});

async function tryAddToQueueFlagSet(queueName, suffix, id, ttl = TTL) {
	const key = `queue-status:${queueName}`;
	const value = `${id}:${suffix}`;
	const created = await redis.tryAddToQueueFlagSet(key, value, ttl);
	return !!created;
}

async function removeFromQueueFlagSet(queueName, suffix, id) {
	const key = `queue-status:${queueName}`;
	const value = `${id}:${suffix}`;

	logger.debug(`remove from queue ${key} ${value}`);
	return await redis.zrem(key, value);
}

async function getQueueFlagSetMembers(queueName) {
	const key = `queue-status:${queueName}`;
	return await redis.getQueueFlagSetMembers(key);
}

async function tryCreateQueueFlag(queueName, suffix, id, ttl = TTL) {
	const key = `queue-status:${queueName}:${id}:${suffix}`;
	const created = await redis.tryCreateQueueFlag(key, ttl);
	return !!created;
}

async function removeQueueFlag(queueName, suffix, id) {
	const key = `queue-status:${queueName}:${id}:${suffix}`;
	return await redis.del(key);
}

module.exports.tryAddToQueueFlagSet = tryAddToQueueFlagSet;
module.exports.removeFromQueueFlagSet = removeFromQueueFlagSet;
module.exports.getQueueFlagSetMembers = getQueueFlagSetMembers;
module.exports.tryCreateQueueFlag = tryCreateQueueFlag;
module.exports.removeQueueFlag = removeQueueFlag;