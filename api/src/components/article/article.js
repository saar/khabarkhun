const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');
const autopopulate = require('mongoose-autopopulate');
const { EnclosureSchema } = require('./enclosure');
const Content = require('./content');
const sanitize = require('../../utils/santitize');
const { parseContent } = require('../../parsers/content');

const ArticleSchema = new mongoose.Schema(
	{
		rss: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'RSS',
			required: true,
			autopopulate: {
				select: [
					'title',
					'url',
					'feedUrl',
					'favicon',
					'categories',
					'description',
					'public',
					'valid',
					'publicationDate',
					'lastScraped',
					'images',
					'featured',
				],
			},
			index: true,
		},
		duplicateOf: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Article',
			required: false,
		},
		url: {
			type: String,
			trim: true,
			required: true,
			index: { type: 'hashed' },
		},
		canonicalUrl: {
			type: String,
			trim: true,
		},
		fingerprint: {
			type: String,
			trim: true,
			required: true,
		},
		guid: {
			type: String,
			trim: true,
		},
		link: {
			type: String,
			trim: true,
		},
		title: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
			maxLength: 240,
			default: '',
		},
		content: {
			type: String,
			trim: true,
			default: '',
		},
		commentUrl: {
			type: String,
			trim: true,
			default: '',
		},
		images: {
			featured: {
				type: String,
				trim: true,
				default: '',
			},
			banner: {
				type: String,
				trim: true,
				default: '',
			},
			favicon: {
				type: String,
				trim: true,
				default: '',
			},
			og: {
				type: String,
				trim: true,
				default: '',
			},
		},
		publicationDate: {
			type: Date,
			default: Date.now,
		},
		lastScraped: {
			type: Date,
		},
		enclosures: [EnclosureSchema],
		tags: [String],
		categories: [String],
		likes: {
			type: Number,
			default: 0,
		},
		socialScore: {
			reddit: {
				type: Number,
			},
			hackernews: {
				type: Number,
			},
		},
		valid: {
			type: Boolean,
			default: true,
			valid: true,
		},
		consecutiveScrapeFailures: {
			type: Number,
			default: 0,
		},

	},
	{
		collection: 'articles',

		toJSON: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.type = 'articles';
			},
		},
		toObject: {
			transform: function(doc, ret) {
				// Frontend breaks if images is null, should be {} instead
				if (!ret.images) {
					ret.images = {};
				}
				ret.images.favicon = ret.images.favicon || '';
				ret.images.og = ret.images.og || '';
				ret.type = 'articles';
			},
		},
	},
);

ArticleSchema.statics.incrScrapeFailures = async function(id) {
	await this.findOneAndUpdate(
		{ _id: id },
		{ $inc: { consecutiveScrapeFailures: 1 } },
	).exec();
};

ArticleSchema.statics.resetScrapeFailures = async function(id) {
	await this.findOneAndUpdate(
		{ _id: id },
		{ $set: { consecutiveScrapeFailures: 0 } },
	).exec();
};

ArticleSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});
ArticleSchema.plugin(mongooseStringQuery);
ArticleSchema.plugin(autopopulate);

ArticleSchema.index({ rss: 1, fingerprint: 1 }, { unique: true });
ArticleSchema.index({ rss: 1, publicationDate: -1 });
ArticleSchema.index({ publicationDate: -1 });
//
// ArticleSchema.methods.getUrl = function() {
// 	return getUrl('article_detail', this.rss._id, this._id);
// };

ArticleSchema.methods.getParsedArticle = async function() {
	const url = this.url;

	const content = await Content.findOne({ url });
	if (content) return content;

	try {
		const parsed = await parseContent(url);
		if (parsed.error) { // noinspection ExceptionCaughtLocallyJS
			throw new Error(parsed.message);
		}

		const title = parsed.title || this.title;
		const excerpt = parsed.excerpt || title || this.description;

		if (!title) return null;

		let content = sanitize(parsed.content);

		this.categories = parsed.categories;
		this.tags = parsed.tags;
		this.publicationDate = parsed.date_published;

		await this.save();

		// XKCD doesn't like Mercury
		if (this.url.indexOf('https://xkcd') === 0) content = this.content;

		return await Content.create({
			content,
			title,
			url,
			excerpt,
			image: parsed.lead_image_url || '',
			publicationDate: parsed.date_published || this.publicationDate,
			commentUrl: this.commentUrl,
			enclosures: this.enclosures,
		});
	} catch (e) {
		throw new Error(`Mercury call failed for ${this.url}: ${e.message}`);
	}
};

module.exports = exports = mongoose.model('Article', ArticleSchema);
module.exports.ArticleSchema = ArticleSchema;
