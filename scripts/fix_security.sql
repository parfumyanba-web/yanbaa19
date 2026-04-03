-- ==========================================
-- AUTH & RLS SECURITY HARDENING
-- ==========================================

-- 1. Create a function to handle new user signups
-- This function will automatically create a entry in public.profiles
-- when a new user signs up in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    store_name,
    wilaya,
    commune,
    address,
    role,
    is_active
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'store_name', ''),
    COALESCE(new.raw_user_meta_data->>'wilaya', ''),
    COALESCE(new.raw_user_meta_data->>'commune', ''),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    'client',
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Standardize RLS Policies for public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by anyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners or admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owners or admins" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- SELECT: Users can see their own profile, Admins can see all
CREATE POLICY "Profiles are viewable by owners or admins"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- UPDATE: Users can update their own profile, Admins can update any
CREATE POLICY "Profiles are updatable by owners or admins"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- INSERT: Only the system (trigger) should normally do this, 
-- but we allow users to insert their own ID to avoid race condition/RLS errors in some client flows
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Fix Admin Login Credentials (ENSURE AT LEAST ONE ADMIN EXISTS)
-- Replace 'admin@yanba.com' with the actual admin email if known
-- This is a placeholder - ensure you have an actual user with this email in auth.users
-- UPDATE public.profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@yanba.com');
