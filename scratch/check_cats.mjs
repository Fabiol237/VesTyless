import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkCategories() {
  const { data: globalCats } = await supabase.from('global_categories').select('id, name, icon');
  console.log('Global Categories in DB:', globalCats);

  const { data: prods } = await supabase.from('products').select('category, global_category_id').limit(20);
  console.log('Sample product categories in DB:', prods);
}

checkCategories();
