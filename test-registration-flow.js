// Test the complete registration flow
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testRegistrationFlow() {
  console.log('='.repeat(60));
  console.log('Testing Complete Registration Flow');
  console.log('='.repeat(60));

  const timestamp = Date.now();
  const testOrg = {
    full_name: 'Test Organization Admin',
    username: `testorg_${timestamp}`,
    password: 'TestPass123',
    organization_name: `Test Org ${timestamp}`,
  };

  console.log('\n1. Registering new organization...');
  console.log('Organization:', testOrg.organization_name);
  console.log('Admin Username:', testOrg.username);
  console.log('Admin Password:', testOrg.password);

  try {
    // Step 1: Register
    const registerResponse = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testOrg),
    });

    const registerData = await registerResponse.json();

    if (registerResponse.status === 201) {
      console.log('✅ Registration successful!');
      console.log('User ID:', registerData.user_id);
      console.log('Organization ID:', registerData.organization_id);
      console.log('Access Token:', registerData.access_token ? 'Generated ✓' : 'Missing ✗');
    } else {
      console.log('❌ Registration failed:', registerData);
      return false;
    }

    // Step 2: Login with new credentials
    console.log('\n2. Logging in with new credentials...');
    
    const loginResponse = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        username: testOrg.username,
        password: testOrg.password,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      console.log('User ID:', loginData.user_id);
      console.log('Full Name:', loginData.full_name);
      console.log('Role:', loginData.role);
      console.log('Organization ID:', loginData.organization_id);
      console.log('Access Token:', loginData.access_token ? 'Generated ✓' : 'Missing ✗');
    } else {
      console.log('❌ Login failed:', loginData);
      return false;
    }

    // Step 3: Verify admin can access dashboard
    console.log('\n3. Testing dashboard access...');
    
    const dashboardResponse = await fetch(`${SUPABASE_URL}/functions/v1/dashboard-overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-token': loginData.access_token,
      },
    });

    const dashboardData = await dashboardResponse.json();

    if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard access successful!');
      console.log('Total Active Employees:', dashboardData.total_active_employees);
      console.log('Logged In Today:', dashboardData.logged_in_today);
    } else {
      console.log('❌ Dashboard access failed:', dashboardData);
      return false;
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Complete Registration Flow Test PASSED!');
    console.log('='.repeat(60));
    console.log('\nYou can now use these credentials in the dashboard:');
    console.log('Username:', testOrg.username);
    console.log('Password:', testOrg.password);
    console.log('='.repeat(60));

    return true;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

testRegistrationFlow();
