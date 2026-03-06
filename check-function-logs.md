# Check Function Logs

The registration is failing with a 500 error. Let's check the logs to see what's happening.

## How to Check Logs:

1. **Go to Function Logs**
   - Open: https://app.supabase.com/project/omjwuntbttxydlsofxao/functions/register-admin/logs

2. **Look for Error Messages**
   - Check the most recent logs
   - Look for red error messages
   - Common issues:
     - Missing environment variables
     - Database connection errors
     - Permission errors

3. **Common Fixes:**

### Issue 1: Missing Environment Variables
The function needs these environment variables set in Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

**To set them:**
1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/settings/functions
2. Add each secret:
   - Name: `SUPABASE_URL`, Value: `https://omjwuntbttxydlsofxao.supabase.co`
   - Name: `SUPABASE_SERVICE_ROLE_KEY`, Value: (from your .env file)
   - Name: `SUPABASE_JWT_SECRET`, Value: (from your .env file)

### Issue 2: RLS Policies Blocking
The function might be blocked by RLS policies. The service role key should bypass RLS, but let's verify.

### Issue 3: Import Errors
Deno might have issues importing the JWT library.

---

## Quick Fix Steps:

1. Check logs first
2. Add environment variables if missing
3. Share the error message with me
4. I'll provide the exact fix

---

**Please check the logs and tell me what error you see!**
