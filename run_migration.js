#!/usr/bin/env node
// Script pour exécuter la migration Supabase automatiquement
// Utilise l'API REST Supabase avec le Service Role Key

const https = require('https');
const fs = require('fs');

const SUPABASE_CONFIG = {
  url: 'https://qkqowrwkmipxyktjdvfg.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M'
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_CONFIG.url);
    
    // Créer une fonction RPC pour exécuter du SQL (si elle existe)
    // Sinon, faire les appels individuels
    
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
        try {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ success: true, data });
          } else {
            resolve({ success: false, status: res.statusCode, data });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function createTableViaREST(tableName, definition) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_CONFIG.url);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: `/rest/v1/${tableName}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.serviceKey,
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
    req.write(JSON.stringify({}));
    req.end();
  });
}

async function main() {
  log('\n🚀 VesTyle Supabase Migration - Automated Integration\n', 'cyan');
  
  log('📦 Configuration:', 'yellow');
  log(`   Project: qkqowrwkmipxyktjdvfg`, 'blue');
  log(`   URL: ${SUPABASE_CONFIG.url}`, 'blue');
  log(`   Service Key: ${SUPABASE_CONFIG.serviceKey.substring(0, 20)}...`, 'blue');
  
  log('\n📖 Reading migration file...', 'yellow');
  
  try {
    const migrationFile = './supabase/migrations/20260421194000_add_reviews_notifications_analytics.sql';
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    log(`✅ Migration file loaded (${migrationSQL.length} bytes)`, 'green');
    
    // Split by statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    log(`\n📋 Found ${statements.length} SQL statements\n`, 'cyan');
    
    // Stratégie alternative : utiliser les insertions REST API individuelles
    // Car Supabase REST API n'expose pas exec_sql directement
    
    log('⚠️  Note: Supabase REST API n\'expose pas exec_sql directement.', 'yellow');
    log('   Utilisation de la méthode alternative...', 'yellow');
    log('   (Les migrations doivent être appliquées via SQL Editor)', 'yellow');
    
    log('\n✅ Voici ce qui doit être fait :', 'green');
    log('   1. Ouvrir : https://app.supabase.com/project/qkqowrwkmipxyktjdvfg/sql/new', 'cyan');
    log('   2. Copier tout le SQL du fichier :', 'cyan');
    log(`      supabase/migrations/20260421194000_add_reviews_notifications_analytics.sql`, 'cyan');
    log('   3. Coller dans l\'éditeur SQL', 'cyan');
    log('   4. Cliquer sur "Run"', 'cyan');
    
    // Tentative de vérification des tables existantes
    log('\n🔍 Checking existing tables...', 'yellow');
    
    const tablesToCheck = ['reviews', 'notifications', 'product_views', 'vendor_analytics'];
    
    for (const table of tablesToCheck) {
      const checkUrl = `${SUPABASE_CONFIG.url}/rest/v1/${table}?limit=0`;
      const result = await new Promise((resolve) => {
        https.get(checkUrl, {
          headers: {
            'apikey': SUPABASE_CONFIG.serviceKey,
          }
        }, (res) => {
          resolve(res.statusCode === 200 ? 'exists' : 'missing');
        }).on('error', () => resolve('error'));
      });
      
      const status = result === 'exists' ? `✅ ${table}` : `❌ ${table}`;
      log(status, result === 'exists' ? 'green' : 'red');
    }
    
    log('\n📝 Migration SQL Content (copy all):', 'yellow');
    log('='.repeat(80), 'cyan');
    console.log(migrationSQL);
    log('='.repeat(80), 'cyan');
    
    log('\n🎯 Next Action Required:', 'yellow');
    log('   Open the link above and execute the SQL', 'cyan');
    log('   Then run: node verify_supabase.js', 'cyan');
    
  } catch (err) {
    log(`❌ Error: ${err.message}`, 'red');
    process.exit(1);
  }
}

main().catch(err => {
  log(`❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
