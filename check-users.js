// Check what users exist in the database
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function checkUsers() {
  console.log('\n============================================================');
  console.log('Checking Users in Database');
  console.log('============================================================\n');

  try {
    // First, let's try to list employees (this will show us what users exist)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/list-employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-token': 'temp_token_8e8ba263-41c4-4c19-a2a2-1348d02b85ec' // Using the admin token from test
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Found users:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
