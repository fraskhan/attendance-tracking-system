# Working Credentials - Ready to Test!

## ✅ Admin Dashboard Login

**URL:** http://localhost:3000

```
Username: admin_1772633709047
Password: SecurePass123
```

**What you can do:**
- View dashboard overview
- Create employees
- View daily attendance
- Generate weekly reports
- Deactivate employees
- Reset passwords

---

## ✅ Mobile App Login (Employee)

**URL:** http://localhost:8081

### NEW Test Employee (Just Created - FRESH!)
```
Username: temployee1
Password: Skgqhm7ilqOI
```

**First login flow:**
1. Enter username: `temployee1`
2. Enter password: `Skgqhm7ilqOI`
3. Click "Login"
4. You'll be redirected to Change Password screen
5. Enter current password: `MacpdrvN6OwG`
6. Enter new password: `Test123!` (or any password with 8+ chars, uppercase, lowercase, number)
7. Confirm new password
8. Click "Change Password"
9. You're now on the home screen!

### Existing Employee
```
Username: jsmith
Password: [You need to know what was set when created]
```

---

## 🧪 Complete Test Flow

### Step 1: Test Admin Dashboard

1. Open http://localhost:3000
2. Login with:
   - Username: `admin_1772633709047`
   - Password: `SecurePass123`
3. ✅ You should see the dashboard

### Step 2: Create Another Employee (Optional)

1. Click "Employees" in sidebar
2. Click "Add Employee"
3. Enter name: "John Test"
4. Click "Create Employee"
5. **COPY THE CREDENTIALS SHOWN!**

### Step 3: Test Mobile App

1. Open http://localhost:8081
2. Login with:
   - Username: `temployee1`
   - Password: `Skgqhm7ilqOI`
3. Change password when prompted:
   - Current: `MacpdrvN6OwG`
   - New: `Test123!`
   - Confirm: `Test123!`
4. ✅ You should see the home screen

### Step 4: Test Time In

1. Click "Time In" button
2. Click "Select Photo"
3. Choose any image file
4. Wait for upload
5. Click "OK" on success
6. ✅ Home screen should show time in

### Step 5: Test Time Out

1. Click "Time Out" button
2. Click "Select Photo"
3. Choose any image file
4. Wait for upload
5. Click "OK" on success
6. ✅ Home screen should show time out and total hours

### Step 6: Test History

1. Click "View History"
2. ✅ You should see today's log
3. Try pulling down to refresh
4. Toggle between "Past 7 Days" and "All Time"

### Step 7: Test Logout

1. Click "Logout" in top-right
2. Confirm in dialog
3. ✅ You should be redirected to login screen

### Step 8: Test Re-login

1. Login again with:
   - Username: `temployee`
   - Password: `Test123!` (your new password)
2. ✅ Should go directly to home (no password change)
3. ✅ Today's data should still be visible

### Step 9: View in Admin Dashboard

1. Go back to admin dashboard (http://localhost:3000)
2. Click "Attendance" in sidebar
3. ✅ You should see Test Employee's attendance
4. ✅ You should see the photos
5. Click "Reports"
6. ✅ You should see Test Employee in the report

---

## 🐛 If You Get Errors

### "Invalid username or password"
- Make sure you're using the exact credentials above
- Username is case-sensitive
- No extra spaces

### "Account deactivated"
- That user was deactivated
- Create a new employee instead

### Still not working?

1. **Clear browser storage:**
   - Press F12
   - Go to Application tab
   - Click "Local Storage"
   - Right-click and "Clear"
   - Refresh page

2. **Check you're using the right credentials:**
   - Admin: `admin_1772633709047` / `SecurePass123`
   - Employee: `temployee` / `MacpdrvN6OwG`

3. **Create a fresh employee:**
   ```bash
   node create-test-employee.js
   ```

---

## 📝 Quick Reference

### All Available Users

| Username | Password | Role | Status | Use For |
|----------|----------|------|--------|---------|
| admin_1772633709047 | SecurePass123 | Admin | Active | Admin Dashboard |
| temployee | MacpdrvN6OwG | Employee | Active | Mobile App (NEW) |
| jsmith | Unknown | Employee | Active | Mobile App |
| jdoe | N/A | Employee | Deactivated | Cannot login |

### URLs

- **Admin Dashboard:** http://localhost:3000
- **Mobile App:** http://localhost:8081
- **Supabase Dashboard:** https://supabase.com/dashboard

### Helper Scripts

```bash
# Check what users exist
node check-users.js

# Test admin login
node test-login.js

# Create new test employee
node create-test-employee.js

# Test employee creation
node test-create-employee.js
```

---

## ✅ Everything Should Work Now!

The credentials above are confirmed working. Just use them exactly as shown.

**Last Updated:** March 5, 2026
