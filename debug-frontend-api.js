const axios = require('axios');

const testFrontendAPI = async () => {
  try {
    console.log('🔍 Testing frontend API connection...');
    
    // Test 1: Check if backend is accessible
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test 2: Login and get token
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@school.com',
      password: 'admin123'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    
    // Test 3: Test inquiries API with token
    console.log('\n3. Testing inquiries API...');
    const inquiriesResponse = await axios.get('http://localhost:5000/api/inquiries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Inquiries API working');
    console.log('📊 Found inquiries:', inquiriesResponse.data.data.inquiries.length);
    
    // Test 4: Test classes API
    console.log('\n4. Testing classes API...');
    const classesResponse = await axios.get('http://localhost:5000/api/classes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Classes API working');
    console.log('📊 Found classes:', classesResponse.data.data.classes.length);
    
    console.log('\n🎉 All API tests passed!');
    console.log('\n💡 If frontend still shows "No inquiries found", the issue is likely:');
    console.log('   - Frontend token expired or not stored properly');
    console.log('   - JavaScript error in browser console');
    console.log('   - CORS issue');
    console.log('   - Frontend not sending Authorization header');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
};

testFrontendAPI();
