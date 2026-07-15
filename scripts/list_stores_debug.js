require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, is_active, owner_id')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error.message || error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('Aucune boutique trouvée.');
      process.exit(0);
    }

    console.log(`Found ${data.length} stores:`);
    data.forEach((s, i) => {
      console.log(`${i + 1}. id=${s.id} name="${s.name}" slug=${s.slug} is_active=${s.is_active} owner=${s.owner_id}`);
    });
  } catch (e) {
    console.error('Unexpected error:', e.message || e);
    process.exit(1);
  }
})();
