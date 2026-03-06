# Build Instructions for Development App

## Setup Complete ✅
- ✅ EAS CLI installed globally
- ✅ expo-dev-client installed
- ✅ eas.json configuration created
- ✅ app.json properly configured

## Next Steps

### 1. Create/Login to Expo Account

If you don't have an Expo account:
1. Go to https://expo.dev
2. Click "Sign Up"
3. Create account with your email

Then login via CLI:
```bash
eas login
```

Enter your Expo credentials when prompted.

### 2. Build the Development App

Once logged in, run:
```bash
eas build --profile development --platform android
```

This will:
- Upload your project to Expo's build servers
- Build a custom development APK
- Provide a download link when complete (takes ~10-15 minutes)

### 3. Install on Your Phone

When the build completes:
1. You'll get a download link in the terminal
2. Open that link on your Android phone
3. Download the APK file
4. Install it (you may need to allow "Install from unknown sources" in Settings)

### 4. Run the Development Server

After installing the app on your phone:
```bash
npm start
```

### 5. Connect Your Phone

1. Open the development build app on your phone (not Expo Go)
2. Scan the QR code from the terminal
3. The app will load with your code

### 6. Development Workflow

From now on:
- Make code changes on your computer
- The app will hot-reload automatically on your phone
- No need to rebuild unless you change native dependencies

---

## Alternative: Continue with Web

While waiting for the build, you can continue development on web:
```bash
npm start
# Press 'w' to open in browser
```

The web version is fully functional for testing authentication and UI.

---

## Troubleshooting

### "An Expo user account is required"
- Run `eas login` first
- Create account at expo.dev if needed

### Build fails
- Check your internet connection
- Ensure app.json is valid JSON
- Check EAS build logs for specific errors

### Can't install APK on phone
- Go to Settings → Security
- Enable "Install from unknown sources" or "Install unknown apps"
- Allow installation from your browser/file manager

---

## What's Next After Build?

Once you have the development build running on your phone, we'll implement:
- Task 14.1: Time In screen with camera
- Task 14.2: Time Out screen with camera
- Task 14.4: History screen

The camera features will work natively on your phone!
