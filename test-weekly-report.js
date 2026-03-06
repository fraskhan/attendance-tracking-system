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
console.log('Weekly Report Endpoint Tests');
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

// Helper to get Monday of current week
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
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

    // Test 1: Get weekly report for current week
    console.log('=== Test 1: Get Weekly Report for Current Week ===');
    const thisMonday = getMondayOfWeek(new Date());
    
    const currentWeekRes = await makeRequest(
      'GET', 
      `/functions/v1/weekly-report?start_date=${thisMonday}`, 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', currentWeekRes.statusCode);
    console.log('Response Body:', JSON.stringify(currentWeekRes.body, null, 2));

    if (currentWeekRes.statusCode === 200) {
      console.log('✅ SUCCESS! Weekly report retrieved.');
      console.log(`\nWeek: ${currentWeekRes.body.week_start} to ${currentWeekRes.body.week_end}`);
      console.log('\nOrganization Totals:');
      console.log(`  Total Hours: ${currentWeekRes.body.organization_totals.total_hours}`);
      console.log(`  Total Days Worked: ${currentWeekRes.body.organization_totals.total_days_worked}`);
      console.log(`  Average Hours/Employee: ${currentWeekRes.body.organization_totals.average_hours_per_employee}`);
      
      if (currentWeekRes.body.employees.length > 0) {
        console.log('\nSample Employee Report:');
        const emp = currentWeekRes.body.employees[0];
        console.log(`  Name: ${emp.full_name}`);
        console.log(`  Total Hours: ${emp.total_hours}`);
        console.log(`  Days Worked: ${emp.days_worked}`);
        console.log(`  Missing Time Outs: ${emp.missing_time_outs}`);
        console.log(`  Days Not Logged: ${emp.days_not_logged}`);
      }
    } else {
      console.log('❌ FAILED! Could not retrieve weekly report.');
    }

    // Test 2: Get weekly report for past week
    console.log('\n=== Test 2: Get Weekly Report for Past Week ===');
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonday = getMondayOfWeek(lastWeek);
    
    const pastWeekRes = await makeRequest(
      'GET', 
      `/functions/v1/weekly-report?start_date=${lastMonday}`, 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', pastWeekRes.statusCode);
    console.log(`Week: ${pastWeekRes.body.week_start} to ${pastWeekRes.body.week_end}`);

    if (pastWeekRes.statusCode === 200) {
      console.log('✅ Past week query working');
    } else {
      console.log('❌ Past week query failed');
    }

    // Test 3: Missing start_date parameter
    console.log('\n=== Test 3: Missing start_date Parameter (Should Fail) ===');
    const noDateRes = await makeRequest(
      'GET', 
      '/functions/v1/weekly-report', 
      null, 
      { 'x-user-token': accessToken }
    );

    console.log('Response Status:', noDateRes.statusCode);

    if (noDateRes.statusCode === 400) {
      console.log('✅ Correctly rejected missing start_date parameter');
    } else {
      console.log('❌ Should have rejected missing start_date parameter');
    }

    // Test 4: Invalid date format
    console.log('\n=== Test 4: Invalid Date Format (Should Fail) ===');
    const invalidDateRes = await makeRequest(
      'GET', 
      '/functions/v1/weekly-report?start_date=invalid-date', 
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
        `/functions/v1/weekly-report?start_date=${thisMonday}`, 
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
    console.log('Get Current Week Report:', currentWeekRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Get Past Week Report:', pastWeekRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED');
    console.log('Missing Date Validation:', noDateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Date Validation:', invalidDateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Employee Access Denied:', empAccessRes?.statusCode === 403 ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (currentWeekRes.statusCode === 200 && 
        pastWeekRes.statusCode === 200 && 
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
