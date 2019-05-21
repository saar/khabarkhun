const assert = require('assert');
const URL = require('url');
const cheerio = require('cheerio');

const Mercury = require('@postlight/mercury-parser');
const WwwTasnimnewsComExtractor = require('./index');

const fs = require('fs');

describe('WwwTasnimnewsComExtractor', () => {
	describe('initial test case', () => {
		let result;
		let url;
		beforeEach(() => {
			Mercury.addExtractor(WwwTasnimnewsComExtractor);
			url =
				'https://www.tasnimnews.com/fa/news/1398/02/30/2015910/%D9%84%DB%8C%DA%AF-%D9%82%D9%87%D8%B1%D9%85%D8%A7%D9%86%D8%A7%D9%86-%D8%A2%D8%B3%DB%8C%D8%A7-%D8%A8%D8%B1%D8%AA%D8%B1%DB%8C-%D8%A8%DB%8C-%D9%81%D8%A7%DB%8C%D8%AF%D9%87-%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3-%D8%AF%D8%B1-%D8%B4%D8%A8-%D8%AA%D9%84%D8%AE-%D8%AE%D8%AF%D8%A7%D8%AD%D8%A7%D9%81%D8%B8%DB%8C-%DA%98%D8%A7%D9%88%DB%8C-%D8%A7%D8%B2-%D9%81%D9%88%D8%AA%D8%A8%D8%A7%D9%84';
			const html =
				fs.readFileSync(
					'./fixtures/www.tasnimnews.com/1558105248971.html');
			result =
				Mercury.parse(url, { html, fallback: false });
		});

		it('returns the title', async () => {
			// To pass this test, fill out the title selector
			const { title } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(title,
				`لیگ قهرمانان آسیا| برتری بی‌فایده پرسپولیس در شب تلخ خداحافظی ژاوی از فوتبال`);
		});

		it('returns the date_published', async () => {
			// To pass this test, fill out the date_published selector
			const { date_published } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(
				date_published, '2019-05-20T18:23:00.000Z');
		});

		it('returns the lead_image_url', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { lead_image_url } = await result;

			// Update these values with the expected values from
			// the article.
			assert.equal(lead_image_url,
				`https://newsmedia.tasnimnews.com/Tasnim/Uploaded/Image/1398/02/30/1398023022092641017467744.jpg`);
		});
		it('returns the Category', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { categories } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(categories[0],  'ورزشی' );
		});

		it('returns the Tags', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { tags } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(tags[0], 'لیگ قهرمانان آسیا');
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
				'به گزارش خبرگزاری تسنیم، دیدار دو تیم پرسپولیس ایران و السد قطر از هفته پایانی مرحله گروهی لیگ قهرمانان آسیا ساعت 21 امشب (دوشنبه) در ورزشگاه آزادی آغاز شد و با نتیجه 2 بر صفر به سود پرسپولیس خاتمه یافت. مهدی ترابی در دقیقه 16 و علی علیپور در دقیقه 67 این دیدار گل‌های پرسپولیس را به ثمر رساندند.'
				, 13));

		});
	});
});

function excerptContent(content, words = 10) {
	return content.trim().split(/\s+/).slice(0, words).join(' ');
}
