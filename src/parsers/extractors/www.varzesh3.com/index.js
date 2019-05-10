const moment = require('moment');

const WwwVarzesh3ComExtractor = {
	domain: 'www.varzesh3.com',

	title: {
		selectors: [
			'h1.news-page--news-title',
		],
	},

	author: {
		selectors: [
			// enter author selectors
		],
	},

	date_published: {
		selectors: [
			['meta[name="og:article:modified_time"]', 'value'],
			['meta[name="og:article:published_time"]', 'value'],

		],
		format: 'YYYY-MM-DDTHH:mm:ss.SSSSSS',
		timezone: 'Asia/Tehran',
	},

	dek: {
		selectors: [
			// enter selectors
		],
	},

	lead_image_url: {
		selectors: [
			[
				'meta[name="og:image"]~meta[name="og:image"]',
				'value'],
		], allowMultiple: false,

	},

	content: {
		selectors: [
			'div.news-page--news-text',
		],

		// Is there anything in the content you selected that needs transformed
		// before it's consumable content? E.g., unusual lazy loaded images
		transforms: {},

		// Is there anything that is in the result that shouldn't be?
		// The clean selectors will remove anything that matches from
		// the result
		clean: [],
	},
	excerpt: {
		selectors: [
			'',
		],
	},
	extend: {
		categories: {
			selectors: [
				['meta[name=\'og:article:section\']', 'value'],
			],
			allowMultiple: true,
		},
		tags: {
			selectors: [['meta[name=\'og:article:tag\']', 'value']],
			allowMultiple: true,
		},
	},
};
module.exports = exports = WwwVarzesh3ComExtractor;