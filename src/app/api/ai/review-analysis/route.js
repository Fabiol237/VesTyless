import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Analyser des avis clients ───────────────────────────────────────
export async function POST(request) {
  try {
    const { reviews, action = 'analyze' } = await request.json();
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'Tableau de reviews requis' }, { status: 400 });
    }

    const reviewsText = reviews.map(r => `"${r.content || r.text || ''}"${r.rating ? ` [Note: ${r.rating}/5]` : ''}`).join('\n---\n');

    if (action === 'analyze') {
      const systemPrompt = `Tu es un analyste de satisfaction client pour VesTyle Marketplace.
Analyse les avis suivants et retourne UNIQUEMENT du JSON valide.

Format attendu :
{
  "overall_sentiment": "positive|negative|mixed",
  "average_score": 0-100,
  "summary": "résumé court en français (2-3 phrases)",
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1", "point faible 2"],
  "urgent_issues": ["problème critique à résoudre"],
  "actionable_tips": ["conseil 1", "conseil 2"],
  "recommended_response": "exemple de réponse aux avis négatifs"
}`;

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
            { role: 'user', content: `Voici les avis clients à analyser:\n${reviewsText}\n\nAnalyse au format JSON.` },
          ],
          temperature: 0.3,
          max_tokens: 500,
          responseFormat: { type: 'json_object' },
        }),
      });

      if (!mistralRes.ok) throw new Error(`Mistral: ${mistralRes.status}`);
      const data = await mistralRes.json();
      const raw = data.choices?.[0]?.message?.content || '{}';
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = { overall_sentiment: 'mixed', summary: 'Analyse non disponible' }; }

      return NextResponse.json({
        success: true,
        reviewCount: reviews.length,
        analysis: parsed,
      });
    }

    if (action === 'respond') {
      // Générer une réponse à un avis spécifique
      const singleReview = reviews[0];
      const isPositive = singleReview.rating >= 4 || !singleReview.rating;

      const systemPrompt = `Tu es le service client de VesTyle Marketplace.
Rédige une réponse ${isPositive ? 'de remerciement chaleureuse' : 'professionnelle et empathique'} à cet avis client.
Sois concis (max 3 phrases), en français. Si l'avis est négatif, propose une solution.`;

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
            { role: 'user', content: `Avis: "${singleReview.content || singleReview.text}"\nNote: ${singleReview.rating || 'Non noté'}/5\nGénère la réponse.` },
          ],
          temperature: 0.6,
          max_tokens: 200,
        }),
      });

      if (!mistralRes.ok) throw new Error(`Mistral: ${mistralRes.status}`);
      const data2 = await mistralRes.json();
      const response = data2.choices?.[0]?.message?.content?.trim() || '';

      return NextResponse.json({ success: true, response });
    }

    return NextResponse.json({ error: `Action "${action}" inconnue` }, { status: 400 });

  } catch (error) {
    console.error('[Review Analysis Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
