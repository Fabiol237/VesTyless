import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { storeId, theme_color, accent_color, secondary_color, font_family, theme_mode, shop_theme } = await request.json();
    if (!storeId) return NextResponse.json({ error: 'storeId requis' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { error } = await supabase.from('stores').update({
      theme_color,
      accent_color,
      secondary_color,
      font_family,
      theme_mode,
      shop_theme,
      updated_at: new Date().toISOString(),
    }).eq('id', storeId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
