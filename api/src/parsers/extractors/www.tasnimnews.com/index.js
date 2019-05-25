const { convertNumbersToEnglish, convertLettersToPersian } = require(
	'../../../utils');

const moment = require('jalali-moment');
const WwwTasnimnewsComExtractor = {
	domain: 'www.tasnimnews.com',

	title: {
		selectors: [
			'.single-news>h1.title',
		],
	},

	author: {
		selectors: [
			// enter author selectors
		],
	},

	date_published: {
		selectors: [
			[
				'ul.list-inline.details li.time',
				null,
				(item) => {
					return moment(convertLettersToPersian(
						convertNumbersToEnglish(item)),
						'jDD jMMMM jYYYY - HH:mm', 'fa').
						toISOString();
				}],
		],
		timezone: 'Asia/Tehran',
	},

	dek: null,

	lead_image_url: {
		selectors: [
			[
				'article.single-news figure>a>img', 'src',
			]],
	},

	content: {
		selectors: [
			['article.single-news .story ',]
		],

		// Is there anything in the content you selected that needs transformed
		// before it's consumable content? E.g., unusual lazy loaded images
		transforms: {},

		// Is there anything that is in the result that shouldn't be?
		// The clean selectors will remove anything that matches from
		// the result
		clean: []
		,
	},
	extend: {
		categories: {
			selectors: [
				'article.single-news ul.list-inline.details li.service',
			],
			allowMultiple: true,
		},
		tags: {
			selectors: [
				[
					'meta[name=\'keywords\']', 'value', (item) => {
					return item.split(/\s*,\s*/);
				}]],
			allowMultiple: true,

		},
	},
};

module.exports = exports = WwwTasnimnewsComExtractor;
