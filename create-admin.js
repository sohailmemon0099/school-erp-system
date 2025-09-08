const axios = require('axios');

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'admin@school.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully:', response.data);
    return response.data.data.token;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Admin user already exists, trying to login...');
      
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@school.com',
        password: 'admin123'
      });
      
      console.log('✅ Admin login successful');
      return loginResponse.data.data.token;
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

createAdmin().then(token => {
  console.log('\n🎉 Admin token:', token);
  console.log('\n📋 You can now test the frontend with admin access!');
  process.exit(0);
}).catch(error => {
  console.log('❌ Failed to create admin:', error.message);
  process.exit(1);
});
