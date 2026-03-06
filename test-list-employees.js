// Test script for list-employees endpoint
const https = require('https');

const SUPABASE_URL = 'https://omjwuntbttxydlsofxao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw';

// Admin credentials
const ADMIN_USERNAME = 'admin_1772633709047';
const ADMIN_PASSWORD = 'SecurePass123';

console.log('============================================================');
console.log('List Employees Endpoint Tests');
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

// Test: List employees
async function testListEmployees(accessToken) {
  console.log('=== Test: List Employees ===');

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
        console.log('Response Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          console.log('Response Body:', JSON.stringify(response, null, 2));
          console.log('\n✅ SUCCESS! Employee list retrieved.');
          console.log('Total Employees:', response.total);
          console.log('\nEmployee Details:');
          response.employees.forEach((emp, index) => {
            console.log(`\n${index + 1}. ${emp.full_name}`);
            console.log('   Username:', emp.username);
            console.log('   Role:', emp.role);
            console.log('   Active:', emp.is_active);
            console.log('   Created:', new Date(emp.created_at).toLocaleString());
          });
          resolve(true);
        } else {
          console.log('Response Body:', body);
          console.log('❌ FAILED! Could not retrieve employee list.');
          resolve(false);
        }
      });
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    const adminToken = await loginAsAdmin();
    const listResult = await testListEmployees(adminToken);

    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('List Employees:', listResult ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (listResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed.');
    }
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests();
