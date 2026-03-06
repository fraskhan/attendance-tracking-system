const https = require('https');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test credentials (admin)
const TEST_ADMIN = {
  username: 'admin_1772633709047',
  password: 'SecurePass123'
};

console.log('============================================================');
console.log('Daily Attendance Endpoint Tests');
console.log('============================================================\n');

// Helper function to make HTTP requests
function makeRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    
    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, body: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  let accessToken = null;

  try {
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginRes = await makeRequest('POST', '/functions/v1/login', {
      username: TEST_ADMIN.username,
      password: TEST_ADMIN.password
    }, {
      'Content-Type': 'application/json'
    });

    if (loginRes.statusCode !== 200) {
      console.error('❌ Login failed:', loginRes.body);
      return;
    }

    accessToken = loginRes.body.access_token;
    console.log('✅ Login successful\n');

    // Test 1: Get daily attendance for today
    console.log('=== Test 1: Get Daily Attendance for Today ===');
    const today = new Date().toISOString().split('T')[0];
    
    const todayRes = await makeRequest(
      'GET', 
      `/functions/v1/daily-attendance?date=${today}`, 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', todayRes.statusCode);
    console.log('Response Body:', JSON.stringify(todayRes.body, null, 2));

    if (todayRes.statusCode === 200) {
      console.log('✅ SUCCESS! Daily attendance retrieved.');
      console.log(`\nSummary for ${today}:`);
      console.log(`  Total Employees: ${todayRes.body.summary.total_employees}`);
      console.log(`  Logged In: ${todayRes.body.summary.logged_in}`);
      console.log(`  Completed: ${todayRes.body.summary.completed}`);
      console.log(`  Incomplete: ${todayRes.body.summary.incomplete}`);
      console.log(`  Missing: ${todayRes.body.summary.missing}`);
      console.log(`  Not Logged In: ${todayRes.body.summary.not_logged_in}`);
      
      if (todayRes.body.employees.length > 0) {
        console.log('\nSample Employee:');
        const emp = todayRes.body.employees[0];
        console.log(`  Name: ${emp.full_name}`);
        console.log(`  Username: ${emp.username}`);
        console.log(`  Status: ${emp.status}`);
        console.log(`  Time In: ${emp.time_in || 'N/A'}`);
        console.log(`  Time Out: ${emp.time_out || 'N/A'}`);
        console.log(`  Total Hours: ${emp.total_hours || 'N/A'}`);
      }
    } else {
      console.log('❌ FAILED! Could not retrieve daily attendance.');
    }

    // Test 2: Get daily attendance for a past date
    console.log('\n=== Test 2: Get Daily Attendance for Past Date ===');
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const pastRes = await makeRequest(
      'GET', 
      `/functions/v1/daily-attendance?date=${yesterday}`, 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', pastRes.statusCode);
    console.log(`Employees for ${yesterday}:`, pastRes.body.employees?.length || 0);

    if (pastRes.statusCode === 200) {
      console.log('✅ Past date query working');
    } else {
      console.log('❌ Past date query failed');
    }

    // Test 3: Missing date parameter
    console.log('\n=== Test 3: Missing Date Parameter (Should Fail) ===');
    const noDateRes = await makeRequest(
      'GET', 
      '/functions/v1/daily-attendance', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', noDateRes.statusCode);

    if (noDateRes.statusCode === 400) {
      console.log('✅ Correctly rejected missing date parameter');
    } else {
      console.log('❌ Should have rejected missing date parameter');
    }

    // Test 4: Invalid date format
    console.log('\n=== Test 4: Invalid Date Format (Should Fail) ===');
    const invalidDateRes = await makeRequest(
      'GET', 
      '/functions/v1/daily-attendance?date=invalid-date', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', invalidDateRes.statusCode);

    if (invalidDateRes.statusCode === 400) {
      console.log('✅ Correctly rejected invalid date format');
    } else {
      console.log('❌ Should have rejected invalid date format');
    }

    // Test 5: Employee trying to access (should fail)
    console.log('\n=== Test 5: Employee Access (Should Fail) ===');
    
    // Login as employee
    const empLoginRes = await makeRequest('POST', '/functions/v1/login', {
      username: 'jsmith',
      password: 'PAt6rFv6jcmJ'
    }, {
      'Content-Type': 'application/json'
    });

    let empAccessRes;
    if (empLoginRes.statusCode === 200) {
      const empToken = empLoginRes.body.access_token;
      
      empAccessRes = await makeRequest(
        'GET', 
        `/functions/v1/daily-attendance?date=${today}`, 
        null, 
        { 'x-user-token': empToken }
      );

      console.log('Response Status:', empAccessRes.statusCode);

      if (empAccessRes.statusCode === 403) {
        console.log('✅ Correctly rejected employee access');
      } else {
        console.log('❌ Should have rejected employee access');
      }
    }

    // Test Summary
    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Get Today Attendance:', todayRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Get Past Date Attendance:', pastRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Missing Date Validation:', noDateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Date Validation:', invalidDateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Employee Access Denied:', empAccessRes?.statusCode === 403 ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (todayRes.statusCode === 200 && 
        pastRes.statusCode === 200 && 
        noDateRes.statusCode === 400 &&
        invalidDateRes.statusCode === 400) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }

  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
