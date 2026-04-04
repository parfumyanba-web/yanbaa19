/**
 * Resolves a product image URL from multiple possible sources:
 * 1. Absolute URLs (http/https)
 * 2. Local public paths (starting with /)
 * 3. Supabase storage filenames (no prefix)
 * 4. Fallback to a professional placeholder if no URL is provided
 */
export function resolveProductImage(url?: string): string {
  // 1. Handle empty or null URLs with a high-quality professional fallback
  if (!url || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1541643600914-7836d3969197?auto=format&fit=crop&q=80&w=800';
  }

  // 2. Already fully qualified URL or local path
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }

  // 3. Supabase Storage Resolution
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return url; // Fallback to raw value if env is missing
  }

  // If it's just a filename, it lives in the 'products' bucket
  return `${supabaseUrl}/storage/v1/object/public/products/${url}`;
}
