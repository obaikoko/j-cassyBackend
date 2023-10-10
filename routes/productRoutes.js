const express = require('express');
const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/prodectController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
