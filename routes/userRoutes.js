const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  resetPassword,
  verifyResetPassword,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/me', protect, updateProfile);
router.post('/resetPassword', resetPassword);
router.put('/resetPassword', verifyResetPassword);
module.exports = router;
