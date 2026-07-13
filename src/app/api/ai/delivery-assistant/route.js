import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Assistant livraison (itinéraire, transcription vocale, statut) ──────
export async function POST(request) {
  try {
    const { action, query, deliveryLat, deliveryLng, storeLat, storeLng } = await request.json();
    if (!action) {
      return NextResponse.json({ error: 'action requise' }, { status: 400 });
    }

    switch (action) {
      case 'voice_to_address': {
        // Transcrire une commande vocale en adresse
        if (!query) return NextResponse.json({ error: 'Transcription requise' }, { status: 400 });

        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
              { role: 'system', content: `Tu es un assistant de livraison pour le Cameroun.
Extrais les informations de livraison à partir d'une transcription vocale.
Réponds UNIQUEMENT en JSON valide:
{
  "address": "adresse complète extraite ou déduite",
  "city": "ville (Douala, Yaoundé, etc.)",
  "landmark": "point de repère si mentionné",
  "recipient_name": "nom du destinataire si mentionné",
  "recipient_phone": "téléphone si mentionné",
  "instructions": "instructions spéciales si mentionnées",
  "confidence": 0-100
}` },
              { role: 'user', content: `Transcription vocale: "${query}"
Extrais les infos de livraison au format JSON.` },
            ],
            temperature: 0.2,
            max_tokens: 300,
            responseFormat: { type: 'json_object' },
          }),
        });

        if (!mistralRes.ok) throw new Error('Mistral indisponible');
        const data = await mistralRes.json();
        const raw = data.choices?.[0]?.message?.content || '{}';
        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = { address: query, city: '', confidence: 30 }; }

        return NextResponse.json({ success: true, extraction: parsed });
      }

      case 'optimize_route': {
        // Suggérer un ordre de livraison optimal basé sur les adresses
        if (!query) return NextResponse.json({ error: 'Adresses requises' }, { status: 400 });

        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
              { role: 'system', content: `Tu es un logisticien expert au Cameroun.
Organise ces adresses de livraison dans l'ordre optimal (plus court trajet).
Réponds en JSON: {"optimized_order": [{"position": 1, "original": "adresse", "city": "ville", "note": "conseil"}], "estimated_km": nombre, "estimated_minutes": nombre, "tip": "astuce locale"}` },
              { role: 'user', content: `Adresses de livraison: ${query}
Optimise l'ordre de tournée au format JSON.` },
            ],
            temperature: 0.2,
            max_tokens: 400,
            responseFormat: { type: 'json_object' },
          }),
        });

        if (!mistralRes.ok) throw new Error('Mistral indisponible');
        const data2 = await mistralRes.json();
        const raw2 = data2.choices?.[0]?.message?.content || '{}';
        let parsed2;
        try { parsed2 = JSON.parse(raw2); } catch { parsed2 = { optimized_order: [], estimated_km: 0, estimated_minutes: 0 }; }

        return NextResponse.json({ success: true, route: parsed2 });
      }

      case 'customer_update': {
        // Générer un message pour le client sur l'état de livraison
        if (!query) return NextResponse.json({ error: 'Contexte requis' }, { status: 400 });

        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
              { role: 'system', content: `Génère un message WhatsApp court et rassurant pour un client camerounais.
Le livreur s'appelle "VesTyle Express". Sois chaleureux, utilise le "tu", max 2 phrases.
Inclus si possible l'heure estimée d'arrivée.` },
              { role: 'user', content: `Contexte: ${query}
Génère le message pour le client.` },
            ],
            temperature: 0.6,
            max_tokens: 150,
          }),
        });

        if (!mistralRes.ok) throw new Error('Mistral indisponible');
        const data3 = await mistralRes.json();
        const message = data3.choices?.[0]?.message?.content?.trim() || '';

        return NextResponse.json({ success: true, message });
      }

      default:
        return NextResponse.json({ error: `Action "${action}" inconnue` }, { status: 400 });
    }

  } catch (error) {
    console.error('[Delivery Assistant Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
