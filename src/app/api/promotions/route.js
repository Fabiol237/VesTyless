import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET — Lister les promotions d'une boutique
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
    .from('promotions')
    .select('*')
    .eq('store_id', storeId)
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const enhanced = (data || []).map(p => ({
    ...p,
    status: new Date(p.end_date) < now ? 'expired' : new Date(p.start_date) > now ? 'scheduled' : 'active',
  }));
  return NextResponse.json({ promotions: enhanced });
}

// POST — Créer une promotion
export async function POST(request) {
  try {
    const body = await request.json();
    const { storeId, title, description, discount_type, discount_value, start_date, end_date, applicable_to, products, show_countdown, countdown_text } = body;

    if (!storeId || !title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    if (new Date(end_date) <= new Date(start_date)) {
      return NextResponse.json({ error: 'La date de fin doit être après la date de début' }, { status: 422 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data, error } = await supabase.from('promotions').insert({
      store_id:       storeId,
      title,
      description:    description || '',
      discount_type:  discount_type || 'percentage',
      discount_value: parseFloat(discount_value) || 0,
      start_date,
      end_date,
      applicable_to:  applicable_to || 'all',
      products:       products || [],
      show_countdown: show_countdown ?? true,
      countdown_text: countdown_text || 'Offre expire dans :',
      is_active:      true,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, promotion: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Supprimer une promotion
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH — Activer/Désactiver
export async function PATCH(request) {
  const { id, is_active } = await request.json();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  await supabase.from('promotions').update({ is_active }).eq('id', id);
  return NextResponse.json({ success: true });
}
