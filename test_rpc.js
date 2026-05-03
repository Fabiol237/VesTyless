const https = require('https');

const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_KEY_HERE'
};

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_CONFIG.url);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.serviceKey,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

const sql = `
  if not exists (select 1 from information_schema.columns where table_name='stores' and column_name='store_code') then
    alter table stores add column store_code varchar(5) unique;
  end if;
`;

executeSQL("SELECT 1;").then(res => {
  console.log("Status:", res.status);
  console.log("Data:", res.data);
}).catch(console.error);
