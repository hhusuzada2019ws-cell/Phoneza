const User = require('../models/User');

// Səbətə məhsul əlavə et
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.id);

    // Məhsul səbətdə var mı?
    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      // Varsa, miqdarı artır
      existingItem.quantity += quantity || 1;
    } else {
      // Yoxsa, yeni əlavə et
      user.cart.push({
        product: productId,
        quantity: quantity || 1
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      success: true,
      message: 'Məhsul səbətə əlavə edildi',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Məhsul əlavə edilmədi',
      error: error.message
    });
  }
};

// Səbətdən məhsul çıxart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      success: true,
      message: 'Məhsul səbətdən çıxarıldı',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Məhsul çıxarılmadı',
      error: error.message
    });
  }
};

// Səbət məhsulunun miqdarını dəyiş
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user.id);

    const cartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul səbətdə tapılmadı'
      });
    }

    cartItem.quantity = quantity;

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      success: true,
      message: 'Miqdar yeniləndi',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Miqdar yenilənmədi',
      error: error.message
    });
  }
};

// Səbəti al
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    res.json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};

// Səbəti təmizlə
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Səbət təmizləndi',
      cart: []
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Səbət təmizlənmədi',
      error: error.message
    });
  }
};