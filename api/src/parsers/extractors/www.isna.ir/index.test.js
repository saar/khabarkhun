const assert = require('assert');
const URL = require('url');
const cheerio = require('cheerio');

const Mercury = require('@postlight/mercury-parser');
const WwwIsnaIrExtractor = require('./index');

const fs = require('fs');

describe('WwwIsnaIrExtractor', () => {
	describe('initial test case', () => {
		let result;
		let url;
		beforeEach(() => {
			Mercury.addExtractor(WwwIsnaIrExtractor);
			url =
				'https://www.isna.ir/news/98030903723/%DA%A9%D8%A7%D8%B1%D8%B4%D9%86%D8%A7%D8%B3%DB%8C-%D8%AF%D8%A7%D9%88%D8%B1%DB%8C-%D8%AF%DB%8C%D8%AF%D8%A7%D8%B1-%D8%B3%D9%BE%D8%A7%D9%87%D8%A7%D9%86-%D9%88-%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3-%D8%A7%D8%B2-%D8%B2%D8%A8%D8%A7%D9%86-%D8%B9%D8%B3%DA%AF%D8%B1%DB%8C';
			const html =
				fs.readFileSync(
					'./fixtures/www.isna.ir/1558105248971.html');
			result =
				Mercury.parse(url, { html, fallback: false });
		});

		it('returns the title', async () => {
			// To pass this test, fill out the title selector
			const { title } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(title,
				`کارشناسی داوری دیدار سپاهان و پرسپولیس از زبان عسگری`);
		});

		it('returns the date_published', async () => {
			// To pass this test, fill out the date_published selector
			const { date_published } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(
				date_published, '2019-05-29T20:24:30.000Z');
		});

		it('returns the lead_image_url', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { lead_image_url } = await result;

			// Update these values with the expected values from
			// the article.
			assert.equal(lead_image_url,
				`https://cdn.isna.ir/d/2019/05/30/4/57884874.jpg`);
		});
		it('returns the Category', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { categories } = await result;

			// Update these values with the expected values from
			// the article.
			// assert.strictEqual(categories[0],  'ورزشی' );
			assert.strictEqual(categories[0],  'فوتبال' );
			assert.strictEqual(categories[1],  'فوتسال' );
		});

		it('returns the Tags', async () => {
			// To pass this test, fill out the lead_image_url selector
			// in ./src/extractors/custom/www.yjc.ir/index.js.
			const { tags } = await result;

			// Update these values with the expected values from
			// the article.
			assert.strictEqual(tags[0], 'تيم فوتبال پرسپوليس');
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
				'حسین عسگری، کارشناس داوری فوتبال در گفت‌وگو با ایسنا، درباره عملکرد داروی بازی پرسپولیس و سپاهان در نیمه نهایی جام حذفی اظهار کرد: این بازی یکی از بازی‌های فوق العاده سخت چه به لحاظ داوری و چه از لحاظ فوتبالی بود. به تیم داوری تبریک می‌گویم. آن‌ها وظیفه خود را به خوبی انجام دادند و همکاری بسیار خوبی در این بازی داشتند. آن‌ها قضاوت کم نقصی از خود ارائه دادند.'
				, 13));

		});
	});
});

function excerptContent(content, words = 10) {
	return content.trim().split(/\s+/).slice(0, words).join(' ');
}
