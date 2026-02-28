const Review = require('../models/Review');
const Order = require('../models/Order');

// GET /api/reviews/:productId — Məhsulun rəylərini gətir
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Rəylər gətirilmədi', error: err.message });
  }
};

// POST /api/reviews/:productId — Rəy əlavə et
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user.id;

    // İstifadəçi bu məhsulu satın alıbmı yoxla
    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: { $in: ['çatdırıldı', 'tamamlandı'] }
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Yalnız satın aldığınız məhsullara rəy yaza bilərsiniz'
      });
    }

    // Mövcud rəy varmı?
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bu məhsula artıq rəy vermişsiniz'
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment
    });

    await review.populate('user', 'name');

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bu məhsula artıq rəy vermişsiniz' });
    }
    res.status(500).json({ success: false, message: 'Rəy əlavə edilmədi', error: err.message });
  }
};

// PUT /api/reviews/:reviewId — Rəyi redaktə et
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Rəy tapılmadı' });
    }

    // Yalnız öz rəyini redaktə edə bilər
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'İcazə yoxdur' });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;

    await review.save();
    await review.populate('user', 'name');

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Rəy yenilənmədi', error: err.message });
  }
};

// DELETE /api/reviews/:reviewId — Rəyi sil
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Rəy tapılmadı' });
    }

    // Öz rəyini silə bilər, admin də silə bilər
    if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'İcazə yoxdur' });
    }

    await Review.findOneAndDelete({ _id: req.params.reviewId });

    res.json({ success: true, message: 'Rəy silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Rəy silinmədi', error: err.message });
  }
};

// GET /api/reviews/my — Mənim rəylərim
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Rəylər gətirilmədi', error: err.message });
  }
};
