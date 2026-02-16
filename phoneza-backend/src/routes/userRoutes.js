const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/userController');
const { protectUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectUser, getMe);
router.put('/profile', protectUser, updateProfile);

module.exports = router;