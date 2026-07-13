/**
 * VESTYLE — Indexation des 28 produits
 * Appelle l'endpoint /index du HF Space pour chaque produit
 * et sauvegarde le vecteur 1024D directement dans Supabase.
 */
import { createClient } from '@supabase/supabase-js';
import { Client } from '@gradio/client';

const SUPABASE_URL = 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M';

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function urlToBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  const buf  = await res.arrayBuffer();
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
}

async function main() {
  console.log('🔗 Connexion au HF Space...');
  const hf = await Client.connect('Fabiol237/vestyle-ai-engine');
  console.log('✅ Connecté !\n');

  const { data: products, error } = await sb
    .from('products')
    .select('id, name, image_url, images')
    .not('image_url', 'is', null)
    .order('created_at');

  if (error) throw new Error('Supabase: ' + error.message);
  console.log(`📦 ${products.length} produits à indexer\n${'─'.repeat(50)}`);

  let success = 0, failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imageUrl = p.image_url || (Array.isArray(p.images) && p.images[0]);
    process.stdout.write(`[${String(i+1).padStart(2)}/${products.length}] "${p.name}" — `);

    if (!imageUrl) {
      console.log('⚠️  Pas d\'image, skip');
      failed++;
      continue;
    }

    try {
      const b64 = await urlToBase64(imageUrl);

      const result = await hf.predict('index', [
        p.id,
        b64,
        p.name || ''
      ]);

      const data = result.data[0];
      if (data.error) {
        console.log(`❌ ${data.error.slice(0, 80)}`);
        failed++;
      } else {
        console.log(`✅ ${data.vector_dims}D — "${(data.caption || '').slice(0, 50)}"`);
        success++;
      }
    } catch (e) {
      console.log(`❌ ${e.message.slice(0, 80)}`);
      failed++;
    }

    // Petite pause pour ne pas surcharger le Space
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ ${success} produits indexés avec succès`);
  console.log(`❌ ${failed} échecs`);
  console.log(`${'═'.repeat(50)}`);

  if (success > 0) {
    // Vérifier le résultat dans Supabase
    const { count } = await sb
      .from('products')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    console.log(`\n📊 Produits avec vecteur dans Supabase : ${count}`);
  }
}

main().catch(e => {
  console.error('CRASH:', e.message);
  process.exit(1);
});
