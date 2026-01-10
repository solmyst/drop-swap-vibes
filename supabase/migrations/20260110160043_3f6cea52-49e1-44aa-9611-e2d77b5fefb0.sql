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

-- Update listings RLS to allow admins full access
CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all listings"
  ON public.listings FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to update all profiles  
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Allow admins to manage passes
CREATE POLICY "Admins can view all passes"
  ON public.user_passes FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage passes"
  ON public.user_passes FOR ALL
  USING (public.is_admin(auth.uid()));

-- Allow admins to view all usage
CREATE POLICY "Admins can view all usage"
  ON public.user_usage FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to view conversations
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (public.is_admin(auth.uid()));