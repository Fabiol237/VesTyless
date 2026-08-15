import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspectAndCleanDB() {
  console.log('🔍 Inspecting Database Products & Stores...\n');

  // 1. Fetch all products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, price, original_price, image_url, is_active, store_id, created_at');

  if (pErr) {
    console.error('Error fetching products:', pErr);
    return;
  }

  console.log(`Total products in DB: ${products.length}`);

  // Identify fake/test products
  const fakeProducts = products.filter(p => {
    const nameLower = (p.name || '').toLowerCase();
    const isTestName = nameLower.includes('test') || nameLower.includes('demo') || nameLower.includes('fake') || nameLower.includes('sample') || nameLower.includes('foo') || nameLower.includes('bar');
    const isInvalidPrice = !p.price || p.price <= 0;
    const isPlaceholderImage = !p.image_url || p.image_url.includes('via.placeholder.com') || p.image_url.includes('placeholder-product');
    return isTestName || isInvalidPrice;
  });

  console.log(`Fake/Test/Invalid products found: ${fakeProducts.length}`);
  fakeProducts.forEach(p => {
    console.log(`  - [ID: ${p.id}] "${p.name}" (Price: ${p.price}, Image: ${p.image_url})`);
  });

  if (fakeProducts.length > 0) {
    const fakeIds = fakeProducts.map(p => p.id);
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .in('id', fakeIds);

    if (delErr) {
      console.error('Error deleting fake products:', delErr);
    } else {
      console.log(`✅ Deleted ${fakeProducts.length} fake/test products from DB.`);
    }
  }

  // 2. Fetch all stores
  const { data: stores, error: sErr } = await supabase
    .from('stores')
    .select('id, name, slug, is_active');

  if (sErr) {
    console.error('Error fetching stores:', sErr);
    return;
  }

  console.log(`\nTotal stores in DB: ${stores.length}`);
  const fakeStores = stores.filter(s => {
    const nameLower = (s.name || '').toLowerCase();
    return nameLower.includes('test') || nameLower.includes('demo') || nameLower.includes('fake');
  });

  console.log(`Fake/Test stores found: ${fakeStores.length}`);
  fakeStores.forEach(s => console.log(`  - [ID: ${s.id}] "${s.name}" (${s.slug})`));

  if (fakeStores.length > 0) {
    const fakeStoreIds = fakeStores.map(s => s.id);
    // Delete associated products first
    await supabase.from('products').delete().in('store_id', fakeStoreIds);
    const { error: delSErr } = await supabase.from('stores').delete().in('id', fakeStoreIds);
    if (delSErr) {
      console.error('Error deleting fake stores:', delSErr);
    } else {
      console.log(`✅ Deleted ${fakeStores.length} fake/test stores.`);
    }
  }

  // 3. Deactivate stores without products
  const { data: activeStores } = await supabase.from('stores').select('id, name').eq('is_active', true);
  if (activeStores) {
    for (const store of activeStores) {
      const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', store.id);
      if ((count || 0) === 0) {
        await supabase.from('stores').update({ is_active: false }).eq('id', store.id);
        console.log(`Deactivated empty store: ${store.name}`);
      }
    }
  }

  console.log('\n✅ Database inspection & cleanup complete!');
}

inspectAndCleanDB();
