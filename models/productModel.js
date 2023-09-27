const mongoose = require('mongoose');

// Define a schema for the product
const productSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);
