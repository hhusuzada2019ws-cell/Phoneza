const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { protectUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectUser, getMe);
router.put('/profile', protectUser, updateProfile);

// Şifrə bərpası
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
