const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.lwgylzcsxrevlwxrwogt:Yy123456789..123.@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });

  try {
    await client.connect();
    console.log("Connected to DB");

    // CRITICAL: Drop existing tables to fix BIGINT vs UUID mismatch
    console.log("Cleaning up existing tables for schema upgrade...");
    await client.query(`
        DROP TABLE IF EXISTS public.order_items CASCADE;
        DROP TABLE IF EXISTS public.orders CASCADE;
        DROP TABLE IF EXISTS public.inventory CASCADE;
        DROP TABLE IF EXISTS public.product_categories CASCADE;
        DROP TABLE IF EXISTS public.product_tags CASCADE;
        DROP TABLE IF EXISTS public.product_collections CASCADE;
        DROP TABLE IF EXISTS public.products CASCADE;
        DROP TABLE IF EXISTS public.brands CASCADE;
        DROP TABLE IF EXISTS public.categories CASCADE;
        DROP TABLE IF EXISTS public.tags CASCADE;
        DROP TABLE IF EXISTS public.collections CASCADE;
    `);

    const schemaSql = fs.readFileSync(path.join(__dirname, '../supabase_schema.sql'), 'utf-8');
    const safeSchemaSql = schemaSql.replace(/ALTER PUBLICATION supabase_realtime ADD TABLE.*;/g, '-- ALTER PUBLICATION removed');
    await client.query(safeSchemaSql);
    console.log("✅ Schema applied successfully.");

    const seedSql = fs.readFileSync(path.join(__dirname, '../seed_test_data.sql'), 'utf-8');
    await client.query(seedSql);
    console.log("✅ Seed data applied successfully.");
    
    // Create bucket if it doesn't exist
    const storageSql = `
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('products', 'products', true) 
      ON CONFLICT (id) DO NOTHING;
      
      -- Add policies for public access if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Public Access to Products'
        ) THEN
            CREATE POLICY "Public Access to Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
        END IF;
      END $$;
      
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Allow Uploads'
        ) THEN
            CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
        END IF;
      END $$;
    `;
    await client.query(storageSql);
    console.log("✅ Storage bucket and policies initialized.");

  } catch (err) {
    console.error("❌ Error executing SQL:", err);
  } finally {
    await client.end();
  }
}
run();
