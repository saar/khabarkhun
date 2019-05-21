const { parseContent } = require('./parsers/content');

parseContent(
	'http://varzesh3.com/news/1608607/%D9%BE%D8%A7%D8%B4%D8%A7%D8%B2%D8%A7%D8%AF%D9%87-%D8%A7%D8%B1%DA%AF%D8%A7%D9%86-%D9%87%D8%A7%DB%8C-%D9%85%D8%B1%D8%A8%D9%88%D8%B7%D9%87-%D8%A8%D8%A7-%D8%B4%D8%B1%D8%B7-%D8%A8%D9%86%D8%AF%DB%8C-%D8%A8%D8%B1%D8%AE%D9%88%D8%B1%D8%AF-%DA%A9%D9%86%D9%86%D8%AF').
	then(parsed => console.log(parsed));