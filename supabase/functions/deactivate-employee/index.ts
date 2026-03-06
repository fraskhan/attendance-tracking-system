// Deactivate Employee Endpoint
// PATCH /admin/employees/:id/deactivate
// Allows admins to deactivate employee accounts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
};

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
    console.log("=== Deactivate Employee Function Started ===");
    
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

    // Parse request body to get employee_id
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
            message: "Only admins can deactivate employees",
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

    // Fetch the employee to verify they exist and are in the same organization
    console.log("Fetching employee:", employee_id);
    const { data: employee, error: employeeError } = await supabase
      .from("users")
      .select("id, organization_id, full_name, username, role, is_active")
      .eq("id", employee_id)
      .single();

    if (employeeError || !employee) {
      console.log("Employee not found or error:", employeeError);
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

    // Verify employee is in the same organization
    if (employee.organization_id !== admin.organization_id) {
      console.log("Employee not in admin's organization");
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Cannot deactivate employees from other organizations",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent admin from deactivating themselves
    if (employee.id === admin.id) {
      console.log("Admin attempting to deactivate themselves");
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Cannot deactivate your own account",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if employee is already deactivated
    if (!employee.is_active) {
      return new Response(
        JSON.stringify({
          error: {
            code: "ALREADY_DEACTIVATED",
            message: "Employee is already deactivated",
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate the employee
    console.log("Deactivating employee:", employee.username);
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", employee_id);

    if (updateError) {
      console.error("Error deactivating employee:", updateError);
      throw new Error(`Failed to deactivate employee: ${updateError.message}`);
    }

    console.log("Employee deactivated successfully");

    // Return success response
    const response = {
      message: "Employee deactivated successfully",
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        username: employee.username,
        is_active: false,
      },
    };

    console.log("=== Deactivate Employee Successful ===");
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
