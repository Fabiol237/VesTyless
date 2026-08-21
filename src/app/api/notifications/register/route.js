import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/register
 * Enregistre ou met à jour le FCM token d'un utilisateur.
 * 
 * Body: { fcmToken, userId, storeId? }
 */
export async function POST(req) {
  try {
    const { fcmToken, userId, storeId } = await req.json();

    if (!fcmToken || !userId) {
      return NextResponse.json({ error: 'fcmToken et userId requis' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Upsert du token FCM
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id:    userId,
        token:      fcmToken,
        store_id:   storeId || null,
        is_active:  true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'token' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Token FCM enregistré' });

  } catch (err) {
    console.error('[Notifications Register] Erreur:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/register
 * Désactive le token FCM (désinscription aux notifications).
 */
export async function DELETE(req) {
  try {
    const { fcmToken } = await req.json();
    if (!fcmToken) return NextResponse.json({ error: 'fcmToken requis' }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    await supabase
      .from('fcm_tokens')
      .update({ is_active: false })
      .eq('token', fcmToken);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
