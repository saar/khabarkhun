const assert = require('assert');
const { parseContent } = require('./content');

describe('Content Parser', () => {
	describe('initial test case', () => {

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
			assert.strictEqual(title,`تلاش لیکنز و شاگردانش برای پایان خوش فصل (عکس)`);
		});
	});
});
