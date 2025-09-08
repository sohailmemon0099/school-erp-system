const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully.');

    // Create default admin user if it doesn't exist
    const { User } = require('../models');
    
    const adminExists = await User.findOne({ where: { email: 'admin@school.com' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        email: 'admin@school.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '1234567890',
        isActive: true
      });
      
      console.log('✅ Default admin user created (email: admin@school.com, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = initDatabase;
