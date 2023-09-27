const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc POST addProduct
// @route api/products
// @privacy Private
const addProduct = asyncHandler(async (req, res) => {
  const { image, title, description, price, category } = req.body;
  const user = await User.findById(req.user);
  if (!image || !price || !title || !category) {
    res.status(400);
    throw new Error('Please add all field');
  }

  if (user && user._id.toString() === '650dd65fe4e6fee35f314523') {
    const product = await Product.create({
      image,
      title,
      description,
      price,
      category,
    });

    if (product) {
      res.status(200);
      res.json(`${title} has been added successfully`);
    }
  } else {
    res.status(401);
    throw new Error('Not Authorized');
  }
});

// @desc POST addProduct
// @route api/products
// @privacy Private

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  if (products) {
    res.status(200);
    res.json(products);
  }
});

// @desc PUT updateProduct
// @route api/products/:id
// @privacy Private

const updateProduct = asyncHandler(async (req, res) => {
  const { image, title, description, price, category } = req.body;
  const productExist = await Product.findById(req.params.id);
  const user = await User.findById(req.user);
  if (!productExist) {
    res.status(400);
    throw new Error('product not found');
  }

  if (user && user._id.toString() === '650dd65fe4e6fee35f314523') {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        image,
        title,
        description,
        price,
        category,
      },
      { new: true }
    );

    if (product) {
      res.status(200);
      res.json(`${title} has been updated successfully`);
    }
  } else {
    res.status(401);
    throw new Error('Not Authorized');
  }
});

// @desc DELETE addProduct
// @route api/products/:id
// @privacy Private

const deleteProduct = asyncHandler(async (req, res) => {
  const productExist = await Product.findById(req.params.id);
  if (!productExist) {
    res.status(400);
    throw new Error('product mot found');
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (product) {
    res.status(200);
    res.json(product._id);
  }
});

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
