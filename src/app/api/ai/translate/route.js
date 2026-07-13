import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Traduction multilingue avec Mistral ──────────────────────────────
export async function POST(request) {
  try {
    const { text, sourceLang = 'fr', targetLang = 'en', context = 'product', preserveFormat = true } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Texte à traduire requis' }, { status: 400 });
    }

    const langMap = {
      fr: 'Français',
      en: 'Anglais',
      wo: 'Wolof',
      ff: 'Peul (Fulfulde)',
      bm: 'Bambara',
      es: 'Espagnol',
      pt: 'Portugais',
      ar: 'Arabe',
    };

    const sourceName = langMap[sourceLang] || sourceLang;
    const targetName = langMap[targetLang] || targetLang;

    const systemPrompt = `Tu es un traducteur expert pour VesTyle Marketplace, spécialisé dans le e-commerce et les langues africaines.

Contexte de traduction: ${context === 'product' ? 'Description de produit à vendre' : context === 'store' ? 'Description de boutique' : context === 'chat' ? 'Message de chat client' : 'Contenu général'}

RÈGLES :
- Traduis UNIQUEMENT le texte, pas d'explications
- Garde le ton commercial et professionnel
- Respecte le format original (gras, listes, emojis)
- ${preserveFormat ? 'Conserve la mise en forme (**, -, etc.)' : 'Adapte naturellement'}
- Si un mot n'a pas d'équivalent direct, garde le mot source entre parenthèses
- Réponds UNIQUEMENT avec le texte traduit, sans guillemets ni commentaires`;

    const userMessage = `Traduis ce texte du ${sourceName} vers le ${targetName}:

"""
${text}
"""

Traduction:`;

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
        temperature: 0.3,
        max_tokens: Math.min(text.length * 2, 2000),
      }),
    });

    if (!mistralRes.ok) throw new Error(`Mistral: ${mistralRes.status}`);

    const data = await mistralRes.json();
    const translated = data.choices?.[0]?.message?.content?.trim() || text;

    return NextResponse.json({
      success: true,
      originalText: text,
      translatedText: translated,
      sourceLang,
      targetLang,
      sourceName,
      targetName,
      wordCount: {
        original: text.split(/\s+/).length,
        translated: translated.split(/\s+/).length,
      },
    });

  } catch (error) {
    console.error('[Translate Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
