import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

console.log('Testing with url:', url);
console.log('Testing with key:', key.slice(0, 20) + '...');

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('stores').select('id').limit(1);
  if (error) {
    console.error('❌ Database connection failed:', error.message);
  } else {
    console.log('✅ Connection OK, found stores count:', data.length);
  }
}

run();
