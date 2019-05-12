const { Schema } = require('mongoose');

const EnclosureSchema = new Schema({
	url: {
		type: String,
		trim: true,
	},
	type: {
		type: String,
		trim: true,
	},
	length: {
		type: String,
		trim: true,
	},
});
module.exports.EnclosureSchema = EnclosureSchema;
