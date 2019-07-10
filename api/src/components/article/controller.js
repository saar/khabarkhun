const express = require('express');
const Article = require('./article');
const router = express.Router();

const logger = require('../../utils/logger');

const getArticles = async (req, res, next) => {
    let perPage = 30
        , page = Math.max(0, parseInt(req.query.p));
    const articles = await Article.find(!!req.query.search ?
        {$text: {$search: req.query.search}} :
        {}
    ).limit(perPage).sort('-publicationDate').skip(perPage * page);

    if (articles)
        res.json(articles);
    else next();

};

const getArticlesByTag = async (req, res, next) => {

    logger.debug(`Find Articles by tag: ${req.params.tag}`);
    let perPage = 30
        , page = Math.max(0, parseInt(req.param('p')));

    const articles = await Article.find({tags: req.params.tag}).limit(perPage).sort('-publicationDate').skip(perPage * page);
    if (articles)
        res.json(articles);
    else next();
};
const getArticlesByCategory = async (req, res, next) => {
    logger.debug(`Find Articles by category: ${req.params.category}`);
    let perPage = 30
        , page = Math.max(0, parseInt(req.param('p')));
    const articles = await Article.find(
        {categories: req.params.category}).limit(perPage).sort('-publicationDate').skip(perPage * page);
    if (articles)
        res.json(articles);
    else next();
};
const getArticle = async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    if (article)
        res.json(article);
    else next();
};

const getArticlesByRss = async (req, res, next) => {
    logger.debug(`Find Articles by rss: ${req.params.rss}`);
    let perPage = 30
        , page = Math.max(0, parseInt(req.param('p')));
    const articles = await Article.find({rss: {_id: req.params.rss}}).limit(perPage).sort('-publicationDate').skip(perPage * page);
    if (articles)
        res.json(articles);
    else next();
};
const likeArticle = async (req, res, next) => {
    const article = await Article.incrLikeCount(req.params.id);
    res.json(article.likeCount);
};
const countArticleLikes = async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    res.json({like: article.likeCount, dislike: article.dislikeCount});
};
const dislikeArticle = async (req, res, next) => {
    const article = await Article.decLikeCount(req.params.id);
    res.json(article.dislikeCount);
};
const visitArticle = async (req, res, next) => {
    const article = await Article.incrVisitCount(req.params.id);
    res.json(article.visitCount);

};
const getArticleVisitCount = async (req, res, next) => {
    const article = await Article.findById(req.params.id);
    res.json(article.visitCount);

};
const keepUnvisitedArticle = async (req, res, next) => {
    const article = await Article.decVisitCount(req.params.id);
    res.json(article.visitCount);
};
router.route('').get(getArticles);
router.route('/:id').get(getArticle);
router.route('/category/:category').get(getArticlesByCategory);
router.route('/tag/:tag').get(getArticlesByTag);
router.route('/rss/:rss').get(getArticlesByRss);
router.route('/:id/like').put(likeArticle);
router.route('/:id/like').get(countArticleLikes);
router.route('/:id/like').delete(dislikeArticle);
router.route('/:id/visit').put(visitArticle);
router.route('/:id/visit').get(getArticleVisitCount);
router.route('/:id/visit').delete(keepUnvisitedArticle);

module.exports = router;

