// Reset Password Endpoint
// POST /admin/employees/:id/reset-password
// Allows admins to reset employee passwords

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

// Generate secure random password
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  for (let i = 3; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Reset Password Function Started ===");
    
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

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

    const body = await req.json();
    const { employee_id } = body;

    if (!employee_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_FIELDS",
            message: "Employee ID is required",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("users")
      .select("id, organization_id, role, is_active")
      .eq("id", adminUserId)
      .single();

    if (adminError || !admin) {
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

    if (admin.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Only admins can reset passwords",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Fetch employee
    const { data: employee, error: employeeError } = await supabase
      .from("users")
      .select("id, organization_id, full_name, username, role, is_active")
      .eq("id", employee_id)
      .single();

    if (employeeError || !employee) {
      return new Response(
        JSON.stringify({
          error: {
            code: "EMPLOYEE_NOT_FOUND",
            message: "Employee not found",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify same organization
    if (employee.organization_id !== admin.organization_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Cannot reset passwords for employees from other organizations",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    const password_hash = await hashPassword(newPassword);

    // Update password and set must_change_password flag
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash,
        must_change_password: true,
      })
      .eq("id", employee_id);

    if (updateError) {
      console.error("Error resetting password:", updateError);
      throw new Error(`Failed to reset password: ${updateError.message}`);
    }

    console.log("Password reset successfully for:", employee.username);

    const response = {
      message: "Password reset successfully",
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        username: employee.username,
      },
      new_password: newPassword,
      must_change_password: true,
    };

    console.log("=== Password Reset Successful ===");
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("=== ERROR ===");
    console.error("Error:", error.message);
    
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
