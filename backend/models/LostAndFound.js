const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String }
});

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);
