const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { cloudinary } = require('../config/cloudinary');

// @desc POST addProduct
// @route api/products
// @privacy Private
const addProduct = asyncHandler(async (req, res) => {
  const { photo, title, description, price, category } = req.body;

  const user = await User.findById(req.user);
  if (!photo || !price || !title || !category) {
    res.status(400);
    throw new Error('Please add all field');
  }

  if (user && user.role === 'Admin') {
    try {
      const fileStr = photo;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'j-cassy',
      });

      const product = await Product.create({
        image: {
          publicId: uploadedResponse.public_id,
          url: uploadedResponse.url,
        },
        title,
        description,
        price,
        category,
      });

      if (product) {
        res.status(201);
        res.json(`${title} has been added successfully`);
      }
    } catch (error) {
      res.status(400);
      throw new Error('cannot upload to image');
    }
  } else {
    res.status(401);
    throw new Error('Not Authorized');
  }
});

// @desc POST addProduct
// @route api/products
// @privacy Public
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
  const { photo, title, description, price, category } = req.body;
  const productExist = await Product.findById(req.params.id);
  const user = await User.findById(req.user);
  if (!productExist) {
    res.status(400);
    throw new Error('product not found');
  }

  if (user && user.role === 'Admin') {
    const publicId = productExist.image.publicId;
    const fileStr = photo;

    const uploadedResponse = await cloudinary.uploader.upload(
      fileStr,
      { publicId },
      (error, result) => {
        if (error) {
          res.status(400);
          throw new Error('Error updating image:', error);
        } else {
          res.status(200)
          res.json('Image updated successfully:', result);
        }
      }
    );
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        image: {
          publicId: uploadedResponse.public_id,
          url: uploadedResponse.url,
        },
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
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(400);
    throw new Error('product mot found');
  }
  const user = await User.findById(req.user);
  if (user && user.role === 'Admin') {
    const publicId = product.image.publicId;
    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Error deleting image:', error);
      } else {
        console.log('Image deleted successfully:', result);
      }
    });

    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.status(200);
      res.json(product._id);
    }
  } else {
    res.status(401);
    throw new Error('Not Authorized');
  }
});

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
