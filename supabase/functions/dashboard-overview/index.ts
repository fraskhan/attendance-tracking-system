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

    const today = new Date().toISOString().split('T')[0];

    // Get total active employees
    const { count: totalEmployees, error: employeesError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .eq('is_active', true);

    if (employeesError) {
      console.error('Error counting employees:', employeesError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to count employees',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's time logs
    const { data: todayLogs, error: logsError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('date', today);

    if (logsError) {
      console.error('Error fetching today logs:', logsError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch today logs',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate metrics
    const loggedInToday = todayLogs.filter(log => log.time_in !== null).length;
    
    const missingTimeOutsToday = todayLogs.filter(log => 
      log.time_in !== null && log.time_out === null
    ).length;

    const totalHoursToday = todayLogs.reduce((sum, log) => {
      return sum + (log.total_hours || 0);
    }, 0);

    const completedLogsToday = todayLogs.filter(log => log.status === 'completed').length;

    return new Response(
      JSON.stringify({
        date: today,
        total_employees: totalEmployees || 0,
        active_employees: totalEmployees || 0, // Same as total since we filter by is_active
        logged_in_today: loggedInToday,
        completed_today: completedLogsToday,
        missing_time_outs_today: missingTimeOutsToday,
        total_hours_today: Math.round(totalHoursToday * 100) / 100,
        average_hours_today: loggedInToday > 0 
          ? Math.round((totalHoursToday / loggedInToday) * 100) / 100 
          : 0
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
