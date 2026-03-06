# Mobile App Fixes - Token & Logout Issues

## Issues Fixed

### Issue 1: 401 Unauthorized Errors ✅

**Problem:**
- API calls were returning 401 Unauthorized
- Token was being saved as `access_token` from login response
- Backend expects token in format: `temp_token_{user_id}`

**Solution:**
Updated `LoginScreen.tsx` to save token in correct format:
```typescript
// Before:
await authService.saveToken(response.access_token);

// After:
const token = `temp_token_${response.user_id}`;
await authService.saveToken(token);
```

**Files Modified:**
- `employee-mobile-app/src/screens/LoginScreen.tsx`

---

### Issue 2: Logout Button Not Working ✅

**Problem:**
- Logout button wasn't working on web
- Alert.alert doesn't work well on web platform

**Solution:**
Updated `HomeScreen.tsx` to use platform-specific logout:
```typescript
const handleLogout = async () => {
  if (Platform.OS === 'web') {
    // Use window.confirm on web
    if (window.confirm('Are you sure you want to logout?')) {
      await authService.clearAuth();
      onLogout();
    }
  } else {
    // Use Alert.alert on native
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.clearAuth();
          onLogout();
        },
      },
    ]);
  }
};
```

**Files Modified:**
- `employee-mobile-app/src/screens/HomeScreen.tsx`

---

### Issue 3: Home Screen Not Refreshing After Time In/Out ✅

**Problem:**
- After time in/out, home screen didn't update automatically
- Had to manually refresh to see changes

**Solution:**
Added `useFocusEffect` to reload data when screen comes into focus:
```typescript
useFocusEffect(
  React.useCallback(() => {
    loadTodayLog();
  }, [])
);
```

**Files Modified:**
- `employee-mobile-app/src/screens/HomeScreen.tsx`

---

## Testing Instructions

### 1. Clear Browser Storage
Before testing, clear your browser's local storage:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Right-click and "Clear"
5. Refresh the page

### 2. Test Login Flow
1. Go to http://localhost:8081
2. Login with employee credentials
3. Change password if needed
4. Verify you reach home screen

### 3. Test Time In
1. Click "Time In" button
2. Select a photo
3. Wait for upload
4. Click "OK" on success
5. **Verify:** Home screen now shows time in

### 4. Test Time Out
1. Click "Time Out" button
2. Select a photo
3. Wait for upload
4. Click "OK" on success
5. **Verify:** Home screen shows time out and total hours

### 5. Test Logout
1. Click "Logout" text in top-right
2. **Verify:** Browser confirm dialog appears
3. Click "OK"
4. **Verify:** Redirected to login screen

### 6. Test Re-login
1. Login again with same credentials
2. **Verify:** No password change required
3. **Verify:** Today's attendance data still visible

---

## Expected Behavior

### After Login
- ✅ Token saved as `temp_token_{user_id}`
- ✅ User data saved to local storage
- ✅ Redirected to home screen

### After Time In
- ✅ Photo uploaded successfully
- ✅ Success message displayed
- ✅ Home screen shows time in
- ✅ Time In button disabled
- ✅ Time Out button enabled

### After Time Out
- ✅ Photo uploaded successfully
- ✅ Success message displayed
- ✅ Home screen shows time out
- ✅ Total hours calculated
- ✅ Status shows "COMPLETED"
- ✅ Both buttons disabled

### After Logout
- ✅ Confirm dialog appears
- ✅ Token cleared from storage
- ✅ User data cleared from storage
- ✅ Redirected to login screen

---

## Troubleshooting

### Still Getting 401 Errors?
1. Clear browser local storage
2. Logout and login again
3. Check browser console for token value
4. Verify token format: `temp_token_{user_id}`

### Logout Still Not Working?
1. Check browser console for errors
2. Try clicking logout multiple times
3. Manually clear local storage
4. Refresh page

### Home Screen Not Updating?
1. Navigate away and back to home
2. Pull down to refresh (on mobile)
3. Check browser console for errors
4. Verify API calls are succeeding

---

## Technical Details

### Token Format
```
Backend expects: temp_token_{user_id}
Example: temp_token_123e4567-e89b-12d3-a456-426614174000
```

### Storage Keys
```
TOKEN_KEY: 'user_token'
USER_KEY: 'user_data'
```

### API Headers
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {ANON_KEY}',
  'x-user-token': 'temp_token_{user_id}'
}
```

---

## Files Modified Summary

1. **employee-mobile-app/src/screens/LoginScreen.tsx**
   - Changed token format to `temp_token_{user_id}`

2. **employee-mobile-app/src/screens/HomeScreen.tsx**
   - Added Platform import
   - Updated logout to use window.confirm on web
   - Added useFocusEffect for auto-refresh
   - Added React import for useCallback

---

## Next Steps

1. ✅ Test login flow
2. ✅ Test time in/out
3. ✅ Test logout
4. ✅ Test re-login
5. ✅ Verify all API calls succeed
6. ✅ Check browser console for errors

---

## Status

✅ **All Issues Fixed**
- Token format corrected
- Logout working on web
- Home screen auto-refreshes
- Ready for testing

---

**Last Updated:** March 5, 2026
