// Test script for deactivate-employee endpoint
const https = require('https');

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

const ADMIN_USERNAME = 'admin_1772633709047';
const ADMIN_PASSWORD = 'SecurePass123';
const EMPLOYEE_USERNAME = 'jdoe'; // John Doe

console.log('============================================================');
console.log('Deactivate Employee Endpoint Tests');
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

// Test 1: Deactivate employee
async function testDeactivateEmployee(accessToken, employeeId) {
  console.log('=== Test 1: Deactivate Employee ===');
  
  const data = JSON.stringify({
    employee_id: employeeId
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/deactivate-employee',
    method: 'PATCH',
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
          console.log('\n✅ SUCCESS! Employee deactivated.');
          console.log('Employee:', response.employee.full_name);
          console.log('Username:', response.employee.username);
          console.log('Is Active:', response.employee.is_active);
          resolve(true);
        } else {
          console.log('\n❌ FAILED! Could not deactivate employee.');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Test 2: Try to login as deactivated employee
async function testDeactivatedLogin(username, password) {
  console.log('\n=== Test 2: Login as Deactivated Employee ===');
  
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
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 403 && response.error && response.error.code === 'ACCOUNT_DEACTIVATED') {
            console.log('✅ Correctly rejected:', response.error.message);
            resolve(true);
          } else {
            console.log('❌ Should have rejected deactivated employee login');
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

// Test 3: Try to deactivate already deactivated employee
async function testAlreadyDeactivated(accessToken, employeeId) {
  console.log('\n=== Test 3: Deactivate Already Deactivated Employee ===');
  
  const data = JSON.stringify({
    employee_id: employeeId
  });

  const options = {
    hostname: 'omjwuntbttxydlsofxao.supabase.co',
    port: 443,
    path: '/functions/v1/deactivate-employee',
    method: 'PATCH',
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
          if (res.statusCode === 400 && response.error && response.error.code === 'ALREADY_DEACTIVATED') {
            console.log('✅ Correctly rejected:', response.error.message);
            resolve(true);
          } else {
            console.log('❌ Should have rejected already deactivated employee');
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
    
    const deactivateResult = await testDeactivateEmployee(adminToken, employeeId);
    const loginResult = await testDeactivatedLogin(EMPLOYEE_USERNAME, 'SuiFis3D19vm'); // Password from earlier test
    const alreadyDeactivatedResult = await testAlreadyDeactivated(adminToken, employeeId);

    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Deactivate Employee:', deactivateResult ? '✅ PASSED' : '❌ FAILED');
    console.log('Deactivated Login Rejection:', loginResult ? '✅ PASSED' : '❌ FAILED');
    console.log('Already Deactivated Rejection:', alreadyDeactivatedResult ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (deactivateResult && loginResult && alreadyDeactivatedResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed.');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests();
