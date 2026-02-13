-- =====================================================
-- COMPLETE DATABASE SETUP FOR DROP-SWAP-VIBES
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 1: Basic Tables Setup
-- =====================================================

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    location TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create listings table
CREATE TABLE public.listings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    size TEXT NOT NULL,
    condition TEXT NOT NULL,
    brand TEXT,
    price DECIMAL(10,2) NOT NULL,
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'deleted')),
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Create wishlist table
CREATE TABLE public.wishlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, listing_id)
);

-- Enable RLS on wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Create pass types enum and passes table
CREATE TYPE public.pass_type AS ENUM ('weekly', 'monthly', 'seller_pro');

CREATE TABLE public.user_passes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pass_type public.pass_type NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_passes
ALTER TABLE public.user_passes ENABLE ROW LEVEL SECURITY;

-- User passes policies
CREATE POLICY "Users can view own passes" ON public.user_passes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own passes" ON public.user_passes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create conversations table for chat
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id 
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    ));
CREATE POLICY "Users can send messages in own conversations" ON public.messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id 
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MIGRATION 2: Storage Setup
-- =====================================================

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Create storage policies for listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- MIGRATION 3: Enhanced Features
-- =====================================================

-- Add price validation constraint on listings
ALTER TABLE public.listings
ADD CONSTRAINT price_positive CHECK (price > 0 AND price < 10000000);

-- Add UPDATE policy for conversations (to update last_message_at)
CREATE POLICY "Users can update own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create private_profile_data table for sensitive fields
CREATE TABLE public.private_profile_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on private_profile_data
ALTER TABLE public.private_profile_data ENABLE ROW LEVEL SECURITY;

-- Only users can view their own private data
CREATE POLICY "Users can view own private data" 
ON public.private_profile_data 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own private data
CREATE POLICY "Users can insert own private data" 
ON public.private_profile_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own private data
CREATE POLICY "Users can update own private data" 
ON public.private_profile_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Remove phone from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

-- Add trigger for updated_at on private_profile_data
CREATE TRIGGER update_private_profile_data_updated_at
BEFORE UPDATE ON public.private_profile_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- MIGRATION 4: Pass System Upgrade
-- =====================================================

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
    WHEN 'buyer_basic' THEN RETURN 8;
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

-- =====================================================
-- MIGRATION 5: Security Improvements
-- =====================================================

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

-- =====================================================
-- MIGRATION 6: Admin System
-- =====================================================

-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Add approval columns to listings
ALTER TABLE public.listings 
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update listings RLS policies
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

-- Admin policies for all tables
CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all listings"
  ON public.listings FOR DELETE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all passes"
  ON public.user_passes FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage passes"
  ON public.user_passes FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all usage"
  ON public.user_usage FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (public.is_admin(auth.uid()));

-- =====================================================
-- SETUP COMPLETE!
-- Now add your admin user:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('07ce59f1-8f0e-45b8-816e-4c755b853100', 'admin');
-- =====================================================

-- =====================================================
-- UPI TRANSACTIONS TABLE FOR PAYMENT TRACKING
-- =====================================================

-- Create UPI transactions table for payment tracking
CREATE TABLE IF NOT EXISTS public.upi_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL UNIQUE, -- UPI transaction ID from user
    pass_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on upi_transactions
ALTER TABLE public.upi_transactions ENABLE ROW LEVEL SECURITY;

-- UPI transactions policies  
CREATE POLICY "Users can view own transactions" ON public.upi_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.upi_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for UPI transactions
CREATE POLICY "Admins can view all transactions"
  ON public.upi_transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage transactions"
  ON public.upi_transactions FOR ALL
  USING (public.is_admin(auth.uid()));