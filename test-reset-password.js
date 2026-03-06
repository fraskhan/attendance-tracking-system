// Test script for reset-password endpoint
const https = require('https');

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

const ADMIN_USERNAME = 'admin_1772633709047';
const ADMIN_PASSWORD = 'SecurePass123';
const EMPLOYEE_USERNAME = 'jsmith'; // Jane Smith

console.log('============================================================');
console.log('Reset Password Endpoint Tests');
console.log('============================================================\n');

// Login as admin
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
          console.log('✅ Admin login successful\n');
          resolve(response.access_token);
        } else {
          reject(new Error('Admin login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Get employee ID
async function getEmployeeId(accessToken, username) {
  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/list-employees',
    method: 'GET',
    headers: {
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
          const response = JSON.parse(body);
          const employee = response.employees.find(e => e.username === username);
          resolve(employee ? employee.id : null);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

// Test: Reset password
async function testResetPassword(accessToken, employeeId) {
  console.log('=== Test 1: Reset Employee Password ===');
  
  const data = JSON.stringify({
    employee_id: employeeId
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/reset-password',
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
          console.log('\n✅ SUCCESS! Password reset.');
          console.log('Employee:', response.employee.full_name);
          console.log('Username:', response.employee.username);
          console.log('New Password:', response.new_password);
          console.log('Must Change Password:', response.must_change_password);
          resolve({ success: true, newPassword: response.new_password, username: response.employee.username });
        } else {
          console.log('\n❌ FAILED! Could not reset password.');
          resolve({ success: false, newPassword: null, username: null });
        }
      });
    });

    req.on('error', () => resolve({ success: false, newPassword: null, username: null }));
    req.write(data);
    req.end();
  });
}

// Test: Login with new password
async function testLoginWithNewPassword(username, password) {
  console.log('\n=== Test 2: Login with New Password ===');
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
          console.log('✅ Login with new password successful');
          console.log('Must Change Password:', response.must_change_password);
          
          if (response.must_change_password === true) {
            console.log('✅ Correctly requires password change after reset');
            resolve(true);
          } else {
            console.log('❌ Should require password change after reset');
            resolve(false);
          }
        } else {
          console.log('❌ Login with new password failed');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    const adminToken = await loginAsAdmin();
    const employeeId = await getEmployeeId(adminToken, EMPLOYEE_USERNAME);
    
    if (!employeeId) {
      console.log('❌ Could not find employee:', EMPLOYEE_USERNAME);
      return;
    }
    
    console.log('Found employee ID:', employeeId, '\n');
    
    const resetResult = await testResetPassword(adminToken, employeeId);
    
    let loginResult = false;
    if (resetResult.success && resetResult.newPassword) {
      loginResult = await testLoginWithNewPassword(resetResult.username, resetResult.newPassword);
    }

    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Reset Password:', resetResult.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Login with New Password:', loginResult ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (resetResult.success && loginResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed.');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests();
