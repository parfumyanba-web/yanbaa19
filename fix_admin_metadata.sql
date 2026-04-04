-- ==============================================================================
-- ADMIN RECOVERY & METADATA FIX
-- This script ensures the admin user has 'admin' privileges in both 
-- Supabase Auth metadata and the public profiles table.
-- ==============================================================================

DO $$
DECLARE
  admin_id UUID;
  admin_email TEXT := 'admin@gmail.com';
  admin_pass TEXT := '123456';
BEGIN
  -- 1. Get or Create the Auth User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000', admin_email, 
      crypt(admin_pass, gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"full_name":"Admin","role":"admin"}',
      'authenticated', 'authenticated', NOW(), NOW()
    ) RETURNING id INTO admin_id;
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
    
    -- 2. Force Update Metadata and Password if user exists
    UPDATE auth.users SET 
      encrypted_password = crypt(admin_pass, gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
      raw_user_meta_data = '{"full_name":"Admin","role":"admin"}',
      updated_at = NOW()
    WHERE id = admin_id;
  END IF;

  -- 3. Sync with public.profiles table
  INSERT INTO public.profiles (
    id, full_name, role, is_active, phone, store_name, address, wilaya, commune
  )
  VALUES (
    admin_id, 'Site Administrator', 'admin', TRUE, '0000000000', 
    'Yanba HQ', 'Main Street', 'Alger', 'Center'
  )
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    is_active = TRUE,
    full_name = 'Site Administrator';

  RAISE NOTICE 'Admin user % synced successfully with role=admin', admin_email;
END $$;
