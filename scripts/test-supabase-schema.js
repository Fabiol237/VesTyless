import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  console.log('Testing Supabase connection to:', supabaseUrl);

  const { data: patterns, error: errPatterns } = await supabase
    .from('design_patterns')
    .select('id, industry, pattern_name, evidence_count, confidence, source_count')
    .limit(5);

  console.log('design_patterns query error:', errPatterns);
  console.log('design_patterns count:', patterns?.length);

  const { data: relations, error: errRelations } = await supabase
    .from('design_pattern_relations')
    .select('*')
    .limit(5);

  console.log('design_pattern_relations query error:', errRelations);
  console.log('design_pattern_relations count:', relations?.length);

  const { data: failures, error: errFailures } = await supabase
    .from('design_failures')
    .select('*')
    .limit(5);

  console.log('design_failures query error:', errFailures);
  console.log('design_failures count:', failures?.length);
}

checkSupabase().catch(console.error);
