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

    // Parse multipart form data
    const formData = await req.formData();
    const photo = formData.get('photo') as File;
    const timestamp = formData.get('timestamp') as string;

    if (!photo || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Photo and timestamp are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate timestamp format (ISO 8601)
    const timeOut = new Date(timestamp);
    if (isNaN(timeOut.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp format. Use ISO 8601 format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current date in YYYY-MM-DD format
    const date = timeOut.toISOString().split('T')[0];

    // Check if time_in exists for today
    const { data: existingLog, error: checkError } = await supabase
      .from('time_logs')
      .select('id, time_in, time_out')
      .eq('organization_id', user.organization_id)
      .eq('user_id', user_id)
      .eq('date', date)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing log:', checkError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to check existing time log',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!existingLog || !existingLog.time_in) {
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'NO_TIME_IN',
            message: 'No time in record found for today. Please clock in first.',
            details: { date },
            timestamp: new Date().toISOString()
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingLog.time_out) {
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DUPLICATE_TIME_OUT',
            message: 'You have already logged time out for today',
            details: { date, existing_time_out: existingLog.time_out },
            timestamp: new Date().toISOString()
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate time_out is after time_in
    const timeIn = new Date(existingLog.time_in);
    if (timeOut <= timeIn) {
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'INVALID_TIME_ORDER',
            message: 'Time out must be after time in',
            details: { 
              time_in: existingLog.time_in, 
              attempted_time_out: timeOut.toISOString() 
            },
            timestamp: new Date().toISOString()
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate photo file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validImageTypes.includes(photo.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG and PNG images are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate photo file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photo.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 5MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload photo to Supabase Storage
    const photoPath = `${user.organization_id}/${user_id}/${date}_time_out.jpg`;
    const photoBytes = await photo.arrayBuffer();
    
    const { error: uploadError } = await supabase.storage
      .from('attendance-photos')
      .upload(photoPath, photoBytes, {
        contentType: photo.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'UPLOAD_ERROR',
            message: 'Failed to upload photo',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the photo
    const { data: urlData } = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(photoPath);

    const photoUrl = urlData.publicUrl;

    // Calculate total hours
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // Update time_log record
    const { data: timeLog, error: updateError } = await supabase
      .from('time_logs')
      .update({
        time_out: timeOut.toISOString(),
        time_out_photo_url: photoUrl,
        total_hours: totalHours,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingLog.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating time log:', updateError);
      return new Response(
        JSON.stringify({ 
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update time log',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        log_id: timeLog.id,
        time_in: timeLog.time_in,
        time_out: timeLog.time_out,
        total_hours: timeLog.total_hours,
        photo_url: timeLog.time_out_photo_url,
        status: timeLog.status,
        message: 'Time out recorded successfully'
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
