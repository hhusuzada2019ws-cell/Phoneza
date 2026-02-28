const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    image: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  deliveredAt: Date,
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripeClientSecret: {
    type: String,
    default: null,
    select: false
  }
}, {
  timestamps: true
});

// Order number generator
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber && this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await this.constructor.countDocuments();
    const orderNum = String(count + 1).padStart(4, '0');
    
    this.orderNumber = `ORD-${year}${month}${day}-${orderNum}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);