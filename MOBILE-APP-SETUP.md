# Mobile App Setup Guide

## Overview

The employee mobile app has been initialized with React Native/Expo and includes the basic project structure, navigation, authentication, and API integration.

## What's Been Completed

### Task 12: Set up React Native/Expo mobile app project ✅

1. **Project Initialization**
   - Created Expo project with TypeScript template
   - Installed all required dependencies:
     - `@supabase/supabase-js` - Supabase client
     - `@react-navigation/native` - Navigation framework
     - `@react-navigation/native-stack` - Stack navigator
     - `expo-camera` - Camera functionality
     - `expo-image-picker` - Image picker
     - `expo-secure-store` - Secure token storage
     - `expo-constants` - Environment configuration
     - `react-native-safe-area-context` - Safe area handling
     - `react-native-screens` - Native screen optimization

2. **Project Structure Created**
   ```
   employee-mobile-app/
   ├── src/
   │   ├── config/
   │   │   └── supabase.ts          # Supabase client setup
   │   ├── navigation/
   │   │   ├── AuthStack.tsx        # Auth navigation (not used, kept for reference)
   │   │   ├── MainStack.tsx        # Main navigation (not used, kept for reference)
   │   │   └── types.ts             # Navigation types
   │   ├── screens/
   │   │   ├── LoginScreen.tsx      # ✅ Complete
   │   │   ├── ChangePasswordScreen.tsx  # ✅ Complete
   │   │   ├── HomeScreen.tsx       # ✅ Complete
   │   │   ├── TimeInScreen.tsx     # 🔄 Placeholder
   │   │   ├── TimeOutScreen.tsx    # 🔄 Placeholder
   │   │   └── HistoryScreen.tsx    # 🔄 Placeholder
   │   ├── services/
   │   │   ├── api.ts               # API service with all endpoints
   │   │   └── auth.ts              # Auth service with secure storage
   │   └── types/
   │       └── index.ts             # TypeScript definitions
   ├── App.tsx                      # Main app with navigation
   ├── app.json                     # Expo config with permissions
   └── README.md                    # Mobile app documentation
   ```

3. **Features Implemented**
   - ✅ Supabase client configuration
   - ✅ Secure token storage using expo-secure-store
   - ✅ API service with all backend endpoints
   - ✅ Authentication service
   - ✅ Navigation structure (Auth and Main stacks)
   - ✅ Login screen with validation
   - ✅ Password change screen with requirements
   - ✅ Home screen with today's status
   - ✅ TypeScript type definitions
   - ✅ Camera permissions configured

4. **Configuration**
   - Updated `app.json` with:
     - Supabase URL and API URL
     - Camera permissions for Android/iOS
     - Expo camera plugin configuration
   - Created `.env.example` for environment variables

## Configuration Required

Before running the app, you need to update `app.json` with your actual Supabase credentials:

```json
"extra": {
  "supabaseUrl": "https://omjwuntbttxydlsofxao.supabase.co",
  "supabaseAnonKey": "YOUR_ACTUAL_ANON_KEY_HERE",
  "apiUrl": "https://omjwuntbttxydlsofxao.supabase.co/functions/v1"
}
```

Get your anon key from:
1. Go to Supabase Dashboard
2. Navigate to Settings > API
3. Copy the "anon public" key

## Running the App

1. Navigate to the mobile app directory:
```bash
cd employee-mobile-app
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - **Expo Go App**: Scan the QR code with Expo Go app
   - **Android Emulator**: Press `a` in terminal
   - **iOS Simulator**: Press `i` in terminal (macOS only)
   - **Web Browser**: Press `w` in terminal

## Testing the App

### Test Login Flow
1. Use employee credentials created by admin
2. Login with username and password
3. If first login, you'll be redirected to change password
4. After password change, you'll see the home screen

### Test Home Screen
- View today's attendance status
- See time in, time out, and total hours
- Status badge shows completion status
- Time In button (enabled if not logged in yet)
- Time Out button (enabled only after time in)
- View History button

## Next Tasks

The following screens need camera implementation:

### Task 13: Implement mobile app authentication screens
- ✅ 13.1 Login screen - COMPLETE
- ✅ 13.2 Password change screen - COMPLETE
- ⏭️ 13.3 Property test for first login flow - OPTIONAL

### Task 14: Implement mobile app time logging screens
- ⏭️ 14.1 Time In screen with camera capture
- ⏭️ 14.2 Time Out screen with camera capture
- ⏭️ 14.3 Enhanced home screen (already implemented)
- ⏭️ 14.4 History screen with pagination

## API Endpoints Used

The mobile app integrates with these Supabase Edge Functions:

1. **POST /login**
   - Authenticates employee
   - Returns token and user data
   - Checks `must_change_password` flag

2. **POST /change-password**
   - Changes employee password
   - Validates password requirements
   - Clears `must_change_password` flag

3. **POST /time-in**
   - Logs time in with photo
   - Uploads photo to Supabase Storage
   - Creates time_log record

4. **POST /time-out**
   - Logs time out with photo
   - Uploads photo to Supabase Storage
   - Updates time_log with total hours

5. **GET /my-logs**
   - Retrieves employee's time logs
   - Supports date range filtering
   - Includes pagination

## Security Features

- ✅ Secure token storage using expo-secure-store
- ✅ Token sent in `x-user-token` header
- ✅ Password validation (8+ chars, uppercase, lowercase, number)
- ✅ Automatic logout on token expiration
- ✅ RLS enforced at database level

## Known Limitations

1. **Camera screens not implemented yet**
   - TimeInScreen, TimeOutScreen, and HistoryScreen are placeholders
   - Will be implemented in Task 14

2. **No offline support**
   - App requires internet connection
   - Could be added in future enhancement

3. **No push notifications**
   - No reminders for time in/out
   - Could be added in future enhancement

## Troubleshooting

### "Cannot find module" errors
```bash
cd employee-mobile-app
npm install
```

### Camera permissions not working
- Android: Check `app.json` has camera permissions
- iOS: Permissions requested automatically on first use
- Restart app after granting permissions

### API connection fails
- Verify `app.json` has correct Supabase URL
- Check network connection
- Verify backend functions are deployed

### Navigation errors
- Clear Metro bundler cache: `npm start -- --clear`
- Restart Expo: `npm start`

## Development Tips

1. **Hot Reload**: Changes to code automatically reload the app
2. **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. **Console Logs**: View in terminal where `npm start` is running
4. **Network Requests**: Use React Native Debugger or Flipper

## Next Steps

Proceed with Task 13 and 14 to implement:
1. Camera functionality for time in/out
2. Photo capture and upload
3. History screen with pagination
4. Enhanced UI/UX features

## Status

✅ Task 12 Complete - Mobile app project setup with navigation and authentication
⏭️ Ready for Task 13 & 14 - Camera implementation and time logging screens
