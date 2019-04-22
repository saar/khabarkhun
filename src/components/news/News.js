const mongoose = require('mongoose');

const schema = mongoose.Schema({
  key: {type: String, required: true, unique: true},
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 255,
  },
  summary: {type: String, required: false},
  content: {type: String, required: true},
  thumbnail: {type: String},
  tags: {type: [String]},
  categories: {type: [String]},
  createDate: {type: Date, default: Date.now},
  readCount: {type: Number, min: 0},
  publishedDate: {type: Date, default: Date.now},
  url: {
    type: String,
    regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\\+.~#?&/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\\+.~#?&/=]*)?/gi,
    required: true,
  },
  update: {type: Date},
  history: {type: Array, itemType: 'News'},
});

const News = mongoose.model('News', schema);
module.exports = News;
