// Test login for temployee
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testLogin() {
  console.log('\n============================================================');
  console.log('Testing temployee Login');
  console.log('============================================================\n');

  const credentials = [
    { username: 'temployee', password: 'MacpdrvN6OwG' },
    { username: 'temployee', password: 'Test123!' },
  ];

  for (const cred of credentials) {
    console.log(`\nTrying: ${cred.username} / ${cred.password}`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(cred)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS!');
        console.log('User ID:', data.user_id);
        console.log('Full Name:', data.full_name);
        console.log('Must Change Password:', data.must_change_password);
        return;
      } else {
        console.log('❌ Failed:', data.error?.message || JSON.stringify(data));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n============================================================');
  console.log('Neither password worked. Creating new employee...');
  console.log('============================================================\n');
}

testLogin();
