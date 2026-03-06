const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test credentials (from previous tests)
const TEST_EMPLOYEE = {
  username: 'jsmith',
  password: 'PAt6rFv6jcmJ' // Password after reset
};

console.log('============================================================');
console.log('Time In Endpoint Tests');
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
      if (data instanceof Buffer) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    
    req.end();
  });
}

// Helper to create multipart form data
function createMultipartFormData(fields, files) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  // Add text fields
  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
      `${value}\r\n`
    );
  }

  // Add file fields
  for (const [name, file] of Object.entries(files)) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"; filename="${file.filename}"\r\n` +
      `Content-Type: ${file.contentType}\r\n\r\n`
    );
    parts.push(file.data);
    parts.push('\r\n');
  }

  parts.push(`--${boundary}--\r\n`);

  return {
    boundary,
    data: Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p)))
  };
}

// Create a dummy image file (1x1 pixel PNG)
function createDummyImage() {
  // Minimal valid PNG file (1x1 transparent pixel)
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
}

async function runTests() {
  let accessToken = null;

  try {
    // Step 1: Login as employee to get access token
    console.log('Step 1: Logging in as employee...');
    const loginRes = await makeRequest('POST', '/functions/v1/login', {
      username: TEST_EMPLOYEE.username,
      password: TEST_EMPLOYEE.password
    }, {
      'Content-Type': 'application/json'
    });

    if (loginRes.statusCode !== 200) {
      console.error('❌ Login failed:', loginRes.body);
      console.log('\n⚠️  Make sure the employee exists and password is correct.');
      console.log('   You may need to run test-create-employee.js first.');
      return;
    }

    accessToken = loginRes.body.access_token;
    console.log('✅ Login successful');
    console.log(`Access Token: ${accessToken}\n`);

    // Step 2: Test valid time in
    console.log('=== Test 1: Valid Time In ===');
    const timestamp = new Date().toISOString();
    const dummyImage = createDummyImage();
    
    const formData = createMultipartFormData(
      { timestamp },
      { 
        photo: {
          filename: 'time_in.png',
          contentType: 'image/png',
          data: dummyImage
        }
      }
    );

    const timeInRes = await makeRequest('POST', '/functions/v1/time-in', formData.data, {
      'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
      'x-user-token': accessToken
    });

    console.log('Response Status:', timeInRes.statusCode);
    console.log('Response Body:', JSON.stringify(timeInRes.body, null, 2));

    if (timeInRes.statusCode === 201) {
      console.log('✅ SUCCESS! Time in recorded.');
      console.log(`Log ID: ${timeInRes.body.log_id}`);
      console.log(`Time In: ${timeInRes.body.time_in}`);
      console.log(`Photo URL: ${timeInRes.body.photo_url}`);
    } else {
      console.log('❌ FAILED! Time in did not complete.');
    }

    // Step 3: Test duplicate time in (should fail)
    console.log('\n=== Test 2: Duplicate Time In (Should Fail) ===');
    const duplicateRes = await makeRequest('POST', '/functions/v1/time-in', formData.data, {
      'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
      'x-user-token': accessToken
    });

    console.log('Response Status:', duplicateRes.statusCode);
    console.log('Response Body:', JSON.stringify(duplicateRes.body, null, 2));

    if (duplicateRes.statusCode === 400 && duplicateRes.body.error?.code === 'DUPLICATE_TIME_IN') {
      console.log('✅ Correctly rejected duplicate time in');
    } else {
      console.log('❌ Should have rejected duplicate time in');
    }

    // Step 4: Test missing photo
    console.log('\n=== Test 3: Missing Photo (Should Fail) ===');
    const noPhotoData = createMultipartFormData({ timestamp }, {});
    
    const noPhotoRes = await makeRequest('POST', '/functions/v1/time-in', noPhotoData.data, {
      'Content-Type': `multipart/form-data; boundary=${noPhotoData.boundary}`,
      'x-user-token': accessToken
    });

    console.log('Response Status:', noPhotoRes.statusCode);
    
    if (noPhotoRes.statusCode === 400) {
      console.log('✅ Correctly rejected missing photo');
    } else {
      console.log('❌ Should have rejected missing photo');
    }

    // Step 5: Test invalid timestamp
    console.log('\n=== Test 4: Invalid Timestamp (Should Fail) ===');
    const invalidTimestampData = createMultipartFormData(
      { timestamp: 'invalid-timestamp' },
      { 
        photo: {
          filename: 'time_in.png',
          contentType: 'image/png',
          data: dummyImage
        }
      }
    );
    
    const invalidTimestampRes = await makeRequest('POST', '/functions/v1/time-in', invalidTimestampData.data, {
      'Content-Type': `multipart/form-data; boundary=${invalidTimestampData.boundary}`,
      'x-user-token': accessToken
    });

    console.log('Response Status:', invalidTimestampRes.statusCode);
    
    if (invalidTimestampRes.statusCode === 400) {
      console.log('✅ Correctly rejected invalid timestamp');
    } else {
      console.log('❌ Should have rejected invalid timestamp');
    }

    // Test Summary
    console.log('\n============================================================');
    console.log('Test Summary');
    console.log('============================================================');
    console.log('Valid Time In:', timeInRes.statusCode === 201 ? '✅ PASSED' : '❌ FAILED');
    console.log('Duplicate Prevention:', duplicateRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Missing Photo Validation:', noPhotoRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('Invalid Timestamp Validation:', invalidTimestampRes.statusCode === 400 ? '✅ PASSED' : '❌ FAILED');
    console.log('============================================================');

    if (timeInRes.statusCode === 201 && 
        duplicateRes.statusCode === 400 && 
        noPhotoRes.statusCode === 400 &&
        invalidTimestampRes.statusCode === 400) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }

  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
