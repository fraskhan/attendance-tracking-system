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
console.log('Dashboard Overview Endpoint Tests');
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

    // Test 1: Get dashboard overview
    console.log('=== Test 1: Get Dashboard Overview ===');
    
    const overviewRes = await makeRequest(
      'GET', 
      '/functions/v1/dashboard-overview', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', overviewRes.statusCode);
    console.log('Response Body:', JSON.stringify(overviewRes.body, null, 2));

    if (overviewRes.statusCode === 200) {
      console.log('✅ SUCCESS! Dashboard overview retrieved.');
      console.log('\n📊 Dashboard Metrics:');
      console.log(`  Date: ${overviewRes.body.date}`);
      console.log(`  Total Employees: ${overviewRes.body.total_employees}`);
      console.log(`  Active Employees: ${overviewRes.body.active_employees}`);
      console.log(`  Logged In Today: ${overviewRes.body.logged_in_today}`);
      console.log(`  Completed Today: ${overviewRes.body.completed_today}`);
      console.log(`  Missing Time Outs Today: ${overviewRes.body.missing_time_outs_today}`);
      console.log(`  Total Hours Today: ${overviewRes.body.total_hours_today}`);
      console.log(`  Average Hours Today: ${overviewRes.body.average_hours_today}`);
    } else {
      console.log('❌ FAILED! Could not retrieve dashboard overview.');
    }

    // Test 2: Verify metrics are numbers
    console.log('\n=== Test 2: Verify Metrics Data Types ===');
    
    let metricsValid = true;
    if (overviewRes.statusCode === 200) {
      const metrics = overviewRes.body;
      
      if (typeof metrics.total_employees !== 'number') {
        console.log('❌ total_employees is not a number');
        metricsValid = false;
      }
      if (typeof metrics.logged_in_today !== 'number') {
        console.log('❌ logged_in_today is not a number');
        metricsValid = false;
      }
      if (typeof metrics.total_hours_today !== 'number') {
        console.log('❌ total_hours_today is not a number');
        metricsValid = false;
      }
      
      if (metricsValid) {
        console.log('✅ All metrics have correct data types');
      }
    }

    // Test 3: Employee trying to access (should fail)
    console.log('\n=== Test 3: Employee Access (Should Fail) ===');
    
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
        '/functions/v1/dashboard-overview', 
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

    // Test 4: Unauthorized access (no token)
    console.log('\n=== Test 4: Unauthorized Access (Should Fail) ===');
    
    const noTokenRes = await makeRequest(
      'GET', 
      '/functions/v1/dashboard-overview', 
      null, 
      {}
    );

    console.log('Response Status:', noTokenRes.statusCode);

    if (noTokenRes.statusCode === 401) {
      console.log('✅ Correctly rejected unauthorized access');
    } else {
      console.log('❌ Should have rejected unauthorized access');
    }

    // Test Summary
    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Get Dashboard Overview:', overviewRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Metrics Data Types:', metricsValid ? '✅ PASSED' : '❌ FAILED');
    console.log('Employee Access Denied:', empAccessRes?.statusCode === 403 ? '✅ PASSED' : '❌ FAILED');
    console.log('Unauthorized Access Denied:', noTokenRes.statusCode === 401 ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (overviewRes.statusCode === 200 && 
        metricsValid &&
        empAccessRes?.statusCode === 403 &&
        noTokenRes.statusCode === 401) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }

  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
