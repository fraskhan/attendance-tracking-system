# How to Disable Browser Cache in DevTools

## Quick Answer
The "Disable cache" checkbox is in the Network tab of your browser's Developer Tools.

## Step-by-Step Instructions

### For Chrome/Edge:

1. **Open Developer Tools**
   - Press `F12` OR
   - Press `Ctrl + Shift + I` OR
   - Right-click anywhere on the page → "Inspect"

2. **Go to the Network Tab**
   - Click on the "Network" tab at the top of DevTools
   - It's usually the 5th or 6th tab from the left

3. **Find the Disable Cache Checkbox**
   - Look at the top of the Network panel
   - You'll see a checkbox labeled "Disable cache"
   - Check this box ✓

4. **Keep DevTools Open**
   - IMPORTANT: The cache is only disabled while DevTools is open
   - Keep the DevTools window open while developing

### Visual Location:
```
DevTools Window
├── [Elements] [Console] [Sources] [Network] ← Click here
│   
│   Network Panel
│   ┌─────────────────────────────────────────┐
│   │ ☐ Preserve log  ☑ Disable cache        │ ← Check this box
│   │ [Filter] [All] [Fetch/XHR] [JS] [CSS]  │
│   │                                         │
│   │ Name          Status  Type    Size     │
│   │ ─────────────────────────────────────  │
│   │ (network requests appear here)         │
│   └─────────────────────────────────────────┘
```

## Why This Fixes Your Issue

When you make code changes and run `npm start`, the Metro bundler creates new JavaScript files. However, your browser caches the old files and doesn't fetch the new ones.

With "Disable cache" enabled:
- Browser always fetches fresh files from the server
- You see your code changes immediately
- No need to press `Ctrl + Shift + R` after every change

## Alternative: Hard Refresh (if you don't want DevTools open)

If you prefer not to keep DevTools open:
- Press `Ctrl + Shift + R` to do a hard refresh
- This bypasses the cache for that one reload
- You'll need to do this after every code change

## Recommended Workflow

For the best development experience:
1. Open DevTools (`F12`)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open (you can dock it to the side or bottom)
5. Now you can make changes and just press `Ctrl + R` for normal refresh

---

**Your app is working perfectly!** The only "issue" was browser caching, which is normal web development behavior. With cache disabled, everything will update instantly.
