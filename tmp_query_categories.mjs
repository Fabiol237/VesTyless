import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:Z0kof%40ro123@db.qkqowrwkmipxyktjdvfg.supabase.co:5432/postgres'
});

try {
  await client.connect();
  const res = await client.query('select id,name,slug,icon from global_categories order by id limit 50');
  console.log(JSON.stringify(res.rows, null, 2));
} catch (e) {
  console.error(e.message);
} finally {
  await client.end();
}
