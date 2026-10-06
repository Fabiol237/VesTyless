import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, slug, owner_id, is_active, business_type, created_at');

  if (error) {
    console.error('Error fetching stores:', error);
    return;
  }

  console.log('=== TOUTES LES BOUTIQUES EN BASE (' + stores.length + ') ===');
  stores.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.id}] "${s.name}" (slug: ${s.slug}) | Actif: ${s.is_active} | Type: ${s.business_type} | Date: ${s.created_at}`);
  });
}

main();
