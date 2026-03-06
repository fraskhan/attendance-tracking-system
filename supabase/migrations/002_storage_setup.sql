-- Multi-Organization Employee Time & Attendance Management System
-- Storage Bucket Setup for Attendance Photos

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Create the attendance-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-photos', 'attendance-photos', false);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy: Employees can upload their own photos
-- Path structure: {organization_id}/{user_id}/{filename}
CREATE POLICY "employee_upload_own_photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'attendance-photos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid())
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Employees can read their own photos
CREATE POLICY "employee_read_own_photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'attendance-photos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid())
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Admins can read all photos in their organization
CREATE POLICY "admin_read_org_photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'attendance-photos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admins can delete photos in their organization (for cleanup/management)
CREATE POLICY "admin_delete_org_photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'attendance-photos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "employee_upload_own_photos" ON storage.objects IS 
'Allows employees to upload photos only to their own folder within their organization';

COMMENT ON POLICY "employee_read_own_photos" ON storage.objects IS 
'Allows employees to read only their own photos';

COMMENT ON POLICY "admin_read_org_photos" ON storage.objects IS 
'Allows admins to read all photos within their organization for verification';

COMMENT ON POLICY "admin_delete_org_photos" ON storage.objects IS 
'Allows admins to delete photos within their organization for management purposes';
