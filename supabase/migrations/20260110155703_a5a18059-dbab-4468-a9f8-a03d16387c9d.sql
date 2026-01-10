-- Fix public storage buckets - make chat-images private
UPDATE storage.buckets SET public = false WHERE id = 'chat-images';

-- Drop existing public select policies for chat-images
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;

-- Create proper RLS policy for chat-images - only conversation participants can view
CREATE POLICY "Conversation participants can view chat images" 
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'chat-images' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Update listings RLS to enforce listing limits
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;

CREATE POLICY "Users can create own listings within limits" 
  ON public.listings 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = seller_id AND 
    (
      get_user_listing_limit(auth.uid()) = -1 OR
      COALESCE((SELECT total_listings_created FROM user_usage WHERE user_id = auth.uid()), 0) < get_user_listing_limit(auth.uid())
    )
  );