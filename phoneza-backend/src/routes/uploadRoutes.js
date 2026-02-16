const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Admin only routes
router.post('/', protect, upload.single('image'), uploadImage);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;