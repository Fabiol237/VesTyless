import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Modérer un contenu (produit, description, avis) ───────────────────
export async function POST(request) {
  try {
    const { content, type = 'product', contentId } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
    }

    const systemPrompt = `Tu es un modérateur IA pour VesTyle, une marketplace camerounaise.
Analyse le ${type} suivant et réponds UNIQUEMENT en JSON valide.

Critères d'évaluation :
1. VIOLATIONS (objectif) : contenu interdit (armes, drogues, discours haineux, spam, escroquerie)
2. QUALITÉ : le contenu est-il clair, professionnel, sans fautes graves ?
3. PRIX ABERRANT : le prix est-il suspect (trop bas ou trop haut pour ce type de produit) ?
4. CATÉGORIE : la description correspond-elle à la catégorie indiquée ?
5. SPAM : contenu générique, répétitif, liens suspects ?

Format de réponse :
{
  "approved": true/false,
  "confidence": 0-100,
  "flags": ["violation_type_ou_qualite_ou_prix"],
  "reasons": ["explication claire en français"],
  "suggested_fix": "suggestion d'amélioration (si qualité < 50)",
  "suggested_category": "catégorie suggérée si incohérente",
  "estimated_legitimate_price_range": {"min": 0, "max": 0, "currency": "FCFA"}
}`;

    const userMessage = `Contenu à modérer (type: ${type}):
"""
${content.substring(0, 2000)}
"""

Analyse ce contenu et retourne le JSON d'évaluation.`;

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
        temperature: 0.1,
        max_tokens: 500,
        responseFormat: { type: 'json_object' },
      }),
    });

    if (!mistralRes.ok) {
      const err = await mistralRes.text();
      throw new Error(`Mistral API: ${mistralRes.status}`);
    }

    const data = await mistralRes.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { approved: false, flags: ['parse_error'], reasons: ['Erreur d\'analyse du modérateur'] };
    }

    return NextResponse.json({
      success: true,
      moderation: {
        approved: parsed.approved === true,
        confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 50)),
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        suggestedFix: parsed.suggested_fix || null,
        suggestedCategory: parsed.suggested_category || null,
        estimatedPriceRange: parsed.estimated_legitimate_price_range || null,
      },
    });

  } catch (error) {
    console.error('[Moderation Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
