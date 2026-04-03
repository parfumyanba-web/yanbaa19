-- ==============================================================================
-- MASTER UNIFIED FIX V2: RESOLVING INFINITE RECURSION & ADMIN ACCESS
-- ==============================================================================

-- 1. DISABLE RLS TO CLEAN UP SAFELY
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- 2. CLEAR ALL POLICIES ON PROFILES (THE SOURCE OF RECURSION)
DROP POLICY IF EXISTS "Public profiles are viewable by anyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin CRUD profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 3. APPLY NON-RECURSIVE POLICIES FOR PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can see their own profile
CREATE POLICY "profiles_owner_select" ON public.profiles 
FOR SELECT TO authenticated USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "profiles_owner_update" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policy 3: Admins can see EVERYTHING (Using JWT metadata to avoid SELECT recursion)
-- This assumes you have 'role' in your auth metadata.
CREATE POLICY "profiles_admin_all" ON public.profiles 
FOR ALL TO authenticated 
USING ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- 4. FIX ORDERS & ORDER_ITEMS (CLEAN START)
DROP POLICY IF EXISTS "Users can handle own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins handle all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner_all" ON public.orders FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL TO authenticated USING ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_owner_all" ON public.order_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL TO authenticated 
USING ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- 5. ENSURE ADMIN USER IS CORRECTLY CONFIGURED (EMAIL + ROLE)
-- Email: admin@gmail.com / Pass: 123456
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- 1. Upsert into auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      gen_random_uuid(),
      'admin@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"full_name":"Admin","role":"admin"}',
      'authenticated',
      'authenticated'
    ) RETURNING id INTO admin_id;
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@gmail.com';
    UPDATE auth.users SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
      raw_user_meta_data = '{"full_name":"Admin","role":"admin"}'
    WHERE id = admin_id;
  END IF;

  -- 2. Ensure Profile exists with 'admin' role
  INSERT INTO public.profiles (id, full_name, role, is_active, phone, store_name, address, wilaya, commune)
  VALUES (admin_id, 'Site Admin', 'admin', TRUE, '0000000000', 'Admin Store', 'HQ', 'Alger', 'Alger')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = TRUE;
END $$;

-- 6. BYPASS EMAIL CONFIRMATION FOR EVERYONE (CRITICAL FOR PHONE REGISTRATION)
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm_email ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user_email();

-- Confirm all existing
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
