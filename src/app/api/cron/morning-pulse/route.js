import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('[CRON] Déclenchement du Matin Pulse...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    // 1. Récupérer toutes les boutiques actives
    const { data: stores, error: storesError } = await supabaseAdmin
      .from('stores')
      .select('id, name, owner_email, daily_views');

    if (storesError) throw new Error(storesError.message);

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
            storeId: store.id,
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
    
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
