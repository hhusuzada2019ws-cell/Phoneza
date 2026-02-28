const Product = require('../models/Product');

// Bütün məhsulları gətir (axtarış + filter dəstəyi ilə)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, tag, minPrice, maxPrice, featured } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (tag) filter.tag = tag;
    if (featured === 'true') filter.featured = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Məhsullar yüklənmədi',
      error: error.message
    });
  }
};

// Bir məhsul gətir
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};

// Yeni məhsul yarat
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: req.body.image || 'https://via.placeholder.com/400x400?text=No+Image',
      imagePublicId: req.body.imagePublicId || null
    };
    
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Məhsul əlavə edildi',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Məhsul əlavə edilmədi',
      error: error.message
    });
  }
};

// Məhsul yenilə
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Məhsul yeniləndi',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Məhsul yenilənmədi',
      error: error.message
    });
  }
};

// Məhsul sil
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Məhsul tapılmadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Məhsul silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Məhsul silinmədi',
      error: error.message
    });
  }
};