const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  getMyReviews
} = require('../controllers/reviewController');
const { protectUser } = require('../middleware/auth');

// Açıq route — rəyləri hamı görə bilər
router.get('/product/:productId', getProductReviews);

// Qorunan route-lar
router.use(protectUser);
router.get('/my', getMyReviews);
router.post('/:productId', addReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;
