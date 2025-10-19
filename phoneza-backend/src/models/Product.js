const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Qablolar', 'Case-lər', 'Ekran Qoruyucuları', 'Şarj Cihazları', 
           'Qulaqcıqlar', 'Power Bank', 'Holder-lər', 'Aksesuarlar']
  },
  image: {
    type: String,
    default: '📱'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  tag: {
    type: String,
    enum: ['YENİ', 'ƏN ÇOX SATAN', 'TOP', 'PREMİUM', null],
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);