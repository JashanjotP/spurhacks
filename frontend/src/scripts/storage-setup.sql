-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for files bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create more permissive policies for development/testing
-- Allow uploads for authenticated users or when using anon key (for demo mode)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'files' AND 
    (auth.uid() IS NOT NULL OR auth.role() = 'anon')
  );

-- Allow reads for authenticated users or when using anon key
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'files' AND 
    (auth.uid() IS NOT NULL OR auth.role() = 'anon')
  );

-- Allow updates for authenticated users or when using anon key
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'files' AND 
    (auth.uid() IS NOT NULL OR auth.role() = 'anon')
  );

-- Allow deletes for authenticated users or when using anon key
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'files' AND 
    (auth.uid() IS NOT NULL OR auth.role() = 'anon')
  );

-- For production, you might want more restrictive policies:
-- CREATE POLICY "Users can upload their own files" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'files' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can view their own files" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'files' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own files" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'files' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ALTERNATIVE: For development/testing, you can disable RLS entirely
-- Uncomment the line below if you want to disable RLS for easier development
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 