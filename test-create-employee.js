// Test script for create-employee endpoint
const https = require('https');

const SUPABASE_URL = 'https://omjwuntbttxydlsofxao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

// Admin credentials
const ADMIN_USERNAME = 'admin_1772633709047';
const ADMIN_PASSWORD = 'SecurePass123';

console.log('============================================================');
console.log('Create Employee Endpoint Tests');
console.log('============================================================\n');

// First, login as admin to get access token
async function loginAsAdmin() {
  console.log('Step 1: Logging in as admin...');
  
  const data = JSON.stringify({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD
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
          console.log('✅ Admin login successful');
          console.log('Access Token:', response.access_token);
          resolve(response.access_token);
        } else {
          console.log('❌ Admin login failed');
          reject(new Error('Admin login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test 1: Create employee with valid data
async function testCreateEmployee(accessToken) {
  console.log('\n=== Test 1: Create Employee ===');
  
  const data = JSON.stringify({
    full_name: "John Doe"
  });

  console.log('Request Data:', JSON.stringify(JSON.parse(data), null, 2));

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/create-employee',
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
        
        if (res.statusCode === 201) {
          const response = JSON.parse(body);
          console.log('✅ SUCCESS! Employee created.');
          console.log('User ID:', response.user_id);
          console.log('Full Name:', response.full_name);
          console.log('Username:', response.username);
          console.log('Password:', response.password);
          console.log('Must Change Password:', response.must_change_password);
          resolve({ success: true, credentials: response });
        } else {
          console.log('❌ FAILED! Employee creation did not complete.');
          resolve({ success: false, credentials: null });
        }
      });
    });

    req.on('error', () => resolve({ success: false, credentials: null }));
    req.write(data);
    req.end();
  });
}

// Test 2: Create another employee (test username generation)
async function testCreateAnotherEmployee(accessToken) {
  console.log('\n=== Test 2: Create Another Employee (Username Generation) ===');
  
  const data = JSON.stringify({
    full_name: "Jane Smith"
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/create-employee',
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
        if (res.statusCode === 201) {
          const response = JSON.parse(body);
          console.log('✅ Employee created');
          console.log('Username:', response.username);
          console.log('Password:', response.password);
          resolve({ success: true, credentials: response });
        } else {
          console.log('❌ Failed to create employee');
          resolve({ success: false, credentials: null });
        }
      });
    });

    req.on('error', () => resolve({ success: false, credentials: null }));
    req.write(data);
    req.end();
  });
}

// Test 3: Login as new employee
async function testEmployeeLogin(username, password) {
  console.log('\n=== Test 3: Login as New Employee ===');
  console.log('Testing login with username:', username);
  
  const data = JSON.stringify({
    username: username,
    password: password
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
          console.log('✅ Employee login successful');
          console.log('Must Change Password:', response.must_change_password);
          
          if (response.must_change_password === true) {
            console.log('✅ Correctly requires password change on first login');
            resolve(true);
          } else {
            console.log('❌ Should require password change on first login');
            resolve(false);
          }
        } else {
          console.log('❌ Employee login failed');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 4: Missing full name
async function testMissingFullName(accessToken) {
  console.log('\n=== Test 4: Missing Full Name ===');
  
  const data = JSON.stringify({});

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/create-employee',
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
          if (res.statusCode === 400 && response.error && response.error.code === 'MISSING_FIELDS') {
            console.log('✅ Correctly rejected:', response.error.message);
            resolve(true);
          } else {
            console.log('❌ Did not reject missing full name correctly');
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

// Run all tests
async function runTests() {
  try {
    const adminToken = await loginAsAdmin();
    const createResult1 = await testCreateEmployee(adminToken);
    const createResult2 = await testCreateAnotherEmployee(adminToken);
    
    let employeeLoginResult = false;
    if (createResult1.success && createResult1.credentials) {
      employeeLoginResult = await testEmployeeLogin(
        createResult1.credentials.username,
        createResult1.credentials.password
      );
    }
    
    const missingNameResult = await testMissingFullName(adminToken);

    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Create Employee:', createResult1.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Create Another Employee:', createResult2.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Employee Login & Must Change Password:', employeeLoginResult ? '✅ PASSED' : '❌ FAILED');
    console.log('Missing Full Name Validation:', missingNameResult ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (createResult1.success && createResult2.success && employeeLoginResult && missingNameResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed.');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests();
