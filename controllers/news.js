/**
 * GET /news
 * List all news.
 */
const News = require('../models/News.js');

exports.getNews = (req, res) => {
  News.find((err, docs) => {
    res.send(docs);
  });
};

/**
 * POST /news
 * Create new news.
 * */


exports.createNews = (req, res, next) => {
  const news = new News({
    key: req.body.key,
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    thumbnail: req.body.thumbnail,
    tags: req.body.tags,
    categories: req.body.categories,
    createDate: req.body.createDate,
    readCount: req.body.readCount,
    publishedDate: req.body.publishedDate,
    url: req.body.url,
    update: req.body.update,
    history: req.body.history,
  });
  news.save((err) => {
    if (err) { return next(err); }
    req.send(news);
  });
};

exports.updateNews = (req, res, next) => {
  News.findById(req.news.id, (err, news) => {
    if (err) { return next(err); }
    news.key = req.body.key || '';
    news.title = req.body.title || '';
    news.summary = req.body.summary || '';
    news.content = req.body.content || '';
    news.thumbnail = req.body.thumbnail || '';
    news.tags = req.body.tags || '';
    news.categories = req.body.categories || '';
    news.createDate = req.body.createDate || '';
    news.readCount = req.body.readCount || '';
    news.publishedDate = req.body.publishedDate || '';
    news.url = req.body.url || '';
    news.update = req.body.update || '';
    news.history = req.body.history || '';
    news.save((err) => {
      if (err) {
        return next(err);
      }
      res.send(news);
    });
  });
};

exports.deleteNews = (req, res, next) => {
  News.deleteOne({_id: req.body.id}, (err) => {
    if (err) { return next(err); }
  });
};
