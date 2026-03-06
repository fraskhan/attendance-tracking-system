import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user token from custom header
    const userToken = req.headers.get('x-user-token');
    if (!userToken || !userToken.startsWith('temp_token_')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user_id from token
    const user_id = userToken.replace('temp_token_', '');

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, role, is_active')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return new Response(
        JSON.stringify({ error: 'Account is deactivated' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date');

    if (!startDate) {
      return new Response(
        JSON.stringify({ error: 'start_date parameter is required (YYYY-MM-DD format, Monday of week)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate end date (6 days after start date for a full week)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    // Get all active employees in the organization
    const { data: employees, error: employeesError } = await supabase
      .from('users')
      .select('id, full_name, username, role')
      .eq('organization_id', user.organization_id)
      .eq('is_active', true)
      .order('full_name');

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch employees',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get time logs for the week
    const { data: timeLogs, error: logsError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('organization_id', user.organization_id)
      .gte('date', startDate)
      .lte('date', endDate);

    if (logsError) {
      console.error('Error fetching time logs:', logsError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch time logs',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group logs by user_id
    const logsByUser = new Map();
    timeLogs.forEach(log => {
      if (!logsByUser.has(log.user_id)) {
        logsByUser.set(log.user_id, []);
      }
      logsByUser.get(log.user_id).push(log);
    });

    // Calculate statistics for each employee
    let orgTotalHours = 0;
    let orgTotalDaysWorked = 0;

    const employeeReports = employees.map(employee => {
      const logs = logsByUser.get(employee.id) || [];
      
      // Calculate total hours
      const totalHours = logs.reduce((sum, log) => {
        return sum + (log.total_hours || 0);
      }, 0);

      // Count days worked (logs with completed status)
      const daysWorked = logs.filter(log => log.status === 'completed').length;

      // Count missing time outs
      const missingTimeOuts = logs.filter(log => log.status === 'missing').length;

      // Calculate days not logged (7 days - days with any log)
      const daysNotLogged = 7 - logs.length;

      // Add to organization totals
      orgTotalHours += totalHours;
      orgTotalDaysWorked += daysWorked;

      return {
        user_id: employee.id,
        full_name: employee.full_name,
        username: employee.username,
        role: employee.role,
        total_hours: Math.round(totalHours * 100) / 100,
        days_worked: daysWorked,
        missing_time_outs: missingTimeOuts,
        days_not_logged: daysNotLogged
      };
    });

    return new Response(
      JSON.stringify({
        week_start: startDate,
        week_end: endDate,
        employees: employeeReports,
        organization_totals: {
          total_hours: Math.round(orgTotalHours * 100) / 100,
          total_days_worked: orgTotalDaysWorked,
          average_hours_per_employee: employees.length > 0 
            ? Math.round((orgTotalHours / employees.length) * 100) / 100 
            : 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
