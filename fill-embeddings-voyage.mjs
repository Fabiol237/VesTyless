import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function downloadImageAsBase64(url, timeout = 10000) {
  try {
    const response = await fetch(url, { timeout });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (e) {
    console.warn(`  ⚠️  Image download failed: ${e.message}`);
    return null;
  }
}

async function generateVoyageMultimodalEmbedding(base64Image, productName) {
  try {
    const content = [];
    if (productName) content.push({ type: "text", text: productName });
    content.push({ type: "image_base64", image_base64: `data:image/jpeg;base64,${base64Image}` });

    const res = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "voyage-multimodal-3",
        inputs: [{ content }],
        input_type: "document"
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Voyage API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.data[0].embedding;
  } catch (e) {
    console.error(`  ❌ Embedding generation failed: ${e.message}`);
    return null;
  }
}

async function fillEmbeddings() {
  console.log('🚀 Remplissage des embeddings avec Voyage AI...');
  
  if (!process.env.VOYAGE_API_KEY) {
    console.error("❌ ERREUR: VOYAGE_API_KEY n'est pas défini dans .env.local");
    process.exit(1);
  }

  // 1. Récupérer tous les produits
  const { data: allProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, image_url')
    .eq('is_active', true);

  if (fetchError) {
    console.error("❌ Erreur de récupération des produits:", fetchError.message);
    process.exit(1);
  }

  // Forcer la mise à jour de TOUS les produits avec une image
  const productsNeedingEmbeddings = allProducts.filter(p => p.image_url);
  console.log(`📊 ${productsNeedingEmbeddings.length} produits à mettre à jour...`);

  for (let i = 0; i < productsNeedingEmbeddings.length; i++) {
    const product = productsNeedingEmbeddings[i];
    console.log(`[${i+1}/${productsNeedingEmbeddings.length}] ${product.name}`);
    
    const base64Image = await downloadImageAsBase64(product.image_url);
    if (!base64Image) continue;

    const embedding = await generateVoyageMultimodalEmbedding(base64Image, product.name);
    if (!embedding) continue;

    await supabase
      .from('products')
      .update({
        image_embedding_1024: embedding,
        text_embedding_1024: embedding,
      })
      .eq('id', product.id);
      
    console.log('  ✅ Mis à jour avec succès!');
    await new Promise(r => setTimeout(r, 2000)); // Rate limiting plus strict pour Voyage AI
  }
  
  console.log('🎉 Terminé!');
}

fillEmbeddings();
