// Test script to create an employee for mobile app testing
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function createTestEmployee() {
  console.log('\n=== Creating Test Employee for Mobile App ===\n');

  // First, login as admin to get token
  console.log('1. Logging in as admin...');
  const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'Admin123',
    }),
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    console.error('❌ Admin login failed:', error);
    console.log('\nPlease make sure you have an admin account created.');
    console.log('You can create one through the admin dashboard at http://localhost:3000/register');
    return;
  }

  const loginData = await loginResponse.json();
  console.log('✅ Admin logged in successfully');

  // Create employee
  console.log('\n2. Creating test employee...');
  const createResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'x-user-token': loginData.token,
    },
    body: JSON.stringify({
      full_name: 'Test Employee',
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error('❌ Failed to create employee:', error);
    return;
  }

  const employeeData = await createResponse.json();
  console.log('✅ Employee created successfully!\n');

  console.log('============================================================');
  console.log('MOBILE APP TEST CREDENTIALS:');
  console.log('============================================================');
  console.log(`Username: ${employeeData.username}`);
  console.log(`Password: ${employeeData.password}`);
  console.log('============================================================\n');
  console.log('📱 Use these credentials to login to the mobile app');
  console.log('⚠️  You will be required to change the password on first login\n');
}

createTestEmployee().catch(console.error);
