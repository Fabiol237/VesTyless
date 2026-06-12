import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching all stores...");
  const { data: stores, error } = await supabase.from('stores').select('id, owner_id, created_at, name');
  
  if (error) {
    console.error("Error fetching stores:", error);
    return;
  }
  
  const ownerMap = {};
  for (const store of stores) {
    if (!store.owner_id) continue;
    
    // Get product count to ensure we don't delete stores with products
    const { count } = await supabase.from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id);
      
    store.productCount = count || 0;
    
    if (!ownerMap[store.owner_id]) ownerMap[store.owner_id] = [];
    ownerMap[store.owner_id].push(store);
  }
  
  let deletedCount = 0;
  for (const [ownerId, userStores] of Object.entries(ownerMap)) {
    if (userStores.length > 1) {
      console.log(`\nUser ${ownerId} has ${userStores.length} stores.`);
      
      // Sort by productCount descending, then created_at descending
      userStores.sort((a, b) => {
        if (b.productCount !== a.productCount) {
          return b.productCount - a.productCount; // Store with most products first
        }
        // If product counts are equal, keep the most recently created one
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      const storeToKeep = userStores[0];
      const storesToDelete = userStores.slice(1);
      
      console.log(`  -> KEEPING store ${storeToKeep.id} (${storeToKeep.productCount} products)`);
      
      for (const store of storesToDelete) {
         console.log(`  -> DELETING store ${store.id} (${store.productCount} products)...`);
         
         // In case there are related products, delete them first to avoid foreign key constraints
         if (store.productCount > 0) {
           await supabase.from('products').delete().eq('store_id', store.id);
         }
         // Delete store
         const { error: delError } = await supabase.from('stores').delete().eq('id', store.id);
         
         if (delError) {
           console.error(`     ❌ Error deleting store ${store.id}:`, delError.message);
         } else {
           console.log(`     ✅ Deleted ${store.id}`);
           deletedCount++;
         }
      }
    }
  }
  
  console.log(`\n=== Cleanup complete. Deleted ${deletedCount} duplicate stores. ===`);
}

run();
