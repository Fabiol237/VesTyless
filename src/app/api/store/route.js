import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  try {
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
    return user || null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'Paramètre storeId requis.' }, { status: 400 });
    }

    const user = await getAuthenticatedUser();
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json({ success: false, error: 'Boutique introuvable.' }, { status: 404 });
    }

    if (user && store.owner_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Accès refusé à cette boutique.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, store });
  } catch (err) {
    console.error('[Store API] GET Exception:', err);
    return NextResponse.json({ success: false, error: 'Erreur lors du chargement de la boutique.' }, { status: 500 });
  }
}
