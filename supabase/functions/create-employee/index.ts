// Create Employee Endpoint
// POST /admin/employees
// Allows admins to create employee accounts with auto-generated credentials

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
};

// Password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate username from full name
function generateUsername(fullName: string, existingUsernames: string[]): string {
  // Remove special characters and convert to lowercase
  const cleanName = fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  // Split into words and take first letter of each word + last name
  const words = cleanName.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) {
    return 'employee_' + Date.now();
  }
  
  let baseUsername = '';
  
  if (words.length === 1) {
    // Single word: use the word
    baseUsername = words[0];
  } else {
    // Multiple words: first letter of first name(s) + last name
    const firstInitials = words.slice(0, -1).map(w => w[0]).join('');
    const lastName = words[words.length - 1];
    baseUsername = firstInitials + lastName;
  }
  
  // Check if username exists, if so add number
  let username = baseUsername;
  let counter = 1;
  
  while (existingUsernames.includes(username)) {
    username = baseUsername + counter;
    counter++;
  }
  
  return username;
}

// Generate secure random password
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;
  
  // Ensure at least one of each required character type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill the rest (total length 12)
  for (let i = 3; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Extract user_id from temporary token
function extractUserIdFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }
  
  if (token.startsWith('temp_token_')) {
    return token.substring(11);
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Create Employee Function Started ===");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Extract user_id from custom token header
    const userToken = req.headers.get('x-user-token');
    const adminUserId = extractUserIdFromToken(userToken);
    
    if (!adminUserId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or missing user token",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin User ID from token:", adminUserId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin user and get organization_id
    console.log("Verifying admin user...");
    const { data: admin, error: adminError } = await supabase
      .from("users")
      .select("id, organization_id, role, is_active")
      .eq("id", adminUserId)
      .single();

    if (adminError || !admin) {
      console.log("Admin not found or error:", adminError);
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Admin user not found",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    if (admin.role !== 'admin') {
      console.log("User is not an admin");
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Only admins can create employees",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if admin is active
    if (!admin.is_active) {
      return new Response(
        JSON.stringify({
          error: {
            code: "ACCOUNT_DEACTIVATED",
            message: "Your account has been deactivated",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body = await req.json();
    const { full_name } = body;

    // Validate fields
    if (!full_name || full_name.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_FIELDS",
            message: "Employee full name is required",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating employee for:", full_name);

    // Get existing usernames in the organization
    const { data: existingUsers } = await supabase
      .from("users")
      .select("username")
      .eq("organization_id", admin.organization_id);

    const existingUsernames = existingUsers ? existingUsers.map(u => u.username) : [];

    // Generate username
    const username = generateUsername(full_name, existingUsernames);
    console.log("Generated username:", username);

    // Generate secure password
    const password = generateSecurePassword();
    console.log("Generated password (length):", password.length);

    // Hash password
    const password_hash = await hashPassword(password);

    // Create employee user
    console.log("Creating employee user...");
    const { data: employee, error: employeeError } = await supabase
      .from("users")
      .insert({
        organization_id: admin.organization_id,
        full_name: full_name.trim(),
        username,
        password_hash,
        role: "employee",
        must_change_password: true,
        is_active: true,
      })
      .select()
      .single();

    if (employeeError) {
      console.error("Employee creation error:", employeeError);
      throw new Error(`Employee creation failed: ${employeeError.message}`);
    }

    console.log("Employee created:", employee.id);

    // Return employee credentials
    const response = {
      user_id: employee.id,
      full_name: employee.full_name,
      username: username,
      password: password,
      must_change_password: true,
      message: "Employee created successfully. Please provide these credentials to the employee.",
    };

    console.log("=== Employee Creation Successful ===");
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("=== ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
