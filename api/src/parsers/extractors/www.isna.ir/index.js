const { convertNumbersToEnglish, convertLettersToPersian } = require(
	'../../../utils');

const moment = require('jalali-moment');
const WwwIsnaIrExtractor = {
	domain: 'isna.ir',

	title: {
		selectors: [
			['meta[name=\'og:title\']', 'value'],
		],
	},

	author: {
		selectors: [
			['.author-id strong'],
			// enter author selectors
		],
	},

	date_published: {
		selectors: [
			[
				'meta[name=\'article:modified_time\']', 'value'],
		],
	},

	dek: null,

	lead_image_url: {
		selectors: [
			[
				'meta[name=\'og:image\']', 'value',
			]],
	},

	content: {
		selectors: [
			['div[itemprop="articleBody"]'],
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
			selectors: [/*[
				`meta[name='article:section']`, 'value',
			],*/
				['span.text-meta[itemprop=\'articleSection\']', null, (item) => {
					return item.split(/\s*[,،]\s*/);
				}],
			],
			extractHtml: true,
			fallback: false,
			allowMultiple: true,
		},
		tags: {
			selectors: [

				'footer.tags a'],
			allowMultiple: true,

		},
	},
};

module.exports = exports = WwwIsnaIrExtractor;
