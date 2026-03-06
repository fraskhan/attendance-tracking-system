# Development Build Setup Guide

## Current Status
- ✅ expo-dev-client installed
- ⏳ Need to build the development app

## Option 1: EAS Build (Recommended - No Android SDK Required)

EAS Build compiles your app in the cloud, so you don't need Android Studio installed locally.

### Steps:

1. **Install EAS CLI globally**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo account** (create one at expo.dev if you don't have it)
   ```bash
   eas login
   ```

3. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

4. **Build for Android (Development)**
   ```bash
   eas build --profile development --platform android
   ```

5. **Install on your device**
   - Once build completes, you'll get a download link
   - Download the APK on your Android phone
   - Install it (you may need to enable "Install from unknown sources")

6. **Run the development server**
   ```bash
   npm start
   ```

7. **Connect your device**
   - Open the development build app on your phone
   - Scan the QR code or enter the URL manually

### Advantages:
- ✅ No need to install Android Studio
- ✅ No need to configure Android SDK
- ✅ Builds in the cloud
- ✅ Free tier available

---

## Option 2: Local Build (Requires Android Studio)

If you want to build locally, you need to set up Android development environment.

### Prerequisites:

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with default settings
   - Open Android Studio and complete the setup wizard

2. **Set up Android SDK**
   - Open Android Studio
   - Go to: Tools → SDK Manager
   - Install:
     - Android SDK Platform 34 (or latest)
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

3. **Set Environment Variables**
   
   Add to your system environment variables:
   ```
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```
   
   Add to PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Restart your terminal/computer** after setting environment variables

### Build Steps:

1. **Enable USB Debugging on your Android phone**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect your phone via USB**
   ```bash
   adb devices
   ```
   You should see your device listed.

3. **Build and run**
   ```bash
   npx expo run:android
   ```

---

## Option 3: Continue with Web (Fastest for Development)

The web version is fully functional and perfect for development:

```bash
npm start
# Press 'w' to open in browser
```

You can develop and test all features on web, then build for mobile later when you need to test camera functionality.

---

## Recommended Approach

For fastest development:

1. **Use web for UI/logic development** (no setup needed)
2. **Use EAS Build for mobile testing** (when you need camera features)

This way you can continue building features without waiting for Android SDK setup.

---

## Next Steps

Choose one of the options above and let me know if you need help with any step!

### Quick Start (EAS Build):
```bash
# In employee-mobile-app directory
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

### Quick Start (Web):
```bash
# In employee-mobile-app directory
npm start
# Press 'w'
```
