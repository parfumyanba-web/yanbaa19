-- ==============================================================================
-- YANBA PERFUMES B2B - COMPLETE SUPABASE SCHEMA
-- ==============================================================================

-- Disable triggers temporarily during setup
SET session_replication_role = 'replica';

-- 1. Create ENUMs
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered');
CREATE TYPE product_quantity AS ENUM ('100g', '500g', '1kg', '10kg');

-- 2. Create Tables
-- USERS
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    address TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    commune TEXT NOT NULL,
    role user_role DEFAULT 'client'::user_role,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BRANDS
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COLLECTIONS
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_dzd NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT CATEGORIES (Relation)
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- PRODUCT TAGS (Relation)
CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- PRODUCT COLLECTIONS (Relation)
CREATE TABLE product_collections (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, collection_id)
);

-- INVENTORY
CREATE TABLE inventory (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity_in_grams INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending'::order_status,
    total_price NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity product_quantity NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    store_name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read/update own, Admin can do all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can delete profiles" ON profiles FOR DELETE USING (is_admin());

-- Products/Brands/Categories/Tags/Collections: Anyone can read, Admin can all
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin all products" ON products FOR ALL USING (is_admin());

CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Admin all brands" ON brands FOR ALL USING (is_admin());

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin all categories" ON categories FOR ALL USING (is_admin());

CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Admin all tags" ON tags FOR ALL USING (is_admin());

CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Admin all collections" ON collections FOR ALL USING (is_admin());

CREATE POLICY "Public read product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Admin all product_categories" ON product_categories FOR ALL USING (is_admin());

CREATE POLICY "Public read product_tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Admin all product_tags" ON product_tags FOR ALL USING (is_admin());

CREATE POLICY "Public read product_collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Admin all product_collections" ON product_collections FOR ALL USING (is_admin());

-- Inventory: Admin only
CREATE POLICY "Admin all inventory" ON inventory FOR ALL USING (is_admin());

-- Orders: Users can create and read own, Admin can all
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete orders" ON orders FOR DELETE USING (is_admin());

-- Order Items
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin())));
CREATE POLICY "Users insert own order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admin all order items" ON order_items FOR ALL USING (is_admin());

-- Invoices: Users can read own, Admin can all
CREATE POLICY "Users view own invoices" ON invoices FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND (orders.user_id = auth.uid() OR is_admin())));
CREATE POLICY "Admin all invoices" ON invoices FOR ALL USING (is_admin());

-- Notifications: Users can read/update own, Admin can all
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin all notifications" ON notifications FOR ALL USING (is_admin());

-- Settings: Public read, Admin write
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin all settings" ON settings FOR ALL USING (is_admin());

-- Announcements: Public read, Admin write
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin all announcements" ON announcements FOR ALL USING (is_admin());

-- 5. FUNCTION & TRIGGERS

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile from Auth User
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, store_name, address, wilaya, commune)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'store_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        COALESCE(NEW.raw_user_meta_data->>'wilaya', ''),
        COALESCE(NEW.raw_user_meta_data->>'commune', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to notify Admin on new order
CREATE OR REPLACE FUNCTION handle_new_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, message)
    SELECT id, 'NEW_ORDER', 'New order ' || NEW.id || ' received.'
    FROM public.profiles WHERE role = 'admin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION handle_new_order();

-- Trigger to deduct inventory and notify User when order is confirmed
CREATE OR REPLACE FUNCTION update_inventory_on_order_confirm()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    gram_multiplier INTEGER;
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            IF item.quantity = '100g' THEN gram_multiplier := 100;
            ELSIF item.quantity = '500g' THEN gram_multiplier := 500;
            ELSIF item.quantity = '1kg' THEN gram_multiplier := 1000;
            ELSIF item.quantity = '10kg' THEN gram_multiplier := 10000;
            ELSE gram_multiplier := 0;
            END IF;

            UPDATE inventory 
            SET quantity_in_grams = quantity_in_grams - gram_multiplier
            WHERE product_id = item.product_id;
        END LOOP;
        
        -- Notify User
        INSERT INTO notifications (user_id, type, message)
        VALUES (NEW.user_id, 'ORDER_CONFIRMED', 'Your order ' || NEW.id || ' has been confirmed.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order_confirm();

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- CREATE INDEX idx_products_name ON products USING GIN (to_tsvector('arabic', name));
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);

-- 7. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'products' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. REALTIME ENABLEMENT
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Initial setup for settings
INSERT INTO settings (id, store_name, phone, whatsapp, email) 
VALUES (1, 'ينبع للعطور', '+213000000000', '+213000000000', 'contact@yanba.com')
ON CONFLICT (id) DO NOTHING;
