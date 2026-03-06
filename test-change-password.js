// Test script for change-password endpoint
const https = require('https');

const SUPABASE_URL = 'https://omjwuntbttxydlsofxao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

// Test credentials from the successful login
const TEST_USERNAME = 'admin_1772633709047';
const TEST_PASSWORD = 'SecurePass123';
const NEW_PASSWORD = 'NewSecurePass456';

console.log('============================================================');
console.log('Change Password Endpoint Tests');
console.log('============================================================\n');

// First, login to get the access token
async function login() {
  console.log('Step 1: Logging in to get access token...');
  
  const data = JSON.stringify({
    username: TEST_USERNAME,
    password: TEST_PASSWORD
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

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          console.log('✅ Login successful');
          console.log('Access Token:', response.access_token);
          resolve(response.access_token);
        } else {
          console.log('❌ Login failed');
          reject(new Error('Login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test 1: Valid password change
async function testValidPasswordChange(accessToken) {
  console.log('\n=== Test 1: Valid Password Change ===');
  
  const data = JSON.stringify({
    current_password: TEST_PASSWORD,
    new_password: NEW_PASSWORD
  });

  console.log('Request Data:', JSON.stringify(JSON.parse(data), null, 2));

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'x-user-token': accessToken
    }
  };

  return new Promise((resolve) => {
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
          console.log('✅ SUCCESS! Password changed.');
          console.log('Must Change Password:', response.must_change_password);
          resolve(true);
        } else {
          console.log('❌ FAILED! Password change did not complete.');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 2: Login with new password
async function testLoginWithNewPassword() {
  console.log('\n=== Test 2: Login with New Password ===');
  
  const data = JSON.stringify({
    username: TEST_USERNAME,
    password: NEW_PASSWORD
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
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          console.log('✅ Login with new password successful');
          console.log('Must Change Password:', response.must_change_password);
          resolve(response.access_token);
        } else {
          console.log('❌ Login with new password failed');
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

// Test 3: Invalid current password
async function testInvalidCurrentPassword(accessToken) {
  console.log('\n=== Test 3: Invalid Current Password ===');
  
  const data = JSON.stringify({
    current_password: 'WrongPassword123',
    new_password: 'AnotherNewPass789'
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'x-user-token': accessToken
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 401 && response.error && response.error.code === 'INVALID_CURRENT_PASSWORD') {
            console.log('✅ Correctly rejected:', response.error.message);
            resolve(true);
          } else {
            console.log('❌ Did not reject invalid current password correctly');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Error parsing response');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 4: Weak new password
async function testWeakPassword(accessToken) {
  console.log('\n=== Test 4: Weak New Password ===');
  
  const data = JSON.stringify({
    current_password: NEW_PASSWORD,
    new_password: 'weak'
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'x-user-token': accessToken
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 400 && response.error && response.error.code === 'INVALID_PASSWORD') {
            console.log('✅ Correctly rejected:', response.error.message);
            resolve(true);
          } else {
            console.log('❌ Did not reject weak password correctly');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Error parsing response');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 5: Change password back to original
async function changePasswordBack(accessToken) {
  console.log('\n=== Cleanup: Changing password back to original ===');
  
  const data = JSON.stringify({
    current_password: NEW_PASSWORD,
    new_password: TEST_PASSWORD
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'x-user-token': accessToken
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Password restored to original');
          resolve(true);
        } else {
          console.log('⚠️  Could not restore password');
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
  try {
    const accessToken = await login();
    const validChangeResult = await testValidPasswordChange(accessToken);
    const newPasswordToken = await testLoginWithNewPassword();
    
    if (!newPasswordToken) {
      console.log('\n⚠️  Cannot continue tests - login with new password failed');
      return;
    }
    
    const invalidCurrentResult = await testInvalidCurrentPassword(newPasswordToken);
    const weakPasswordResult = await testWeakPassword(newPasswordToken);
    await changePasswordBack(newPasswordToken);

    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Valid Password Change:', validChangeResult ? '✅ PASSED' : '❌ FAILED');
    console.log('Login with New Password:', newPasswordToken ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Current Password:', invalidCurrentResult ? '✅ PASSED' : '❌ FAILED');
    console.log('Weak Password Rejection:', weakPasswordResult ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (validChangeResult && newPasswordToken && invalidCurrentResult && weakPasswordResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed.');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests();
