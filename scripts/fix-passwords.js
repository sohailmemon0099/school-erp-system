const bcrypt = require('bcryptjs');
const { User } = require('../models');

const fixPasswords = async () => {
  try {
    console.log('🔍 Checking for users with unhashed passwords...');
    
    // Get all users
    const users = await User.findAll();
    
    let fixedCount = 0;
    
    for (const user of users) {
      // Check if password looks like it's not hashed (less than 60 characters or doesn't start with $2a$)
      if (user.password && user.password.length < 60 && !user.password.startsWith('$2a$')) {
        console.log(`🔧 Fixing password for user: ${user.email}`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Update the user with hashed password
        await user.update({ password: hashedPassword });
        
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} user passwords`);
    } else {
      console.log('✅ All user passwords are already properly hashed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
};

fixPasswords();
