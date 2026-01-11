-- Apply missing database functions for रविस्त्र marketplace

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
    WHEN 'buyer_basic' THEN RETURN 8;  -- Updated to 8 chats for ₹69
    WHEN 'buyer_pro' THEN RETURN -1;   -- Unlimited
    WHEN 'seller_starter' THEN RETURN -1;
    WHEN 'seller_basic' THEN RETURN -1;
    WHEN 'seller_pro' THEN RETURN -1;
    ELSE RETURN 2; -- Default for free users
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
    WHEN 'buyer_starter' THEN RETURN 0;
    WHEN 'buyer_basic' THEN RETURN 0;
    WHEN 'buyer_pro' THEN RETURN 0;
    WHEN 'seller_starter' THEN RETURN 10;
    WHEN 'seller_basic' THEN RETURN 25;
    WHEN 'seller_pro' THEN RETURN -1; -- Unlimited
    ELSE RETURN 3; -- Default for free users
  END CASE;
END;
$$;