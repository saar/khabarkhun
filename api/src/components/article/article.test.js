const assert = require('assert');
const Article = require('./article');

require('../../utils/db');
// require("../../../config");
describe('Article Component', () => {

	let article;
	let content;
	beforeEach(async () => {
		article = await Article.findOne({});
	});
	it('get article particle\'s content', async () => {
		content = await article.getParsedArticle(true);
	});
	it('article must contains tags', () => {

		assert.ok(!!article.tags.length, 'Must have tag');

	});

});
