/**
 * VesTyle — Full Database Migration using service_role key
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY_HERE';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

// Execute SQL via Supabase REST (service_role can bypass RLS but not DDL directly)
// Use the pg REST endpoint for raw SQL
async function execSQL(sql, label) {
  process.stdout.write(`⚙️  ${label}... `);
  
  // Try Management API approach (requires personal access token - won't work)
  // Try via RPC if exec_sql function exists
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql_query: sql }),
  });
  
  if (r1.ok) { console.log('✅'); return { ok: true }; }
  
  // Try via query endpoint
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql }),
  });
  
  if (r2.ok) { console.log('✅'); return { ok: true }; }
  
  const err = await r1.text();
  console.log(`⚠️  No direct SQL exec available`);
  return { ok: false, err };
}

async function rest(method, path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
  catch { return { ok: r.ok, status: r.status, data: text }; }
}

async function main() {
  console.log('🚀 VesTyle — Database Migration\n');
  console.log('✅ Using service_role key (full privileges)\n');

  // ─── 1. Check current stores ───────────────────────────────
  const { data: stores } = await rest('GET', 'stores?select=id,name&order=created_at');
  if (!Array.isArray(stores)) {
    console.log('❌ Cannot read stores:', stores);
    return;
  }
  console.log(`📋 Found ${stores.length} boutiques\n`);

  // ─── 2. Check if store_code column exists ──────────────────
  const colCheck = await rest('GET', 'stores?select=store_code&limit=1');
  const hasStoreCode = colCheck.ok;
  
  if (!hasStoreCode) {
    console.log('❌ store_code column missing — trying to create via RPC...');
    
    // Try calling exec_sql RPC  
    const sqlAlter = `
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_code VARCHAR(5);
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS city TEXT;
    `;
    await execSQL(sqlAlter, 'ALTER TABLE stores');
    
    // Re-check
    const recheck = await rest('GET', 'stores?select=store_code&limit=1');
    if (!recheck.ok) {
      console.log('\n⚠️  Cannot alter table via REST API (expected — Supabase blocks DDL via REST)');
      console.log('💡 Solution: The columns need to be added manually via Supabase SQL Editor.');
      console.log('   Provide me your Supabase login email + password and I will open the browser to do it.\n');
      return;
    }
  } else {
    console.log('✅ store_code column exists!\n');
  }

  // ─── 3. Assign unique 5-digit codes to stores ─────────────
  const usedCodes = new Set(stores.map(s => s.store_code).filter(Boolean));
  const noCode = stores.filter(s => !s.store_code);
  
  console.log(`🔢 Stores needing codes: ${noCode.length}`);
  
  for (const store of noCode) {
    let code;
    do { code = String(Math.floor(Math.random() * 90000 + 10000)); } while (usedCodes.has(code));
    usedCodes.add(code);
    
    const upd = await rest('PATCH', `stores?id=eq.${store.id}`, { store_code: code });
    console.log(`   ${upd.ok ? '✅' : '❌'} "${store.name}" → #${code}`);
  }

  // ─── 4. Add missing product columns ────────────────────────
  const prodCheck = await rest('GET', 'products?select=is_promo,is_boosted&limit=1');
  if (!prodCheck.ok) {
    console.log('\n⚠️  Product columns (is_promo, is_boosted) missing — need DDL access');
  } else {
    console.log('\n✅ Product columns already present');
  }

  // ─── 5. Final report ───────────────────────────────────────
  const { data: final } = await rest('GET', 'stores?select=name,store_code,city&order=created_at');
  console.log('\n══════════════════════════════════════════');
  console.log('📊 RÉSULTAT FINAL — Toutes les boutiques :');
  console.log('══════════════════════════════════════════');
  if (Array.isArray(final)) {
    final.forEach(s => {
      const code = s.store_code ? `#${s.store_code}` : '❌ PAS DE CODE';
      console.log(`   🏪 ${s.name.padEnd(25)} ${code.padEnd(10)} 📍 ${s.city || 'Non définie'}`);
    });
  }
  console.log('\n🎉 Migration terminée!');
}

main().catch(console.error);
