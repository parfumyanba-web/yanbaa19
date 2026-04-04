-- ==============================================================================
-- ADMIN ISOLATION & SEPARATION MIGRATION
-- This script creates a dedicated admin table and updates authentication logic.
-- ==============================================================================

-- 1. Create a dedicated admin profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Site Administrator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Update is_admin() function to check the NEW table
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cleanup existing admin data from public.profiles
-- We identify admins by their role and move/remove them.
DELETE FROM public.profiles WHERE role = 'admin'::user_role;

-- 4. Create RLS for admin_profiles (Only admins can see it)
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles 
FOR SELECT USING (is_admin());

-- 5. Final sync with Supabase Realtime (optional but recommended)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_profiles') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_profiles;
        END IF;
    END IF;
END $$;
