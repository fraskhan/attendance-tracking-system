-- Multi-Organization Employee Time & Attendance Management System
-- Storage Bucket Setup for Attendance Photos (Simplified)

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Create the attendance-photos bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'attendance-photos', 
    'attendance-photos', 
    false,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NOTE: Storage policies must be created through the Supabase Dashboard
-- ============================================================================
-- Due to permissions, storage policies cannot be created via SQL.
-- Please follow the instructions in: supabase/migrations/002_storage_setup_manual.md
--
-- Quick steps:
-- 1. Go to: Storage → attendance-photos → Policies
-- 2. Create policies for upload, read, and delete operations
-- 3. Use the policy definitions from 002_storage_setup_manual.md
