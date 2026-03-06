# Supabase Setup Guide

This directory contains the database schema and configuration for the Multi-Organization Employee Time & Attendance Management System.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for Quick Start)

1. **Create a New Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Enter project details:
     - Name: `multi-org-attendance`
     - Database Password: (generate a strong password)
     - Region: (choose closest to your users)
   - Click "Create new project"

2. **Run Database Migrations**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `migrations/001_initial_schema.sql`
   - Click "Run" to execute
   - Repeat for `migrations/002_storage_setup.sql`

3. **Get Your Project Credentials**
   - Go to Project Settings > API
   - Copy the following values:
     - Project URL
     - `anon` public key
     - `service_role` secret key (for backend operations)

4. **Configure Environment Variables**
   - Create a `.env` file in your project root (see `.env.example`)
   - Add your Supabase credentials

### Option 2: Using Supabase CLI (For Local Development)

1. **Initialize Supabase Locally**
   ```bash
   supabase init
   ```

2. **Start Local Supabase**
   ```bash
   supabase start
   ```
   This will start a local Supabase instance with PostgreSQL, Auth, and Storage.

3. **Apply Migrations**
   ```bash
   supabase db reset
   ```
   This will apply all migrations in the `migrations/` directory.

4. **Link to Remote Project** (Optional)
   ```bash
   supabase link --project-ref your-project-ref
   ```

5. **Push Migrations to Remote**
   ```bash
   supabase db push
   ```

## Database Schema Overview

### Tables

1. **organizations**
   - Stores organization/tenant information
   - Each admin registration creates a new organization

2. **users**
   - Stores both admin and employee accounts
   - Linked to organizations via `organization_id`
   - Includes authentication fields and role management

3. **time_logs**
   - Stores employee time in/out records
   - Includes photo URLs and calculated total hours
   - Status tracking: incomplete, completed, missing

### Storage Bucket

- **attendance-photos**: Stores time in/out verification photos
- Path structure: `{organization_id}/{user_id}/{YYYY-MM-DD}_time_in.jpg`
- Access controlled via storage policies

### Indexes

Performance indexes are created on:
- `users`: organization_id, username, role, is_active
- `time_logs`: organization_id, user_id, date, status
- Composite indexes for common query patterns

### Triggers

1. **update_time_logs_updated_at**: Automatically updates `updated_at` timestamp
2. **check_time_order**: Validates time_out is after time_in
3. **auto_calculate_total_hours**: Automatically calculates total hours and sets status

## Row Level Security (RLS)

RLS policies will be added in the next migration to enforce multi-tenant data isolation. These policies ensure:
- Users can only access data from their own organization
- Employees can only see their own time logs
- Admins can see all data within their organization

## Storage Policies

Storage policies enforce:
- Employees can only upload/read their own photos
- Admins can read all photos in their organization
- Photos are organized by organization and user

## Testing the Setup

After running the migrations, you can test the setup:

```sql
-- Test: Create a test organization
INSERT INTO organizations (name) VALUES ('Test Org') RETURNING *;

-- Test: Create a test admin user
INSERT INTO users (organization_id, full_name, username, password_hash, role)
VALUES (
    'your-org-id',
    'Test Admin',
    'testadmin',
    'hashed_password',
    'admin'
) RETURNING *;

-- Test: Create a test time log
INSERT INTO time_logs (organization_id, user_id, date, time_in)
VALUES (
    'your-org-id',
    'your-user-id',
    CURRENT_DATE,
    NOW()
) RETURNING *;
```

## Next Steps

1. Set up Row Level Security policies (Task 2)
2. Implement authentication endpoints (Task 4)
3. Build the mobile app and admin dashboard

## Troubleshooting

### Migration Errors

If you encounter errors during migration:
1. Check that the UUID extension is enabled
2. Ensure you're running migrations in order
3. Verify your database user has sufficient permissions

### Storage Bucket Issues

If storage policies aren't working:
1. Verify the bucket was created successfully
2. Check that `auth.uid()` is available (requires authenticated requests)
3. Test with the Supabase Storage UI first

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
