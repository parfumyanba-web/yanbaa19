-- ==============================================================================
-- MASTER ADMIN AUTH & SCHEMA FIX
-- This script provides a absolute fix for the admin login including:
-- 1. Table creation (admin_profiles)
-- 2. Robust is_admin() function (Prevents recursion & schema query errors)
-- 3. Correct permissions for Supabase API (authenticator role)
-- 4. Initializing the admin account (admin@gmail.com / 123456)
-- ==============================================================================

-- STEP 1: Basic Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;

-- STEP 2: Create Admin Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Site Administrator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 3: Robust is_admin() function
-- Uses JWT metadata to avoid recursion and is SECURITY DEFINER for isolation.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to API role
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, authenticator;

-- STEP 4: Simplified RLS for Admin Profiles
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles 
FOR SELECT TO authenticated USING (is_admin());

-- STEP 5: Initialize the Admin Account (admin@gmail.com / 123456)
DO $$
DECLARE
  target_admin_id UUID := gen_random_uuid();
  target_admin_email TEXT := 'admin@gmail.com';
  target_admin_pass TEXT := '123456';
BEGIN
  -- 5.1 Cleanup Old Entries
  DELETE FROM auth.users WHERE email = target_admin_email;
  
  -- 5.2 Create Fresh Auth User with proper App Metadata
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, 
    confirmation_token, recovery_token, email_change_token_new, email_change_token_current
  )
  VALUES (
    target_admin_id, '00000000-0000-0000-0000-000000000000', target_admin_email, 
    crypt(target_admin_pass, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"full_name":"Site Administrator","role":"admin"}',
    'authenticated', 'authenticated', NOW(), NOW(),
    '', '', '', ''
  );

  -- 5.3 Ensure Admin Profile exists
  INSERT INTO public.admin_profiles (id, email, full_name, is_active)
  VALUES (target_admin_id, target_admin_email, 'Site Administrator', TRUE)
  ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

  -- 5.4 Ensure it is REMOVED from the standard profiles table for pure isolation
  DELETE FROM public.profiles WHERE id = target_admin_id OR phone = '0000000000';

  RAISE NOTICE 'Master fix applied successfully for %', target_admin_email;
END $$;
