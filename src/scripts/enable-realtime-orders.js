const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function checkRealtime() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders'");
    if (res.rows.length > 0) {
      console.log('SUCCESS: Orders table IS in realtime publication.');
    } else {
      console.log('WARNING: Orders table IS NOT in realtime publication. Enabling it now...');
      await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE orders");
      console.log('SUCCESS: Realtime enabled for orders.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkRealtime();
