-- ==============================================================================
-- ADMIN CREDENTIAL SETUP (NEW SYSTEM)
-- This script prepares the new admin account: admin@gmail.com / 123456
-- ==============================================================================

DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
  new_admin_email TEXT := 'admin@gmail.com';
  new_admin_pass TEXT := '123456';
BEGIN
  -- 1. CLEANUP PREVIOUS ADMINS
  -- Delete from auth.users (identify by role in metadata if possible, or manual selection)
  -- To be safe, we only delete 'admin@gmail.com' and create it fresh.
  DELETE FROM auth.users WHERE email = new_admin_email;
  
  -- 2. CREATE NEW ADMIN USER IN AUTH
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
  )
  VALUES (
    new_admin_id, '00000000-0000-0000-0000-000000000000', new_admin_email, 
    crypt(new_admin_pass, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"full_name":"Site Administrator","role":"admin"}',
    'authenticated', 'authenticated', NOW(), NOW()
  );

  -- 3. POPULATE ADMIN_PROFILES TABLE
  INSERT INTO public.admin_profiles (id, email, full_name, is_active)
  VALUES (new_admin_id, new_admin_email, 'Site Administrator', TRUE)
  ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

  RAISE NOTICE 'Admin user % has been initialized in the isolated system.', new_admin_email;
END $$;
