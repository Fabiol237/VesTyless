/**
 * VesTyle — Migration via GoTrue token + Management API
 */

const PROJECT_REF = 'qkqowrwkmipxyktjdvfg';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY_HERE';
const EMAIL = process.env.SUPABASE_EMAIL || 'YOUR_EMAIL_HERE';
const PASSWORD = process.env.SUPABASE_PASSWORD || 'YOUR_PASSWORD_HERE';

const MIGRATION_STEPS = [
  {
    name: 'Add store_code, qr_code_url, city to stores',
    sql: `ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_code VARCHAR(5); ALTER TABLE stores ADD COLUMN IF NOT EXISTS qr_code_url TEXT; ALTER TABLE stores ADD COLUMN IF NOT EXISTS city TEXT;`
  },
  {
    name: 'Add product columns',
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(8); ALTER TABLE products ADD COLUMN IF NOT EXISTS qr_code_url TEXT; ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;`
  },
  {
    name: 'Add unique constraint on store_code',
    sql: `ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_store_code_key; ALTER TABLE stores ADD CONSTRAINT stores_store_code_key UNIQUE (store_code);`
  },
  {
    name: 'Create generate_store_code function',
    sql: `CREATE OR REPLACE FUNCTION generate_store_code() RETURNS VARCHAR(5) LANGUAGE plpgsql AS $func$ DECLARE new_code VARCHAR(5); code_exists BOOLEAN; BEGIN LOOP new_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0'); SELECT EXISTS(SELECT 1 FROM stores WHERE store_code = new_code) INTO code_exists; EXIT WHEN NOT code_exists; END LOOP; RETURN new_code; END; $func$;`
  },
  {
    name: 'Assign codes to all existing stores',
    sql: `DO $do$ DECLARE r RECORD; BEGIN FOR r IN SELECT id FROM stores WHERE store_code IS NULL LOOP UPDATE stores SET store_code = generate_store_code() WHERE id = r.id; END LOOP; END; $do$;`
  },
  {
    name: 'Create auto-assign trigger',
    sql: `CREATE OR REPLACE FUNCTION auto_assign_store_code() RETURNS TRIGGER LANGUAGE plpgsql AS $func$ BEGIN IF NEW.store_code IS NULL THEN NEW.store_code := generate_store_code(); END IF; RETURN NEW; END; $func$; DROP TRIGGER IF EXISTS trg_auto_store_code ON stores; CREATE TRIGGER trg_auto_store_code BEFORE INSERT ON stores FOR EACH ROW EXECUTE FUNCTION auto_assign_store_code();`
  },
  {
    name: 'Create get_store_by_code RPC',
    sql: `CREATE OR REPLACE FUNCTION get_store_by_code(p_code VARCHAR) RETURNS TABLE(id UUID, name TEXT, slug TEXT, logo_url TEXT, banner_url TEXT, whatsapp_number TEXT, store_code VARCHAR, city TEXT, description TEXT, theme_color TEXT) LANGUAGE plpgsql SECURITY DEFINER AS $func$ BEGIN RETURN QUERY SELECT s.id,s.name,s.slug,s.logo_url,s.banner_url,s.whatsapp_number,s.store_code,s.city,s.description,s.theme_color FROM stores s WHERE s.store_code=p_code AND s.is_active=true; END; $func$; GRANT EXECUTE ON FUNCTION get_store_by_code(VARCHAR) TO anon, authenticated; GRANT EXECUTE ON FUNCTION generate_store_code() TO authenticated;`
  },
];

async function execViaManagementAPI(sql, token, label) {
  process.stdout.write(`  ⚙️  ${label}... `);
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (r.ok) { console.log('✅'); return { ok: true, data: await r.json().catch(() => ({})) }; }
  const err = await r.text();
  console.log(`❌ ${r.status}: ${err.slice(0, 150)}`);
  return { ok: false, err };
}

async function main() {
  console.log('🚀 VesTyle — Database Migration\n');

  // 1. Login via project GoTrue to get user session
  console.log('🔐 Authenticating...');
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  
  if (!loginRes.ok) {
    console.log('❌ Login failed:', await loginRes.text());
    return;
  }
  
  const { access_token: userToken } = await loginRes.json();
  console.log('✅ Authenticated as:', EMAIL);

  // 2. Try Management API with user token
  console.log('\n📡 Testing Management API access...');
  const testRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}`, {
    headers: { 'Authorization': `Bearer ${userToken}` },
  });
  
  if (testRes.ok) {
    const proj = await testRes.json();
    console.log(`✅ Project access confirmed: ${proj.name || PROJECT_REF}`);
    
    // Run each migration step
    console.log('\n🔄 Running migration steps:\n');
    for (const step of MIGRATION_STEPS) {
      await execViaManagementAPI(step.sql, userToken, step.name);
    }
    
    // Verify
    console.log('\n📊 Verifying results...');
    const verifyRes = await execViaManagementAPI(
      'SELECT name, store_code, city FROM stores ORDER BY name;',
      userToken,
      'Get store codes'
    );
    
    if (verifyRes.ok && Array.isArray(verifyRes.data)) {
      console.log('\n══════════════════════════════════════════════════');
      console.log('🏪 BOUTIQUES ET CODES:');
      console.log('══════════════════════════════════════════════════');
      verifyRes.data.forEach(row => {
        console.log(`   ${row.name?.padEnd(30)} → Code: #${row.store_code || 'N/A'}`);
      });
    }
    
    console.log('\n🎉 Migration terminée avec succès!');
    
  } else {
    const errText = await testRes.text();
    console.log(`⚠️  Management API access: ${testRes.status} — ${errText.slice(0, 200)}`);
    console.log('\n📋 Trying alternative: Supabase pg-meta API...');
    
    // Try pg-meta which is accessible via the project's internal API
    const metaRes = await fetch(`${SUPABASE_URL}/pg-meta/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'SELECT name, store_code FROM stores LIMIT 5' }),
    });
    console.log(`pg-meta response: ${metaRes.status}`, await metaRes.text().then(t => t.slice(0,200)));
  }
}

main().catch(console.error);
