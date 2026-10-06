import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
}

/**
 * GET /api/store/config?storeId=...
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Paramètre storeId requis.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data: store, error } = await supabase
      .from('stores')
      .select('id, name, slug, draft_config, published_config, status')
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mode: store.status || 'draft',
      config: store.draft_config || store.published_config || {},
    });
  } catch (err) {
    console.error('[Store Config API] GET Error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

/**
 * PUT /api/store/config
 */
export async function PUT(req) {
  try {
    const body = await req.json();
    const { storeId, draftConfig } = body || {};

    if (!storeId || !draftConfig) {
      return NextResponse.json({ error: 'storeId et draftConfig requis.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('stores')
      .update({
        draft_config: draftConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      draftConfig: data.draft_config,
    });
  } catch (err) {
    console.error('[Store Config API] PUT Error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

/**
 * POST /api/store/config
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { storeId, action = 'publish' } = body || {};

    if (!storeId) {
      return NextResponse.json({ error: 'storeId requis.' }, { status: 400 });
    }

    const supabase = await getSupabase();

    if (action === 'publish') {
      const { data: store } = await supabase.from('stores').select('draft_config').eq('id', storeId).single();
      const configToPublish = store?.draft_config || {};

      const { data, error } = await supabase
        .from('stores')
        .update({
          published_config: configToPublish,
          published_at: new Date().toISOString(),
          status: 'published',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({
        success: true,
        action: 'publish',
        publishedConfig: data.published_config,
        publishedAt: data.published_at,
      });
    }

    return NextResponse.json({ error: `Action inconnue : ${action}` }, { status: 400 });
  } catch (err) {
    console.error('[Store Config API] POST Error:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
