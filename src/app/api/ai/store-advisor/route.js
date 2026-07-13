import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { COMPONENT_REGISTRY } from '@/lib/componentRegistry';

// ─── Scoring et analyse de boutique ──────────────────────────────────────────
function analyzeStore(store, modules, products) {
  const score = { total: 0, max: 0, details: [] };
  const suggestions = [];

  // ── 1. Présence d'un hero ──────────────────────────────────────────────────
  score.max += 15;
  const hasHero = modules.some(m => m.type === 'hero' || m.type === 'vitrine');
  if (hasHero) {
    score.total += 15;
    score.details.push({ label: 'Section d\'accueil', ok: true, score: 15 });
  } else {
    score.details.push({ label: 'Section d\'accueil', ok: false, score: 0, hint: 'Aucune section héro détectée' });
    suggestions.push({
      id: 'add_hero',
      priority: 'high',
      category: 'structure',
      title: '🚀 Ajoutez une section d\'accueil percutante',
      description: 'Votre boutique n\'a pas de bannière d\'accueil. C\'est la première chose que vos visiteurs verront — elle doit les convaincre de rester.',
      impact: 'Augmente le temps passé sur le site de +60% en moyenne',
      action: { type: 'add_block', args: { type: 'hero', config: { title: store.name || 'Bienvenue', subtitle: store.description || 'Découvrez nos offres exceptionnelles', backgroundGradient: '135deg,#667eea 0%,#764ba2 100%', ctaText: 'Découvrir', height: 'screen' } } },
      actionLabel: '✨ Ajouter automatiquement',
    });
  }

  // ── 2. Logo / Image de la boutique ────────────────────────────────────────
  score.max += 10;
  if (store.logo_url) {
    score.total += 10;
    score.details.push({ label: 'Logo de la boutique', ok: true, score: 10 });
  } else {
    score.details.push({ label: 'Logo de la boutique', ok: false, score: 0, hint: 'Aucun logo uploadé' });
    suggestions.push({
      id: 'missing_logo',
      priority: 'high',
      category: 'branding',
      title: '🖼️ Ajoutez un logo à votre boutique',
      description: 'Les boutiques avec un logo génèrent 3× plus de confiance auprès des acheteurs.',
      impact: 'Taux de conversion +35%',
      action: null,
      actionLabel: '📸 Aller aux paramètres',
      actionLink: '/dashboard/settings',
    });
  }

  // ── 3. Description de boutique ────────────────────────────────────────────
  score.max += 10;
  if (store.description && store.description.length > 50) {
    score.total += 10;
    score.details.push({ label: 'Description de boutique', ok: true, score: 10 });
  } else {
    score.details.push({ label: 'Description de boutique', ok: false, score: 0, hint: store.description ? 'Description trop courte' : 'Aucune description' });
    suggestions.push({
      id: 'missing_description',
      priority: 'medium',
      category: 'seo',
      title: '📝 Rédigez une description de boutique',
      description: `Votre description actuelle est ${store.description ? 'trop courte' : 'absente'}. Une bonne description améliore votre référencement et rassure vos clients.`,
      impact: 'Améliore le SEO et la confiance client',
      action: null,
      actionLabel: '✏️ Modifier la description',
      actionLink: '/dashboard/settings',
    });
  }

  // ── 4. Produits / Catalogue ────────────────────────────────────────────────
  score.max += 20;
  if (products.length >= 5) {
    score.total += 20;
    score.details.push({ label: 'Catalogue produits', ok: true, score: 20 });
  } else if (products.length > 0) {
    score.total += 10;
    score.details.push({ label: 'Catalogue produits', ok: 'partial', score: 10, hint: `Seulement ${products.length} produit(s)` });
    suggestions.push({
      id: 'few_products',
      priority: 'high',
      category: 'catalogue',
      title: `📦 Enrichissez votre catalogue (${products.length} produits)`,
      description: 'Les boutiques avec 5+ produits ont 4× plus de chances de réaliser une vente. Ajoutez plus d\'articles pour maximiser vos opportunités.',
      impact: 'Taux de vente ×4 avec 5+ produits',
      action: null,
      actionLabel: '+ Ajouter des produits',
      actionLink: '/dashboard/products',
    });
  } else {
    score.details.push({ label: 'Catalogue produits', ok: false, score: 0, hint: 'Aucun produit' });
    suggestions.push({
      id: 'no_products',
      priority: 'critical',
      category: 'catalogue',
      title: '🛒 Ajoutez vos premiers produits !',
      description: 'Votre boutique est vide. Sans produits, vous ne pouvez pas vendre. Commencez par ajouter au moins 3 articles.',
      impact: 'Indispensable pour démarrer',
      action: null,
      actionLabel: '+ Créer un produit',
      actionLink: '/dashboard/products',
    });
  }

  // ── 5. Grille de produits dans le builder ─────────────────────────────────
  score.max += 10;
  const hasGrid = modules.some(m => ['catalogue', 'offeringGrid'].includes(m.type));
  if (hasGrid) {
    score.total += 10;
    score.details.push({ label: 'Affichage catalogue', ok: true, score: 10 });
  } else if (products.length > 0) {
    score.details.push({ label: 'Affichage catalogue', ok: false, score: 0 });
    suggestions.push({
      id: 'add_grid',
      priority: 'high',
      category: 'structure',
      title: '🗂️ Affichez vos produits sur votre boutique',
      description: 'Vous avez des produits mais ils ne sont pas visibles sur votre page d\'accueil ! Ajoutez une grille pour les mettre en valeur.',
      impact: 'Vos produits seront visibles directement',
      action: { type: 'add_block', args: { type: 'offeringGrid', config: { title: 'Nos Produits', showFilters: true, hoverEffect: 'lift' } } },
      actionLabel: '✨ Afficher automatiquement',
    });
  }

  // ── 6. Témoignages / Avis clients ─────────────────────────────────────────
  score.max += 10;
  const hasTestimonials = modules.some(m => ['testimonials', 'testimonialSlider'].includes(m.type));
  if (hasTestimonials) {
    score.total += 10;
    score.details.push({ label: 'Avis clients', ok: true, score: 10 });
  } else {
    score.details.push({ label: 'Avis clients', ok: false, score: 0 });
    suggestions.push({
      id: 'add_testimonials',
      priority: 'medium',
      category: 'confiance',
      title: '⭐ Ajoutez des avis clients',
      description: '88% des acheteurs font autant confiance aux avis en ligne qu\'aux recommandations personnelles. Une section témoignages est essentielle.',
      impact: 'Taux de conversion +25%',
      action: { type: 'add_block', args: { type: 'testimonialSlider', config: { title: 'Ce que disent nos clients', layout: 'slider' } } },
      actionLabel: '✨ Ajouter les avis',
    });
  }

  // ── 7. Contact / WhatsApp ─────────────────────────────────────────────────
  score.max += 10;
  const hasContact = modules.some(m => ['contact', 'contactForm', 'links'].includes(m.type));
  const hasWhatsApp = store.whatsapp || modules.some(m => m.config?.whatsapp);
  if (hasContact || hasWhatsApp) {
    score.total += 10;
    score.details.push({ label: 'Contact client', ok: true, score: 10 });
  } else {
    score.details.push({ label: 'Contact client', ok: false, score: 0 });
    suggestions.push({
      id: 'add_contact',
      priority: 'medium',
      category: 'confiance',
      title: '📞 Ajoutez vos informations de contact',
      description: 'Les visiteurs doivent pouvoir vous joindre facilement. Ajoutez votre WhatsApp, email ou formulaire de contact.',
      impact: 'Réduit l\'abandon panier de -40%',
      action: { type: 'add_block', args: { type: 'contactForm', config: { title: 'Nous Contacter', showWhatsApp: true } } },
      actionLabel: '✨ Ajouter le contact',
    });
  }

  // ── 8. Réseaux sociaux ────────────────────────────────────────────────────
  score.max += 5;
  const hasSocials = modules.some(m => m.type === 'socialLinks') || store.instagram || store.facebook;
  if (hasSocials) {
    score.total += 5;
    score.details.push({ label: 'Réseaux sociaux', ok: true, score: 5 });
  } else {
    score.details.push({ label: 'Réseaux sociaux', ok: false, score: 0 });
    suggestions.push({
      id: 'add_socials',
      priority: 'low',
      category: 'branding',
      title: '📱 Ajoutez vos réseaux sociaux',
      description: 'Connectez votre boutique à vos réseaux sociaux pour fidéliser votre audience et générer du trafic organique.',
      impact: 'Fidélisation et notoriété',
      action: { type: 'add_block', args: { type: 'socialLinks', config: { title: 'Suivez-nous' } } },
      actionLabel: '✨ Ajouter les réseaux',
    });
  }

  // ── 9. Newsletter / Fidélisation ──────────────────────────────────────────
  score.max += 5;
  const hasNewsletter = modules.some(m => ['newsletter', 'newsletterSignup'].includes(m.type));
  if (hasNewsletter) {
    score.total += 5;
    score.details.push({ label: 'Capture email / Newsletter', ok: true, score: 5 });
  } else {
    score.details.push({ label: 'Capture email', ok: false, score: 0 });
    suggestions.push({
      id: 'add_newsletter',
      priority: 'low',
      category: 'marketing',
      title: '📧 Construisez votre liste email',
      description: 'Le marketing par email offre le meilleur retour sur investissement (ROI ×42). Commencez à collecter des emails dès maintenant.',
      impact: 'ROI email marketing ×42',
      action: { type: 'add_block', args: { type: 'newsletterSignup', config: { title: 'Offre exclusive pour nos abonnés !', incentive: '-10% sur votre première commande' } } },
      actionLabel: '✨ Ajouter la newsletter',
    });
  }

  // ── 10. Statistiques / Preuves sociales ───────────────────────────────────
  score.max += 5;
  const hasStats = modules.some(m => m.type === 'statsBar');
  if (hasStats) {
    score.total += 5;
    score.details.push({ label: 'Preuves sociales', ok: true, score: 5 });
  } else {
    score.details.push({ label: 'Preuves sociales', ok: false, score: 0 });
    suggestions.push({
      id: 'add_stats',
      priority: 'low',
      category: 'confiance',
      title: '📊 Affichez vos chiffres clés',
      description: `Vous avez ${products.length} produit(s) et une boutique active. Mettez en avant vos réalisations pour inspirer confiance.`,
      impact: 'Crédibilité et confiance',
      action: { type: 'add_block', args: { type: 'statsBar', config: { stats: [
        { value: `${products.length}+`, label: 'Produits disponibles', icon: '🛍️' },
        { value: '4.9★', label: 'Note clients', icon: '⭐' },
        { value: '100%', label: 'Satisfaction garantie', icon: '✅' },
      ] } } },
      actionLabel: '✨ Afficher les stats',
    });
  }

  const percentage = Math.round((score.total / score.max) * 100);
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeLabel = { A: 'Excellente boutique !', B: 'Très bonne boutique', C: 'Boutique correcte', D: 'Boutique à améliorer', F: 'Boutique en construction' }[grade];

  return {
    score: percentage,
    grade,
    gradeLabel,
    scoreDetails: score.details,
    suggestions: suggestions.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    }),
  };
}

// ─── Handler GET : Analyse de la boutique ─────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    if (!storeId) return NextResponse.json({ error: 'storeId requis' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const [{ data: store }, { data: modules }, { data: products }] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId).single(),
      supabase.from('store_modules').select('*').eq('store_id', storeId).eq('is_active', true),
      supabase.from('products').select('id,name,price,stock_quantity,image_url').eq('store_id', storeId).eq('is_active', true),
    ]);

    if (!store) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    const analysis = analyzeStore(store, modules || [], products || []);

    // Enrichissement par Mistral : message personnalisé IA ─────────────────
    let aiMessage = '';
    try {
      const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [{
            role: 'user',
            content: `Tu es un expert en e-commerce africain et un conseiller bienveillant pour la plateforme VeStyle.

Analyse cette boutique et donne un conseil personnalisé EN FRANÇAIS, chaleureux et motivant (max 3 phrases). 

Boutique: "${store.name}" - ${store.description || 'pas de description'}
Secteur: ${store.business_type || 'non spécifié'}
Score actuel: ${analysis.score}/100 (Grade: ${analysis.grade} - ${analysis.gradeLabel})
Produits: ${(products || []).length}
Modules actifs: ${(modules || []).map(m => m.type).join(', ') || 'aucun'}
Problèmes principaux: ${analysis.suggestions.slice(0, 3).map(s => s.title).join(', ')}

Réponds avec un seul paragraphe de conseil, chaleureux et actionnable.`,
          }],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });
      if (mistralRes.ok) {
        const data = await mistralRes.json();
        aiMessage = data.choices?.[0]?.message?.content || '';
      }
    } catch {}

    return NextResponse.json({ ...analysis, aiMessage, storeName: store.name });
  } catch (error) {
    console.error('[Store Advisor Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Handler POST : Appliquer une suggestion ──────────────────────────────────
export async function POST(request) {
  try {
    const { storeId, suggestion } = await request.json();
    if (!storeId || !suggestion?.action) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Déléguer à l'orchestrateur principal
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/builder-orchestrator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      body: JSON.stringify({
        storeId,
        message: `Applique automatiquement : ${suggestion.title}`,
        _directToolCall: { name: suggestion.action.type, args: suggestion.action.args },
      }),
    });

    // Si l'orchestrateur ne supporte pas _directToolCall, appliquer directement
    if (!res.ok) {
      const { createBlock } = await import('@/lib/blockPatcher');
      const args = suggestion.action.args;
      const newBlock = createBlock(args.type, args.config || {});
      const { data: lastModule } = await supabase
        .from('store_modules')
        .select('position')
        .eq('store_id', storeId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      await supabase.from('store_modules').insert({
        id:        newBlock.id,
        store_id:  storeId,
        type:      newBlock.type,
        label:     newBlock.label,
        position:  (lastModule?.position ?? -1) + 1,
        is_active: true,
        config:    newBlock.config,
      });

      const { data: updated } = await supabase
        .from('store_modules')
        .select('*')
        .eq('store_id', storeId)
        .order('position');

      return NextResponse.json({ success: true, updatedModules: updated });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
