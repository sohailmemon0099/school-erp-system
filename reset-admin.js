const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'school_erp',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '880080',
  dialect: 'postgres',
  logging: false
});

async function resetAdmin() {
  try {
    console.log('🔧 Resetting admin password...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update admin password
    const [updated] = await sequelize.query(`
      UPDATE "User" 
      SET password = $1, "updatedAt" = NOW()
      WHERE email = 'admin@school.com'
    `, {
      bind: [hashedPassword]
    });
    
    console.log('✅ Admin password reset successfully');
    console.log('📋 Login credentials: admin@school.com / admin123');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetAdmin();
