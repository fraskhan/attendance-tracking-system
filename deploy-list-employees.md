# Deploy List Employees Function

The list-employees function has been updated to map `id` to `user_id` for frontend compatibility.

## Steps to Deploy

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/omjwuntbttxydlsofxao

2. Navigate to: Edge Functions

3. Find the `list-employees` function

4. Click "Deploy new version"

5. Copy the contents from: `supabase/functions/list-employees/index.ts`

6. Paste into the editor

7. Click "Deploy"

## What Changed

The function now maps the database `id` field to `user_id` in the response:

```typescript
const mappedEmployees = (employees || []).map(emp => ({
  user_id: emp.id,  // Map id to user_id
  full_name: emp.full_name,
  username: emp.username,
  is_active: emp.is_active,
  created_at: emp.created_at,
}));
```

This ensures the frontend receives the expected `user_id` field for the React key prop.

## After Deployment

Refresh the admin dashboard and the employees page should load correctly.
