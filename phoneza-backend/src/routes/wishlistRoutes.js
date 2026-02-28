const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protectUser } = require('../middleware/auth');

router.use(protectUser);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
