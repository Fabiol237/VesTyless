/**
 * Test connexion Supabase avec clé anon
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qkqowrwkmipxyktjdvfg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcwNzY1NzAsImV4cCI6MTk2MjY1MjU3MH0.jPnE-Fw4TdiBaEkSYx7CPJCdBlyP83e_3vCeW0K1tZE'
);

async function test() {
  try {
    console.log('Test lecture...');
    const { data, error } = await supabase.from('stores').select('id').limit(1);
    if (error) {
      console.error('Erreur:', error.message);
    } else {
      console.log('✅ OK, stores trouvés:', data.length);
      if (data.length > 0) {
        console.log('   ID store:', data[0].id);
      }
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

test();
