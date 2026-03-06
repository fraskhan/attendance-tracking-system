# ✅ Database Migration Checklist

## Quick Links
- 🔗 **SQL Editor**: https://app.supabase.com/project/omjwuntbttxydlsofxao/sql
- 📊 **Tables**: https://app.supabase.com/project/omjwuntbttxydlsofxao/editor
- 📦 **Storage**: https://app.supabase.com/project/omjwuntbttxydlsofxao/storage/buckets
- 🔐 **Policies**: https://app.supabase.com/project/omjwuntbttxydlsofxao/auth/policies

---

## Migration Steps

### [ ] Step 1: Migration 001_initial_schema.sql
1. Open SQL Editor (link above)
2. Click "New Query"
3. Open file: `supabase/migrations/001_initial_schema.sql`
4. Copy ENTIRE file contents (Ctrl+A, Ctrl+C)
5. Paste in SQL Editor (Ctrl+V)
6. Click "Run" button (or Ctrl+Enter)
7. ✅ Verify: Should see "Success. No rows returned"

**What this creates:**
- ✅ organizations table
- ✅ users table
- ✅ time_logs table
- ✅ Database triggers (auto-calculate hours, validate times)
- ✅ Performance indexes

---

### [ ] Step 2: Migration 002_storage_setup.sql
1. Click "New Query" in SQL Editor
2. Open file: `supabase/migrations/002_storage_setup.sql`
3. Copy ENTIRE file contents
4. Paste in SQL Editor
5. Click "Run"
6. ✅ Verify: Should see "Success"

**What this creates:**
- ✅ attendance-photos storage bucket
- ✅ Storage policies for photo access control

---

### [ ] Step 3: Migration 003_enable_rls.sql
1. Click "New Query" in SQL Editor
2. Open file: `supabase/migrations/003_enable_rls.sql`
3. Copy ENTIRE file contents
4. Paste in SQL Editor
5. Click "Run"
6. ✅ Verify: Should see "Success"

**What this creates:**
- ✅ Row Level Security enabled on all tables
- ✅ 12 security policies for multi-tenant isolation

---

## Verification Checklist

### [ ] Verify Tables Created
1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/editor
2. Check you see these tables:
   - [ ] organizations
   - [ ] users
   - [ ] time_logs

### [ ] Verify Storage Bucket
1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/storage/buckets
2. Check you see:
   - [ ] attendance-photos (private bucket)

### [ ] Verify RLS Policies
1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/auth/policies
2. Check you see policies for:
   - [ ] organizations (1 policy)
   - [ ] users (6 policies)
   - [ ] time_logs (5 policies)
   - [ ] Total: 12 policies

---

## Optional: Run Validation Tests

### [ ] Test RLS Policies
1. Go to SQL Editor
2. Open file: `supabase/tests/rls_validation.sql`
3. Copy ENTIRE file contents
4. Paste in SQL Editor
5. Click "Run"
6. ✅ Verify: All tests show "PASS"

---

## Troubleshooting

### ❌ "relation already exists"
- **This is OK!** It means the table was already created
- Continue with next migration

### ❌ "permission denied"
- Check you're logged into the correct Supabase account
- Verify project URL: omjwuntbttxydlsofxao

### ❌ "syntax error near..."
- Make sure you copied the ENTIRE file
- Check you didn't accidentally modify the SQL

### ❌ Storage bucket creation fails
- Go to Storage manually and create bucket:
  - Name: `attendance-photos`
  - Public: OFF (private)
  - Then re-run migration 002

---

## ✅ All Done?

When you've completed all steps and verified everything:

1. Check all boxes above are ✅
2. Return to chat and type: **"Migrations complete"**
3. I'll continue with the remaining tasks automatically!

---

## Current Status

- ✅ Environment configured (.env file)
- ✅ Node dependencies installed
- ⏳ **YOU ARE HERE** → Run migrations manually
- ⏸️ Waiting to continue task execution

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy (just copy & paste)

💡 **Tip:** Keep this file open in a separate window while you work!
