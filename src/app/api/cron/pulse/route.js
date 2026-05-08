import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// On utilise les clés admin car c'est un job système
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

export async function GET(req) {
  // Sécurité : Vérifier une clé secrète pour éviter que n'importe qui déclenche le pulse
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Récupérer toutes les boutiques actives
    const { data: stores, error: storesErr } = await supabase
      .from('stores')
      .select('id, name, owner_id');

    if (storesErr) throw storesErr;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pulseResults = [];

    for (const store of stores) {
      // 2. Calculer les ventes de la veille pour cette boutique
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('store_id', store.id)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (ordersErr) continue;

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const totalOrders = orders.length;

      // 3. Créer la notification "Vestyle Pulse"
      let message = "";
      if (totalOrders > 0) {
        message = `Hier, vous avez réalisé ${totalOrders} vente(s) pour un total de ${totalRevenue.toLocaleString()} F. Continuez comme ça !`;
      } else {
        message = "Aucune vente hier. C'est le moment de partager vos produits sur WhatsApp pour attirer des clients !";
      }

      await supabase.from('notifications').insert([{
        user_id: store.owner_id,
        store_id: store.id,
        type: 'daily_pulse',
        title: `🌞 Bilan du Matin : ${store.name}`,
        message: message
      }]);

      pulseResults.push({ store: store.name, orders: totalOrders, revenue: totalRevenue });
    }

    return NextResponse.json({ success: true, processed: pulseResults.length, details: pulseResults });
  } catch (error) {
    console.error('Pulse Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
