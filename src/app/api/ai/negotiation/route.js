import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Négociation de prix automatique ─────────────────────────────────
export async function POST(request) {
  try {
    const { storeId, productId, customerOffer, customerName, customerMessage, product } = await request.json();
    if (!productId || !customerOffer) {
      return NextResponse.json({ error: 'productId et customerOffer requis' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Récupérer le produit (soit passé en paramètre, soit depuis la BD)
    let productData = product;
    if (!productData && storeId) {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, description, stock_quantity, store_id')
        .eq('id', productId)
        .single();
      productData = data;
    }

    if (!productData) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });

    const originalPrice = Number(productData.price);
    const offerAmount = Number(customerOffer);

    // Récupérer le store pour connaitre ses préférences
    let store = null;
    if (storeId) {
      const { data } = await supabase.from('stores').select('id, name, business_type').eq('id', storeId).single();
      store = data;
    }

    // Calculer le seuil de flexibilité (on peut le parametrer par boutique plus tard)
    const MIN_PRICE_PERCENT = 70; // Ne jamais descendre en dessous de 70% du prix
    const minAcceptable = originalPrice * (MIN_PRICE_PERCENT / 100);

    const systemPrompt = `Tu es un négociateur IA pour VesTyle Marketplace.
Ton rôle est de négocier le prix d'un produit avec un client de manière commerciale et gagnant-gagnant.
Tu dois maximiser la vente tout en restant flexible selon l'offre.

RÈGLES :
- Prix original: ${originalPrice.toLocaleString()} FCFA
- Prix minimum acceptable: ${minAcceptable.toLocaleString()} FCFA (${MIN_PRICE_PERCENT}% du prix)
- Si l'offre >= 90% du prix → accepter avec remerciements
- Si l'offre entre 80-89% → contre-proposer à 92% du prix original
- Si l'offre entre 70-79% → contre-proposer à 85% du prix original
- Si l'offre < 70% → refuser poliment, proposer le prix minimum acceptable
- Toujours rester courtois et professionnel

Réponds UNIQUEMENT en JSON valide:
{
  "decision": "accepted|counter|declined",
  "counterOffer": montant_en_fcfa (si contre-proposition),
  "message": "message au client en français, chaleureux",
  "savings": économie_par_rapport_au_prix_original,
  "finalPrice": prix_final_accepté_ou_proposé,
  "reason": "explication simple de la décision"
}`;

    const userMessage = `Produit: "${productData.name}"
Prix original: ${originalPrice.toLocaleString()} FCFA
Offre du client ${customerName || 'anonyme'}: ${offerAmount.toLocaleString()} FCFA
${customerMessage ? `Message: "${customerMessage}"` : ''}
${store ? `Boutique: ${store.name} (${store.business_type || 'ecommerce'})` : ''}

Analyse la négociation et réponds au format JSON.`;

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 300,
        responseFormat: { type: 'json_object' },
      }),
    });

    if (!mistralRes.ok) throw new Error(`Mistral: ${mistralRes.status}`);

    const data = await mistralRes.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { decision: 'counter', counterOffer: minAcceptable, message: 'Faisons une contre-proposition.' }; }

    return NextResponse.json({
      success: true,
      negotiation: {
        decision: parsed.decision || 'counter',
        counterOffer: Math.round(parsed.counterOffer || minAcceptable),
        message: parsed.message || 'Merci pour votre offre.',
        savings: Math.round(parsed.savings || (originalPrice - (parsed.finalPrice || originalPrice))),
        finalPrice: Math.round(parsed.finalPrice || (parsed.decision === 'accepted' ? offerAmount : parsed.counterOffer || minAcceptable)),
        reason: parsed.reason || '',
        originalPrice,
        customerOffer: offerAmount,
        minAcceptable,
      },
    });

  } catch (error) {
    console.error('[Negotiation Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
