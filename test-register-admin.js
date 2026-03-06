// Simple Node.js test for register-admin endpoint
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testRegisterAdmin() {
  console.log('Testing Admin Registration Endpoint...\n');

  const testData = {
    full_name: 'Test Admin User',
    username: `admin_${Date.now()}`,
    password: 'SecurePass123',
    organization_name: 'Test Organization Inc',
  };

  console.log('Request Data:', JSON.stringify(testData, null, 2));
  console.log('\nSending request to:', `${SUPABASE_URL}/functions/v1/register-admin`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testData),
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\nResponse Text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('\nResponse Body:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('\nFailed to parse JSON. Raw response:', responseText);
      return false;
    }

    if (response.status === 201) {
      console.log('\n✅ SUCCESS! Admin registration completed.');
      console.log('User ID:', responseData.user_id);
      console.log('Organization ID:', responseData.organization_id);
      console.log('Access Token:', responseData.access_token ? 'Generated ✓' : 'Missing ✗');
      console.log('Refresh Token:', responseData.refresh_token ? 'Generated ✓' : 'Missing ✗');
      return true;
    } else {
      console.log('\n❌ FAILED! Registration did not complete successfully.');
      return false;
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

async function testPasswordValidation() {
  console.log('\n\n=== Testing Password Validation ===\n');

  const testCases = [
    {
      name: 'Password too short',
      data: {
        full_name: 'Test User',
        username: `user_${Date.now()}`,
        password: 'Short1',
        organization_name: 'Test Org',
      },
      expectedError: 'INVALID_PASSWORD',
    },
    {
      name: 'Password without uppercase',
      data: {
        full_name: 'Test User',
        username: `user_${Date.now() + 1}`,
        password: 'testpass123',
        organization_name: 'Test Org',
      },
      expectedError: 'INVALID_PASSWORD',
    },
    {
      name: 'Password without number',
      data: {
        full_name: 'Test User',
        username: `user_${Date.now() + 2}`,
        password: 'TestPassword',
        organization_name: 'Test Org',
      },
      expectedError: 'INVALID_PASSWORD',
    },
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.name}`);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(testCase.data),
      });

      const responseData = await response.json();
      if (response.status === 400 && responseData.error?.code === testCase.expectedError) {
        console.log('✅ Correctly rejected:', responseData.error.message);
      } else {
        console.log('❌ Unexpected response:', response.status, responseData);
        allPassed = false;
      }
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      allPassed = false;
    }
  }

  return allPassed;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Admin Registration Endpoint Tests');
  console.log('='.repeat(60));
  
  const test1 = await testRegisterAdmin();
  const test2 = await testPasswordValidation();
  
  console.log('\n\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log('Valid Registration:', test1 ? '✅ PASSED' : '❌ FAILED');
  console.log('Password Validation:', test2 ? '✅ PASSED' : '❌ FAILED');
  console.log('='.repeat(60));
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed.');
    process.exit(1);
  }
}

runTests();
