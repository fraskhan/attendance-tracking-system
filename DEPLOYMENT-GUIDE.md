# Complete Deployment Guide

## Overview
This guide covers deploying all three components of your attendance system:
- Supabase Backend (Edge Functions + Database)
- Next.js Admin Dashboard
- React Native Mobile App (APK/IPA)

---

## 1. Supabase Backend Deployment

### Current Status
Your Supabase project is already cloud-hosted. Edge Functions need to be deployed.

### Deploy Edge Functions
```bash
# Login to Supabase
npx supabase login

# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Deploy all functions
npx supabase functions deploy

# Or deploy individual functions
npx supabase functions deploy register-admin
npx supabase functions deploy login
npx supabase functions deploy time-in
# ... etc
```

### Verify Deployment
- Check Supabase Dashboard → Edge Functions
- Test endpoints using your test scripts
- Ensure all environment variables are set in Supabase Dashboard

---

## 2. Next.js Admin Dashboard Deployment

### Option A: Vercel (Recommended - Free Tier Available)

**Why Vercel?**
- Built by Next.js creators
- Zero configuration
- Automatic HTTPS
- Free tier includes: 100GB bandwidth, unlimited deployments
- Automatic preview deployments for branches

**Steps:**

1. **Prepare for deployment**
```bash
cd admin-dashboard

# Create production build locally to test
npm run build
```

2. **Deploy to Vercel**

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Configure build settings (auto-detected)
```

**Method 2: GitHub Integration (Recommended)**
- Push code to GitHub
- Go to https://vercel.com
- Click "Import Project"
- Select your GitHub repository
- Vercel auto-detects Next.js settings
- Click "Deploy"

3. **Configure Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Custom Domain (Optional)**
- Vercel provides: `your-project.vercel.app`
- Add custom domain in Settings → Domains

### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd admin-dashboard
netlify deploy --prod
```

### Option C: Self-Hosted (VPS/Cloud)

**Requirements:**
- Node.js 18+ installed
- PM2 for process management
- Nginx as reverse proxy

```bash
# On your server
git clone your-repo
cd admin-dashboard
npm install
npm run build

# Install PM2
npm i -g pm2

# Start with PM2
pm2 start npm --name "admin-dashboard" -- start
pm2 save
pm2 startup
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. React Native Mobile App Deployment

### For Android (APK/AAB)

**Option A: EAS Build (Recommended)**

Your project is already configured with EAS. This is the easiest method.

**Prerequisites:**
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
```

**Build APK (for testing/direct distribution):**
```bash
cd employee-mobile-app

# Build APK
eas build --platform android --profile preview

# This will:
# - Upload your code to Expo servers
# - Build the APK in the cloud
# - Provide download link when complete
```

**Build AAB (for Google Play Store):**
```bash
# Build production AAB
eas build --platform android --profile production

# This creates an Android App Bundle for Play Store
```

**Your eas.json configuration:**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // Creates APK for direct install
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"  // Creates AAB for Play Store
      }
    }
  }
}
```

**Option B: Local Build (More Complex)**

Requires Android Studio and Java SDK installed.

```bash
cd employee-mobile-app

# Generate native Android project
npx expo prebuild --platform android

# Build locally
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### For iOS (IPA)

**Requirements:**
- Mac computer
- Apple Developer Account ($99/year)
- Xcode installed

**Using EAS Build:**
```bash
cd employee-mobile-app

# Build for iOS
eas build --platform ios --profile production

# For TestFlight (beta testing)
eas submit --platform ios
```

**Local Build:**
```bash
# Generate iOS project
npx expo prebuild --platform ios

# Open in Xcode
cd ios
open EmployeeAttendance.xcworkspace

# Build in Xcode:
# Product → Archive → Distribute App
```

### Distribution Options

**1. Direct APK Distribution (Android Only)**
- Share APK file directly
- Users need to enable "Install from Unknown Sources"
- Good for: Internal testing, small teams

**2. Google Play Store (Android)**
- Professional distribution
- Automatic updates
- Requires: Google Play Developer account ($25 one-time)
- Upload AAB file from EAS build

**3. Apple App Store (iOS)**
- Required for iOS distribution
- Requires: Apple Developer account ($99/year)
- Submit through App Store Connect

**4. TestFlight (iOS Beta)**
- Free beta testing platform
- Up to 10,000 testers
- Managed through App Store Connect

**5. Expo Go (Development Only)**
- Not for production
- Users need Expo Go app
- Good for: Quick demos, development

---

## 4. Environment Configuration

### Production Environment Variables

**Admin Dashboard (.env.production):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**Mobile App (app.config.js):**
```javascript
export default {
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  }
}
```

Create `.env.production` in mobile app:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## 5. Pre-Deployment Checklist

### Backend
- [ ] All Edge Functions deployed
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Storage buckets configured
- [ ] Environment secrets set in Supabase Dashboard

### Admin Dashboard
- [ ] Production build succeeds locally
- [ ] Environment variables configured
- [ ] API endpoints point to production Supabase
- [ ] Test all features in production mode
- [ ] Configure custom domain (optional)

### Mobile App
- [ ] Update app.json version numbers
- [ ] Configure app icons and splash screens
- [ ] Test on physical devices
- [ ] Update API URLs to production
- [ ] Configure app signing (for stores)
- [ ] Prepare store listings (screenshots, descriptions)

---

## 6. Recommended Deployment Flow

### Initial Deployment
```bash
# 1. Deploy Backend
npx supabase functions deploy

# 2. Deploy Admin Dashboard
cd admin-dashboard
vercel --prod

# 3. Build Mobile App
cd ../employee-mobile-app
eas build --platform android --profile production
```

### Continuous Deployment

**For Admin Dashboard:**
- Connect GitHub to Vercel
- Every push to `main` auto-deploys
- Preview deployments for PRs

**For Mobile App:**
- Use EAS Update for JS-only changes (instant)
- Full rebuild for native changes
- Submit updates to stores

---

## 7. Cost Breakdown

### Free Tier (Suitable for Small Teams)
- **Supabase Free:** 500MB database, 1GB file storage, 2GB bandwidth
- **Vercel Free:** 100GB bandwidth, unlimited deployments
- **EAS Build Free:** 30 builds/month (Android + iOS)

### Paid Options
- **Supabase Pro:** $25/month (8GB database, 100GB storage)
- **Vercel Pro:** $20/month (1TB bandwidth, advanced features)
- **EAS Build:** $29/month (unlimited builds)
- **Google Play:** $25 one-time
- **Apple Developer:** $99/year

---

## 8. Quick Start Commands

### Deploy Everything
```bash
# Backend
npx supabase functions deploy

# Admin Dashboard (Vercel)
cd admin-dashboard
vercel --prod

# Mobile App (Android APK)
cd ../employee-mobile-app
eas build -p android --profile preview
```

### Update After Changes
```bash
# Backend functions
npx supabase functions deploy function-name

# Admin Dashboard (auto-deploys via GitHub)
git push origin main

# Mobile App (JS-only changes)
cd employee-mobile-app
eas update --branch production
```

---

## 9. Testing Production Builds

### Admin Dashboard
```bash
cd admin-dashboard
npm run build
npm start
# Test at http://localhost:3000
```

### Mobile App
```bash
cd employee-mobile-app
# Test production mode locally
npx expo start --no-dev --minify
```

---

## 10. Troubleshooting

### Common Issues

**Admin Dashboard won't build:**
- Check for TypeScript errors: `npm run build`
- Verify environment variables are set
- Check Next.js version compatibility

**Mobile App build fails:**
- Verify eas.json configuration
- Check app.json for errors
- Ensure all dependencies are compatible
- Review build logs in EAS dashboard

**API calls fail in production:**
- Verify Supabase URL and keys
- Check CORS settings in Supabase
- Ensure Edge Functions are deployed
- Test endpoints with curl/Postman

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Supabase Docs:** https://supabase.com/docs
- **Play Store Guide:** https://play.google.com/console/about/guides/
- **App Store Guide:** https://developer.apple.com/app-store/

