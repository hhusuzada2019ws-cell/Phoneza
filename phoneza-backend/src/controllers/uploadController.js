const { cloudinary } = require('../config/cloudinary');

// Şəkil yüklə
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Şəkil seçilməyib'
      });
    }

    res.json({
      success: true,
      message: 'Şəkil yükləndi',
      image: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şəkil yüklənmədi',
      error: error.message
    });
  }
};

// Şəkil sil
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'Şəkil silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şəkil silinmədi',
      error: error.message
    });
  }
};