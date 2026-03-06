// Password Change Endpoint
// POST /auth/change-password
// Allows users to change their password

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

// Password verification using Web Crypto API
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hash;
}

// Extract user_id from temporary token (format: "temp_token_<user_id>")
function extractUserIdFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }
  
  // For temporary tokens
  if (token.startsWith('temp_token_')) {
    return token.substring(11); // Remove "temp_token_"
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Change Password Function Started ===");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Extract user_id from custom token header (x-user-token)
    const userToken = req.headers.get('x-user-token');
    const userId = extractUserIdFromToken(userToken);
    
    if (!userId) {
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

    console.log("User ID from token:", userId);

    // Parse request
    const body = await req.json();
    const { current_password, new_password } = body;

    // Validate fields
    if (!current_password || !new_password) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_FIELDS",
            message: "Current password and new password are required",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate new password requirements
    if (new_password.length < 8) {
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

    if (!/[A-Z]/.test(new_password)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must contain at least one uppercase letter",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/[a-z]/.test(new_password)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must contain at least one lowercase letter",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/[0-9]/.test(new_password)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must contain at least one number",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user
    console.log("Fetching user...");
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, password_hash, is_active")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.log("User not found or error:", userError);
      return new Response(
        JSON.stringify({
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is active
    if (!user.is_active) {
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

    // Verify current password
    console.log("Verifying current password...");
    const isCurrentPasswordValid = await verifyPassword(current_password, user.password_hash);

    if (!isCurrentPasswordValid) {
      console.log("Current password is incorrect");
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CURRENT_PASSWORD",
            message: "Current password is incorrect",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash new password
    console.log("Hashing new password...");
    const newPasswordHash = await hashPassword(new_password);

    // Update password and clear must_change_password flag
    console.log("Updating password...");
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Password update error:", updateError);
      throw new Error(`Password update failed: ${updateError.message}`);
    }

    console.log("Password changed successfully");

    const response = {
      message: "Password changed successfully",
      must_change_password: false,
    };

    console.log("=== Password Change Successful ===");
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
