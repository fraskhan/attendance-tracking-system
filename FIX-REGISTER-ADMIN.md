# Fix register-admin Function

The function is deployed but failing with a 500 error. Here's how to fix it:

## Step 1: Check Function Logs

1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/functions/register-admin/logs
2. Look for the most recent error message
3. Tell me what you see

## Step 2: Add Environment Variables (Most Likely Fix)

The function needs environment variables to work. Here's how to add them:

### Go to Function Settings:
https://app.supabase.com/project/omjwuntbttxydlsofxao/settings/functions

### Add These Secrets:

1. **SUPABASE_URL**
   - Value: `https://omjwuntbttxydlsofxao.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU3ODYxNSwiZXhwIjoyMDg4MTU0NjE1fQ.upgQt0J9D9c8Ux1AhtahnRISeh85CF2Yq099yVIDa5Q`

3. **SUPABASE_JWT_SECRET**
   - Value: `kvodqUUZvoCBARKvmDim+h/WFjD3GMcNuSyn/60ga/XXJKTVHnBiaS7id6qI0e2CSdE3jBvLJm7Ks0qfw421EQ==`

### How to Add:
1. Click "Add new secret"
2. Enter the name (e.g., `SUPABASE_URL`)
3. Enter the value
4. Click "Save"
5. Repeat for all 3 secrets

## Step 3: Use Simplified Version (Alternative)

If the JWT library is causing issues, I've created a simplified version:

1. Open the function editor in Supabase
2. Replace the code with contents of: `supabase/functions/register-admin/index-simple.ts`
3. This version:
   - Has better error logging
   - Uses temporary tokens (we'll add real JWT later)
   - Easier to debug

## Step 4: Test Again

After adding environment variables OR using the simplified version:

```bash
node test-register-admin.js
```

## Step 5: Check Logs Again

If it still fails:
1. Check the logs again
2. The simplified version has detailed console.log statements
3. Share the log output with me
4. I'll provide the exact fix

---

## Quick Checklist:

- [ ] Check function logs
- [ ] Add 3 environment variables
- [ ] Test again
- [ ] If still failing, use simplified version
- [ ] Check logs for detailed error
- [ ] Share error with me

---

## Most Common Issues:

1. **Missing environment variables** ← 90% of cases
2. **JWT library import error** ← Use simplified version
3. **RLS blocking service role** ← Unlikely but possible

Let me know what you find in the logs!
