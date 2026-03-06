# Storage Setup - Manual Instructions

The storage bucket and policies need to be created through the Supabase Dashboard UI due to permissions.

## Step 1: Create Storage Bucket

1. Go to: https://app.supabase.com/project/omjwuntbttxydlsofxao/storage/buckets
2. Click "Create a new bucket"
3. Configure:
   - **Name**: `attendance-photos`
   - **Public**: OFF (keep it private)
   - **File size limit**: 5MB
   - **Allowed MIME types**: image/jpeg, image/jpg, image/png
4. Click "Create bucket"

## Step 2: Create Storage Policies

After creating the bucket, you need to add policies:

1. Click on the `attendance-photos` bucket
2. Go to "Policies" tab
3. Click "New Policy"

### Policy 1: Employee Upload Own Photos

- **Policy name**: `employee_upload_own_photos`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'attendance-photos'
AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.users WHERE id = auth.uid())
AND (storage.foldername(name))[2] = auth.uid()::text
```

### Policy 2: Employee Read Own Photos

- **Policy name**: `employee_read_own_photos`
- **Allowed operation**: SELECT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'attendance-photos'
AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.users WHERE id = auth.uid())
AND (storage.foldername(name))[2] = auth.uid()::text
```

### Policy 3: Admin Read Org Photos

- **Policy name**: `admin_read_org_photos`
- **Allowed operation**: SELECT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'attendance-photos'
AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.users WHERE id = auth.uid())
AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
```

### Policy 4: Admin Delete Org Photos

- **Policy name**: `admin_delete_org_photos`
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'attendance-photos'
AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.users WHERE id = auth.uid())
AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
```

## Alternative: Simplified Approach

If the above is too complex, you can create simpler policies for now:

### Simple Policy: Authenticated Users Can Upload
```sql
bucket_id = 'attendance-photos' AND auth.role() = 'authenticated'
```

### Simple Policy: Authenticated Users Can Read
```sql
bucket_id = 'attendance-photos' AND auth.role() = 'authenticated'
```

You can refine these policies later once the app is working.

## Verification

After creating the bucket and policies:
1. Go to Storage → attendance-photos
2. Verify the bucket exists
3. Check Policies tab shows your policies
