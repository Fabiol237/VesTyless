import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Récupérer la boutique de l'utilisateur
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (storeError || !store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    // 2. Calculer les statistiques en parallèle
    const [ordersResult, productsResult] = await Promise.all([
      supabase.from('orders').select('total_amount, status, created_at').eq('store_id', store.id),
      supabase.from('products').select('stock_quantity').eq('store_id', store.id)
    ]);

    const { data: orders, error: ordersError } = ordersResult;
    const { data: products, error: productsError } = productsResult;

    if (ordersError || productsError) throw new Error('Failed to fetch data');

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStockCount = products.filter(p => p.stock_quantity <= 5).length;

    // 3. Stats par jour (7 derniers jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDay = last7Days.map(date => {
      const dayTotal = orders
        .filter(o => o.created_at.startsWith(date) && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
      return { date, total: dayTotal };
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      lowStockCount,
      revenueByDay
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
