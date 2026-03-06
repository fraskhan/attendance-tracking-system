# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- Both servers already running (check terminals)

---

## Step 1: Access Admin Dashboard

Open browser: **http://localhost:3000**

### Register Organization
1. Click "Register Organization"
2. Fill in:
   - Full Name: Your Name
   - Username: admin1
   - Password: Admin123!
   - Organization Name: Test Company
3. Click "Register"
4. You're now logged in!

---

## Step 2: Create Employee

1. Click "Employees" in sidebar
2. Click "Add Employee"
3. Enter employee name: "John Doe"
4. Click "Create Employee"
5. **IMPORTANT:** Copy the username and password shown
   - Example: `john.doe` / `TempPass123!`

---

## Step 3: Test Mobile App

Open browser: **http://localhost:8081**

### Login as Employee
1. Enter the username and password from Step 2
2. Click "Login"
3. You'll be prompted to change password

### Change Password
1. Enter current password (the temp one)
2. Enter new password: `NewPass123!`
3. Confirm password: `NewPass123!`
4. Click "Change Password"
5. You're now on the home screen!

---

## Step 4: Time In

1. Click "Time In" button
2. Click "Select Photo"
3. Choose any image from your computer
4. Wait for upload
5. Click "OK" on success message
6. Home screen now shows your time in!

---

## Step 5: Time Out

1. Click "Time Out" button
2. Click "Select Photo"
3. Choose any image
4. Wait for upload
5. Click "OK"
6. Home screen now shows:
   - Time In
   - Time Out
   - Total Hours (calculated!)
   - Status: Completed ✅

---

## Step 6: View History

1. Click "View History"
2. See today's log with all details
3. Try pulling down to refresh
4. Toggle between "Past 7 Days" and "All Time"

---

## Step 7: Admin View

Go back to admin dashboard: **http://localhost:3000**

### View Daily Attendance
1. Click "Attendance" in sidebar
2. See John Doe's attendance
3. View time in/out
4. See total hours
5. Click photo thumbnails to view full size

### Generate Report
1. Click "Reports" in sidebar
2. See weekly summary
3. Click "Export CSV" to download

### Dashboard Overview
1. Click "Dashboard" in sidebar
2. See metrics:
   - Total Active Employees: 1
   - Logged In Today: 1
   - Total Hours Today: [calculated]

---

## 🎉 You're Done!

You've just tested the complete system:
- ✅ Organization registration
- ✅ Employee creation
- ✅ Employee login
- ✅ Password change
- ✅ Time in with photo
- ✅ Time out with photo
- ✅ Hours calculation
- ✅ History viewing
- ✅ Admin attendance view
- ✅ Report generation

---

## What's Next?

### Test More Features

**Admin Dashboard:**
- Create more employees
- Deactivate an employee
- Reset employee password
- View different dates
- Export more reports

**Mobile App:**
- Logout and login again
- View history filters
- Pull to refresh
- Test with different employees

### Build for Native

```bash
cd employee-mobile-app
eas login
eas build --profile development --platform android
```

Then install on your phone and test camera!

---

## Troubleshooting

### Admin Dashboard Not Loading
```bash
cd admin-dashboard
npm run dev
```

### Mobile App Not Loading
```bash
cd employee-mobile-app
npm start
# Press 'w'
```

### Can't Login
- Check you're using correct credentials
- Verify backend is running (Supabase)
- Check browser console for errors

### Photo Upload Fails
- Check file size (< 5MB)
- Check file type (JPEG/PNG)
- Verify internet connection

---

## Quick Commands

### Start Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

### Start Mobile App
```bash
cd employee-mobile-app
npm start
# Press 'w' for web
```

### Run Backend Tests
```bash
node test-login.js
node test-time-in.js
node test-daily-attendance.js
```

---

## URLs

- **Admin Dashboard:** http://localhost:3000
- **Mobile App:** http://localhost:8081
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## Test Credentials

### Admin
- Username: admin1
- Password: Admin123!

### Employee (after creation)
- Username: john.doe
- Password: TempPass123! (then change to NewPass123!)

---

## Need Help?

Check these files:
- `SYSTEM-COMPLETE.md` - Complete system overview
- `TESTING-GUIDE.md` - Detailed testing scenarios
- `PROJECT-STATUS.md` - Current status
- `README.md` - Main documentation

---

**Happy Testing!** 🎉
