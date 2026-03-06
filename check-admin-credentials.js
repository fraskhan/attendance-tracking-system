// Check for existing admin credentials
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function createTestAdmin() {
  console.log('Creating a test admin account for dashboard login...\n');

  const adminData = {
    full_name: 'Dashboard Admin',
    username: 'admin',
    password: 'Admin123',
    organization_name: 'My Organization',
  };

  console.log('Creating admin with credentials:');
  console.log('Username:', adminData.username);
  console.log('Password:', adminData.password);
  console.log('Organization:', adminData.organization_name);
  console.log('\nSending request...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(adminData),
    });

    const responseData = await response.json();

    if (response.status === 201) {
      console.log('✅ SUCCESS! Admin account created.\n');
      console.log('='.repeat(60));
      console.log('LOGIN CREDENTIALS FOR DASHBOARD:');
      console.log('='.repeat(60));
      console.log('Username: admin');
      console.log('Password: Admin123');
      console.log('='.repeat(60));
      console.log('\nYou can now login to the dashboard at http://localhost:3000');
      return true;
    } else if (response.status === 409) {
      console.log('ℹ️  Admin username already exists. Trying to login...\n');
      
      // Try to login with existing credentials
      const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'Admin123',
        }),
      });

      if (loginResponse.status === 200) {
        console.log('✅ Existing admin account found!\n');
        console.log('='.repeat(60));
        console.log('LOGIN CREDENTIALS FOR DASHBOARD:');
        console.log('='.repeat(60));
        console.log('Username: admin');
        console.log('Password: Admin123');
        console.log('='.repeat(60));
        console.log('\nYou can now login to the dashboard at http://localhost:3000');
        return true;
      } else {
        console.log('❌ Username exists but password is different.');
        console.log('Please check your previous admin credentials or use a different username.');
        return false;
      }
    } else {
      console.log('❌ Failed to create admin:', responseData);
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

createTestAdmin();
