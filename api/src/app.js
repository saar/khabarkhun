/**
 * Module dependencies.
 */
const Article = require('./components/article/article');

const express = require('express');

const swaggerMiddleware = require('../config/swagger/swaggerMiddleware');
/**
 * Controllers (route handlers).
 */
const sass = require('node-sass-middleware');
const expressStatusMonitor = require('express-status-monitor');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dotenv = require('dotenv');
const lusca = require('lusca');
const errorHandler = require('errorhandler');
const chalk = require('chalk');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const rssController = require('./components/rss/controller');
const articleController = require('./components/article/controller');

// const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });
/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.DATABASE_URI);
mongoose.connection.on('error', (err) => {
	console.error(err);
	console.log(
		'%s MongoDB connection error. Please make sure MongoDB is running.',
		chalk.red('✗'));
	process.exit();
});

/**
 * Express configuration.
 */
app.disable('x-powered-by');
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
	store: new MongoStore({
		url: process.env.DATABASE_URI,
		autoReconnect: true,
	}),
}));
app.use(flash());
// app.use((req, res, next) => {
// 	lusca.csrf()(req, res, next);
// });
app.use(lusca.xframe('SAMEORIGIN'));

app.use(lusca.xssProtection(true));

app.use('/docs', swaggerMiddleware);
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});

/**
 * Primary app routes.
 */

app.route('/api/rss').post(rssController.addFeed);

app.use('/api/article', articleController);
/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
	// only use in development
	app.use(errorHandler());
} else {
	app.use((err, req, res) => {
		console.error(err);
		res.status(500).send('Server Error');
	});
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%d in %s mode',
		chalk.green('✓'), app.get('port'), app.get('env'));
	console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
