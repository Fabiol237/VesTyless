const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function listPolicies() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT polname, polcmd, polqual, polwithcheck 
      FROM pg_policy 
      WHERE polrelid = 'orders'::regclass
    `);
    console.log('Policies for "orders":');
    res.rows.forEach(row => {
      console.log(`- Name: ${row.polname}`);
      console.log(`  Command: ${row.polcmd}`);
      console.log(`  Qual: ${row.polqual}`);
      console.log(`  With Check: ${row.polwithcheck}`);
      console.log('---');
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

listPolicies();
