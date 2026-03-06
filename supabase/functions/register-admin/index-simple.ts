// Simplified Admin Registration Endpoint for Debugging
// POST /auth/register-admin

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Register Admin Function Started ===");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Parse request
    const body = await req.json();
    console.log("Request body:", { ...body, password: "[REDACTED]" });
    
    const { full_name, username, password, organization_name } = body;

    // Validate fields
    if (!full_name || !username || !password || !organization_name) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_FIELDS",
            message: "All fields required",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must be at least 8 characters long",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must contain uppercase, lowercase, and number",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check username
    console.log("Checking username uniqueness...");
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: {
            code: "USERNAME_EXISTS",
            message: "Username already exists",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash password
    console.log("Hashing password...");
    const password_hash = await bcrypt.hash(password);
    console.log("Password hashed successfully");

    // Create organization
    console.log("Creating organization...");
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: organization_name })
      .select()
      .single();

    if (orgError) {
      console.error("Organization creation error:", orgError);
      throw new Error(`Org creation failed: ${orgError.message}`);
    }

    console.log("Organization created:", organization.id);

    // Create user
    console.log("Creating user...");
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        organization_id: organization.id,
        full_name,
        username,
        password_hash,
        role: "admin",
        must_change_password: false,
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      // Rollback
      await supabase.from("organizations").delete().eq("id", organization.id);
      throw new Error(`User creation failed: ${userError.message}`);
    }

    console.log("User created:", user.id);

    // Update organization
    await supabase
      .from("organizations")
      .update({ created_by: user.id })
      .eq("id", organization.id);

    console.log("Organization updated with created_by");

    // Generate simple tokens (for now, just return user info)
    // We'll add proper JWT later once basic flow works
    const response = {
      user_id: user.id,
      organization_id: organization.id,
      access_token: "temp_token_" + user.id,
      refresh_token: "temp_refresh_" + user.id,
    };

    console.log("=== Registration Successful ===");
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
          message: error.message || "An unexpected error occurred",
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
