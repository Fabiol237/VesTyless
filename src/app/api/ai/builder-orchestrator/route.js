import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ─── Registre des thèmes avec leurs keywords de matching ──────────────────────
const THEME_REGISTRY = [
  {
    id: 'theme_00', name: 'VesTyle Classique', emoji: '🏪',
    keywords: ['general', 'universel', 'classique', 'marketplace', 'multi', 'polyvalent', 'boutique'],
    description: 'Thème universel VesTyle — propre, lisible, idéal pour toute activité',
  },
  {
    id: 'theme_01', name: 'Luxe & Couture', emoji: '👑',
    keywords: ['mode', 'fashion', 'luxe', 'couture', 'vêtement', 'habit', 'robe', 'prêt-à-porter', 'bijou', 'accessoire'],
    description: 'Élégance éditoriale noir & or — pour la mode haut de gamme',
  },
  {
    id: 'theme_02', name: 'Beauté & Salon', emoji: '🌸',
    keywords: ['beauté', 'salon', 'cosmétique', 'soin', 'coiffure', 'manucure', 'maquillage', 'parfum', 'spa', 'esthétique'],
    description: 'Rose glamour et doux — pour salons de beauté et cosmétiques',
  },
  {
    id: 'theme_03', name: 'Marché Frais', emoji: '🛒',
    keywords: ['alimentaire', 'épicerie', 'marché', 'nourriture', 'légume', 'fruit', 'produit frais', 'supermarché', 'grain', 'vivrier'],
    description: 'Vert vif et orange — idéal pour épiceries et marchés alimentaires',
  },
  {
    id: 'theme_04', name: 'Restaurant & Chef', emoji: '🍽️',
    keywords: ['restaurant', 'café', 'traiteur', 'fast-food', 'snack', 'boulangerie', 'pâtisserie', 'maquis', 'gastronomie', 'cuisine', 'menu', 'livraison repas'],
    description: 'Atmosphère sombre et dorée — pour restaurants et traiteurs',
  },
  {
    id: 'theme_05', name: 'Commerce Pro', emoji: '🔧',
    keywords: ['quincaillerie', 'btb', 'b2b', 'matériaux', 'construction', 'gros', 'industrie', 'professionnel', 'outil', 'électricité', 'plomberie'],
    description: 'Bleu marine & orange professionnel — pour commerces B2B et quincailleries',
  },
  {
    id: 'theme_06', name: 'Street & Urban', emoji: '👟',
    keywords: ['street', 'urban', 'sneaker', 'streetwear', 'casquette', 'sport', 'jeune', 'cool', 'sweat', 'basket', 'tendance'],
    description: 'Dark glassmorphism et néon — pour streetwear, sneakers, mode urbaine',
  },
  {
    id: 'theme_07', name: 'Tech & Gadgets', emoji: '📱',
    keywords: ['tech', 'technologie', 'gadget', 'informatique', 'téléphone', 'électronique', 'jeu', 'gaming', 'ordinateur', 'appareil', 'high-tech'],
    description: 'Noir/bleu néon futuriste — pour boutiques high-tech et gadgets',
  },
  {
    id: 'theme_08', name: 'Magazine Éditorial', emoji: '📰',
    keywords: ['magazine', 'éditorial', 'blog', 'lifestyle', 'presse', 'culture', 'art', 'créatif', 'portfolio', 'content'],
    description: 'Blanc et typographie bold cinématique — pour lifestyle et magazines',
  },
  {
    id: 'theme_09', name: 'Artisan & Craft', emoji: '🪵',
    keywords: ['artisan', 'craft', 'handmade', 'fait main', 'meuble', 'bois', 'poterie', 'textile', 'couture', 'antiquité', 'vintage', 'décoration'],
    description: 'Tons terre et bois — pour artisans, créateurs et marchés slow',
  },
  {
    id: 'theme_10', name: 'Sport & Fitness', emoji: '💪',
    keywords: ['sport', 'fitness', 'gym', 'musculation', 'yoga', 'course', 'nutrition', 'complément', 'athletic', 'équipement sportif'],
    description: 'Rouge/noir dynamique et énergique — pour sport et fitness',
  },
  {
    id: 'theme_11', name: 'Santé & Pharmacie', emoji: '💊',
    keywords: ['santé', 'pharmacie', 'médical', 'clinique', 'médicament', 'parapharmacie', 'optique', 'dentaire', 'bien-être', 'thérapie'],
    description: 'Vert clair et blanc propre — pour pharmacies et santé',
  },
  {
    id: 'theme_12', name: 'Événements & Night', emoji: '🎵',
    keywords: ['événement', 'concert', 'dj', 'night', 'fête', 'soirée', 'club', 'bar', 'spectacle', 'animation', 'mariage', 'festival'],
    description: 'Violet/or et neon — pour événements, DJs, soirées',
  },
];

// ─── Sélectionner les thèmes les plus adaptés ─────────────────────────────────
function selectThemes(store) {
  const text = [
    store.name || '',
    store.description || '',
    store.category || '',
    store.business_type || '',
  ].join(' ').toLowerCase();

  // Score de pertinence par thème
  const scored = THEME_REGISTRY.map(theme => {
    const score = theme.keywords.reduce((acc, kw) => {
      return acc + (text.includes(kw) ? 2 : 0);
    }, 0);
    return { ...theme, score };
  });

  // Tri par score
  scored.sort((a, b) => b.score - a.score);

  // Si aucun match fort → thème_00 (classique) en premier
  const best = scored[0].score === 0
    ? [scored.find(t => t.id === 'theme_00'), ...scored.filter(t => t.id !== 'theme_00').slice(0, 1)]
    : scored.slice(0, 2);

  // 2 alternatives différentes des best
  const bestIds = best.map(t => t.id);
  const alternatives = scored.filter(t => !bestIds.includes(t.id)).slice(0, 2);

  return { best, alternatives };
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { storeId, message } = await request.json();
    if (!storeId) {
      return NextResponse.json({ error: 'storeId requis' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // ── 1. Récupérer la boutique ───────────────────────────────────────────
    const { data: store } = await supabase
      .from('stores')
      .select('id, name, description, category, business_type, shop_theme')
      .eq('id', storeId)
      .single();

    if (!store) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    // ── 2. Si message → Mistral interprète et aide à choisir ──────────────
    let aiMessage = null;
    if (message?.trim() && process.env.MISTRAL_API_KEY) {
      const prompt = `Tu es un conseiller de boutique VesTyle. 
L'utilisateur veut configurer son thème visuel et dit : "${message}"

La boutique s'appelle "${store.name}" et vend : "${store.description || store.category || 'produits variés'}"

Voici les thèmes disponibles :
${THEME_REGISTRY.map(t => `- ${t.id} : ${t.name} ${t.emoji} → ${t.description} [mots-clés: ${t.keywords.join(', ')}]`).join('\n')}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans explications :
{
  "best": ["theme_id_1", "theme_id_2"],
  "alternatives": ["theme_id_3", "theme_id_4"],
  "message": "Une phrase courte et humaine expliquant pourquoi ces thèmes correspondent"
}`;

      try {
        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 300,
          }),
        });

        if (mistralRes.ok) {
          const mistralData = await mistralRes.json();
          const content = mistralData.choices?.[0]?.message?.content || '';
          try {
            const parsed = JSON.parse(content.trim());
            // Valider que les IDs existent
            const validIds = THEME_REGISTRY.map(t => t.id);
            const validBest = (parsed.best || []).filter(id => validIds.includes(id));
            const validAlts = (parsed.alternatives || []).filter(id => validIds.includes(id));
            
            if (validBest.length > 0) {
              return NextResponse.json({
                success: true,
                source: 'mistral',
                best: validBest.map(id => THEME_REGISTRY.find(t => t.id === id)),
                alternatives: validAlts.map(id => THEME_REGISTRY.find(t => t.id === id)),
                message: parsed.message || 'Voici les thèmes les plus adaptés à votre boutique.',
                currentTheme: store.shop_theme,
              });
            }
          } catch { /* fallback algorithmique */ }
        }
      } catch { /* fallback algorithmique */ }
    }

    // ── 3. Fallback : sélection algorithmique pure ─────────────────────────
    const { best, alternatives } = selectThemes(store);

    const descriptions = {
      0: 'Parfaitement adapté à votre secteur d\'activité',
      1: 'Très bon choix pour votre type de boutique',
    };

    return NextResponse.json({
      success: true,
      source: 'algorithmic',
      best: best.map((t, i) => ({ ...t, reason: descriptions[i] || '' })),
      alternatives: alternatives.map(t => ({ ...t, reason: 'Alternative similaire pour varier le style' })),
      message: `Voici les thèmes les plus adaptés à "${store.name}". Cliquez pour prévisualiser.`,
      currentTheme: store.shop_theme,
    });

  } catch (error) {
    console.error('[Theme Selector Error]', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}

// ─── Handler PUT : Appliquer un thème ─────────────────────────────────────────
export async function PUT(request) {
  try {
    const { storeId, themeId } = await request.json();
    if (!storeId || !themeId) {
      return NextResponse.json({ error: 'storeId et themeId requis' }, { status: 400 });
    }

    const theme = THEME_REGISTRY.find(t => t.id === themeId);
    if (!theme) {
      return NextResponse.json({ error: 'Thème inconnu' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    await supabase.from('stores').update({
      shop_theme: themeId,
      updated_at: new Date().toISOString(),
    }).eq('id', storeId);

    return NextResponse.json({ success: true, applied: theme });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
