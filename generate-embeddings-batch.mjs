#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

async function generateEmbeddings() {
  try {
    console.log('🔄 GÉNÉRATION DES EMBEDDINGS MANQUANTS...\n');
    
    // 1) Trouver les produits sans embeddings
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description');
    
    const productsWithoutEmbed = products.filter(p => !p.text_embedding_1024 && !p.image_embedding_1024);
    
    console.log(`📊 ${productsWithoutEmbed.length} produits sans embeddings trouvés\n`);
    
    if (productsWithoutEmbed.length === 0) {
      console.log('✅ Tous les produits ont des embeddings !');
      return;
    }
    
    let successCount = 0;
    
    for (const product of productsWithoutEmbed) {
      try {
        const textToEmbed = `${product.name}. ${product.description || ''}`.trim();
        
        console.log(`⏳ ${product.name}...`);
        
        // Générer l'embedding avec Cohere
        const embedRes = await cohere.embed({
          texts: [textToEmbed],
          model: 'embed-english-v3.0',
          inputType: 'search_document',
          embeddingTypes: ['float']
        });
        
        if (!embedRes.embeddings || !embedRes.embeddings.float || embedRes.embeddings.float.length === 0) {
          throw new Error('Pas d\'embeddings retournés');
        }
        
        const embedding = embedRes.embeddings.float[0];
        
        if (!embedding || embedding.length !== 1024) {
          throw new Error(`Embedding invalide (${embedding?.length || 0} dimensions)`);
        }
        
        // Mettre à jour le produit
        const { error: updateErr } = await supabase
          .from('products')
          .update({
            text_embedding_1024: embedding,
            image_embedding_1024: embedding
          })
          .eq('id', product.id);
        
        if (updateErr) throw updateErr;
        
        console.log(`   ✅ ${product.name}`);
        successCount++;
        
        // Rate limit: pause de 1 seconde entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.log(`   ❌ ${product.name}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Génération complétée: ${successCount}/${productsWithoutEmbed.length} embeddings créés`);
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

generateEmbeddings();
