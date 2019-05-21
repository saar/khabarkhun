const assert = require('assert');
const URL = require('url');
const cheerio = require('cheerio');

const Mercury = require('@postlight/mercury-parser');
const WwwYjcIrExtractor = require('./index');

const fs = require('fs');

describe('WwwYjcIrExtractor', () => {
	describe('initial test case', () => {
		let result;
		let url;
		beforeEach(() => {
			Mercury.addExtractor(WwwYjcIrExtractor);
			url =
				'https://www.yjc.ir/fa/news/6919119/%DA%AF%D8%B1%D8%AF%D9%87%D9%85%D8%A7%DB%8C%DB%8C-%D8%B1%D8%A4%D8%B3%D8%A7%DB%8C-%D8%B3%D8%A7%D8%B2%D9%85%D8%A7%D9%86-%D9%86%D8%B8%D8%A7%D9%85-%D8%AF%D8%A7%D9%85%D9%BE%D8%B2%D8%B4%DA%A9%DB%8C-%DA%A9%D8%B4%D9%88%D8%B1-%D8%AF%D8%B1-%D8%B4%D9%87%D8%B1%DA%A9%D8%B1%D8%AF';
			const html =
				fs.readFileSync('./fixtures/www.yjc.ir/1558105248971.html');
			result =
				Mercury.parse(url, { html, fallback: false });
		});

		it('returns the title', async () => {
			// To pass this test, fill out the title selector
			const { title } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(title,
				`گردهمایی رؤسای سازمان نظام دامپزشکی کشور در شهرکرد`);
		});

		it('returns the date_published', async () => {
			// To pass this test, fill out the date_published selector
			const { date_published } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(date_published, '2019-05-02T11:42:00.000Z');
		});


		it('returns the lead_image_url', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { lead_image_url } = await result;

			// Update these values with the expected values from
			// the article.
			assert.equal(lead_image_url,
				`https://cdn.yjc.ir/files/fa/news/1398/2/12/9845005_654.jpg`);
		});
		it('returns the Category', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { categories } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(categories[0], 'چهارمحال و بختیاری');
		});

		it('returns the Tags', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { tags } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(tags[0], 'دامپزشکی');
		});

		it('returns the content', async () => {
			// To pass this test, fill out the content selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			// You may also want to make use of the clean and transform
			// options.
			const { content } = await result;
			// const $ = cheerio.load(content || '');

			const $ = cheerio.load(content || '');

			const first13 = excerptContent($('*').first().text(), 13);
			// Update these values with the expected values from
			// the article.
			assert.strictEqual(first13, excerptContent(
				'به گزارش گروه استان‌های باشگاه خبرنگاران جوان از شهرکرد، گردهمایی رؤسای سازمان نظام دامپزشکی سراسر کشور، به میزبانی استان چهارمحال و بختیاری در خانه معلم شهرکرد برگزار شد.'
				, 13));

		});
	});
});

function excerptContent(content, words = 10) {
	return content.trim().split(/\s+/).slice(0, words).join(' ');
}
