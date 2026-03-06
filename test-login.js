// Test script for login endpoint
const https = require('https');

const SUPABASE_URL = 'https://omjwuntbttxydlsofxao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

// Test credentials from the successful registration
const TEST_USERNAME = 'admin_1772633709047';
const TEST_PASSWORD = 'SecurePass123';

console.log('============================================================');
console.log('Login Endpoint Tests');
console.log('============================================================\n');

// Test 1: Valid login
async function testValidLogin() {
  console.log('Testing Valid Login...');
  
  const data = JSON.stringify({
    username: TEST_USERNAME,
    password: TEST_PASSWORD
  });

  console.log('Request Data:', JSON.stringify(JSON.parse(data), null, 2));

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', JSON.stringify(JSON.parse(body), null, 2));
        
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          console.log('✅ SUCCESS! Login completed.');
          console.log('User ID:', response.user_id);
          console.log('Organization ID:', response.organization_id);
          console.log('Full Name:', response.full_name);
          console.log('Role:', response.role);
          console.log('Must Change Password:', response.must_change_password);
          console.log('Access Token:', response.access_token ? 'Generated ✓' : 'Missing ✗');
          resolve(true);
        } else {
          console.log('❌ FAILED! Login did not complete successfully.');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test 2: Invalid password
async function testInvalidPassword() {
  console.log('\n=== Testing Invalid Password ===');
  
  const data = JSON.stringify({
    username: TEST_USERNAME,
    password: 'WrongPassword123'
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const response = JSON.parse(body);
        if (res.statusCode === 401 && response.error.code === 'INVALID_CREDENTIALS') {
          console.log('✅ Correctly rejected:', response.error.message);
          resolve(true);
        } else {
          console.log('❌ Did not reject invalid password correctly');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 3: Invalid username
async function testInvalidUsername() {
  console.log('\nTest: Invalid username');
  
  const data = JSON.stringify({
    username: 'nonexistent_user',
    password: 'SomePassword123'
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const response = JSON.parse(body);
        if (res.statusCode === 401 && response.error.code === 'INVALID_CREDENTIALS') {
          console.log('✅ Correctly rejected:', response.error.message);
          resolve(true);
        } else {
          console.log('❌ Did not reject invalid username correctly');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 4: Missing fields
async function testMissingFields() {
  console.log('\nTest: Missing password field');
  
  const data = JSON.stringify({
    username: TEST_USERNAME
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const response = JSON.parse(body);
        if (res.statusCode === 400 && response.error.code === 'MISSING_FIELDS') {
          console.log('✅ Correctly rejected:', response.error.message);
          resolve(true);
        } else {
          console.log('❌ Did not reject missing fields correctly');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Run all tests
async function runTests() {
  const validLoginResult = await testValidLogin();
  const invalidPasswordResult = await testInvalidPassword();
  const invalidUsernameResult = await testInvalidUsername();
  const missingFieldsResult = await testMissingFields();

  console.log('\n============================================================');
  console.log('Test Summary');
  console.log('============================================================');
  console.log('Valid Login:', validLoginResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Invalid Password:', invalidPasswordResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Invalid Username:', invalidUsernameResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Missing Fields:', missingFieldsResult ? '✅ PASSED' : '❌ FAILED');
  console.log('============================================================');

  if (validLoginResult && invalidPasswordResult && invalidUsernameResult && missingFieldsResult) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed.');
  }
}

runTests().catch(console.error);
