const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmail } = require('../config/email');

const sendOrderEmail = async (order, user) => {
  const paymentLabels = { cash: 'Nağd ödəniş', card: 'Kart ilə ödəniş', online: 'Onlayn ödəniş' };
  const itemRows = order.items.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${item.price} AZN</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${(item.price * item.quantity).toFixed(2)} AZN</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1e293b;">🦁 PHONEZA</h1>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#15803d;margin:0;">✅ Sifarişiniz qəbul edildi!</h2>
        <p style="color:#166534;margin:8px 0 0 0;">Sifariş №: <strong>${order.orderNumber}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px;text-align:left;border-bottom:2px solid #e2e8f0;">Məhsul</th>
            <th style="padding:10px;text-align:center;border-bottom:2px solid #e2e8f0;">Miqdar</th>
            <th style="padding:10px;text-align:right;border-bottom:2px solid #e2e8f0;">Qiymət</th>
            <th style="padding:10px;text-align:right;border-bottom:2px solid #e2e8f0;">Cəm</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:right;margin-bottom:20px;">
        <p>Ara cəm: <strong>${order.subtotal.toFixed(2)} AZN</strong></p>
        <p>Çatdırılma: <strong>${order.shippingCost === 0 ? 'Pulsuz' : order.shippingCost + ' AZN'}</strong></p>
        <p style="font-size:18px;color:#1e293b;">Ümumi: <strong>${order.totalAmount.toFixed(2)} AZN</strong></p>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
        <h3 style="margin:0 0 12px 0;">📍 Çatdırılma Məlumatları</h3>
        <p style="margin:4px 0;">${order.shippingAddress.fullName}</p>
        <p style="margin:4px 0;">📞 ${order.shippingAddress.phone}</p>
        <p style="margin:4px 0;">📍 ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        <p style="margin:4px 0;">💳 ${paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;">© 2024 PHONEZA. Bütün hüquqlar qorunur.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: `PHONEZA — Sifariş #${order.orderNumber} qəbul edildi`,
      html
    });
  } catch (err) {
    console.error('Sifariş emaili göndərilmədi:', err.message);
  }
};

// Yeni sifariş yarat
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // User-in səbətindən məhsulları yoxla
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Səbətiniz boşdur'
      });
    }

    // Məhsulları hazırla
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const product = cartItem.product;
      
      // Stok yoxla
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} üçün kifayət qədər stok yoxdur`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: cartItem.quantity
      });

      subtotal += product.price * cartItem.quantity;

      // Stokdan çıxart
      product.stock -= cartItem.quantity;
      await product.save();
    }

    // Çatdırılma xərci (50 AZN-dən aşağı sifarişlərə)
    const shippingCost = subtotal >= 50 ? 0 : 5;
    const totalAmount = subtotal + shippingCost;

    // Sifariş yarat
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      subtotal,
      shippingCost,
      totalAmount,
      notes
    });

    // Səbəti təmizlə
    user.cart = [];
    await user.save();

    // Populate et
    await order.populate('items.product');

    // Email bildirişi göndər (arxa planda)
    sendOrderEmail(order, user);

    res.status(201).json({
      success: true,
      message: 'Sifariş uğurla yaradıldı',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Sifariş yaradılmadı',
      error: error.message
    });
  }
};

// User-in sifarişlərini gətir
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sifarişlər yüklənmədi',
      error: error.message
    });
  }
};

// Bir sifarişi gətir
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sifariş tapılmadı'
      });
    }

    // User yalnız öz sifarişini görə bilər (admin istisna)
    if (order.user._id.toString() !== req.user.id && !req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Bu sifarişə giriş icazəniz yoxdur'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Xəta baş verdi',
      error: error.message
    });
  }
};

// Admin: Bütün sifarişləri gətir
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };

    res.json({
      success: true,
      stats,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sifarişlər yüklənmədi',
      error: error.message
    });
  }
};

// Admin: Sifariş statusunu yenilə
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sifariş tapılmadı'
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Sifariş statusu yeniləndi',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Status yenilənmədi',
      error: error.message
    });
  }
};

// Sifarişi ləğv et
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sifariş tapılmadı'
      });
    }

    // Yalnız pending sifarişləri ləğv etmək olar
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu sifariş ləğv edilə bilməz'
      });
    }

    // Stoku geri qaytar
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Sifariş ləğv edildi',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Sifariş ləğv edilmədi',
      error: error.message
    });
  }
};