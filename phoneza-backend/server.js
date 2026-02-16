const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Config
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Static files
app.use(express.static('public'));
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB-yə qoşuldu!');
  })
  .catch((err) => {
    console.error('❌ MongoDB qoşulma xətası:', err.message);
  });
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/', (req, res) => {
  res.json({ 
    message: 'PHONEZA API işləyir! 🦁',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Qoşuludur ✅' : 'Qoşulu deyil ❌'
  });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portunda işləyir`);
  console.log(`🌐 http://localhost:${PORT}`);
});