const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

const products = [
  {
    name: 'iPhone 15 Pro Silikon Case',
    description: 'Premium silikon material, MagSafe dəstəyi, anti-yellow texnologiya',
    price: 45,
    category: 'Case-lər',
    image: '📱',
    stock: 25,
    tag: 'YENİ',
    featured: true
  },
  {
    name: 'Samsung S24 Ultra Ekran Qoruyucu',
    description: '9H sərtlik, ultra şəffaf, sensor həssaslığı qoruyur',
    price: 35,
    category: 'Ekran Qoruyucuları',
    image: '🛡️',
    stock: 50,
    tag: 'ƏN ÇOX SATAN',
    featured: true
  },
  {
    name: 'USB-C Fast Charger 65W',
    description: 'GaN texnologiya, 3 port, smart charging',
    price: 55,
    category: 'Şarj Cihazları',
    image: '⚡',
    stock: 30,
    tag: 'TOP',
    featured: true
  },
  {
    name: 'Wireless Earbuds Pro',
    description: 'Active Noise Cancellation, 30 saat batareya, IPX7 su dəyanəti',
    price: 120,
    category: 'Qulaqcıqlar',
    image: '🎧',
    stock: 15,
    tag: 'PREMİUM',
    featured: true
  },
  {
    name: 'Braided Lightning Cable 2m',
    description: 'Ultra davamlı toxunma, sürətli şarj dəstəyi',
    price: 25,
    category: 'Qablolar',
    image: '🔌',
    stock: 100,
    tag: null,
    featured: false
  },
  {
    name: '20000mAh Power Bank',
    description: 'PD 30W, wireless charging, LED ekran',
    price: 75,
    category: 'Power Bank',
    image: '🔋',
    stock: 20,
    tag: 'TOP',
    featured: true
  },
  {
    name: 'Magsafe Car Mount',
    description: 'Güclü maqnit, 360° fırlanma, universal',
    price: 40,
    category: 'Holder-lər',
    image: '🚗',
    stock: 35,
    tag: null,
    featured: false
  },
  {
    name: 'AirTag Holder Keychain',
    description: 'Premium dəri, AirTag üçün xüsusi dizayn',
    price: 15,
    category: 'Aksesuarlar',
    image: '🔑',
    stock: 60,
    tag: null,
    featured: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB-yə qoşuldu');

    // Əvvəlki məhsulları sil
    await Product.deleteMany({});
    console.log('🗑️  Köhnə məhsullar silindi');

    // Yeni məhsulları əlavə et
    await Product.insertMany(products);
    console.log('✅ 8 məhsul əlavə edildi');

    process.exit();
  } catch (error) {
    console.error('❌ Xəta:', error);
    process.exit(1);
  }
};

seedDB();