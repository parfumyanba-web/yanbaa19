-- ==============================================================================
-- AUTHENTICATION FIX: REMOVE APPROVAL LOGIC
-- ==============================================================================

-- 1. Ensure profiles table defaults to is_active = TRUE
ALTER TABLE public.profiles ALTER COLUMN is_active SET DEFAULT TRUE;

-- 2. Activate all existing users immediately
UPDATE public.profiles SET is_active = TRUE;

-- 3. Create/Update Trigger Function for Immediate Activation
-- This ensures that when a user signs up via Auth, their profile is created ACTIVE.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    store_name, 
    address, 
    wilaya, 
    commune, 
    role, 
    is_active
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '0000000000'),
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Business Account'),
    COALESCE(NEW.raw_user_meta_data->>'address', 'Pending Address'), -- Fallback for NOT NULL
    COALESCE(NEW.raw_user_meta_data->>'wilaya', 'Algiers'), -- Fallback for NOT NULL
    COALESCE(NEW.raw_user_meta_data->>'commune', 'Center'), -- Fallback for NOT NULL
    'client',
    TRUE -- Always ACTIVE immediately, bypassing any approval logic
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-apply the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Final verification of policies (Ensuring clients can read their own active state)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- SUCCESS: Account approval logic removed. Users can now login right after signup.
