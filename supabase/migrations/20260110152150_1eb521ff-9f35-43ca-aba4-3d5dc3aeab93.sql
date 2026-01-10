-- Add price validation constraint on listings
ALTER TABLE public.listings
ADD CONSTRAINT price_positive CHECK (price > 0 AND price < 10000000);

-- Update conversations INSERT policy to require active pass for buyers
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users with active pass can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM public.user_passes 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND expires_at > now()
  )
);

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