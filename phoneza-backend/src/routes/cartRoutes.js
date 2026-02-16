const express = require('express');
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  clearCart
} = require('../controllers/cartController');
const { protectUser } = require('../middleware/auth');

router.use(protectUser);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .delete(removeFromCart)
  .put(updateCartQuantity);

module.exports = router;