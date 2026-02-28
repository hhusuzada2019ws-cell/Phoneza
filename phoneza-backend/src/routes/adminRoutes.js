const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, toggleUserStatus } = require('../controllers/adminUserController');
const { protect } = require('../middleware/auth');

// Admin qoruması bütün route-lara tətbiq olunur
router.use(protect);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
