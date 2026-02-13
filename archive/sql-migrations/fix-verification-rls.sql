-- Add RLS policy for admins to view all verification requests

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON public.verification_requests;

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  OR auth.uid() = user_id  -- Users can still see their own
);

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.verification_requests TO authenticated;

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'verification_requests';
