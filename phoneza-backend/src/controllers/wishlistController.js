const User = require('../models/User');

// GET /api/wishlist — İstifadəçinin wishlist-ini gətir
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Wishlist gətirilmədi', error: err.message });
  }
};

// POST /api/wishlist/:productId — Wishlist-ə əlavə et / çıxar (toggle)
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    const index = user.wishlist.findIndex(id => id.toString() === productId);

    if (index === -1) {
      // Əlavə et
      user.wishlist.push(productId);
      await user.save();
      res.json({ success: true, added: true, message: 'Wishlist-ə əlavə edildi' });
    } else {
      // Çıxar
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ success: true, added: false, message: 'Wishlist-dən çıxarıldı' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Əməliyyat uğursuz oldu', error: err.message });
  }
};

// DELETE /api/wishlist/:productId — Wishlist-dən sil
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Wishlist-dən silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Silmə uğursuz oldu', error: err.message });
  }
};
