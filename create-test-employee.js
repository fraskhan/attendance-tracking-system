// Create a test employee with known credentials
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Use the admin token from the test
const ADMIN_TOKEN = 'temp_token_8e8ba263-41c4-4c19-a2a2-1348d02b85ec';

async function createTestEmployee() {
  console.log('\n============================================================');
  console.log('Creating Test Employee');
  console.log('============================================================\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        full_name: 'Test Employee'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Employee created successfully!\n');
      console.log('============================================================');
      console.log('SAVE THESE CREDENTIALS:');
      console.log('============================================================');
      console.log('Full Name:', data.full_name);
      console.log('Username:', data.username);
      console.log('Password:', data.password);
      console.log('============================================================\n');
      console.log('Use these credentials to login to the mobile app:');
      console.log('URL: http://localhost:8081');
      console.log('Username:', data.username);
      console.log('Password:', data.password);
      console.log('\nYou will be prompted to change the password on first login.');
    } else {
      console.log('❌ Error creating employee:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestEmployee();
