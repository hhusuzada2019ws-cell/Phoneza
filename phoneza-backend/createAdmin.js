const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB-yə qoşuldu');

    // İlk admin yarat
    const admin = await Admin.create({
      name: 'PHONEZA Admin',
      email: 'admin@phoneza.az',
      password: 'admin123456',
      role: 'superadmin'
    });

    console.log('✅ Admin yaradıldı:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123456');
    console.log('👤 Role:', admin.role);

    process.exit();
  } catch (error) {
    console.error('❌ Xəta:', error.message);
    process.exit(1);
  }
};

createAdmin();