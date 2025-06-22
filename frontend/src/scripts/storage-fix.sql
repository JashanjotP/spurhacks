-- Quick fix for storage RLS issues during development
-- This disables Row Level Security on storage.objects to allow file uploads

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Note: This is for development only. In production, you should use proper RLS policies. 