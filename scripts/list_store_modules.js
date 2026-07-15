require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const storeId = process.argv[2];
if (!storeId) { console.error('Usage: node scripts/list_store_modules.js <storeId>'); process.exit(1); }

(async () => {
  try {
    const { data: modules } = await supabase.from('store_modules').select('*').eq('store_id', storeId).order('position', { ascending: true });
    const { data: prods } = await supabase.from('products').select('id,name,is_active,created_at').eq('store_id', storeId).order('created_at', { ascending: false });

    console.log(`Modules (${modules?.length||0}):`);
    (modules||[]).forEach((m,i)=> console.log(`${i+1}. id=${m.id} type=${m.type} label=${m.label} pos=${m.position} is_active=${m.is_active}`));

    console.log(`\nProduits (${prods?.length||0}):`);
    (prods||[]).forEach((p,i)=> console.log(`${i+1}. id=${p.id} name="${p.name}" active=${p.is_active}`));
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
})();
