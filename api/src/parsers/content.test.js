const assert = require('assert');
const { parseContent } = require('./content');

describe('Content Parser', function() {
	this.timeout(10000);
	describe('varzesh3.com test', () => {

		let url;
		let result;
		beforeEach(async () => {
			url = 'http://varzesh3.com/news/1611365/%D8%AA%D9%84%D8%A7%D8%B4-%D9%84%DB%8C%DA%A9%D9%86%D8%B2-%D9%88-%D8%B4%D8%A7%DA%AF%D8%B1%D8%AF%D8%A7%D9%86%D8%B4-%D8%A8%D8%B1%D8%A7%DB%8C-%D9%BE%D8%A7%DB%8C%D8%A7%D9%86-%D8%AE%D9%88%D8%B4-%D9%81%D8%B5%D9%84-%D8%B9%DA%A9%D8%B3';
			result = await parseContent(url);
		});
		it('returns the title', async () => {
			// To pass this test, fill out the title selector
			const { title } = result;
			// Update these values with the expected values from
			// the article.
			assert.strictEqual(title,
				`تلاش لیکنز و شاگردانش برای پایان خوش فصل (عکس)`);
		});
	});

	describe('yjc.ir test', () => {

		let url;
		let result;

		it('returns the Tags', async () => {
			url = 'https://yjc.ir/fa/news/6947821/%D8%A2%D8%A8%D8%B1%D8%B3%D8%A7%D9%86%DB%8C-%D8%A8%D9%87-%DB%B4%DB%B8%D8%B1%D9%88%D8%B3%D8%AA%D8%A7%DB%8C-%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%A7%DB%8C%D9%84%D8%A7%D9%85-%D8%AF%D8%B1-%D8%B3%D8%A7%D9%84-%DB%B9%DB%B7';
			result = await parseContent(url, 4000, 3, 100);
			// To pass this test, fill out the title selector
			const { tags } = result;
			// Update these values with the expected values from
			// the article.
			assert.strictEqual(tags[0], `وزارت نیرو`);
		});
	});
	describe('isna.ir test', () => {

		let url;
		let result;

		it('returns the Tags', async () => {
			url = 'https://isna.ir/news/98030903914/%D9%85%D8%B9%D8%A7%D9%85%D9%84%D9%87-%D9%82%D8%B1%D9%86-%D9%81%D8%B1%D9%88%D9%BE%D8%A7%D8%B4%DB%8C-%D9%88%D8%AD%D8%AF%D8%AA-%D8%AC%D9%87%D8%A7%D9%86-%D8%A7%D8%B3%D9%84%D8%A7%D9%85-%D8%B1%D8%A7-%D8%AF%D9%86%D8%A8%D8%A7%D9%84-%D9%85%DB%8C-%DA%A9%D9%86%D8%AF:';
			result = await parseContent(url, 4000, 3, 100);
			// To pass this test, fill out the title selector
			const { tags } = result;
			// Update these values with the expected values from
			// the article.
			assert.strictEqual(tags[0], `جامعه اسلامي مهندسين`);
		});
	});
});
