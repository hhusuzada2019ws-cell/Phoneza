const User = require('../models/User');
const Order = require('../models/Order');

// Bütün istifadəçiləri gətir
exports.getAllUsers = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstifadəçilər yüklənmədi',
      error: error.message
    });
  }
};

// Bir istifadəçini gətir (sifarişləri ilə)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      user,
      orders,
      orderCount: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};

// İstifadəçi statusunu dəyiş (aktiv/deaktiv)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'İstifadəçi aktivləşdirildi' : 'İstifadəçi deaktivləşdirildi',
      isActive: user.isActive
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Status dəyişdirilmədi',
      error: error.message
    });
  }
};
