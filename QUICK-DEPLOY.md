# Quick Deployment Guide

## TL;DR - Fastest Way to Deploy

### 1. Backend (5 minutes)
```bash
npx supabase login
npx supabase functions deploy
```
✅ Done! Your API is live.

### 2. Admin Dashboard (10 minutes)
```bash
# Push to GitHub
git push origin main

# Go to vercel.com
# Click "Import Project" → Select your repo → Deploy
```
✅ Done! Dashboard is live at `your-project.vercel.app`

### 3. Mobile App APK (20 minutes)
```bash
cd employee-mobile-app

# Install EAS CLI (one time)
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android --profile preview
```
✅ Done! Download APK from the link provided.

---

## What You Get

### Admin Dashboard
- **URL:** `https://your-project.vercel.app`
- **Access:** Any web browser
- **Updates:** Automatic on git push

### Mobile App
- **File:** `employee-app.apk` (download link)
- **Install:** Share APK file with employees
- **Size:** ~50-80 MB
- **Updates:** Build new APK and redistribute

---

## For Production (Play Store)

### Google Play Store Setup

1. **Create Developer Account**
   - Go to: https://play.google.com/console
   - Pay $25 one-time fee
   - Complete registration

2. **Build Production AAB**
```bash
cd employee-mobile-app
eas build --platform android --profile production
```

3. **Upload to Play Store**
   - Download AAB file from EAS
   - Create app listing in Play Console
   - Upload AAB
   - Fill out store listing (description, screenshots)
   - Submit for review (1-3 days)

### Benefits of Play Store
- Professional distribution
- Automatic updates for users
- Better security
- User reviews and ratings
- Analytics

---

## Cost Summary

### Free Option (Good for Testing)
- Supabase: Free tier
- Vercel: Free tier
- EAS Build: 30 builds/month free
- **Total: $0/month**

### Production Option
- Supabase: Free or $25/month
- Vercel: Free or $20/month
- Google Play: $25 one-time
- **Total: $25 one-time + $0-45/month**

---

## Distribution Methods

### Method 1: Direct APK (Easiest)
**Pros:**
- No store account needed
- Instant distribution
- Free

**Cons:**
- Users must enable "Unknown Sources"
- Manual updates
- Less professional

**Best for:** Internal use, small teams, testing

### Method 2: Google Play Store (Professional)
**Pros:**
- Professional appearance
- Automatic updates
- Better security
- Wider reach

**Cons:**
- $25 fee
- Review process (1-3 days)
- Store policies to follow

**Best for:** Public release, large teams, commercial use

---

## Next Steps

1. **Test locally first**
   - Ensure everything works in development
   - Test all features thoroughly

2. **Deploy backend**
   - Run `npx supabase functions deploy`
   - Verify all functions work

3. **Deploy dashboard**
   - Push to GitHub
   - Connect to Vercel
   - Test production URL

4. **Build mobile app**
   - Run `eas build`
   - Download and test APK
   - Distribute to users

5. **Monitor and maintain**
   - Check Supabase logs
   - Monitor Vercel analytics
   - Collect user feedback

---

## Common Questions

**Q: Can I update the app without rebuilding?**
A: Yes! For JavaScript changes only, use:
```bash
eas update --branch production
```
This pushes updates instantly without rebuilding.

**Q: How do users install the APK?**
A: 
1. Download APK file
2. Open file on Android device
3. Allow "Install from Unknown Sources" if prompted
4. Tap "Install"

**Q: Do I need a Mac for iOS?**
A: For EAS Build, no. EAS builds iOS apps in the cloud. You only need a Mac for local builds or testing.

**Q: How much does it cost to run?**
A: Free tier works for small teams. Expect $0-50/month depending on usage.

**Q: Can I use my own domain?**
A: Yes! Add custom domain in Vercel settings (free with Vercel).

**Q: How do I update the app?**
A: Build new version with `eas build`, then redistribute APK or push update to Play Store.

