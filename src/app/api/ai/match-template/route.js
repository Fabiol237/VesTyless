/**
 * API Route : VESTIN AI Template Matcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Le vendeur décrit sa boutique en langage naturel.
 * Mistral/Jina analysent la description et sélectionnent les 3 templates
 * les plus pertinents depuis la bibliothèque Vestin.
 *
 * Input : { description: string, storeId?: string }
 * Output : { templates: TemplateMatch[], intent: ParsedIntent }
 */

import { NextResponse } from 'next/server';
import { TEMPLATE_LIBRARY } from '@/lib/template-library';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ── Fournisseur Mistral ──────────────────────────────────────────────────────
const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

async function callMistral(description) {
  if (!MISTRAL_KEY) throw new Error('MISTRAL_API_KEY manquant');

  const systemPrompt = `Tu es l'assistant de configuration de boutique Vestin.
Tu analyses la description d'une boutique faite par un vendeur africain et tu retournes :
1. Le secteur principal (hotel|restaurant|fashion|beauty|bakery|electronics|hairdresser|supermarket|furniture|real_estate|accessories|jewelry|pharmacy|auto)
2. Le style visuel préféré (luxe|minimal|bold|warm|tech|artisanal)
3. Les données disponibles (products|services|gallery|reviews|promotions)
4. Une description reformulée en 1 phrase courte et précise

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "sector": "restaurant",
  "style": "warm",
  "dataHints": ["products", "gallery"],
  "reformulated": "Restaurant africain traditionnel avec plats locaux",
  "confidence": 0.92
}`;

  const response = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Description de la boutique : "${description}"` },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

// ── Sélection de templates (fallback local si IA indisponible) ───────────────
function matchTemplates(intent) {
  const { sector, style, dataHints = [] } = intent;

  // Scoring de chaque template
  const scored = TEMPLATE_LIBRARY.map((template) => {
    let score = 0;

    // Correspondance secteur exact : +10
    if (template.sector === sector) score += 10;

    // Correspondance secteur proche : +4
    const sectorGroups = {
      food: ['restaurant', 'bakery', 'supermarket'],
      beauty: ['beauty', 'hairdresser'],
      retail: ['fashion', 'accessories', 'jewelry', 'electronics'],
      hospitality: ['hotel'],
      services: ['real_estate', 'auto'],
      home: ['furniture'],
    };
    for (const [, group] of Object.entries(sectorGroups)) {
      if (group.includes(template.sector) && group.includes(sector)) {
        score += 4;
        break;
      }
    }

    // Correspondance style via tags : +2 par tag
    const styleTags = {
      luxe: ['luxe', 'premium', 'immersif'],
      minimal: ['minimal', 'éditorial', 'minimalisme'],
      bold: ['bold', 'tendance', 'promo'],
      warm: ['artisanal', 'chaleureux', 'alimentaire'],
      tech: ['tech', 'dark', 'compact'],
      artisanal: ['artisanal', 'warm'],
    };
    const targetTags = styleTags[style] || [];
    for (const tag of (template.tags || [])) {
      if (targetTags.includes(tag)) score += 2;
    }

    // Correspondance données disponibles : +1 par match
    for (const hint of dataHints) {
      if (template.dataRequirements.includes(hint)) score += 1;
    }

    return { template, score };
  });

  // Trier par score et prendre les 5 premiers
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ template, score }) => ({
      id: template.id,
      name: template.name,
      sector: template.sector,
      sectorLabel: template.sectorLabel,
      description: template.description,
      tags: template.tags,
      theme: template.theme,
      sections: template.sections,
      dataRequirements: template.dataRequirements,
      score,
      confidence: Math.min(1, score / 15),
    }));
}

// ── Fallback local (sans IA) ─────────────────────────────────────────────────
function localIntentParser(description) {
  const lower = description.toLowerCase();

  const KEYWORDS = {
    restaurant: ['restaurant', 'manger', 'nourriture', 'cuisine', 'plat', 'menu', 'repas', 'food', 'resto'],
    bakery: ['boulangerie', 'pâtisserie', 'pain', 'gâteau', 'pâtissier', 'boulanger', 'croissant'],
    hotel: ['hôtel', 'hotel', 'chambre', 'nuit', 'séjour', 'hébergement', 'lodge'],
    beauty: ['beauté', 'cosmétique', 'maquillage', 'crème', 'soin', 'visage', 'peau'],
    hairdresser: ['coiffure', 'salon', 'coiffeur', 'cheveux', 'coupe', 'tresse', 'lissage'],
    fashion: ['vêtement', 'mode', 'habit', 'tenue', 'robe', 'fashion', 'boutique de vêtement'],
    electronics: ['téléphone', 'électronique', 'ordinateur', 'tech', 'phone', 'smartphone', 'accessoire tech'],
    supermarket: ['supermarché', 'épicerie', 'alimentation', 'marché', 'commerce'],
    furniture: ['meuble', 'décoration', 'deco', 'intérieur', 'maison', 'design'],
    real_estate: ['immobilier', 'appartement', 'terrain', 'maison à vendre', 'location'],
  };

  let bestSector = 'fashion';
  let bestCount = 0;
  for (const [sector, keywords] of Object.entries(KEYWORDS)) {
    const count = keywords.filter(k => lower.includes(k)).length;
    if (count > bestCount) { bestCount = count; bestSector = sector; }
  }

  const style = lower.includes('luxe') || lower.includes('premium') ? 'luxe'
    : lower.includes('artisan') || lower.includes('traditionnel') ? 'artisanal'
    : lower.includes('moderne') || lower.includes('tech') ? 'tech'
    : 'minimal';

  return {
    sector: bestSector,
    style,
    dataHints: ['products', 'gallery'],
    reformulated: description.slice(0, 80),
    confidence: bestCount > 0 ? 0.7 : 0.4,
    source: 'local',
  };
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { description, storeId } = await req.json();

    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'La description est requise.' },
        { status: 400 }
      );
    }

    // 1. Analyser l'intention (Mistral en priorité, fallback local)
    let intent;
    let aiProvider = 'local';

    try {
      intent = await callMistral(description.trim());
      aiProvider = 'mistral';
    } catch (err) {
      console.warn('[match-template] Mistral indisponible, fallback local:', err.message);
      intent = localIntentParser(description.trim());
    }

    // 2. Sélectionner les templates les plus pertinents
    const matchedTemplates = matchTemplates(intent);

    return NextResponse.json({
      success: true,
      intent,
      templates: matchedTemplates,
      aiProvider,
      description: description.trim(),
    });
  } catch (error) {
    console.error('[API /api/ai/match-template]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
