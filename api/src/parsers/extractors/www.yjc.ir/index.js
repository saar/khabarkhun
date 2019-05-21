const { convertNumbersToEnglish } = require('../../../utils');

const moment = require('jalali-moment');
const WwwYjcIrExtractor = {
	domain: 'www.yjc.ir',

	title: {
		selectors: [
			'div.title h1.Htags a.title',
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
				'meta[name="article:published_time"]', 'value', (item) => {
				return moment.from(convertNumbersToEnglish(item), 'fa',
					'YYYY/MM/DD - HH:mm').toISOString();
			}],
		],
	},

	dek: null,

	lead_image_url: {
		selectors: [
			[
				'div.body img.image_btn', 'src',
			], (item)=> {
				console.log(item);
				return item;
			}],
	},

	content: {
		selectors: [
			'div.body',
		],

		// Is there anything in the content you selected that needs transformed
		// before it's consumable content? E.g., unusual lazy loaded images
		transforms: {
			a: $node => {
				const innerHtml = $node.html();
				$node.replaceWith(innerHtml);
			},
			span: $node => {
				const innerHtml = $node.html();
				$node.replaceWith(innerHtml);
			},
		},

		// Is there anything that is in the result that shouldn't be?
		// The clean selectors will remove anything that matches from
		// the result
		clean: ['h2']
		,
	},
	extend: {
		categories: {
			selectors: [
				['meta[name=\'article:section\']', 'value'],
			],
			allowMultiple: true,
		},
		tags: {
			selectors: [
				[
					'meta[name=\'article:tag\']', 'value', (item) => {
					return item.split(/\s*,\s*/);
				}]],
			allowMultiple: true,

		},
	},
};

module.exports = exports = WwwYjcIrExtractor;