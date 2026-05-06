'use server'
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function toggleStoreStatusAction(storeId, currentVerified) {
  const newVerified = !currentVerified;
  const { error } = await supabaseAdmin.from('stores').update({ verified: newVerified }).eq('id', storeId);
  return { error: error?.message };
}

export async function toggleStoreBoostAction(storeId, currentBoost) {
  const { error } = await supabaseAdmin.from('stores').update({ is_boosted: !currentBoost }).eq('id', storeId);
  return { error: error?.message };
}

export async function deleteStoreAction(storeId) {
  const { error } = await supabaseAdmin.from('stores').delete().eq('id', storeId);
  return { error: error?.message };
}

export async function getAdminStatsAction() {
  const [{ count: stores }, { count: products }, { data: users }] = await Promise.all([
    supabaseAdmin.from('stores').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.auth.admin.listUsers()
  ]);
  
  return {
    stores: stores || 0,
    products: products || 0,
    users: users?.users?.length || 0
  };
}

export async function searchStoresAction(query) {
  let dbQuery = supabaseAdmin.from('stores').select('*').order('created_at', { ascending: false }).limit(20);
  
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,store_code.ilike.%${query}%`);
  }
  
  const { data, error } = await dbQuery;
  return { data, error: error?.message };
}

// PRODUITS
export async function searchProductsAction(query) {
  let dbQuery = supabaseAdmin.from('products')
    .select('id,name,price,image_url,is_boosted,is_active,stores(name,slug)')
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }
  
  const { data, error } = await dbQuery;
  return { data, error: error?.message };
}

export async function deleteProductAction(productId) {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
  return { error: error?.message };
}

export async function toggleProductBoostAction(productId, currentBoost) {
  const { error } = await supabaseAdmin.from('products').update({ is_boosted: !currentBoost }).eq('id', productId);
  return { error: error?.message };
}

// UTILISATEURS
export async function searchUsersAction(query) {
  // listUsers does not easily support filtering via API, so we fetch and filter in memory since this is a demo/SaaS.
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) return { data: [], error: error.message };
  
  let users = data.users || [];
  if (query) {
    const lowerQuery = query.toLowerCase();
    users = users.filter(u => 
      u.email?.toLowerCase().includes(lowerQuery) || 
      u.phone?.includes(query) ||
      u.id.includes(lowerQuery)
    );
  }
  
  return { data: users.slice(0, 50), error: null }; // Return top 50
}

export async function deleteUserAction(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { error: error?.message };
}
