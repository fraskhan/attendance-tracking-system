# Quick Start Guide

Get the Multi-Organization Attendance System up and running in 10 minutes.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com) - free tier available)
- Basic familiarity with SQL and environment variables

## Step 1: Create Supabase Project (2 minutes)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `multi-org-attendance` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Run Database Migrations (3 minutes)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/migrations/001_initial_schema.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"
7. Repeat steps 2-6 for `supabase/migrations/002_storage_setup.sql`

## Step 3: Get Your Credentials (2 minutes)

1. In your Supabase dashboard, go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see your credentials:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role secret**: `eyJhbGc...` (different long string)
4. Keep this page open - you'll need these values next

## Step 4: Configure Environment (2 minutes)

1. In your project directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace the placeholder values with your actual Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
   ```

4. Save the file

## Step 5: Verify Setup (1 minute)

Let's verify everything is working by testing the database:

1. Go back to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. You should see three tables:
   - `organizations`
   - `users`
   - `time_logs`
4. Click **Storage** in the left sidebar
5. You should see a bucket named `attendance-photos`

If you see all of these, congratulations! Your database is set up correctly. 🎉

## What's Next?

Now that your Supabase backend is ready, you can:

1. **Implement Row Level Security** (Task 2)
   - This adds multi-tenant data isolation
   - See `.kiro/specs/multi-org-attendance-system/tasks.md`

2. **Build the Authentication API** (Task 4)
   - Create admin registration endpoint
   - Create login endpoint
   - Create password change endpoint

3. **Start the Mobile App** (Task 12)
   - Initialize React Native/Expo project
   - Connect to Supabase
   - Build authentication screens

4. **Start the Admin Dashboard** (Task 16)
   - Initialize Next.js project
   - Connect to Supabase
   - Build admin interface

## Testing Your Setup

You can test your database by running some SQL queries in the SQL Editor:

### Create a test organization
```sql
INSERT INTO organizations (name) 
VALUES ('Test Organization') 
RETURNING *;
```

### Create a test admin user
```sql
-- Replace 'your-org-id' with the id from the previous query
INSERT INTO users (
    organization_id, 
    full_name, 
    username, 
    password_hash, 
    role
)
VALUES (
    'your-org-id',
    'Test Admin',
    'testadmin',
    '$2a$10$abcdefghijklmnopqrstuvwxyz', -- dummy hash
    'admin'
)
RETURNING *;
```

### Create a test time log
```sql
-- Replace with your actual org_id and user_id
INSERT INTO time_logs (
    organization_id,
    user_id,
    date,
    time_in
)
VALUES (
    'your-org-id',
    'your-user-id',
    CURRENT_DATE,
    NOW()
)
RETURNING *;
```

If all these queries work, your database schema is functioning correctly!

## Troubleshooting

### "relation does not exist" error
- Make sure you ran both migration files in order
- Check that you're in the correct project

### "permission denied" error
- Verify you're logged into the correct Supabase account
- Check that your project is fully provisioned

### Storage bucket not appearing
- Make sure you ran the second migration (`002_storage_setup.sql`)
- Refresh the Storage page in your dashboard

### Environment variables not working
- Check that your `.env` file is in the project root
- Verify there are no extra spaces or quotes around the values
- Make sure the file is named exactly `.env` (not `.env.txt`)

## Need Help?

- 📚 Check the [full documentation](../README.md)
- 🗄️ Review the [database schema reference](./database-schema.md)
- 🔧 See the [Supabase setup guide](../supabase/README.md)
- 💬 Check [Supabase documentation](https://supabase.com/docs)

## Security Reminder

⚠️ **Important**: Never commit your `.env` file to version control!

The `.gitignore` file is already configured to exclude it, but always double-check before pushing code.

---

**Estimated total time**: ~10 minutes

You're now ready to start building the application! 🚀
