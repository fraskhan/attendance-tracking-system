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

    // Parse query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate date formats if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return new Response(
        JSON.stringify({ error: 'Invalid start_date format. Use YYYY-MM-DD.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return new Response(
        JSON.stringify({ error: 'Invalid end_date format. Use YYYY-MM-DD.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: 'Limit must be between 1 and 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (offset < 0) {
      return new Response(
        JSON.stringify({ error: 'Offset must be non-negative' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query
    let query = supabase
      .from('time_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', user.organization_id)
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    // Apply date filters
    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      console.error('Error fetching logs:', logsError);
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

    // Format response
    const formattedLogs = logs.map(log => ({
      log_id: log.id,
      date: log.date,
      time_in: log.time_in,
      time_out: log.time_out,
      total_hours: log.total_hours,
      status: log.status,
      time_in_photo_url: log.time_in_photo_url,
      time_out_photo_url: log.time_out_photo_url,
      created_at: log.created_at,
      updated_at: log.updated_at
    }));

    return new Response(
      JSON.stringify({
        logs: formattedLogs,
        total_count: count,
        limit: limit,
        offset: offset,
        has_more: count ? (offset + limit < count) : false
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
