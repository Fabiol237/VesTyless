import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Générer description produit SEO-friendly ──────────────────────────
export async function POST(request) {
  try {
    const { name, category, keywords, tone = 'professional', lang = 'fr', length = 'medium' } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 });
    }

    const lengthMap = { short: '2-3 phrases, max 50 mots', medium: '4-6 phrases, max 120 mots', long: '7-10 phrases, max 250 mots' };
    const toneMap = {
      professional: 'Professionnel, rassurant, mise sur la qualité et la durabilité',
      luxury: 'Élégant, exclusif, vocabulaire premium',
      casual: 'Décontracté, jeune, accessible, emojis possibles',
      urgent: 'Urgent, promo, stock limité, FOMO',
      seo: 'Optimisé SEO avec mots-clés naturels, maximum de variantes',
    };

    const systemPrompt = `Tu es un copywriter e-commerce expert pour VesTyle (marketplace camerounaise).
Génère une description de produit ${toneMap[tone] || toneMap.professional}.
Langue: ${lang === 'fr' ? 'Français' : lang === 'en' ? 'Anglais' : 'Français'}
Longueur: ${lengthMap[length] || lengthMap.medium}

RÈGLES :
- Ne jamais inventer de caractéristiques techniques
- Inclure les mots-clés fournis naturellement
- Structure : accroche → bénéfices → appel à l'action
- Pas de prix dans la description
- UNIQUEMENT la description, sans titre, sans guillemets`;

    const userMessage = `Produit: "${name}"
${category ? `Catégorie: ${category}` : ''}
${keywords?.length ? `Mots-clés: ${keywords.join(', ')}` : ''}
Génère la description.`;

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: length === 'long' ? 400 : length === 'medium' ? 250 : 150,
      }),
    });

    if (!mistralRes.ok) {
      const err = await mistralRes.text();
      throw new Error(`Mistral API: ${mistralRes.status}`);
    }

    const data = await mistralRes.json();
    const description = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      success: true,
      description,
      wordCount: description.split(/\s+/).length,
      meta: {
        tone,
        lang,
        length,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Product Description Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
