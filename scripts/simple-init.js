const { sequelize } = require('../models');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models with force: true to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized successfully.');

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase().then(() => {
  process.exit(0);
});
