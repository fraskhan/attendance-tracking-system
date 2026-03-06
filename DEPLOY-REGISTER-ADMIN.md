# Deploy register-admin Function

## Quick Deployment Guide

The `register-admin` function is fully implemented and ready to deploy. Choose one of the methods below:

---

## Method 1: Deploy via Supabase Dashboard (Easiest)

### Steps:

1. **Open Supabase Functions Dashboard**
   - Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/functions

2. **Create New Function**
   - Click "Create a new function"
   - Name: `register-admin`
   - Click "Create function"

3. **Copy Function Code**
   - Open `supabase/functions/register-admin/index.ts` in your editor
   - Copy the entire file contents

4. **Paste and Deploy**
   - Paste the code into the Supabase editor
   - Click "Deploy"
   - Wait for deployment to complete

5. **Verify Deployment**
   - Run: `node test-register-admin.js`
   - Should see ✅ SUCCESS messages

---

## Method 2: Deploy via CLI (Requires Docker)

### Prerequisites:
- Docker Desktop must be installed and running
- Supabase CLI authenticated (✅ already done)

### Steps:

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start

2. **Deploy Function**
   ```bash
   npx supabase functions deploy register-admin --project-ref omjwuntbttxydlsofxao
   ```

3. **Verify Deployment**
   ```bash
   node test-register-admin.js
   ```

---

## Method 3: Link Project and Deploy (Most Automated)

### Prerequisites:
- Docker Desktop running
- Database password available

### Steps:

1. **Get Database Password**
   - Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/settings/database
   - Copy your database password

2. **Link Project**
   ```bash
   npx supabase link --project-ref omjwuntbttxydlsofxao
   ```
   - Enter database password when prompted

3. **Deploy Function**
   ```bash
   npx supabase functions deploy register-admin
   ```

4. **Verify Deployment**
   ```bash
   node test-register-admin.js
   ```

---

## Testing After Deployment

### Automated Test
```bash
node test-register-admin.js
```

Expected output:
```
============================================================
Admin Registration Endpoint Tests
============================================================
Testing Admin Registration Endpoint...

✅ SUCCESS! Admin registration completed.
User ID: <uuid>
Organization ID: <uuid>
Access Token: Generated ✓
Refresh Token: Generated ✓

=== Testing Password Validation ===

Test: Password too short
✅ Correctly rejected: Password must be at least 8 characters long

Test: Password without uppercase
✅ Correctly rejected: Password must contain at least one uppercase letter

Test: Password without number
✅ Correctly rejected: Password must contain at least one number

============================================================
Test Summary
============================================================
Valid Registration: ✅ PASSED
Password Validation: ✅ PASSED
============================================================

🎉 All tests passed!
```

### Manual Test with curl
```bash
curl -X POST https://omjwuntbttxydlsofxao.supabase.co/functions/v1/register-admin \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "full_name": "Test Admin",
    "username": "testadmin123",
    "password": "SecurePass123",
    "organization_name": "Test Organization"
  }'
```

---

## Troubleshooting

### Error: "Requested function was not found" (404)
**Cause:** Function not deployed yet  
**Solution:** Deploy using one of the methods above

### Error: "Docker daemon is not running"
**Cause:** Docker Desktop not started  
**Solution:** 
- Start Docker Desktop application
- Wait for it to fully start
- Try deployment again

### Error: "password authentication failed"
**Cause:** Incorrect database password  
**Solution:**
- Get correct password from Supabase dashboard
- Try linking again with correct password

### Error: "USERNAME_EXISTS" (409)
**Cause:** Username already taken (from previous test)  
**Solution:** This is expected! Use a different username or verify the user was created successfully

---

## Verification Checklist

After deployment, verify:

- [ ] Function appears in Supabase Dashboard
- [ ] Test script runs successfully
- [ ] Valid registration creates user and organization
- [ ] Password validation works correctly
- [ ] JWT tokens are generated
- [ ] Error responses are formatted correctly

---

## Next Steps After Deployment

Once the function is deployed and tested:

1. Mark task 4.1 as complete
2. Continue with task 4.3: Login endpoint
3. Continue with task 4.5: Password change endpoint

---

## Need Help?

- Check function logs in Supabase Dashboard
- Review `TASK-4.1-SUMMARY.md` for implementation details
- Check `supabase/functions/README.md` for more info
