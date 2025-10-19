const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Token yaratma funksiyası
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Admin qeydiyyatı (ilk admin yaratmaq üçün)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email yoxla
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email artıq qeydiyyatdan keçib'
      });
    }

    // Admin yarat
    const admin = await Admin.create({
      name,
      email,
      password
    });

    // Token yarat
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin yaradıldı',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Admin yaradılmadı',
      error: error.message
    });
  }
};

// Admin login
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

    // Admin tap
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email və ya password yanlışdır'
      });
    }

    // Password yoxla
    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email və ya password yanlışdır'
      });
    }

    // Active yoxla
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktivdir'
      });
    }

    // Token yarat
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login uğurlu',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
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

// Cari admin məlumatı
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
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