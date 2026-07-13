import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Classifier un produit (catégorie + tags) ──────────────────────────
export async function POST(request) {
  try {
    const { name, description, existingCategories = [] } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 });
    }

    const categoriesStr = existingCategories.length > 0
      ? existingCategories.join(', ')
      : 'Mode, Alimentation, High-Tech, Maison, Santé, Beauté, Sport, Loisirs, Services, Animaux';

    const systemPrompt = `Tu es un expert en catégorisation de produits e-commerce.
Analyse le produit et retourne UNIQUEMENT du JSON valide.

Format attendu :
{
  "category": "nom de la catégorie la plus adaptée",
  "confidence": 0-100,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "subcategory": "sous-catégorie si pertinente",
  "reason": "explication courte de pourquoi cette catégorie"
}

Catégories disponibles: ${categoriesStr}

RÈGLES :
- Choisis TOUJOURS UNE catégorie parmi celles listées
- Les tags doivent être en français, pertinents pour la recherche
- 3-5 tags maximum
- Si le nom suffit, utilise-le. Ne base pas sur la description seule.`;

    const userMessage = `Nom du produit: "${name}"${description ? `\nDescription: "${description.substring(0, 500)}"` : ''}\n\nAnalyse et classifie ce produit au format JSON.`;

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
        max_tokens: 300,
        responseFormat: { type: 'json_object' },
      }),
    });

    if (!mistralRes.ok) throw new Error(`Mistral API: ${mistralRes.status}`);

    const data = await mistralRes.json();
    const raw = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { category: existingCategories[0] || 'Divers', tags: [], confidence: 0 }; }

    return NextResponse.json({
      success: true,
      classification: {
        category: parsed.category || existingCategories[0] || 'Divers',
        confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 0)),
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        subcategory: parsed.subcategory || null,
        reason: parsed.reason || '',
      },
    });

  } catch (error) {
    console.error('[Classify Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
