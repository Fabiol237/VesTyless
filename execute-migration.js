// execute-migration.js
// Exécute la migration SQL directement via PostgreSQL

const https = require('https');
const fs = require('fs');

const SUPABASE_PROJECT_ID = 'qkqowrwkmipxyktjdvfg';
const SUPABASE_URL = 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M';

const c = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

console.log(`${c.cyan}🚀 VesTyle Supabase Migration\n${c.reset}`);

// Solution 1 : Utiliser l'API Supabase pour créer un RPC dynamique
// Solution 2 : Faire chaque opération via REST API

async function httpRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function createTable(tableName, hasData = false) {
  const options = {
    hostname: 'qkqowrwkmipxyktjdvfg.supabase.co',
    port: 443,
    path: `/rest/v1/${tableName}?limit=0`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    }
  };

  try {
    const res = await httpRequest(options);
    if (res.status === 200) {
      console.log(`${c.green}✅ ${tableName}${c.reset}`);
      return true;
    } else if (res.status === 404) {
      console.log(`${c.red}❌ ${tableName} (not found - needs SQL execution)${c.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${c.red}❌ ${tableName} (error: ${err.message})${c.reset}`);
    return false;
  }
}

async function main() {
  const newTables = ['reviews', 'notifications', 'product_views', 'vendor_analytics'];
  
  console.log(`${c.yellow}Checking database tables...${c.reset}\n`);
  
  let allExist = true;
  for (const table of newTables) {
    const exists = await createTable(table);
    if (!exists) allExist = false;
  }

  console.log(`\n${c.yellow}Reading migration SQL...${c.reset}`);
  const sql = fs.readFileSync('./supabase/migrations/20260421194000_add_reviews_notifications_analytics.sql', 'utf8');
  console.log(`${c.green}✅ Migration file loaded${c.reset}`);

  if (!allExist) {
    console.log(`\n${c.red}❌ Tables are missing. Need to execute SQL migration.${c.reset}`);
    console.log(`\n${c.cyan}⚠️  AUTOMATED SQL EXECUTION NOT AVAILABLE${c.reset}`);
    console.log(`${c.yellow}Reason: Supabase REST API doesn't expose arbitrary SQL execution for security.${c.reset}`);
    
    console.log(`\n${c.cyan}📋 REQUIRED ACTION:${c.reset}`);
    console.log(`\n1️⃣  Open: ${c.cyan}https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/sql/new${c.reset}`);
    console.log(`2️⃣  Copy and paste ALL of this SQL into the editor:\n`);
    
    console.log(`${c.cyan}${'='.repeat(80)}${c.reset}`);
    console.log(sql);
    console.log(`${c.cyan}${'='.repeat(80)}${c.reset}\n`);
    
    console.log(`3️⃣  Click "Run" button`);
    console.log(`4️⃣  Wait for "Success" message`);
    console.log(`5️⃣  Then run: ${c.cyan}node verify_supabase.js${c.reset}\n`);
    
    process.exit(1);
  } else {
    console.log(`\n${c.green}✅ All tables exist! Migration already applied.${c.reset}`);
    console.log(`\n${c.cyan}Running verification...${c.reset}\n`);
    
    // TODO: Run verification
  }
}

main().catch(err => {
  console.error(`${c.red}Error: ${err.message}${c.reset}`);
  process.exit(1);
});
