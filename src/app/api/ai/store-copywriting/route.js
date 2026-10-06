import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      storeName = 'Ma Boutique',
      storeCity = 'Douala',
      storeWhatsApp = '237690000000',
      sellerPrompt = '',
      businessType = 'general',
    } = body;

    const mistralApiKey = process.env.MISTRAL_API_KEY;

    const systemPrompt = `Tu es le Copywriter & Directeur Artistique IA d'élite de VesTyle, marketplace au Cameroun.
Ta mission : Créer le copywriting complet (En-tête, Titre Hero, Slogan, Badge, CTA, Réassurance et 3 Produits d'exemple réalistes) pour une boutique, UNIQUEMENT basé sur les informations réelles fournies par le vendeur.
RÈGLES ABSOLUES :
1. ZÉRO FAUSSE INFORMATION. Tout doit être cohérent avec ce que le vendeur dit vendre.
2. Les prix doivent être en FCFA réalistes pour le marché camerounais (Douala / Yaoundé).
3. Adapte le vocabulaire local (ex: FCFA, MTN MoMo, Orange Money, quartiers de Douala/Yaoundé si mentionnés).
4. Détermine l'index du design recommandé (0 = Mode, 1 = Restaurant/Gastro, 2 = Beauté/Services, 3 = Élevage/Agro, 4 = Location/Immo/Auto, 5 = Commerce Général/Librairie).

Réponds UNIQUEMENT avec un objet JSON valide suivant exactement ce schéma :
{
  "heroTitle": "Titre d'en-tête ultra accrocheur (max 8-10 mots)",
  "heroSubtitle": "Slogan vendeur percutant (1-2 phrases)",
  "heroBadge": "Badge accrocheur en majuscules (ex: '🔥 PLATS CHAUDS DU JOUR', '📚 FOURNISSEUR AGRÉÉ ÉCOLES', '✨ CRÉATIONS SUR-MESURE')",
  "ctaText": "Texte du bouton d'action principal (ex: 'Commander mes livres', 'Réserver une table', 'Prendre rendez-vous')",
  "trustBadgeText": "Texte de réassurance locale (ex: 'Paiement MTN MoMo / Orange Money & Livraison Douala Express')",
  "whatsappOrderPrefix": "Phrase de commande pré-remplie sur WhatsApp",
  "suggestedDesignIndex": 0,
  "generatedProducts": [
    {
      "name": "Nom précis de l'article",
      "price": 5000,
      "priceFormatted": "5 000 FCFA",
      "category": "Rayon / Catégorie",
      "tag": "Badge produit",
      "metaInfo": "Détail métier (ex: Taille M, 2.8 kg, Durée 45 min, etc.)",
      "description": "Description vendeuse courte de l'article"
    }
  ]
}`;

    const userPrompt = `Voici les données du vendeur :
- Nom de la boutique : "${storeName}"
- Ville : "${storeCity}, Cameroun"
- Numéro WhatsApp : "+${storeWhatsApp}"
- Ce que le vendeur dit vouloir vendre (Intention réelle) : "${sellerPrompt || storeName}"

Génère le copywriting complet et les 3 produits d'exception au format JSON.`;

    if (mistralApiKey) {
      const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
        }),
      });

      if (mistralRes.ok) {
        const data = await mistralRes.json();
        const content = data.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return NextResponse.json({ success: true, result: parsed, source: 'mistral-ai' });
        }
      }
    }

    // Fallback Déterministe Intelligent si l'API Mistral n'est pas joignable
    const lower = (sellerPrompt || storeName).toLowerCase();
    let designIdx = 5; // Default: Commerce / Librairie
    let heroBadge = '📚 ARTICLES DISPONIBLES EN BOUTIQUE';
    let ctaText = 'Découvrir nos offres';
    let trustBadgeText = 'Paiement MTN MoMo / Orange Money & Livraison Douala / Yaoundé';
    let whatsappOrderPrefix = `Bonjour ${storeName}, je souhaite commander :`;

    if (lower.includes('mode') || lower.includes('wax') || lower.includes('robe') || lower.includes('couture')) {
      designIdx = 0;
      heroBadge = '✨ HAUTE COUTURE & CRÉATIONS SUR-MESURE';
      ctaText = 'Commander sur-mesure';
    } else if (lower.includes('poisson') || lower.includes('resto') || lower.includes('ndol') || lower.includes('grill')) {
      designIdx = 1;
      heroBadge = '🔥 SERVICE CHAUD DU JOUR • OUVERT ACTUELLEMENT';
      ctaText = 'Commander mon plat';
    } else if (lower.includes('coiffure') || lower.includes('perruque') || lower.includes('beauté') || lower.includes('soin')) {
      designIdx = 2;
      heroBadge = '💎 PRESTATIONS VIP SUR RENDEZ-VOUS';
      ctaText = 'Prendre rendez-vous';
    } else if (lower.includes('poulet') || lower.includes('ferme') || lower.includes('elevage') || lower.includes('oeuf')) {
      designIdx = 3;
      heroBadge = '🌿 100% FERME LOCALE • PRODUITS FRAIS';
      ctaText = 'Commander à la ferme';
    } else if (lower.includes('location') || lower.includes('voiture') || lower.includes('appartement')) {
      designIdx = 4;
      heroBadge = '🔑 VÉHICULES & BIENS DISPONIBLES';
      ctaText = 'Vérifier les disponibilités';
    }

    return NextResponse.json({
      success: true,
      result: {
        heroTitle: `${storeName} • ${sellerPrompt || 'Votre référence d’excellence'}`,
        heroSubtitle: `Retrouvez nos offres et prestations sélectionnées à ${storeCity} avec commande directe sur WhatsApp.`,
        heroBadge,
        ctaText,
        trustBadgeText,
        whatsappOrderPrefix,
        suggestedDesignIndex: designIdx,
      },
      source: 'deterministic-fallback',
    });
  } catch (err) {
    console.error('[StoreCopywriting API] Erreur :', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
