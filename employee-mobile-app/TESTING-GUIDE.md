# Mobile App Testing Guide

## Quick Start

The app is currently running on web. You can test all features immediately!

### Access the App
Open your browser to: **http://localhost:8081**

(If port 8081 is in use, check the terminal for the actual port)

## Test Scenarios

### 1. First-Time Employee Login

**Prerequisites:**
- Create an employee via admin dashboard (http://localhost:3000)
- Note the generated username and password

**Steps:**
1. Open mobile app in browser
2. Enter username and password
3. Click "Login"
4. **Expected:** Redirected to Change Password screen
5. Enter current password (the generated one)
6. Enter new password (must meet requirements)
7. Confirm new password
8. Click "Change Password"
9. **Expected:** Redirected to Home screen

**Success Criteria:**
- ✅ Login successful
- ✅ Password change enforced
- ✅ New password accepted
- ✅ Home screen displays user name
- ✅ Today's status shows "No attendance logged yet"

---

### 2. Time In Flow

**Prerequisites:**
- Logged in as employee
- On Home screen

**Steps:**
1. Click "Time In" button
2. **Expected:** Redirected to Time In screen
3. Click "Select Photo" button
4. Choose any image file from your computer
5. **Expected:** Photo uploads, success message appears
6. Click "OK" on success alert
7. **Expected:** Redirected back to Home screen
8. **Expected:** Home screen now shows:
   - Time In: [current time]
   - Time Out: --:--
   - Status: Incomplete (yellow badge)

**Success Criteria:**
- ✅ Photo picker opens
- ✅ Photo uploads successfully
- ✅ Success message displays
- ✅ Home screen updates with time in
- ✅ Time In button becomes disabled
- ✅ Time Out button becomes enabled

---

### 3. Time Out Flow

**Prerequisites:**
- Already timed in (completed Test 2)
- On Home screen

**Steps:**
1. Click "Time Out" button
2. **Expected:** Redirected to Time Out screen
3. Click "Select Photo" button
4. Choose any image file from your computer
5. **Expected:** Photo uploads, success message appears
6. Click "OK" on success alert
7. **Expected:** Redirected back to Home screen
8. **Expected:** Home screen now shows:
   - Time In: [earlier time]
   - Time Out: [current time]
   - Total Hours: [calculated hours]
   - Status: Completed (green badge)

**Success Criteria:**
- ✅ Photo picker opens
- ✅ Photo uploads successfully
- ✅ Success message displays
- ✅ Home screen updates with time out
- ✅ Total hours calculated correctly
- ✅ Status changes to "Completed"
- ✅ Both buttons become disabled

---

### 4. View History

**Prerequisites:**
- Have at least one attendance log (completed Tests 2 & 3)
- On Home screen

**Steps:**
1. Click "View History" button
2. **Expected:** Redirected to History screen
3. **Expected:** See today's log displayed with:
   - Date
   - Time In
   - Time Out
   - Total Hours
   - Status badge (green for completed)
4. Pull down to refresh
5. **Expected:** Loading indicator, then data refreshes
6. Click "All Time" filter tab
7. **Expected:** Shows all logs (not just past 7 days)
8. Click "Past 7 Days" filter tab
9. **Expected:** Shows only recent logs

**Success Criteria:**
- ✅ History screen loads
- ✅ Today's log displays correctly
- ✅ All data fields populated
- ✅ Status badge shows correct color
- ✅ Pull-to-refresh works
- ✅ Filter toggle works
- ✅ Times formatted correctly

---

### 5. Logout and Re-login

**Prerequisites:**
- Logged in as employee
- On Home screen

**Steps:**
1. Click "Logout" button
2. **Expected:** Redirected to Login screen
3. Enter same username and NEW password (from Test 1)
4. Click "Login"
5. **Expected:** Redirected directly to Home screen (no password change)
6. **Expected:** Today's attendance data still visible

**Success Criteria:**
- ✅ Logout successful
- ✅ Login screen appears
- ✅ Re-login with new password works
- ✅ No password change screen (already changed)
- ✅ Data persists across sessions

---

### 6. Error Handling

#### Invalid Login
1. Enter wrong username or password
2. Click "Login"
3. **Expected:** Error message displays

#### Duplicate Time In
1. Time in successfully
2. Try to time in again (refresh page if needed)
3. **Expected:** Error message about duplicate time in

#### Time Out Without Time In
1. Logout and login as different employee (or next day)
2. Try to time out without timing in first
3. **Expected:** Error message about missing time in

**Success Criteria:**
- ✅ Error messages display clearly
- ✅ App doesn't crash
- ✅ User can retry after error

---

## Native Testing (After Development Build)

### Prerequisites
1. Build development app:
   ```bash
   eas login
   eas build --profile development --platform android
   ```
2. Install APK on Android phone
3. Run development server:
   ```bash
   npm start
   ```
4. Open development build app and scan QR code

### Native-Specific Tests

#### Camera Permission
1. Navigate to Time In screen
2. **Expected:** Camera permission request appears
3. Grant permission
4. **Expected:** Camera preview shows

#### Camera Capture
1. Position face in camera frame
2. Tap large circular capture button
3. **Expected:** Photo captures and uploads
4. **Expected:** Success message appears

#### Camera Quality
1. Capture photo in good lighting
2. Capture photo in low lighting
3. **Expected:** Both photos upload successfully
4. **Expected:** File sizes reasonable (~100-500KB)

---

## Performance Testing

### Load Time
- ✅ App loads in < 3 seconds
- ✅ Login response in < 2 seconds
- ✅ Photo upload in < 5 seconds
- ✅ History loads in < 2 seconds

### Responsiveness
- ✅ Buttons respond immediately
- ✅ No lag during navigation
- ✅ Smooth scrolling in history
- ✅ Pull-to-refresh smooth

---

## Browser Compatibility (Web)

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Common Issues & Solutions

### Issue: "Cannot read property 'uri' of undefined"
**Solution:** Make sure you selected a valid image file

### Issue: "Network request failed"
**Solution:** Check that backend is running and API URL is correct

### Issue: "Unauthorized"
**Solution:** Token may have expired, logout and login again

### Issue: Photo upload takes too long
**Solution:** Choose smaller image files (< 5MB)

### Issue: History shows no data
**Solution:** Make sure you've completed at least one time in/out cycle

---

## Test Data Cleanup

To reset test data:
1. Login to admin dashboard
2. Go to Daily Attendance
3. View employee logs
4. Or use Supabase dashboard to clear time_logs table

---

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device info
5. Console errors (F12 → Console tab)
6. Screenshots if applicable

---

## Success Checklist

Before considering testing complete:

### Authentication
- [ ] First login redirects to password change
- [ ] Password validation works
- [ ] Subsequent logins skip password change
- [ ] Logout works
- [ ] Invalid credentials show error

### Time Logging
- [ ] Time In captures and uploads photo
- [ ] Time Out captures and uploads photo
- [ ] Home screen updates after each action
- [ ] Buttons enable/disable correctly
- [ ] Total hours calculated correctly

### History
- [ ] Logs display correctly
- [ ] Filters work (7 days / all time)
- [ ] Pull-to-refresh works
- [ ] Status badges show correct colors
- [ ] Empty state displays when no logs

### Error Handling
- [ ] Network errors display messages
- [ ] Validation errors display messages
- [ ] App doesn't crash on errors
- [ ] User can recover from errors

### Performance
- [ ] App loads quickly
- [ ] Navigation is smooth
- [ ] No memory leaks
- [ ] Photo uploads complete

---

## Next Steps After Testing

1. Document any bugs found
2. Test on native device (after build)
3. Test with multiple employees
4. Test edge cases (midnight, timezone changes)
5. Performance testing with many logs
6. Accessibility testing
7. Security testing

---

## Quick Test Commands

```bash
# Start web server
cd employee-mobile-app
npm start
# Press 'w'

# Build for native
eas build --profile development --platform android

# Check build status
eas build:list

# View logs
npm start
# Check terminal for errors
```

---

## Test Credentials

Create via admin dashboard:
- URL: http://localhost:3000
- Login as admin
- Create employee
- Use generated credentials in mobile app

---

Happy Testing! 🎉
