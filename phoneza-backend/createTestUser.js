const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB-yə qoşuldu');

    // Test user yarat
    const user = await User.create({
      name: 'Test User',
      email: 'user@phoneza.az',
      password: 'user123456',
      phone: '+994501234567'
    });

    console.log('✅ Test user yaradıldı:');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: user123456');

    process.exit();
  } catch (error) {
    console.error('❌ Xəta:', error.message);
    process.exit(1);
  }
};

createTestUser();