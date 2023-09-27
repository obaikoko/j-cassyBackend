const express = require('express');
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/prodectController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.get('/', getProducts);

module.exports = router;
