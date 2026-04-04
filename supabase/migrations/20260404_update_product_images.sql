-- ==============================================================================
-- FIX: ADD MISSING updated_at AND UPDATE PRODUCT IMAGES
-- ==============================================================================

-- 1. Ensure updated_at column exists to satisfy triggers
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Generated Custom Images
UPDATE public.products SET image_url = '/images/products/interlude.png' WHERE name = 'عطر إنترلود';
UPDATE public.products SET image_url = '/images/products/safari.png' WHERE name = 'سفاري';
UPDATE public.products SET image_url = '/images/products/shams.png' WHERE name = 'مخلط شمس';
UPDATE public.products SET image_url = '/images/products/black_leather.png' WHERE name = 'بلاك ليذر';
UPDATE public.products SET image_url = '/images/products/white_oud.png' WHERE name = 'عود أبيض';

-- 3. High-Quality Premium Fallbacks (Unsplash)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1000' WHERE name = 'مسك الختام';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1592945403244-b3fbfa9f578f?auto=format&fit=crop&q=80&w=1000' WHERE name = 'كراون الملكي';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000' WHERE name = 'وردي';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=1000' WHERE name = 'ليال';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1616194477691-f20321a6f84f?auto=format&fit=crop&q=80&w=1000' WHERE name = 'مسك الطهارة';
