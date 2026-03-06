// Manual test script for register-admin function
// Run with: deno run --allow-net --allow-env manual-test.ts

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://omjwuntbttxydlsofxao.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

async function testRegisterAdmin() {
  console.log("Testing Admin Registration Endpoint...\n");

  const testData = {
    full_name: "Test Admin User",
    username: `admin_${Date.now()}`,
    password: "SecurePass123",
    organization_name: "Test Organization Inc",
  };

  console.log("Request Data:", JSON.stringify(testData, null, 2));
  console.log("\nSending request to:", `${SUPABASE_URL}/functions/v1/register-admin`);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testData),
    });

    console.log("\nResponse Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log("\nResponse Body:", JSON.stringify(responseData, null, 2));

    if (response.status === 201) {
      console.log("\n✅ SUCCESS! Admin registration completed.");
      console.log("User ID:", responseData.user_id);
      console.log("Organization ID:", responseData.organization_id);
      console.log("Access Token:", responseData.access_token ? "Generated" : "Missing");
      console.log("Refresh Token:", responseData.refresh_token ? "Generated" : "Missing");
    } else {
      console.log("\n❌ FAILED! Registration did not complete successfully.");
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
  }
}

// Test invalid password scenarios
async function testInvalidPassword() {
  console.log("\n\n=== Testing Invalid Password Scenarios ===\n");

  const testCases = [
    {
      name: "Password too short",
      data: {
        full_name: "Test User",
        username: `user_${Date.now()}`,
        password: "Short1",
        organization_name: "Test Org",
      },
    },
    {
      name: "Password without uppercase",
      data: {
        full_name: "Test User",
        username: `user_${Date.now()}`,
        password: "testpass123",
        organization_name: "Test Org",
      },
    },
    {
      name: "Password without lowercase",
      data: {
        full_name: "Test User",
        username: `user_${Date.now()}`,
        password: "TESTPASS123",
        organization_name: "Test Org",
      },
    },
    {
      name: "Password without number",
      data: {
        full_name: "Test User",
        username: `user_${Date.now()}`,
        password: "TestPassword",
        organization_name: "Test Org",
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.name}`);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(testCase.data),
      });

      const responseData = await response.json();
      if (response.status === 400 && responseData.error?.code === "INVALID_PASSWORD") {
        console.log("✅ Correctly rejected:", responseData.error.message);
      } else {
        console.log("❌ Unexpected response:", response.status, responseData);
      }
    } catch (error) {
      console.error("❌ ERROR:", error.message);
    }
  }
}

// Run tests
await testRegisterAdmin();
await testInvalidPassword();

console.log("\n\n=== Tests Complete ===");
