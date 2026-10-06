import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/manage?storeId=...&limit=...&unreadOnly=...
 * ─────────────────────────────────────────────────────────────────────────────
 * Récupère les notifications réelles pour la boutique active (isolation stricte).
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!storeId) {
      return NextResponse.json(
        { error: 'Paramètre storeId requis pour filtrer les notifications' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[Notifications Manage API] GET error:', error.message);
      return NextResponse.json({ notifications: [], error: error.message }, { status: 200 });
    }

    return NextResponse.json({
      notifications: data || [],
      unreadCount: (data || []).filter(n => !n.is_read).length,
    });
  } catch (err) {
    console.error('[Notifications Manage API] GET Exception:', err);
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications/manage
 * ─────────────────────────────────────────────────────────────────────────────
 * Marque une ou toutes les notifications d'une boutique comme lues.
 *
 * Payload :
 *   - { storeId: string, markAllRead: true }
 *   - { storeId: string, notificationId: string, isRead?: boolean }
 */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { storeId, notificationId, markAllRead, isRead = true } = body || {};

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 });
    }

    // 1. Tout marquer comme lu pour la boutique
    if (markAllRead) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('store_id', storeId)
        .eq('is_read', false);

      if (error) {
        console.warn('[Notifications Manage API] Mark all read error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, allRead: true });
    }

    // 2. Marquer une notification spécifique comme lue / non-lue
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId requis si markAllRead n\'est pas actif' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: Boolean(isRead) })
      .eq('id', notificationId)
      .eq('store_id', storeId) // Isolation stricte
      .select()
      .single();

    if (error) {
      console.warn('[Notifications Manage API] Update single notif error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err) {
    console.error('[Notifications Manage API] PATCH Exception:', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des notifications' }, { status: 500 });
  }
}
