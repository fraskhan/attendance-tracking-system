// List Employees Endpoint
// GET /admin/employees
// Returns all employees in the admin's organization

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
    console.log("=== List Employees Function Started ===");
    
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
            message: "Only admins can list employees",
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

    // Fetch all employees in the organization (RLS will enforce organization isolation)
    console.log("Fetching employees for organization:", admin.organization_id);
    const { data: employees, error: employeesError } = await supabase
      .from("users")
      .select("id, full_name, username, role, is_active, created_at")
      .eq("organization_id", admin.organization_id)
      .order("created_at", { ascending: false });

    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }

    console.log("Found employees:", employees?.length || 0);

    // Map id to user_id for frontend compatibility
    const mappedEmployees = (employees || []).map(emp => ({
      user_id: emp.id,
      full_name: emp.full_name,
      username: emp.username,
      is_active: emp.is_active,
      created_at: emp.created_at,
    }));

    // Return employee list
    const response = {
      employees: mappedEmployees,
      total: mappedEmployees.length,
    };

    console.log("=== List Employees Successful ===");
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
