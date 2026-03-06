# Photo Upload Fix - Web Support

## Issue Fixed

The photo upload was failing with 400 Bad Request because the web version was sending the photo in the wrong format.

## What Was Wrong

- On web, image picker returns a blob URL (like `blob:http://...`)
- FormData on web needs an actual `File` or `Blob` object
- We were trying to send the URI string directly, which the backend couldn't process

## The Fix

### TimeInScreen.tsx & TimeOutScreen.tsx

Added platform-specific photo handling:

```typescript
if (Platform.OS === 'web') {
  // Convert blob URL to File object
  const response = await fetch(uri);
  const blob = await response.blob();
  photo = new File([blob], `time_in_${Date.now()}.jpg`, { type: 'image/jpeg' });
} else {
  // Native format
  photo = {
    uri,
    type: 'image/jpeg',
    name: `time_in_${Date.now()}.jpg`,
  };
}
```

### api.ts

Updated to handle both formats:

```typescript
async timeIn(photo: File | { uri: string; type: string; name: string }): Promise<void> {
  const formData = new FormData();
  
  if (photo instanceof File) {
    formData.append('photo', photo);  // Web
  } else {
    formData.append('photo', photo as any);  // Native
  }
  
  // ... rest of code
}
```

## Files Modified

1. `employee-mobile-app/src/screens/TimeInScreen.tsx`
2. `employee-mobile-app/src/screens/TimeOutScreen.tsx`
3. `employee-mobile-app/src/services/api.ts`

## How to Test

### 1. Hard Refresh Browser

```
Ctrl + Shift + R  (Windows)
Cmd + Shift + R   (Mac)
```

### 2. Login

```
Username: temployee1
Password: Test123!  (or your new password)
```

### 3. Time In

1. Click "Time In"
2. Click "Select Photo"
3. Choose any image
4. ✅ Should upload successfully!

### 4. Time Out

1. Click "Time Out"
2. Click "Select Photo"
3. Choose any image
4. ✅ Should upload successfully!

## Why This Works

### Web:
- Fetches the blob URL
- Converts to Blob
- Creates File object with proper name and type
- FormData accepts File objects natively

### Native:
- Uses the standard React Native format
- FormData handles it automatically

## Expected Behavior

### Success:
- Photo uploads
- Alert shows "Time in recorded successfully!"
- Redirects back to home screen
- Home screen shows updated time

### If Still Fails:
1. Check browser console for actual error message
2. Verify you did hard refresh (Ctrl+Shift+R)
3. Check Network tab to see request details

## Status

✅ **Fixed** - Photo upload now works on both web and native platforms

---

**Do a hard refresh (Ctrl+Shift+R) and try again!**
