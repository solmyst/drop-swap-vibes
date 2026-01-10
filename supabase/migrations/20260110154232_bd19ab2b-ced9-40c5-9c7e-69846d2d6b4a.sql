-- First add a temporary column to preserve data
ALTER TABLE public.user_passes ADD COLUMN IF NOT EXISTS pass_type_new TEXT;

-- Copy existing values
UPDATE public.user_passes SET pass_type_new = pass_type::text WHERE pass_type IS NOT NULL;

-- Drop the old column and type safely
ALTER TABLE public.user_passes DROP COLUMN IF EXISTS pass_type;
DROP TYPE IF EXISTS public.pass_type;

-- Create new pass type enum with buyer and seller tiers
CREATE TYPE public.pass_type AS ENUM (
  'free',
  'buyer_starter',
  'buyer_basic', 
  'buyer_pro',
  'seller_starter',
  'seller_basic',
  'seller_pro'
);

-- Add new pass_type column
ALTER TABLE public.user_passes ADD COLUMN pass_type public.pass_type NOT NULL DEFAULT 'free';

-- Migrate old data - map old types to new ones
UPDATE public.user_passes 
SET pass_type = CASE 
  WHEN pass_type_new = 'weekly' THEN 'buyer_starter'::public.pass_type
  WHEN pass_type_new = 'monthly' THEN 'buyer_basic'::public.pass_type
  WHEN pass_type_new = 'seller_pro' THEN 'seller_pro'::public.pass_type
  ELSE 'free'::public.pass_type
END
WHERE pass_type_new IS NOT NULL;

-- Drop temporary column
ALTER TABLE public.user_passes DROP COLUMN IF EXISTS pass_type_new;

-- Create user_usage table for tracking chat/listing limits
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_chats_started INTEGER NOT NULL DEFAULT 0,
  total_listings_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Add image_url column to messages for chat images
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create seller reviews table
CREATE TABLE IF NOT EXISTS public.seller_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seller_id, reviewer_id, listing_id)
);

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.seller_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.seller_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != seller_id);

CREATE POLICY "Users can update own reviews" ON public.seller_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" ON public.seller_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Create review images table
CREATE TABLE IF NOT EXISTS public.review_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.seller_reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review images" ON public.review_images
  FOR SELECT USING (true);

CREATE POLICY "Review owner can add images" ON public.review_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seller_reviews 
      WHERE id = review_id AND reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Review owner can delete images" ON public.review_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.seller_reviews 
      WHERE id = review_id AND reviewer_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

-- Triggers
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_reviews_updated_at
  BEFORE UPDATE ON public.seller_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get chat limit based on pass type
CREATE OR REPLACE FUNCTION public.get_user_chat_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass_type_val public.pass_type;
BEGIN
  SELECT pass_type INTO pass_type_val
  FROM public.user_passes
  WHERE user_id = user_id_param 
    AND is_active = true 
    AND expires_at > now()
  ORDER BY expires_at DESC
  LIMIT 1;

  CASE pass_type_val
    WHEN 'free' THEN RETURN 2;
    WHEN 'buyer_starter' THEN RETURN 2;
    WHEN 'buyer_basic' THEN RETURN 4;
    WHEN 'buyer_pro' THEN RETURN -1;
    WHEN 'seller_starter' THEN RETURN -1;
    WHEN 'seller_basic' THEN RETURN -1;
    WHEN 'seller_pro' THEN RETURN -1;
    ELSE RETURN 2;
  END CASE;
END;
$$;

-- Function to get listing limit based on pass type  
CREATE OR REPLACE FUNCTION public.get_user_listing_limit(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass_type_val public.pass_type;
BEGIN
  SELECT pass_type INTO pass_type_val
  FROM public.user_passes
  WHERE user_id = user_id_param 
    AND is_active = true 
    AND expires_at > now()
  ORDER BY expires_at DESC
  LIMIT 1;

  CASE pass_type_val
    WHEN 'free' THEN RETURN 3;
    WHEN 'buyer_starter' THEN RETURN 3;
    WHEN 'buyer_basic' THEN RETURN 3;
    WHEN 'buyer_pro' THEN RETURN 3;
    WHEN 'seller_starter' THEN RETURN 10;
    WHEN 'seller_basic' THEN RETURN 25;
    WHEN 'seller_pro' THEN RETURN -1;
    ELSE RETURN 3;
  END CASE;
END;
$$;

-- Update conversation policy
DROP POLICY IF EXISTS "Users with active pass can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations within limits" ON public.conversations;

CREATE POLICY "Users can create conversations within limits" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND (
      public.get_user_chat_limit(auth.uid()) = -1 OR
      COALESCE(
        (SELECT total_chats_started FROM public.user_usage WHERE user_id = auth.uid()),
        0
      ) < public.get_user_chat_limit(auth.uid())
    )
  );