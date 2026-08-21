import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendFCMNotification, sendFCMMulticast } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/send
 * Envoie une notification FCM à un utilisateur ou à tous les vendeurs d'une boutique.
 * 
 * Body: {
 *   userId?:    string   — notif à un utilisateur spécifique
 *   storeId?:  string   — notif à tous les abonnés d'une boutique
 *   broadcast?: boolean — notif à tous les utilisateurs (admin seulement)
 *   notification: { title, body, link?, icon? }
 *   data?: object
 * }
 */
export async function POST(req) {
  try {
    const { userId, storeId, broadcast, notification, data } = await req.json();

    if (!notification?.title || !notification?.body) {
      return NextResponse.json({ error: 'notification.title et body requis' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let tokens = [];

    if (userId) {
      // Notif à un utilisateur spécifique
      const { data: rows } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', userId)
        .eq('is_active', true);
      tokens = rows?.map(r => r.token) || [];

    } else if (storeId) {
      // Notif à tous les abonnés d'une boutique
      const { data: rows } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('store_id', storeId)
        .eq('is_active', true);
      tokens = rows?.map(r => r.token) || [];

    } else if (broadcast) {
      // Broadcast global (admin seulement)
      const { data: rows } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('is_active', true)
        .limit(500);
      tokens = rows?.map(r => r.token) || [];
    }

    if (tokens.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Aucun token FCM trouvé pour ce destinataire' 
      });
    }

    // Envoi unique ou multicast
    let result;
    if (tokens.length === 1) {
      result = await sendFCMNotification(tokens[0], notification, data || {});
    } else {
      result = await sendFCMMulticast(tokens, notification, data || {});
    }

    // Logger la notification dans Supabase
    await supabase.from('notification_logs').insert({
      user_id:  userId || null,
      store_id: storeId || null,
      title:    notification.title,
      body:     notification.body,
      tokens_count: tokens.length,
      success:  result.success,
      sent_at:  new Date().toISOString(),
    }).select();

    return NextResponse.json(result);

  } catch (err) {
    console.error('[Notifications API] Erreur:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
