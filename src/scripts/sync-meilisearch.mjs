import { createClient } from '@supabase/supabase-js';
import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const meiliHost = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
const meiliApiKey = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const meili = new Meilisearch({ host: meiliHost, apiKey: meiliApiKey });
const index = meili.index('products');

async function sync() {
  console.log('Configuration de l\'index...');
  await index.updateFilterableAttributes(['store_id', 'category_id']);
  
  console.log('Récupération des produits depuis Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Erreur Supabase:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('Aucun produit à synchroniser.');
    return;
  }

  console.log(`${products.length} produits trouvés. Indexation dans Meilisearch...`);
  
  const task = await index.addDocuments(products);
  console.log('Tâche d\'indexation envoyée. ID:', task.taskUid);
  
  console.log('Attente de la fin de l\'indexation...');
  const result = await meili.waitForTask(task.taskUid);
  console.log('Statut final:', result.status);
}

sync().catch(console.error);
