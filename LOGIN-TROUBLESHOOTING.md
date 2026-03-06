# Login Troubleshooting Guide

## Current Users in Database

Based on the database check, here are the existing users:

### Admin User
- **Username:** `admin_1772633709047`
- **Password:** `SecurePass123`
- **Role:** Admin
- **Status:** Active ✅

### Employee Users
1. **Jane Smith**
   - **Username:** `jsmith`
   - **Password:** (You need to know what was set when created)
   - **Status:** Active ✅

2. **John Doe**
   - **Username:** `jdoe`
   - **Status:** Deactivated ❌ (Cannot login)

---

## How to Login

### Admin Dashboard (http://localhost:3000)

**Use these credentials:**
```
Username: admin_1772633709047
Password: SecurePass123
```

### Mobile App (http://localhost:8081)

**Use employee credentials:**
```
Username: jsmith
Password: [the password that was generated when you created this employee]
```

---

## How to Create New Users

### Option 1: Via Admin Dashboard

1. **Login to Admin Dashboard**
   - Go to http://localhost:3000
   - Username: `admin_1772633709047`
   - Password: `SecurePass123`

2. **Create Employee**
   - Click "Employees" in sidebar
   - Click "Add Employee"
   - Enter full name (e.g., "Test Employee")
   - Click "Create Employee"
   - **IMPORTANT:** Copy the generated username and password immediately!

3. **Use in Mobile App**
   - Go to http://localhost:8081
   - Login with the generated credentials
   - Change password when prompted

### Option 2: Via Test Script

Run this command to create a new employee:
```bash
node test-create-employee.js
```

This will output the generated credentials.

---

## Common Login Errors

### Error: "Invalid username or password" (401)

**Causes:**
1. Username doesn't exist
2. Password is incorrect
3. Typo in username or password

**Solutions:**
- Double-check the username (case-sensitive!)
- Make sure you're using the correct password
- Use the credentials from the list above
- Create a new employee if needed

### Error: "Account deactivated" (403)

**Cause:** The user account has been deactivated

**Solution:**
- Login as admin
- Go to Employees page
- The user will show as deactivated
- You cannot reactivate (would need backend update)
- Create a new employee instead

### Error: "Too many login attempts" (429)

**Cause:** Rate limiting after 5 failed attempts

**Solution:**
- Wait 15 minutes
- Or restart the Supabase function
- Use correct credentials

---

## Testing Login

### Test Admin Login
```bash
# This will test with the admin credentials
node test-login.js
```

### Test Employee Login

Create a test file `test-employee-login.js`:
```javascript
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testLogin() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      username: 'jsmith',  // Change this
      password: 'YourPassword123!'  // Change this
    })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testLogin();
```

---

## Step-by-Step: Complete Test Flow

### 1. Login as Admin (Dashboard)

```
URL: http://localhost:3000
Username: admin_1772633709047
Password: SecurePass123
```

### 2. Create New Employee

1. Click "Employees"
2. Click "Add Employee"
3. Enter name: "Test User"
4. Click "Create"
5. **Copy these credentials:**
   - Username: (e.g., `test.user`)
   - Password: (e.g., `TempPass123!`)

### 3. Login as Employee (Mobile App)

```
URL: http://localhost:8081
Username: [from step 2]
Password: [from step 2]
```

### 4. Change Password

1. Enter current password (from step 2)
2. Enter new password: `MyNewPass123!`
3. Confirm password: `MyNewPass123!`
4. Click "Change Password"

### 5. Test Time In/Out

1. Click "Time In"
2. Select photo
3. Wait for success
4. Click "Time Out"
5. Select photo
6. See total hours

---

## Quick Fix: Reset Everything

If you want to start fresh:

### Option 1: Create New Admin

```bash
node test-register-admin.js
```

This creates a new organization and admin user.

### Option 2: Use Existing Admin

Just use the credentials above:
- Username: `admin_1772633709047`
- Password: `SecurePass123`

---

## Browser Console Errors Explained

### "401 Unauthorized"
- Wrong username or password
- User doesn't exist
- Check credentials carefully

### "500 Internal Server Error" (create-employee)
- Backend issue
- Check Supabase function logs
- Verify admin token is correct

### "Password field not in form" (Warning)
- This is just a browser warning
- Doesn't affect functionality
- Can be ignored

### "shadow* style deprecated" (Warning)
- React Native Web warning
- Doesn't affect functionality
- Can be ignored

---

## Debugging Steps

### 1. Check if user exists
```bash
node check-users.js
```

### 2. Test login with known credentials
```bash
node test-login.js
```

### 3. Create new employee
```bash
# Via admin dashboard or:
node test-create-employee.js
```

### 4. Check browser console
- Press F12
- Go to Console tab
- Look for actual error messages
- Ignore warnings about autocomplete, shadows, etc.

### 5. Check Network tab
- Press F12
- Go to Network tab
- Click on failed request
- Check "Response" tab for actual error

---

## Summary

**To login successfully:**

1. **Admin Dashboard:**
   - Username: `admin_1772633709047`
   - Password: `SecurePass123`

2. **Mobile App:**
   - First create employee via admin dashboard
   - Use the generated credentials
   - Change password on first login

3. **Don't use:**
   - Random usernames like "itest"
   - Passwords you haven't set
   - Deactivated accounts

---

## Need Help?

1. Run `node check-users.js` to see all users
2. Run `node test-login.js` to test admin login
3. Use admin dashboard to create new employees
4. Copy credentials immediately when creating users
5. Check browser console for actual errors (not warnings)

---

**Last Updated:** March 5, 2026
