const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Vegetables', 'Fruits'] },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);
