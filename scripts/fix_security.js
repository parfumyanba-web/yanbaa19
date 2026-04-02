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

    const sql = fs.readFileSync(path.join(__dirname, 'fix_security.sql'), 'utf-8');
    await client.query(sql);
    console.log("✅ Security fixes applied successfully.");

  } catch (err) {
    console.error("❌ Error executing security fixes:", err);
  } finally {
    await client.end();
  }
}
run();
