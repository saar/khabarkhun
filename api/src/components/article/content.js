const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');
const ContentSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			trim: true,
			index: true,
			required: true,
		},
		title: {
			type: String,
			trim: true,
			required: true,
		},
		excerpt: {
			type: String,
			trim: true,
			required: true,
		},
		content: {
			type: String,
			trim: true,
			required: true,
		},
		image: {
			type: String,
			trim: true,
		},
		publicationDate: {
			type: Date,
			default: Date.now,
		},
		enclosures: [],
	},
	{ collection: 'content' },
);
ContentSchema.index({ url: 1 }, { unique: true });

ContentSchema.plugin(timestamps, {
	createdAt: { index: true },
	updatedAt: { index: true },
});

ContentSchema.plugin(mongooseStringQuery);

module.exports = exports = mongoose.model('Content', ContentSchema);
module.exports.ContentSchema = ContentSchema;
