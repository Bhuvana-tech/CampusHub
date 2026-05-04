const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  uploader: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tags: [{ type: String }],
  fileUrl: { type: String, required: true }
});

module.exports = mongoose.model('Note', noteSchema);
