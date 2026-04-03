-- ==============================================================================
-- FINAL UNIFIED SETUP: ADMIN (admin@gmail.com / 123456) & AUTH FIX
-- ==============================================================================

-- 1. Ensure profiles table defaults to is_active = TRUE
ALTER TABLE public.profiles ALTER COLUMN is_active SET DEFAULT TRUE;
UPDATE public.profiles SET is_active = TRUE;

-- 2. Create the Specific Admin User requested
-- Email: admin@gmail.com
-- Pass: 123456
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
  'admin@gmail.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Site Administrator","role":"admin"}',
  NOW(),
  NOW(),
  'authenticated',
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com')
RETURNING id;

-- 3. Ensure Profile exists with 'admin' role & NOT NULL fields
INSERT INTO public.profiles (id, full_name, phone, store_name, address, wilaya, commune, role, is_active)
SELECT 
  id, 
  'Site Administrator', 
  '0000000000', 
  'Yanba Main Office',
  'Yanba HQ Algiers',
  'Alger',
  'Center',
  'admin', 
  TRUE
FROM auth.users 
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin', 
  is_active = TRUE,
  store_name = 'Yanba Main Office',
  full_name = 'Site Administrator';

-- 4. Set is_active = TRUE for ALL users (Removing Approval logic)
UPDATE public.profiles SET is_active = TRUE;

-- 5. Final verification of policies
DROP POLICY IF EXISTS "Public profiles are viewable by anyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone." ON public.profiles FOR SELECT USING (true);

-- SUCCESS: Admin created (admin@gmail.com / 123456) and all users activated.
