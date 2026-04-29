#!/usr/bin/env node
// Script to verify Supabase setup and apply migrations
// Run with: node verify_supabase.js

const https = require('https');

const config = {
  projectUrl: 'https://qkqowrwkmipxyktjdvfg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDk5NTAsImV4cCI6MjA5MjAyNTk1MH0.e-8FzvYhry7i9swL0ajMtVnWz8TMm53TYu48hWFE0gU',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M'
};

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : body });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function verifySupabase() {
  console.log(chalk.cyan('🚀 Verifying Supabase Setup\n'));

  const url = new URL(config.projectUrl);
  
  // Test 1: Check connection
  console.log(chalk.yellow('1️⃣  Testing Supabase connection...'));
  const testUrl = `${url.protocol}//${url.host}/rest/v1/`;
  const testOptions = {
    method: 'GET',
    headers: {
      'apikey': config.anonKey,
      'Authorization': `Bearer ${config.anonKey}`,
    },
  };

  try {
    const testRes = await makeRequest(testUrl, testOptions);
    if (testRes.status === 200) {
      console.log(chalk.green('✅ Connection successful!\n'));
    } else {
      console.log(chalk.red(`❌ Unexpected response: ${testRes.status}\n`));
    }
  } catch (err) {
    console.log(chalk.red(`❌ Connection failed: ${err.message}\n`));
  }

  // Test 2: Check tables
  console.log(chalk.yellow('2️⃣  Checking database tables...'));
  const tables = ['reviews', 'notifications', 'product_views', 'vendor_analytics', 'orders', 'products', 'stores', 'profiles'];
  
  for (const table of tables) {
    const tableUrl = `${url.protocol}//${url.host}/rest/v1/${table}?limit=0`;
    const tableOptions = {
      method: 'GET',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
      },
    };

    try {
      const res = await makeRequest(tableUrl, tableOptions);
      if (res.status === 200) {
        console.log(chalk.green(`✅ ${table}`));
      } else if (res.status === 404) {
        console.log(chalk.red(`❌ ${table} (not found)`));
      } else {
        console.log(chalk.yellow(`⚠️  ${table} (status: ${res.status})`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ ${table} (error: ${err.message})`));
    }
  }

  console.log('\n' + chalk.cyan('✨ Verification complete!\n'));
  console.log(chalk.yellow('📋 Next Steps:\n'));
  console.log('1. Open: https://app.supabase.com/projects');
  console.log('2. Select project: qkqowrwkmipxyktjdvfg');
  console.log('3. Go to: SQL Editor');
  console.log('4. Click: "New Query"');
  console.log('5. Paste migration file content');
  console.log('6. Click: "Run"\n');
}

verifySupabase().catch(console.error);
