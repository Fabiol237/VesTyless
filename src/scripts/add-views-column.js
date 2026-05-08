const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.qkqowrwkmipxyktjdvfg:Z0kof@ro123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  });
  await client.connect();
  try {
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;");
    console.log("SUCCESS: Column 'views' added to 'products' table.");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await client.end();
  }
}

run();
