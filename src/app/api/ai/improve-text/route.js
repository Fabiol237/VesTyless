import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, field, context } = await req.json();

    // Si la clé API n'est pas configurée, on utilise un fallback pour éviter les erreurs
    if (!process.env.MISTRAL_API_KEY) {
      console.warn("Clé MISTRAL_API_KEY manquante. Utilisation de la simulation de repli.");
      // Petite simulation de repli
      let fallbackText = text;
      if (field === 'headline') fallbackText = `✨ ${text} ✨`;
      if (field === 'subtext' || field === 'subheadline') fallbackText = `Découvrez notre excellence : ${text}`;
      return NextResponse.json({ improved: fallbackText });
    }

    const systemPrompt = `Tu es un expert en copywriting, marketing digital et design d'interface.
Ton objectif est d'améliorer et de sublimer le texte fourni pour une boutique en ligne haut de gamme.
Contexte de la boutique: ${context || 'Non précisé'}.
Le texte est destiné au champ: "${field}".

Règles strictes :
1. Sois percutant, professionnel et vendeur.
2. Garde le texte court et adapté à une interface web.
3. Réponds UNIQUEMENT avec le texte amélioré. Pas de guillemets, pas de commentaires, pas d'intro.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text || "Génère un texte accrocheur." }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur Mistral API: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const improved = data.choices[0].message.content.trim();

    return NextResponse.json({ improved });

  } catch (error) {
    console.error('[Mistral Improve Text Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
