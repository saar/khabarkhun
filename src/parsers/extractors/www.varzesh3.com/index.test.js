const moment = require('moment');

const assert = require('assert');
const cheerio = require('cheerio');

const Mercury = require('@postlight/mercury-parser');
const WwwVarzesh3ComExtractor = require('./index');

const fs = require('fs');

describe('WwwVarzesh3ComExtractor', () => {
	describe('initial test case', () => {
		let result;
		let url;

		beforeAll(() => {
			Mercury.addExtractor(WwwVarzesh3ComExtractor);
			url =
				'https://www.varzesh3.com/news/1608590/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4-%D8%B2%D9%86%D8%AF%D9%87-%D8%AA%D8%B1%D8%A7%DA%A9%D8%AA%D9%88%D8%B1%D8%B3%D8%A7%D8%B2%DB%8C-0-%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3-0-%D9%84%DB%8C%DA%AF-%D8%A8%D8%B1%D8%AA%D8%B1-11-02-1398';
			const html =
				fs.readFileSync(
					'./fixtures/www.varzesh3.com/1557406768845.html');
			result =
				Mercury.parse(url, {
					html,
					fallback: false,
				});
		});

		it('returns the title', async () => {
			// To pass this test, fill out the title selector
			const { title } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(title,
				`تراکتور 1 - پرسپولیس 1؛ دانیال علیه جشن قهرمانی!`);
		});

		it('returns the date_published', async () => {
			// To pass this test, fill out the date_published selector
			const { date_published } = await result;

			// Update these values with the expected values from
			// the article.
			let fixDate = moment('2019-05-01T19:04:00.0000000',
				'YYYY-MM-DDTHH:mm:ss.SSSSSS', 'Asia/Tehran');
			assert.ok(moment(date_published).
					isSame(fixDate),
				`date_published is ${date_published} but expected ${fixDate.toISOString()}`);
		});

		it('returns the lead_image_url', async () => {
			// To pass this test, fill out the lead_image_url selector
			const { lead_image_url } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(lead_image_url,
				`https://static.farakav.com/files/pictures/01402433.jpg`);
		});

		it('returns the content', async () => {
			// To pass this test, fill out the content selector
			// You may also want to make use of the clean and transform
			// options.
			const { content } = await result;

			const $ = cheerio.load(content || '');

			const first13 = excerptContent($('*').first().text(), 13);

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(first13, excerptContent(
				'به گزارش "ورزش سه"، تراکتورسازی بعد از هفته‌های درخشانی که پشت سر گذاشت و خود را به‌عنوان یک مدعی اصلی قهرمانی معرفی کرد، طی سه مسابقه اخیرش به شکل ناباورانه‌ای مقابل سپیدرود رشت،'
				, 13));
		});
		it('returns the category', async () => {
			// To pass this test, fill out the content selector
			// You may also want to make use of the clean and transform
			// options.
			const { categories } = await result;

			assert.strictEqual(categories[0], 'فوتبال');

		});
		it('returns the tags', async () => {
			// To pass this test, fill out the content selector
			// You may also want to make use of the clean and transform
			// options.
			const { tags } = await result;

			assert.strictEqual(tags[0], 'تراکتورسازی تبریز');
			assert.strictEqual(tags[1], 'پرسپولیس تهران');

		});
	});
});

function excerptContent(content, words = 10) {
	return content.trim().split(/\s+/).slice(0, words).join(' ');
}