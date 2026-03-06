// Unit tests for admin registration endpoint
// Tests Requirements: 2.1, 2.2, 2.3, 2.4, 2.5

import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Test configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/register-admin`;

Deno.test("Admin Registration - Valid registration creates organization and admin user", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: `testadmin_${Date.now()}`,
    password: "TestPass123",
    organization_name: "Test Organization",
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 201);
  
  const data = await response.json();
  assertExists(data.user_id);
  assertExists(data.organization_id);
  assertExists(data.access_token);
  assertExists(data.refresh_token);

  // Verify organization was created
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", data.organization_id)
    .single();

  assertExists(org);
  assertEquals(org.name, requestBody.organization_name);

  // Verify user was created and linked to organization
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user_id)
    .single();

  assertExists(user);
  assertEquals(user.full_name, requestBody.full_name);
  assertEquals(user.username, requestBody.username);
  assertEquals(user.organization_id, data.organization_id);
  assertEquals(user.role, "admin");
  assertEquals(user.is_active, true);
  assertEquals(user.must_change_password, false);
});

Deno.test("Admin Registration - Missing fields returns 400", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: "testadmin",
    // Missing password and organization_name
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 400);
  
  const data = await response.json();
  assertEquals(data.error.code, "MISSING_FIELDS");
});

Deno.test("Admin Registration - Password too short returns 400", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: `testadmin_${Date.now()}`,
    password: "Short1", // Only 6 characters
    organization_name: "Test Organization",
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 400);
  
  const data = await response.json();
  assertEquals(data.error.code, "INVALID_PASSWORD");
});

Deno.test("Admin Registration - Password without uppercase returns 400", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: `testadmin_${Date.now()}`,
    password: "testpass123", // No uppercase
    organization_name: "Test Organization",
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 400);
  
  const data = await response.json();
  assertEquals(data.error.code, "INVALID_PASSWORD");
});

Deno.test("Admin Registration - Password without lowercase returns 400", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: `testadmin_${Date.now()}`,
    password: "TESTPASS123", // No lowercase
    organization_name: "Test Organization",
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 400);
  
  const data = await response.json();
  assertEquals(data.error.code, "INVALID_PASSWORD");
});

Deno.test("Admin Registration - Password without number returns 400", async () => {
  const requestBody = {
    full_name: "Test Admin",
    username: `testadmin_${Date.now()}`,
    password: "TestPassword", // No number
    organization_name: "Test Organization",
  };

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 400);
  
  const data = await response.json();
  assertEquals(data.error.code, "INVALID_PASSWORD");
});

Deno.test("Admin Registration - Duplicate username returns 409", async () => {
  const username = `testadmin_${Date.now()}`;
  
  // First registration
  const requestBody = {
    full_name: "Test Admin",
    username,
    password: "TestPass123",
    organization_name: "Test Organization",
  };

  await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  // Second registration with same username
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(response.status, 409);
  
  const data = await response.json();
  assertEquals(data.error.code, "USERNAME_EXISTS");
});
