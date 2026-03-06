// Login Endpoint
// POST /auth/login
// Authenticates user and returns JWT token

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Password verification using Web Crypto API
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hash;
}

// Simple rate limiting (in-memory, resets on function restart)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(username: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(username);
  
  if (!attempt || now > attempt.resetTime) {
    // Reset or create new entry
    loginAttempts.set(username, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 minutes
    return true;
  }
  
  if (attempt.count >= 5) {
    return false; // Rate limit exceeded
  }
  
  attempt.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Login Function Started ===");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Parse request
    const body = await req.json();
    console.log("Login attempt for username:", body.username);
    
    const { username, password } = body;

    // Validate fields
    if (!username || !password) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_FIELDS",
            message: "Username and password are required",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(username)) {
      console.log("Rate limit exceeded for username:", username);
      return new Response(
        JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many login attempts. Please try again later.",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user by username
    console.log("Fetching user...");
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, organization_id, full_name, username, password_hash, role, must_change_password, is_active")
      .eq("username", username)
      .single();

    if (userError || !user) {
      console.log("User not found or error:", userError);
      // Generic error message to prevent username enumeration
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid username or password",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      console.log("User is deactivated:", username);
      return new Response(
        JSON.stringify({
          error: {
            code: "ACCOUNT_DEACTIVATED",
            message: "Your account has been deactivated. Please contact your administrator.",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password
    console.log("Verifying password...");
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.log("Invalid password for username:", username);
      // Generic error message to prevent username enumeration
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid username or password",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Login successful for user:", user.id);

    // Generate tokens (temporary - using simple tokens for now)
    const response = {
      user_id: user.id,
      organization_id: user.organization_id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      must_change_password: user.must_change_password,
      access_token: "temp_token_" + user.id,
      refresh_token: "temp_refresh_" + user.id,
    };

    console.log("=== Login Successful ===");
    return new Response(JSON.stringify(response), {
      status: 200,
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
