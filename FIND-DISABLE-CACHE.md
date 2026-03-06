# Where is the "Disable Cache" Checkbox?

## Quick Visual Guide

You're looking for this checkbox in your browser DevTools:

```
┌─────────────────────────────────────────────────────────────┐
│  Edge/Chrome Browser Window                            [_][□][X] │
├─────────────────────────────────────────────────────────────┤
│  ← → ⟳  localhost:8081                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your App Content Here                                       │
│                                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  DevTools (Press F12 to open)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Elements Console Sources Network Performance ← CLICK │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ☐ Preserve log  ☑ Disable cache  ← CHECK THIS BOX! │  │
│  │                   ^^^^^^^^^^^^^^^^                    │  │
│  │  Filter: [____________]  [All] [Fetch/XHR] [JS]      │  │
│  │                                                       │  │
│  │  Name          Status   Type      Size      Time     │  │
│  │  ───────────────────────────────────────────────────│  │
│  │  main.js       200      script    1.2 MB    234ms   │  │
│  │  bundle.js     200      script    856 KB    156ms   │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Exact Steps:

1. **Press F12** on your keyboard (while the app is open in browser)
   
2. **Click "Network"** tab (it's one of the tabs at the top of DevTools)
   
3. **Look at the very top** of the Network panel
   
4. **You'll see:** `☐ Preserve log  ☐ Disable cache`
   
5. **Click the checkbox** next to "Disable cache" to check it: ☑
   
6. **Keep DevTools open** - it only works while DevTools is open!

## What You'll See:

Before checking the box:
```
☐ Preserve log  ☐ Disable cache
```

After checking the box:
```
☐ Preserve log  ☑ Disable cache  ← Like this!
```

## Result:

Once you check this box and keep DevTools open:
- ✅ Time-in will work immediately (no refresh needed)
- ✅ Logout will work immediately (no refresh needed)  
- ✅ All actions will update the UI instantly
- ✅ No more Ctrl+Shift+R needed!

## Important:
- Keep the DevTools window open while you're developing
- You can minimize it or dock it to the side
- If you close DevTools, the cache will be enabled again

---

**That's it!** This is how all web developers work. The checkbox is in the Network tab, and it needs to stay checked while you develop.
