-- ==============================================================================
-- RECURSION FIX & DATABASE OPTIMIZATION
-- This script fixes the infinite loop caused by is_admin() calling itself.
-- ==============================================================================

-- 1. Redesign is_admin() to check JWT metadata (FAST & SECURE)
-- This avoids any table queries, thus preventing RLS recursion.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  -- Extract 'role' from the 'app_metadata' object in the JWT
  -- This works without hitting any tables, even during authentication.
  RETURN (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Basic security for admin_profiles (Admins can see everything, others nothing)
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles 
FOR SELECT USING (is_admin());

-- 3. Optimization for activity_logs RLS
-- Let's ensure it doesn't cause recursion either.
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs 
FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Re-grant for safety
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.admin_profiles TO authenticated;

-- Notice for confirmation
DO $$ BEGIN RAISE NOTICE 'Recursion fixed via JWT metadata verification.'; END $$;
