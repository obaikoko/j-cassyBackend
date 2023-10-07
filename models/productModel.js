const mongoose = require('mongoose');

// Define a schema for the product
const productSchema = new mongoose.Schema({
  image: {
    publicId: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);
