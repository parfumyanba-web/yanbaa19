-- ==============================================================================
-- CHECKOUT & ORDER SYSTEM UPDATES
-- ==============================================================================

-- 1. Add Shipping Information to Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_wilaya TEXT,
ADD COLUMN IF NOT EXISTS shipping_commune TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 2. Create Cart Items table for persistent sync
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_label TEXT NOT NULL, -- '100g', '500g', '1kg', '10kg'
    quantity_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, quantity_label)
);

-- 3. Enable RLS for Cart Items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
FOR ALL USING (auth.uid() = user_id);

-- 4. Add Trigger for updated_at on cart_items
DO $$ BEGIN
    CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Add cart_items to Realtime
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'cart_items') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
        END IF;
    END IF;
END $$;
