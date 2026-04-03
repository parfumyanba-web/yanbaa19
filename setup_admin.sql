-- ==============================================================================
-- ADMIN SETUP SCRIPT
-- ==============================================================================

-- 1. Create the Admin User in auth.users (if not exists)
-- Replace 'admin@yanba.com' and 'SecureAdminPass123!' with your desired credentials.
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@yanba.com',
  crypt('SecureAdminPass123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Yanba Admin","role":"admin"}',
  NOW(),
  NOW(),
  'authenticated',
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@yanba.com')
RETURNING id;

-- 2. Ensure Profile exists with 'admin' role
-- Note: If you have the handle_new_user trigger, it might have already created this.
-- This query ensures the role is set to 'admin' regardless.
UPDATE public.profiles 
SET role = 'admin', is_active = TRUE 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@yanba.com');

-- If you ran the INSERT above and need to manually insert the profile if trigger failed:
INSERT INTO public.profiles (id, full_name, phone, store_name, address, wilaya, commune, role, is_active)
SELECT 
  id, 
  'Yanba Admin', 
  '0000000000', 
  'Yanba Headquarters',
  'Yanba HQ Algiers', -- Added to fix NOT NULL constraint
  'Alger',            -- Added
  'Alger Center',     -- Added
  'admin', 
  TRUE
FROM auth.users 
WHERE email = 'admin@yanba.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin', 
  is_active = TRUE, 
  store_name = 'Yanba Headquarters',
  address = 'Yanba HQ Algiers',
  wilaya = 'Alger',
  commune = 'Alger Center';

-- SUCCESS: Admin user created. Login at /admin/login with:
-- Email: admin@yanba.com
-- Pass: SecureAdminPass123!
