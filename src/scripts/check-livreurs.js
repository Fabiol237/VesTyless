const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Checking "livreurs" table...');
  const { data, error } = await supabase.from('livreurs').select('*').limit(1);
  
  if (error) {
    console.error('Error selecting from livreurs:', error.message);
  } else {
    console.log('Success! Data:', data);
    
    // Check columns
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'livreurs' });
    if (colError) {
       // Fallback: check via another query if RPC doesn't exist
       console.log('Columns check failed (RPC might be missing)');
    } else {
       console.log('Columns:', cols);
    }
  }
}

check();
