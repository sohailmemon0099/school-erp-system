const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    console.log('🔄 Creating admin user...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@school.com' } });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      email: 'admin@school.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+1234567890',
      address: 'School Address',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@school.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    process.exit(1);
  }
};

createAdmin().then(() => {
  process.exit(0);
});
