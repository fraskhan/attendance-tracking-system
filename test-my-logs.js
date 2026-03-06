const https = require('https');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test credentials
const TEST_EMPLOYEE = {
  username: 'jsmith',
  password: 'PAt6rFv6jcmJ'
};

console.log('============================================================');
console.log('My Logs Endpoint Tests');
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
    // Step 1: Login as employee
    console.log('Step 1: Logging in as employee...');
    const loginRes = await makeRequest('POST', '/functions/v1/login', {
      username: TEST_EMPLOYEE.username,
      password: TEST_EMPLOYEE.password
    }, {
      'Content-Type': 'application/json'
    });

    if (loginRes.statusCode !== 200) {
      console.error('❌ Login failed:', loginRes.body);
      return;
    }

    accessToken = loginRes.body.access_token;
    console.log('✅ Login successful\n');

    // Test 1: Get all logs (no filters)
    console.log('=== Test 1: Get All Logs ===');
    const allLogsRes = await makeRequest('GET', '/functions/v1/my-logs', null, {
      'x-user-token': accessToken
    });

    console.log('Response Status:', allLogsRes.statusCode);
    console.log('Response Body:', JSON.stringify(allLogsRes.body, null, 2));

    if (allLogsRes.statusCode === 200) {
      console.log('✅ SUCCESS! Logs retrieved.');
      console.log(`Total Count: ${allLogsRes.body.total_count}`);
      console.log(`Logs Returned: ${allLogsRes.body.logs.length}`);
      console.log(`Has More: ${allLogsRes.body.has_more}`);
      
      if (allLogsRes.body.logs.length > 0) {
        console.log('\nSample Log:');
        const log = allLogsRes.body.logs[0];
        console.log(`  Date: ${log.date}`);
        console.log(`  Time In: ${log.time_in || 'N/A'}`);
        console.log(`  Time Out: ${log.time_out || 'N/A'}`);
        console.log(`  Total Hours: ${log.total_hours || 'N/A'}`);
        console.log(`  Status: ${log.status}`);
      }
    } else {
      console.log('❌ FAILED! Could not retrieve logs.');
    }

    // Test 2: Get logs with date range
    console.log('\n=== Test 2: Get Logs with Date Range ===');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const dateRangeRes = await makeRequest(
      'GET', 
      `/functions/v1/my-logs?start_date=${yesterday}&end_date=${today}`, 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', dateRangeRes.statusCode);
    console.log(`Logs in range ${yesterday} to ${today}:`, dateRangeRes.body.logs.length);

    if (dateRangeRes.statusCode === 200) {
      console.log('✅ Date range filter working');
    } else {
      console.log('❌ Date range filter failed');
    }

    // Test 3: Get logs with pagination
    console.log('\n=== Test 3: Get Logs with Pagination ===');
    const paginatedRes = await makeRequest(
      'GET', 
      '/functions/v1/my-logs?limit=2&offset=0', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', paginatedRes.statusCode);
    console.log(`Logs Returned: ${paginatedRes.body.logs.length}`);
    console.log(`Limit: ${paginatedRes.body.limit}`);
    console.log(`Offset: ${paginatedRes.body.offset}`);

    if (paginatedRes.statusCode === 200 && paginatedRes.body.logs.length <= 2) {
      console.log('✅ Pagination working');
    } else {
      console.log('❌ Pagination failed');
    }

    // Test 4: Invalid date format
    console.log('\n=== Test 4: Invalid Date Format (Should Fail) ===');
    const invalidDateRes = await makeRequest(
      'GET', 
      '/functions/v1/my-logs?start_date=invalid-date', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', invalidDateRes.statusCode);

    if (invalidDateRes.statusCode === 400) {
      console.log('✅ Correctly rejected invalid date format');
    } else {
      console.log('❌ Should have rejected invalid date format');
    }

    // Test 5: Invalid limit
    console.log('\n=== Test 5: Invalid Limit (Should Fail) ===');
    const invalidLimitRes = await makeRequest(
      'GET', 
      '/functions/v1/my-logs?limit=200', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', invalidLimitRes.statusCode);

    if (invalidLimitRes.statusCode === 400) {
      console.log('✅ Correctly rejected invalid limit');
    } else {
      console.log('❌ Should have rejected invalid limit');
    }

    // Test Summary
    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Get All Logs:', allLogsRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Date Range Filter:', dateRangeRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Pagination:', paginatedRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Date Validation:', invalidDateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Limit Validation:', invalidLimitRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (allLogsRes.statusCode === 200 && 
        dateRangeRes.statusCode === 200 && 
        paginatedRes.statusCode === 200 &&
        invalidDateRes.statusCode === 400 &&
        invalidLimitRes.statusCode === 400) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }

  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
