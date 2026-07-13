import { createClient } from '@supabase/supabase-js';
import { Client } from '@gradio/client';
import fs from 'fs';

const SUPABASE_URL = 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M';
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Image test publique (un sac à dos basique)
const TEST_IMAGE = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
let productId = null;

async function urlToBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`;
}

async function main() {
  console.log("🚀 DÉBUT DU TEST END-TO-END\n");

  try {
    // 1. Appel du Next.js API (simulation)
    // Au lieu d'appeler l'API locale Next.js, on va appeler directement le code HF Space qu'on a mis dans l'API
    console.log("1️⃣  Génération du vecteur via le moteur HF...");
    const hf = await Client.connect("Fabiol237/vestyle-ai-engine");
    const b64 = await urlToBase64(TEST_IMAGE);
    
    // Equivalent à l'appel API generate-embeddings-v2
    const embedRes = await hf.predict("search", [b64, 0.01, 1]);
    const embedData = embedRes.data[0];
    
    const vector = embedData.metadata?.embedding;
    const caption = embedData.step?.florence?.caption;
    console.log(`   ✅ Vecteur généré : ${vector?.length} dimensions.`);
    console.log(`   📝 Description de l'image : "${caption}"\n`);

    // 2. Insertion dans Supabase
    console.log("2️⃣  Ajout du produit test dans Supabase...");
    
    // Récupérer un store_id valide
    const { data: storeData } = await sb.from('stores').select('id').limit(1).single();
    const validStoreId = storeData ? storeData.id : null;
    
    if (!validStoreId) {
       console.log("⚠️ Aucun store trouvé, on utilise un ID temporaire.");
    }
    
    const newProduct = {
      store_id: validStoreId,
      name: "Test Sac à Dos End-to-End",
      price: 15000,
      image_url: TEST_IMAGE,
      image_embedding_1024: vector,
      ai_caption: caption,
      is_active: true
    };

    const { data: inserted, error: insertErr } = await sb
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (insertErr) throw new Error("Erreur insertion: " + insertErr.message);
    productId = inserted.id;
    console.log(`   ✅ Produit ajouté avec succès (ID: ${productId})\n`);

    // 3. Test de la recherche visuelle
    console.log("3️⃣  Recherche visuelle avec la même image...");
    // On rappelle la recherche pour voir si le produit remonte
    const searchRes = await hf.predict("search", [b64, 0.5, 5]);
    const searchData = searchRes.data[0];
    
    const foundProducts = searchData.products || [];
    console.log(`   🔎 Trouvé(s) : ${foundProducts.length} produit(s) (seuil 0.5)`);
    
    let isFound = false;
    for (const p of foundProducts) {
      console.log(`      - ${p.name} (Sim: ${(p.similarity*100).toFixed(1)}%)`);
      if (p.id === productId) {
        isFound = true;
      }
    }

    if (isFound) {
      console.log("\n🎉 SUCCÈS TOTAL : Le produit a été indexé et retrouvé immédiatement !");
    } else {
      console.log("\n❌ ÉCHEC : Le produit n'est pas apparu dans les résultats.");
    }

  } catch (err) {
    console.error("\n❌ ERREUR PENDANT LE TEST:", err);
  } finally {
    // Nettoyage : On supprime le produit de test
    if (productId) {
      console.log("\n🧹 Suppression du produit de test...");
      await sb.from('products').delete().eq('id', productId);
      console.log("   ✅ Produit supprimé.");
    }
  }
}

main();
