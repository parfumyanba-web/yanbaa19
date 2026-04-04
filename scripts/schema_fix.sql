-- ==============================================================================
-- SCHEMA & PERMISSIONS FIX
-- This script fixes the "Database error querying schema" by ensuring the is_admin()
-- function is robust and permissions are correctly set for the Supabase API.
-- ==============================================================================

-- 1. Ensure public schema usage for basic roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;

-- 2. Define a more robust is_admin() function
-- Adding coalesce and error handling to prevent schema introspection errors.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  -- We use coalesce to ensure that if auth.jwt() is null, it returns an empty string
  -- instead of NULL, preventing potential comparison issues.
  RETURN (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  -- In case of any unexpected internal Postgres error, return FALSE 
  -- instead of crashing the schema query.
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execution rights to all roles including authenticator (Supabase API)
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, authenticator;

-- 4. Ensure RLS on admin_profiles is simple enough for safe introspection
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles 
FOR SELECT TO authenticated USING (is_admin());

-- 5. Final verification of permissions
GRANT SELECT ON public.admin_profiles TO authenticator;
GRANT SELECT ON public.activity_logs TO authenticator;

-- Confirmation notice
DO $$ BEGIN RAISE NOTICE 'Schema fix applied. Robust is_admin() and permissions granted.'; END $$;
