# Fix: Clear Browser Storage

## The Problem

After changing your password, you're getting 401 errors because your browser still has old session data cached.

## The Solution

You need to clear your browser's local storage.

### Method 1: Using Browser DevTools (Recommended)

1. Press `F12` to open DevTools
2. Go to the **Application** tab (or **Storage** tab in Firefox)
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:8081`
5. Right-click in the main area
6. Click **Clear**
7. Close DevTools
8. **Refresh the page** (F5 or Ctrl+R)

### Method 2: Using Console

1. Press `F12` to open DevTools
2. Go to the **Console** tab
3. Type this command and press Enter:
   ```javascript
   localStorage.clear()
   ```
4. Refresh the page (F5)

### Method 3: Hard Refresh

1. Close the browser tab completely
2. Open a new tab
3. Go to http://localhost:8081
4. Try logging in again

---

## After Clearing Storage

### Step 1: Login Again

```
URL: http://localhost:8081
Username: temployee
Password: MacpdrvN6OwG
```

### Step 2: Change Password

1. Enter current password: `MacpdrvN6OwG`
2. Enter new password: `Test123!`
3. Confirm password: `Test123!`
4. Click "Change Password"
5. ✅ Should work now!

### Step 3: You're Done!

After password change, you should see the home screen.

---

## Why This Happens

When you login, the app saves a token in browser storage. This token is tied to your user ID, not your password. However, if there's any corruption or old data, it can cause issues.

Clearing storage ensures you start fresh.

---

## Prevention

In the future, if you get weird 401 errors:
1. Clear local storage
2. Refresh the page
3. Login again

---

## Quick Commands

### Clear Storage (Console)
```javascript
localStorage.clear()
location.reload()
```

### Check Current Storage (Console)
```javascript
console.log('Token:', localStorage.getItem('user_token'))
console.log('User:', localStorage.getItem('user_data'))
```

---

**Try this now and the password change should work!**
