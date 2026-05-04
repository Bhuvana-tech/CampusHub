const mongoose = require('mongoose');

const cafeteriaItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  isSpecial: { type: Boolean, default: false }
});

module.exports = mongoose.model('CafeteriaItem', cafeteriaItemSchema);
