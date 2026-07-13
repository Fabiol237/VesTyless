import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ─── GET : Liste des versions ─────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');
  if (!storeId) return NextResponse.json({ error: 'storeId requis' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data, error } = await supabase
    .from('store_versions')
    .select('id, label, description, modules_count, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data || [] });
}

// ─── POST : Sauvegarder une version ──────────────────────────────────────────
export async function POST(request) {
  try {
    const { storeId, label, description } = await request.json();
    if (!storeId) return NextResponse.json({ error: 'storeId requis' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const [{ data: store }, { data: modules }] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId).single(),
      supabase.from('store_modules').select('*').eq('store_id', storeId).order('position'),
    ]);

    const snapshot = {
      store_id:      storeId,
      label:         label || `Version du ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
      description:   description || '',
      modules_count: (modules || []).length,
      modules_data:  modules || [],
      theme_data: {
        theme_color:     store?.theme_color,
        secondary_color: store?.secondary_color,
        accent_color:    store?.accent_color,
        font_family:     store?.font_family,
        theme_mode:      store?.theme_mode,
      },
    };

    const { data, error } = await supabase.from('store_versions').insert(snapshot).select().single();
    if (error) throw error;

    // Garder seulement les 20 dernières versions
    const { data: oldVersions } = await supabase
      .from('store_versions')
      .select('id')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .range(20, 100);
    if (oldVersions?.length > 0) {
      await supabase.from('store_versions').delete().in('id', oldVersions.map(v => v.id));
    }

    return NextResponse.json({ success: true, version: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── PUT : Restaurer une version ──────────────────────────────────────────────
export async function PUT(request) {
  try {
    const { storeId, versionId } = await request.json();
    if (!storeId || !versionId) return NextResponse.json({ error: 'storeId et versionId requis' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: version } = await supabase.from('store_versions').select('*').eq('id', versionId).single();
    if (!version) return NextResponse.json({ error: 'Version introuvable' }, { status: 404 });

    // Sauvegarder l'état actuel avant restauration
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/store/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      body: JSON.stringify({ storeId, label: '⚡ Avant restauration (auto-sauvegarde)', description: 'Créé automatiquement avant la restauration' }),
    });

    // Supprimer les modules actuels et restaurer
    await supabase.from('store_modules').delete().eq('store_id', storeId);
    if (version.modules_data?.length > 0) {
      await supabase.from('store_modules').insert(
        version.modules_data.map(m => ({ ...m, store_id: storeId }))
      );
    }

    // Restaurer le thème
    if (version.theme_data) {
      await supabase.from('stores').update({ ...version.theme_data, updated_at: new Date().toISOString() }).eq('id', storeId);
    }

    const { data: updatedModules } = await supabase
      .from('store_modules').select('*').eq('store_id', storeId).order('position');

    return NextResponse.json({ success: true, updatedModules, themeData: version.theme_data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
