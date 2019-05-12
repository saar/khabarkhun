const request = require('request');
const htmlparser = require('htmlparser2');
const normalize = require('normalize-url');
const url = require('url');
const FeedParser = require('feedparser');
const { Buffer } = require('safe-buffer');
const { extractHostname, userAgent } = require('../networkUtils');
const { PassThrough } = require('stream');

const InflateAuto = require('inflate-auto');
const { Gunzip } = require('zlib');
/*
 * Based on the awesome work of rssfinder
 * https://github.com/ggkovacs/rss-finder
 * By @ggkovacs
 */

const rssMap = {
	'application/rss+xml': 1,
	'application/atom+xml': 1,
	'application/rdf+xml': 1,
	'application/rss': 1,
	'application/atom': 1,
	'application/rdf': 1,
	'text/rss+xml': 1,
	'text/atom+xml': 1,
	'text/rdf+xml': 1,
	'text/rss': 1,
	'text/atom': 1,
	'text/rdf': 1,
};
const iconRels = { 'icon': 1, 'shortcut icon': 1 };

// request settings
const maxContentLengthBytes = 1024 * 1024 * 5;

function readRequestBody(stream) {
	return new Promise((resolve, reject) => {
		let resolved = false;
		let bodyLength = 0;
		let res;
		const buffers = [];
		const strings = [];

		//XXX: piping to a pass through dummy stream so we can pipe it later
		//     without causing request errors
		let dummy = new PassThrough();
		stream.pipe(dummy);

		stream.on('response', (response) => {

			const contentLength = parseInt(response.headers['content-length'],
				10);
			if (contentLength > maxContentLengthBytes) {
				stream.abort();
				return reject(
					new Error('Request body larger than maxBodyLength limit'),
				);
			}
			const encoding = (response.headers['content-encoding'] ||
				'identity').trim().toLowerCase();

			// InflateAuto could be used for gzip to accept deflate data declared as gzip
			const inflater = encoding === 'deflate' ? new InflateAuto() :
				encoding === 'gzip' ? new Gunzip() :
					null;

			if (inflater) {
				dummy = dummy.pipe(inflater);
			}
			dummy.on('error', (err) => {
				if (!resolved) {
					reject(err);
				}
				stream.abort();
			});
			dummy.on('data', (data) => {

				resolved = true;

				if (bodyLength + data.length <= maxContentLengthBytes) {
					bodyLength += data.length;
					if (!Buffer.isBuffer(data)) {
						strings.push(data);
					} else if (data.length) {
						buffers.push(data);
					}
				} else {
					stream.abort();
					return reject(
						new Error(
							'Request body larger than maxBodyLength limit'),
					);
				}

			}).on('end', () => {
				if (bodyLength) {
					res.body = Buffer.concat(buffers, bodyLength);
					if (stream.encoding !== null) {
						res.body = res.body.toString(stream.encoding);
					}
				} else if (strings.length) {
					// The UTF8 BOM [0xEF,0xBB,0xBF] is converted to [0xFE,0xFF] in the JS UTC16/UCS2 representation.
					// Strip this value out when the encoding is set to 'utf8', as upstream consumers won't expect it and it breaks JSON.parse().
					if (
						stream.encoding === 'utf8' &&
						strings[0].length > 0 &&
						strings[0][0] === '\uFEFF'
					) {
						strings[0] = strings[0].substring(1);
					}
					res.body = strings.join('');
				}
				if (typeof res.body === 'undefined') {
					res.body = stream.encoding === null ? Buffer.alloc(0) : '';
				}
				resolve(res);
			});

			res = response;
		}).on('error', (err) => {
			if (!resolved) {
				reject(err);
			} else {
				dummy.destroy(err);
			}
			stream.abort();
		});
	});
}

async function discoverRSS(uri) {

	let headers = {
		'User-Agent': userAgent,
	};
	const response = await readRequestBody(
		request({
			uri,
			headers,
			maxRedirects: 20,
			timeout: 12 * 1000,
			resolveWithFullResponse: true,
		}),
	);

	let discovered;

	try {
		discovered = await discoverFromFeed(response.body);
	} catch (e) {
		discovered = discoverFromHTML(response.body);
	}

	const canonicalUrl = url.resolve(
		extractHostname(response.request),
		response.request.path,
	);
	return fixData(discovered, canonicalUrl);
}

function discoverFromHTML(body) {
	let rs = {};
	let feeds = [];
	let parser;
	let favicon;
	let isSiteTitle;
	let siteTitle;
	// noinspection JSUnusedGlobalSymbols
	parser = new htmlparser.Parser({
		onopentag: function(name, attr) {
			if (name === 'link' && attr.type && attr.type.toLowerCase() in
				rssMap) {
				feeds.push(
					{ title: attr.title || null, url: attr.href || null });
			}
			if (name === 'link') {
				let a = attr.rel && attr.rel.toLowerCase();
				let t = attr.type && attr.type.toLowerCase();
				if (a in iconRels || t ===
					'image/x-icon') {favicon = attr.href;}
			}
			if (name === 'title') {isSiteTitle = true;}
		},
		ontext: function(text) {if (isSiteTitle) {siteTitle = text;}},
		onclosetag: function(name) {
			if (name === 'title') {isSiteTitle = false;}
		},
	}, { recognizeCDATA: true });

	parser.write(body);
	parser.end();
	// noinspection JSUnusedAssignment
	rs.site = {
		title: siteTitle || null,
		favicon: favicon || null,
	};

	rs.feedUrls = feeds;
	return rs;
}

function isRelativeUrl(str) {
	return /^https?:\/\//i.test(str);
}

function getFaviconUrl(uri) {
	let parsedUrl = url.parse(uri);

	return url.resolve(parsedUrl.protocol + '//' + parsedUrl.host,
		'favicon.ico');
}

// make the urls absolute and try the default favicon location
async function fixData(res, uri) {
	let favicon;
	// make the urls unique
	for (const feed of res.feedUrls) {
		if (feed.url) {
			if (!isRelativeUrl(feed.url)) {
				feed.url = normalize(url.resolve(uri, feed.url));
			}
		} else {
			feed.url = normalize(uri);
		}
	}

	if (!res.site.url) {
		res.site.url = normalize(uri);
	}

	if (res.site.favicon) {
		if (!isRelativeUrl(res.site.favicon)) {
			res.site.favicon = url.resolve(res.site.url, res.site.favicon);
		}

		return res;
	}

	// see if mysite.com/favicon.ico works :)
	favicon = getFaviconUrl(res.site.url);

	try {

		// ensure favicon url is reachable
		await new Promise((resolve, reject) => {
			const req = request(favicon, {
				headers,
				maxRedirects: 20,
				timeout: 12 * 1000,
			});
			on('response', () => resolve(req.abort())).
				on('error', reject);
		});
		res.site.favicon = favicon;
	} catch (_) {
		//XXX: ignore error
	}
	return res;
}

function discoverFromFeed(body) {
	return new Promise(function(resolve, reject) {
		const feedParser = new FeedParser();

		feedParser.on('error', function(err) {
			reject(err);
		});

		let feedMeta;
		feedParser.on('readable', function() {
			if (!feedMeta) {
				feedMeta = this.meta;
			}
		});

		feedParser.write(body);

		feedParser.end(function() {
			if (feedMeta) {
				return resolve({
					site: {
						title: feedMeta.title || null,
						favicon: feedMeta.favicon || null,
						url: feedMeta.link || null,
					},
					feedUrls: [
						{
							title: feedMeta.title || null,
							url: feedMeta.xmlUrl || null,
						},
					],
				});
			}

			resolve({});
		});
	});
}

module.exports.discoverFromHTML = discoverFromHTML;
module.exports.discoverFromFeed = discoverFromFeed;
module.exports.discoverRSS = discoverRSS;