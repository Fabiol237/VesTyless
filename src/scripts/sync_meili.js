const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDk5NTAsImV4cCI6MjA5MjAyNTk1MH0.e-8FzvYhry7i9swL0ajMtVnWz8TMm53TYu48hWFE0gU';

const msHost = 'https://ms-8dae386d9adc-46848.fra.meilisearch.io';
const msKey = 'b266e79052658faf1e1a20c7e846c98cffff1225';

async function sync() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { Meilisearch } = await import('meilisearch');
  const ms = new Meilisearch({ host: msHost, apiKey: msKey });
  
  // 1. Sync Products
  console.log('Fetching products...');
  const { data: products } = await supabase.from('products').select('*, stores(name, slug)');
  const productIndex = ms.index('products');
  const prodFormatted = products.map(p => ({
    id: p.id,
    type: 'product',
    name: p.name,
    description: p.description,
    price: p.price,
    category_id: p.category_id,
    store_name: p.stores?.name,
    store_slug: p.stores?.slug,
    image_url: p.image_url,
    is_promo: p.is_promo,
    is_boosted: p.is_boosted,
    is_active: p.is_active
  }));
  await productIndex.addDocuments(prodFormatted);

  // 2. Sync Stores
  console.log('Fetching stores...');
  const { data: stores } = await supabase.from('stores').select('*');
  const storeIndex = ms.index('stores');
  const storeFormatted = stores.map(s => ({
    id: s.id,
    type: 'store',
    name: s.name,
    slug: s.slug,
    logo_url: s.logo_url,
    city: s.city,
    is_boosted: s.is_boosted
  }));
  await storeIndex.addDocuments(storeFormatted);
  
  console.log('Sync completed for products and stores.');
}

sync();
