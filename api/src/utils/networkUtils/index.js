const request = require('request');
const logger = require('../../utils/logger');
const { PassThrough } = require('stream');
const InflateAuto = require('inflate-auto');
const zlib = require('zlib');

const userAgent = 'Khabarkhun: Open Source RSS & Podcast app: https://khabarkhun.ir/';
const AcceptHeader = 'text/html,application/xhtml+xml,application/xml';

const maxContentLengthBytes = 1024 * 1024 * 5;

const requestTTL = 12 * 1000;

function readURL(url) {
	let headers = {
		'User-Agent': userAgent,
		'Accept-Encoding': 'gzip,deflate',
		'Accept': AcceptHeader,
	};
	return request({
		method: 'get',
		agent: false,
		pool: { maxSockets: 256 },
		uri: url,
		timeout: requestTTL,
		headers: headers,
		maxRedirects: 20,
		resolveWithFullResponse: true,
	});
}

function checkHeaders(stream, url, checkContentType = false) {
	return new Promise((resolve, reject) => {
		let resolved = false;
		let bodyLength = 0;

		//XXX: piping to a pass through dummy stream so we can pipe it later
		//     without causing request errors
		let dummy = new PassThrough();
		stream.pipe(dummy);

		stream.on('response', (response) => {
			if (checkContentType) {
				const contentType = response.headers['content-type'];
				if (
					!contentType ||
					!contentType.trim().toLowerCase().includes('html')
				) {
					logger.warn(
						`Invalid content type '${contentType}' for url ${url}`,
					);
					stream.abort();
					return resolve(null);
				}
			}
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
				encoding === 'gzip' ? new zlib.Gunzip() :
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
		}).on('error', (err) => {
			if (!resolved) {
				reject(err);
			} else {
				dummy.destroy(err);
			}
			stream.abort();
		}).on('data', (data) => {
			resolved = true;
			resolve(dummy);

			if (bodyLength + data.length <= maxContentLengthBytes) {
				bodyLength += data.length;
			} else {
				dummy.destroy(
					new Error('Request body larger than maxBodyLength limit'),
				);
			}
		}).on('end', () => {
			if (!resolved) {
				resolve(dummy);
			}
		});
	});
}

function extractHostname(request) {
	const protocol =
		(request.connection && request.connection.encrypted
			? 'https'
			: 'http') + '://';
	let canonicalUrl = '';
	if (request.uri) {
		canonicalUrl = `${request.uri.protocol}//${request.uri.host}`;
	}
	if (!canonicalUrl && request.href) {
		canonicalUrl = request.href;
	}
	if (!canonicalUrl && request.res) {
		canonicalUrl = request.res.responseUrl;
	}
	if (!canonicalUrl && request.domain) {
		canonicalUrl = protocol + request.domain;
	}
	if (!canonicalUrl) {
		const host =
			request.originalHost ||
			request.host ||
			(request.headers ? request.headers['host'] : request.getHeader(
				'Host'));
		canonicalUrl = protocol + host;
	}
	return canonicalUrl;
}

function ensureEncoded(url) {
	if (url === decodeURI(url)) {
		return encodeURI(url);
	}
	return url;
}

module.exports.requestTTL = requestTTL;
module.exports.readURL = readURL;
module.exports.checkHeaders = checkHeaders;
module.exports.extractHostname = extractHostname;
module.exports.userAgent = userAgent;
module.exports.ensureEncoded = ensureEncoded;
