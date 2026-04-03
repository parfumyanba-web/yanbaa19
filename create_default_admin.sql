-- Set up default admin account
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- 1. Insert/Update into auth.users using SUPABASE_ADMIN role credentials
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"full_name":"Admin","role":"admin"}',
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_id;
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@gmail.com';
    UPDATE auth.users SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
      raw_user_meta_data = '{"full_name":"Admin","role":"admin"}',
      updated_at = NOW()
    WHERE id = admin_id;
  END IF;

  -- 2. Ensure Profile exists with 'admin' role in public.profiles table
  INSERT INTO public.profiles (id, full_name, role, is_active, phone, store_name, address, wilaya, commune)
  VALUES (admin_id, 'Site Administrator', 'admin', TRUE, 'ADMIN_PHONE', 'Yanba Admin HQ', 'HQ', 'Alger', 'Alger')
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    is_active = TRUE,
    full_name = 'Site Administrator';
END $$;
