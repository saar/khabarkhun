const { isURL } = require('../../utils/validation');
const moment = require('moment');
const entities = require('entities');

const normalizeUrl = require('normalize-url');
const RSS = require('.');
const RssQueueAdd = require('../../task/asyncTasks').RssQueueAdd;
const { discoverRSS } = require('../../utils/discovery');

module.exports.addFeed = async (req, res) => {
	const data = req.body || {};
	let normalizedUrl;
	// TODO: refactor this url check in utitlies
	try {
		normalizedUrl = normalizeUrl(data.feedUrl);
	} catch (e) {
		return res.status(400).
			json({ error: 'Please provide a valid RSS URL.' });
	}
	if (!data.feedUrl || !isURL(normalizedUrl)) {
		return res.status(400).
			json({ error: 'Please provide a valid RSS URL.' });
	}

	let foundRSS = await discoverRSS(normalizeUrl(data.feedUrl));

	if (!foundRSS.feedUrls.length) {
		return res.status(404).
			json(
				{ error: 'We couldn\'t find any feeds for that RSS feed URL :(' });
	}

	let insertedFeeds = [];
	let feeds = [];

	for (let feed of foundRSS.feedUrls.slice(0, 10)) {
		let feedTitle = feed.title;
		if (!feedTitle) {
			continue;
		}

		if (feedTitle.toLowerCase() === 'rss') {
			feedTitle = foundRSS.site.title;
		}

		let feedUrl = normalizeUrl(feed.url);
		if (!isURL(feedUrl)) {
			continue;
		}
		let rss = await RSS.findOne({ feedUrl: feedUrl });
		const limit = moment().subtract(30, 'seconds');

		// don't update featured RSS feeds since that ends up removing images etc
		if (!rss || (!rss.featured && limit.isAfter(rss.lastScraped))) {
			let response = await RSS.findOneAndUpdate(
				{ feedUrl: feedUrl },
				{
					categories: 'RSS',
					description: entities.decodeHTML(feed.title),
					feedUrl: feedUrl,
					images: {
						favicon: foundRSS.site.favicon,
					},
					lastScraped: moment().format(),
					title: entities.decodeHTML(feedTitle),
					url: foundRSS.site.url,
					valid: true,
				},
				{
					new: true,
					rawResult: true,
					upsert: true,
				},
			);
			rss = response.value;
			if (response.lastErrorObject.upserted) {
				insertedFeeds.push(rss);
			}
		}
		feeds.push(rss);
	}

	let promises = [];
	insertedFeeds.map((f) => {
		// promises.push(search(f.searchDocument()));
		let rssScrapingPromise = RssQueueAdd(
			{
				rss: f._id,
				url: f.feedUrl,
			},
			{
				priority: 1,
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
		promises.push(rssScrapingPromise);
	});
	await Promise.all(promises);

	res.status(201);
	res.json(
		feeds.map((f) => {
			return f.serialize();
		}),
	);
};