import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { storeSlug, storeId, message, history = [] } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message requis' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Récupérer les infos de la boutique
    let store = null;
    if (storeId) {
      const { data } = await supabase.from('stores').select('*').eq('id', storeId).single();
      store = data;
    } else if (storeSlug) {
      const { data } = await supabase.from('stores').select('*').eq('slug', storeSlug).single();
      store = data;
    }
    if (!store) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    // Récupérer les produits disponibles
    const { data: products } = await supabase
      .from('products')
      .select('name, price, description, stock_quantity, category')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .limit(30);

    const systemPrompt = `Tu es l'assistant virtuel de la boutique "${store.name}", propulsé par VeStyle.

Informations sur la boutique :
- Nom : ${store.name}
- Description : ${store.description || 'Non précisée'}
- Ville : ${store.city || 'Non précisée'}
- WhatsApp : ${store.whatsapp || store.phone || 'Non communiqué'}
- Email : ${store.email || 'Non communiqué'}

Produits disponibles (${(products || []).length}) :
${(products || []).map(p => `• ${p.name} — ${p.price?.toLocaleString()} FCFA${p.stock_quantity === 0 ? ' (RUPTURE)' : ` (${p.stock_quantity} en stock)`}${p.category ? ` [${p.category}]` : ''}${p.description ? ` — ${p.description.substring(0, 60)}` : ''}`).join('\n') || 'Aucun produit référencé'}

RÈGLES :
- Réponds TOUJOURS en français (ou dans la langue du client si différente)
- Sois chaleureux, professionnel et concis (max 3 phrases par réponse)
- Si on te demande une info que tu n'as pas, dirige vers WhatsApp : ${store.whatsapp || store.phone || 'voir les coordonnées'}
- Ne jamais inventer de prix, stocks ou informations
- Si le produit est en rupture, propose des alternatives similaires
- Tu NE peux PAS passer des commandes, mais tu peux guider vers WhatsApp pour ça`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
      body: JSON.stringify({ model: 'mistral-small-latest', messages, temperature: 0.6, max_tokens: 350 }),
    });

    if (!mistralRes.ok) throw new Error('Mistral indisponible');
    const data = await mistralRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';

    return NextResponse.json({ reply, storeName: store.name, whatsapp: store.whatsapp || store.phone });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
