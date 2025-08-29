-- Fix categories RLS policy to use JWT-based admin authentication
-- Drop the old policy that checks public.users table
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;

-- Create new policy that uses JWT app_metadata for admin role
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (
  auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
);