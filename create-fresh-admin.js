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

async function createFreshAdmin() {
  try {
    console.log('🔧 Creating fresh admin user...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Delete existing admin user
    await sequelize.query(`DELETE FROM "User" WHERE email = 'admin@school.com'`);
    console.log('🗑️ Deleted existing admin user');
    
    // Create new admin user
    const [newAdmin] = await sequelize.query(`
      INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'admin@school.com', $1, 'Admin', 'User', 'admin', true, NOW(), NOW())
      RETURNING id, email, "firstName", "lastName", role
    `, {
      bind: [hashedPassword]
    });
    
    console.log('✅ Fresh admin user created successfully!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('   URL: http://localhost:3000');
    console.log('   Email: admin@school.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🚀 You can now login to your School ERP system!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createFreshAdmin();
