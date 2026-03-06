export default {
  expo: {
    name: "employee-mobile-app",
    slug: "employee-mobile-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      url: "https://u.expo.dev/c9c088eb-2643-4b70-8761-9ca120573b98"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      package: "com.fraskhan.employeemobileapp",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: "https://omjwuntbttxydlsofxao.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tand1bnRidHR4eWRsc29meGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzg2MTUsImV4cCI6MjA4ODE1NDYxNX0.kJOZ2GUUY4X9srBSjElxEXHgjdD2JAyvMMZGwbOmFHw",
      apiUrl: "https://omjwuntbttxydlsofxao.supabase.co/functions/v1",
      eas: {
        projectId: "c9c088eb-2643-4b70-8761-9ca120573b98"
      }
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera for time logging verification."
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "2.0.21",
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
            usesCleartextTraffic: true,
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            buildToolsVersion: "35.0.0"
          },
          ios: {}
        }
      ]
    ],
    jsEngine: "hermes"
  }
};
