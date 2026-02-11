-- Fix chat-images bucket to be public
-- The bucket exists but public is set to false

UPDATE storage.buckets 
SET public = true 
WHERE id = 'chat-images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Users can upload chat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to chat images
CREATE POLICY "Public can view chat images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Policy 3: Allow users to delete their own images
CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the fix
SELECT id, name, public FROM storage.buckets WHERE id = 'chat-images';
