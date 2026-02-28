const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// Şifrə bərpası sorğusu göndər
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email ünvanını daxil edin'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Təhlükəsizlik üçün həmişə eyni cavab veririk
    if (!user) {
      return res.json({
        success: true,
        message: 'Əgər bu email qeydiyyatdadırsa, bərpa linki göndəriləcək'
      });
    }

    // Token yarat
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 dəqiqə
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e293b; font-size: 28px;">🦁 PHONEZA</h1>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Şifrə Bərpası</h2>
          <p style="color: #475569; margin-bottom: 24px;">
            Salam <strong>${user.name}</strong>,<br><br>
            Hesabınız üçün şifrə bərpası sorğusu alındı. Aşağıdakı düyməyə klikləyin:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #3b82f6; color: white; padding: 14px 28px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Şifrəni Bərpa Et
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            Bu link <strong>30 dəqiqə</strong> ərzində etibarlıdır.<br>
            Əgər bu sorğunu siz göndərməmisinizsə, bu emaili nəzərə almayın.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 PHONEZA. Bütün hüquqlar qorunur.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'PHONEZA — Şifrə Bərpası',
      html
    });

    res.json({
      success: true,
      message: 'Bərpa linki email ünvanınıza göndərildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email göndərilmədi',
      error: error.message
    });
  }
};

// Yeni şifrə təyin et
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifrə ən azı 6 simvol olmalıdır'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token etibarsızdır və ya vaxtı keçib'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Şifrəniz uğurla yeniləndi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};
