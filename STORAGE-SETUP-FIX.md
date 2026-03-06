# 🔧 Storage Setup Fix

## The Issue
The error `must be owner of relation objects` happens because storage policies can't be created via SQL - they need to be created through the Supabase Dashboard UI.

## ✅ Solution: Two Options

### Option 1: Quick & Easy (Recommended)

**Just create the bucket manually, skip the policies for now:**

1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/storage/buckets
2. Click "**New bucket**"
3. Enter:
   - Name: `attendance-photos`
   - Public: **OFF** (keep private)
4. Click "**Create bucket**"
5. **Done!** Skip migration 002 and continue to migration 003

**Why this works:** The bucket is the important part. We can add policies later when we test photo uploads.

---

### Option 2: Complete Setup (If you want full security now)

Follow the detailed instructions in: `supabase/migrations/002_storage_setup_manual.md`

This creates the bucket AND all 4 security policies.

---

## 🚀 Next Steps

After creating the bucket (Option 1 or 2):

1. ✅ Skip the SQL for migration 002 (you already created the bucket manually)
2. ✅ Continue to migration 003: `003_enable_rls.sql`
3. Run migration 003 in SQL Editor
4. Tell me "Migrations complete"

---

## Quick Command

**To continue right now:**

1. Create bucket manually (link above)
2. Go back to SQL Editor: https://app.supabase.com/project/omjwuntbttxydlsofxao/sql
3. Open and run: `supabase/migrations/003_enable_rls.sql`
4. Done!

---

## Why This Happened

Supabase's `storage.objects` table is owned by the system, not your user account. Storage policies must be created through the Dashboard UI which has the proper permissions.

This is a Supabase security feature, not a bug in our setup.

---

## Summary

- ✅ Migration 001: **DONE** (tables created)
- ⚠️ Migration 002: **SKIP SQL** → Create bucket manually instead
- ⏳ Migration 003: **NEXT** → Run the RLS policies

**Current status:** You're doing great! Just create the bucket manually and move on to migration 003.
