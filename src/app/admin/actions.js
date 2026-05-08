'use server'
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
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
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [
    { count: stores }, 
    { count: products }, 
    { data: users },
    { data: orders },
    { data: recentStores },
    { data: lastMonthOrders },
    { data: recentEvents }
  ] = await Promise.all([
    supabaseAdmin.from('stores').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin.from('orders').select('total_amount, status, created_at'),
    supabaseAdmin.from('stores').select('name, daily_views, verified, id').order('daily_views', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('total_amount').gte('created_at', lastMonth.toISOString()),
    // Fetch last 10 events across major tables for the "Live Flux"
    supabaseAdmin.rpc('get_recent_system_activity') // I will define this RPC or use multiple queries
  ]);
  
  // Alternative to RPC: Fetch recent items manually if RPC doesn't exist
  const [
    { data: rOrders }, 
    { data: rStores }
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('customer_name, total_amount, created_at').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('stores').select('name, created_at').order('created_at', { ascending: false }).limit(5)
  ]);

  const activity = [
    ...(rOrders?.map(o => ({ type: 'ORDER', msg: `Nouvelle commande: ${o.total_amount}F par ${o.customer_name}`, time: o.created_at })) || []),
    ...(rStores?.map(s => ({ type: 'STORE', msg: `Nouvelle boutique: ${s.name}`, time: s.created_at })) || [])
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
  const lastMonthRevenue = lastMonthOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
  const growth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
  
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  
  return {
    stores: stores || 0,
    products: products || 0,
    users: users?.users?.length || 0,
    totalRevenue,
    pendingOrders,
    topStores: recentStores || [],
    revenueGrowth: growth,
    activity: activity.slice(0, 10)
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
  
  return { data: users.slice(0, 50), error: null };
}

export async function deleteUserAction(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { error: error?.message };
}

// CONFIGURATION SAAS
export async function getGlobalConfigAction() {
  const { data, error } = await supabaseAdmin.from('global_config').select('*').eq('id', 'saas_settings').single();
  if (error || !data) {
    return { commission_rate: 15, maintenance_mode: false, platform_name: 'Vestyle PRO', currency: 'XAF' };
  }
  return data.value;
}

export async function updateGlobalConfigAction(newConfig) {
  const { error } = await supabaseAdmin.from('global_config').upsert({ id: 'saas_settings', value: newConfig });
  return { error: error?.message };
}

export async function getFinanceStatsAction() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

  const [
    { data: currentOrders },
    { data: previousOrders }
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('total_amount, status, created_at').gte('created_at', thirtyDaysAgo.toISOString()),
    supabaseAdmin.from('orders').select('total_amount').gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString())
  ]);

  const config = { commission_rate: 15 };

  const { data: allOrders } = await supabaseAdmin.from('orders').select('total_amount, status');

  const totalRevenue = allOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
  const currentMonthRevenue = currentOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
  const previousMonthRevenue = previousOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;

  const revenueTrend = previousMonthRevenue > 0 
    ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
    : "100";

  const commissionRate = config?.commission_rate || 15;
  
  return {
    totalRevenue,
    currentMonthRevenue,
    revenueTrend,
    commissionRate,
    platformRevenue: totalRevenue * (commissionRate / 100),
    completedOrders: allOrders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0,
    pendingOrders: allOrders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0
  };
}

export async function triggerMorningPulseAction() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().split('T')[0];

  // 1. Récupérer toutes les boutiques actives
  const { data: stores, error: storesError } = await supabaseAdmin
    .from('stores')
    .select('id, name, owner_email, daily_views');

  if (storesError) return { error: storesError.message };

  const results = [];

  for (const store of stores) {
    if (!store.owner_email) continue;

    // 2. Récupérer les ventes d'hier pour cette boutique
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('store_id', store.id)
      .gte('created_at', yesterdayISO);

    const yesterdaySales = orders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;

    // 3. Envoyer l'email Pulse
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/emails/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: store.owner_email,
          storeId: store.id, // Ajout de l'ID pour la synchro BD automatique
          subject: `Matin Pulse: ${store.name}`,
          type: 'PULSE',
          data: {
            message: `Bonjour ! Voici votre rapport de performance pour la journée d'hier.`,
            views: store.daily_views || 0,
            sales: yesterdaySales
          }
        })
      });
      
      if (response.ok) {
        results.push({ store: store.name, status: 'SENT' });
      }
    } catch (e) {
      console.error(`Pulse failed for ${store.name}:`, e);
    }
  }

  return { success: true, log: results };
}

