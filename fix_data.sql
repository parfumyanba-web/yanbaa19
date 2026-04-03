-- 1. Ensure Storage Bucket is Public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Update existing products with sample images from Unsplash to fix "Images Not Showing"
-- Using Unsplash IDs for various perfume/scent related images
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1541643600914-7836d3969197?auto=format&fit=crop&q=80&w=800' WHERE name LIKE '%عطر%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800' WHERE name LIKE '%مسك%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616984268282-55d470d7558a?auto=format&fit=crop&q=80&w=800' WHERE name LIKE '%عود%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800' WHERE image_url = '' OR image_url IS NULL;

-- 3. Ensure "New Arrivals" tag exists and is linked
DO $$
DECLARE
    tag_id UUID;
BEGIN
    INSERT INTO public.tags (name) VALUES ('جديد') ON CONFLICT (name) DO NOTHING;
    SELECT id INTO tag_id FROM public.tags WHERE name = 'جديد';
    
    -- Link some products to 'جديد' if they aren't already
    INSERT INTO public.product_tags (product_id, tag_id)
    SELECT id, tag_id FROM public.products LIMIT 4
    ON CONFLICT DO NOTHING;
END $$;
