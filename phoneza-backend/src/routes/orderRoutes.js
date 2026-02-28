const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protectUser } = require('../middleware/auth');
const { protect } = require('../middleware/auth');

// User routes
router.post('/', protectUser, createOrder);
router.get('/my-orders', protectUser, getMyOrders);
router.get('/:id', protectUser, getOrder);
router.put('/:id/cancel', protectUser, cancelOrder);

// Admin routes
router.get('/admin/all', protect, getAllOrders);
router.put('/admin/:id/status', protect, updateOrderStatus);

module.exports = router;