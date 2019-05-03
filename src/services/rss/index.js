const { sleep } = require('../../utils');

const { getStatsDClient } = require('../../utils/statsd');

const { checkHeaders, readURL, requestTTL } = require(
	'../../utils/networkUtils');

const logger = require('../../utils/logger');
const FeedParser = require('feedparser');
const urlParser = require('url');
const { createHash } = require('crypto');

const strip = require('strip');
const normalize = require('normalize-url');
const sanitizeHtml = require('sanitize-html');
const entities = require('entities');
const moment = require('moment');
const Article = require('../../components/article/article');

const statsD = getStatsDClient();

async function parseFeed(feedURL, guidStability, limit = 1000) {
	logger.info(`Attempting to parse RSS ${feedURL}`);
	const start = new Date();
	const host = urlParser.parse(feedURL).host;

	const stream = await readFeedURL(feedURL);
	const posts = await readFeedStream(stream);
	const feedResponse = parseFeedPosts(host, posts, guidStability, limit);

	statsD.timing('khabarkhun.parsers.rss.finished_parsing', new Date() - start);
	return feedResponse;
}

// Read the given feed URL and return a Stream
async function readFeedURL(feedURL, retries = 2, backoffDelay = 100) {
	let currentDelay = 0,
		nextDelay = backoffDelay;
	for (; ;) {
		try {
			await sleep(currentDelay);
			return await checkHeaders(readURL(feedURL), feedURL);
		} catch (err) {
			logger.warn(
				`Failed to read feed url ${feedURL}: ${err.message}. Retrying`);
			--retries;
			[currentDelay, nextDelay] = [nextDelay, currentDelay + nextDelay];
			if (!retries) {
				throw err;
			}
		}
	}
}

// Turn the feed Stream into a list of posts
function readFeedStream(feedStream) {
	return Promise.race([
		new Promise((resolve, reject) =>
			setTimeout(reject, 2 * requestTTL, new Error('Request timed out')),
		),
		new Promise((resolve, reject) => {
			const posts = [];
			const parser = new FeedParser();
			let resolved = false;

			feedStream.on('error', (err) => {
				if (!resolved) {
					reject(err);
				}
				feedStream.destroy();
			});

			parser.on('data', (data) => posts.push(data)).on('end', () => {
				resolved = true;
				resolve(posts);
			}).on('error', (err) => {
				if (!resolved) {
					reject(err);
				}
				parser.destroy();
			});

			feedStream.pipe(parser);
		}),
	]);
}

// Parse the posts and add our custom logic
function parseFeedPosts(domain, posts, guidStability, limit = 1000) {
	let feedContents = { articles: [] };
	// create finger prints before doing anything else
	posts = createFingerPrints(posts, guidStability);

	for (let i in posts.slice(0, limit)) {
		const post = posts[i];

		let article;
		let url = post.link;

		try {
			if (!url) {
				logger.info('skipping article since there is no url');
				continue;
			}
			const title = strip(entities.decodeHTML(post.title));
			if (!title) {
				logger.info('skipping article since there is no title');
				continue;
			}
			let description = strip(entities.decodeHTML(post.description)).
				substring(
					0,
					280,
				);
			if (description === 'null') {
				description = null;
			}
			if (!urlParser.parse(url).host) {
				url = url.resolve(domain, url);
			}
			url = normalize(url);
			// articles need to have a title
			// ensure we keep order for feeds with no time
			const time =
				moment(post.pubdate).toISOString() ||
				moment().subtract(i, 'minutes').toISOString();
			const content = sanitize(post.summary);
			article = new Article({
				content: content,
				description: description,
				enclosures: post.enclosures,
				fingerprint: post.fingerprint,
				guid: post.guid,
				link: post.link,
				publicationDate: time,
				title: title,
				url: url,
			});
		} catch (err) {
			logger.info('skipping article', { err });
			continue;
		}

		if (post['yt:videoid']) {
			let youtubeID = post['yt:videoid']['#'];
			article.enclosures.push({
				type: 'youtube',
				url: `https://www.youtube.com/watch?v=${youtubeID}`,
			});
			if (post['media:group'] && !article.description) {
				article.description = post['media:group']['media:description']['#'];
			}
		}

		// HNEWS
		if (post.comments) {
			article.commentUrl = post.comments;
		}

		if (post.link) {
			// product hunt comments url
			if (post.link.startsWith('https://www.producthunt.com')) {
				const matches = post.description.match(
					/(https:\/\/www.producthunt.com\/posts\/.*)"/,
				);
				if (matches && matches.length) {
					article.commentUrl = matches[1];
				}
			}

		}

		feedContents.articles.push(article);
	}
	if (posts.length) {
		let meta = posts[0].meta;
		feedContents.title = meta.title;
		feedContents.link = meta.link;
		feedContents.image = meta.image;
		feedContents.description = meta.description;
		feedContents.fingerprint = meta.fingerprint;

		if (meta.link && meta.link.includes('reddit.com')) {
			feedContents.title = `/r/${feedContents.title}`;
		}
	}
	return feedContents;
}

function createFingerPrints(posts, guidStability) {
	if (!posts.length) {
		return posts;
	}
	// start by selecting the best strategy for uniqueness
	let uniqueness = { guid: {}, link: {}, enclosure: {}, hash: {} };
	for (let p of posts) {
		uniqueness.guid[p.guid && p.guid.slice(0, 249)] = 1;
		uniqueness.link[p.link && p.link.slice(0, 249)] = 1;
		if (p.enclosures.length && p.enclosures[0].url) {
			uniqueness.enclosure[p.enclosures[0].url.slice(0, 244)] = 1;
			p.enclosure = p.enclosures[0].url;
		}
		p.hash = computeHash(p);
		uniqueness.hash[p.hash] = 1;
	}
	// count which strategy is the best
	let uniquenessCounts = {};
	for (const [k, v] of Object.entries(uniqueness)) {
		uniquenessCounts[k] = Object.keys(v).length;
	}
	// select the strategy that's 100% unique, if none match fall back to a hash
	let strategy = 'hash';
	const backupStrategy = guidStability === 'STABLE' ? 'guid' : 'link';
	const l = posts.length;
	const strategies = ['guid', 'link', 'enclosure'];
	if (guidStability !== 'STABLE') {
		strategies.shift();
	}
	for (let s of strategies) {
		if (uniquenessCounts[s] === l) {
			strategy = s;
			break;
		}
	}
	if (strategy === 'hash' && uniquenessCounts[backupStrategy] >= 3) {
		// better to fail in a predictable way
		strategy = backupStrategy;
	}

	// compute the post fingerprints
	for (let p of posts) {
		p.fingerprint = `${strategy}:${p[strategy] &&
		p[strategy].slice(0, 254 - strategy.length)}`;
	}

	// next compute the publication fingerprint
	let hash = computePublicationHash(posts);
	posts[0].meta = posts[0].meta || {};
	posts[0].meta.fingerprint = `${strategy}:${hash}`;
	posts[0].meta.fingerprintCounts = uniquenessCounts;

	return posts;
}

/**
 * @return {string}
 */
function computeHash(post) {
	const enclosureUrls = post.enclosures.map((e) => e.url);
	const enclosureString = enclosureUrls.join(',') || '';
	//XXX: ignore post.content for now, it changes too often
	const data = `${post.title}:${post.description}:${post.link}:${enclosureString}`;
	return createHash('md5').update(data).digest('hex');
}

/**
 * @return {string}
 */
function computePublicationHash(posts, limit = 20) {
	const fingerprints = posts.slice(0, limit).
		filter((p) => !!p.fingerprint).
		map((p) => p.fingerprint);
	if (fingerprints.length !== Math.min(posts.length, limit)) {
		throw Error('Missing post fingerprints');
	}
	const data = fingerprints.join(',');
	return createHash('md5').update(data).digest('hex');
}

function sanitize(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: { img: ['src', 'title', 'alt'] },
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
}

function checkGuidStability(original, control) {
	const link2guid = original.reduce(
		(map, content) => map.set(content.link, content.guid),
		new Map(),
	);
	let same = true;
	for (const content of control) {
		const originalGUID = link2guid.get(content.link);
		if (originalGUID) {
			same = same && originalGUID === content.guid;
		}
	}
	return same ? 'STABLE' : 'UNSTABLE';
}

module.exports.checkGuidStability = checkGuidStability;
module.exports.parseFeed = parseFeed;
module.exports.readFeedURL = readFeedURL;
module.exports.readFeedStream = readFeedStream;
module.exports.parseFeedPosts = parseFeedPosts;
module.exports.createFingerPrints = createFingerPrints;
module.exports.computeHash = computeHash;
module.exports.computePublicationHash = computePublicationHash;