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
    const date = url.searchParams.get('date');

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Date parameter is required (YYYY-MM-DD format)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all employees in the organization
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

    // Get time logs for the specified date
    const { data: timeLogs, error: logsError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('date', date);

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

    // Create a map of user_id to time log
    const logMap = new Map();
    timeLogs.forEach(log => {
      logMap.set(log.user_id, log);
    });

    // Build attendance data for each employee
    const attendanceData = employees.map(employee => {
      const log = logMap.get(employee.id);

      if (!log) {
        // Employee has no log for this date
        return {
          user_id: employee.id,
          full_name: employee.full_name,
          username: employee.username,
          role: employee.role,
          time_in: null,
          time_out: null,
          total_hours: null,
          status: 'not_logged_in',
          time_in_photo_url: null,
          time_out_photo_url: null
        };
      }

      // Employee has a log
      return {
        user_id: employee.id,
        full_name: employee.full_name,
        username: employee.username,
        role: employee.role,
        time_in: log.time_in,
        time_out: log.time_out,
        total_hours: log.total_hours,
        status: log.status,
        time_in_photo_url: log.time_in_photo_url,
        time_out_photo_url: log.time_out_photo_url
      };
    });

    // Calculate summary statistics
    const summary = {
      total_employees: attendanceData.length,
      logged_in: attendanceData.filter(e => e.time_in !== null).length,
      completed: attendanceData.filter(e => e.status === 'completed').length,
      incomplete: attendanceData.filter(e => e.status === 'incomplete').length,
      missing: attendanceData.filter(e => e.status === 'missing').length,
      not_logged_in: attendanceData.filter(e => e.status === 'not_logged_in').length
    };

    return new Response(
      JSON.stringify({
        date: date,
        summary: summary,
        employees: attendanceData
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
