const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('supabase/migrate_to_cohere_1024.sql', 'utf8');

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.qkqowrwkmipxyktjdvfg',
  password: 'Z0kof@ro123',
  database: 'postgres',
  connectionTimeoutMillis: 10000
});

client.connect()
  .then(() => {
    console.log('Connected to eu-west-1 pooler. Running migration...');
    return client.query(sql);
  })
  .then(() => {
    console.log('Migration successful!');
    return client.end();
  })
  .catch(err => {
    console.error('Error eu-west-1:', err.message);
    client.end();
    
    // Fallback if the pooler connection isn't working properly
    console.log('Trying direct connection...');
    const client2 = new Client({
      connectionString: 'postgresql://postgres:Z0kof%40ro123@db.qkqowrwkmipxyktjdvfg.supabase.co:5432/postgres'
    });
    client2.connect()
      .then(() => client2.query(sql))
      .then(() => {
        console.log('Migration successful via direct connection!');
        client2.end();
      })
      .catch(e => {
        console.error('Direct connection error:', e.message);
        client2.end();
      });
  });
