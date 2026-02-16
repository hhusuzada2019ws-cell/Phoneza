const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Token yaratma
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// User qeydiyyatı
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Email yoxla
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email artıq qeydiyyatdan keçib'
      });
    }

    // User yarat
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Token yarat
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Qeydiyyat uğurlu',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Qeydiyyat uğursuz',
      error: error.message
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email və password yoxla
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email və password daxil edin'
      });
    }

    // User tap
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email və ya password yanlışdır'
      });
    }

    // Password yoxla
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email və ya password yanlışdır'
      });
    }

    // Active yoxla
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktivdir'
      });
    }

    // Token yarat
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login uğurlu',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login xətası',
      error: error.message
    });
  }
};

// Cari user məlumatı
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        cart: user.cart
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};

// Profil yenilə
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profil yeniləndi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Profil yenilənmədi',
      error: error.message
    });
  }
};