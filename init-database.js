const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Grade = require('./models/Grade');
const Fee = require('./models/Fee');

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'school_erp',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '880080',
  dialect: 'postgres',
  logging: console.log
});

async function initDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync all models (create tables)
    console.log('📋 Creating tables...');
    await sequelize.sync({ force: false });
    console.log('✅ All tables created/updated');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@school.com' },
      defaults: {
        email: 'admin@school.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }
    });
    
    if (created) {
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create a test class
    console.log('🏫 Creating test class...');
    const [testClass, classCreated] = await Class.findOrCreate({
      where: { name: 'Grade 1', section: 'A' },
      defaults: {
        name: 'Grade 1',
        section: 'A',
        academicYear: '2024-2025',
        capacity: 30,
        isActive: true
      }
    });
    
    if (classCreated) {
      console.log('✅ Test class created');
    } else {
      console.log('ℹ️ Test class already exists');
    }
    
    // Create a test student
    console.log('👨‍🎓 Creating test student...');
    const [testUser, userCreated] = await User.findOrCreate({
      where: { email: 'student@test.com' },
      defaults: {
        email: 'student@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        isActive: true
      }
    });
    
    if (userCreated) {
      const [testStudent, studentCreated] = await Student.findOrCreate({
        where: { userId: testUser.id },
        defaults: {
          userId: testUser.id,
          studentId: 'STU001',
          admissionDate: new Date(),
          classId: testClass.id,
          parentName: 'Parent Name',
          parentPhone: '1234567890',
          parentEmail: 'parent@test.com',
          isActive: true
        }
      });
      
      if (studentCreated) {
        console.log('✅ Test student created');
      } else {
        console.log('ℹ️ Test student already exists');
      }
    }
    
    console.log('\n🎉 Database initialization completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@school.com / admin123');
    console.log('   Student: student@test.com / admin123');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

initDatabase();
