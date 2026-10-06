import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function generateWithMistral(prompt) {
  if (!process.env.MISTRAL_API_KEY) return null;
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices[0].message.content.trim();
  } catch (e) {
    return null;
  }
}

// ─── Mapping des fonctionnalités vers les types de modules ──────────────────
const FEATURE_TO_MODULE = {
  products: { type: 'catalogue', label: 'Nos Produits', icon: 'ShoppingBag' },
  services: { type: 'services', label: 'Nos Services', icon: 'Briefcase' },
  booking: { type: 'reservation', label: 'Réserver', icon: 'Calendar' },
  events: { type: 'billetterie', label: 'Événements', icon: 'Ticket' },
  portfolio: { type: 'portfolio', label: 'Réalisations', icon: 'Image' },
  restaurant: { type: 'restaurant', label: 'Notre Menu', icon: 'UtensilsCrossed' },
  newsletter: { type: 'newsletter', label: 'Newsletter', icon: 'Send' },
  reviews: { type: 'testimonials', label: 'Avis Clients', icon: 'Star' },
  contact: { type: 'contact', label: 'Contact', icon: 'Mail' },
  devis: { type: 'devis', label: 'Devis Gratuit', icon: 'FileText' },
  blog: { type: 'links', label: 'Nos Contenus', icon: 'Link2' },
  online_payment: null, // Géré via le module catalogue / services
  abonnement: { type: 'abonnement', label: 'Abonnements', icon: 'Repeat' },
};

// ─── Thème suggéré par style ─────────────────────────────────────────────────
const STYLE_TO_THEME = {
  elegant: { primaryColor: '#1a1a2e', secondaryColor: '#f8f9fa', accentColor: '#6c63ff', fontFamily: 'Inter', mode: 'light' },
  vibrant: { primaryColor: '#ff006e', secondaryColor: '#fff8f0', accentColor: '#fb5607', fontFamily: 'Outfit', mode: 'light' },
  dark: { primaryColor: '#7c3aed', secondaryColor: '#0a0a0a', accentColor: '#a855f7', fontFamily: 'Space Grotesk', mode: 'dark' },
  natural: { primaryColor: '#2d6a4f', secondaryColor: '#f8f7f2', accentColor: '#95d5b2', fontFamily: 'DM Sans', mode: 'light' },
  luxury: { primaryColor: '#c9a84c', secondaryColor: '#1a1a1a', accentColor: '#f5f5f0', fontFamily: 'Cormorant Garamond', mode: 'dark' },
  tech: { primaryColor: '#00f5ff', secondaryColor: '#0f0f23', accentColor: '#7b2ff7', fontFamily: 'Space Grotesk', mode: 'dark' },
};

import { businessTypeRegistry } from '@/lib/business-types/BusinessTypeRegistry';

// ─── Modules auto-suggérés par secteur si pas de features ──────────────────
const BT_DEFAULT_MODULES = {
  product: ['products', 'reviews', 'newsletter', 'contact'],
  hotel: ['services', 'booking', 'reviews', 'contact'],
  restaurant: ['restaurant', 'booking', 'reviews', 'contact'],
  service: ['services', 'booking', 'devis', 'reviews', 'contact'],
  digital_service: ['portfolio', 'services', 'reviews', 'contact'],
  event: ['events', 'newsletter', 'contact'],
  beauty: ['services', 'booking', 'reviews', 'contact'],
  hair_salon: ['services', 'booking', 'reviews', 'contact'],
};

// ─── Générateur de slug ─────────────────────────────────────────────────────
function generateSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60) + '-' + Date.now().toString(36);
}

export async function POST(request) {
  try {
    const { formData, userId, storeId } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // ─── 1. Construire la config du thème & valider strictement le type métier ─────
    const themeConfig = STYLE_TO_THEME[formData?.style] || STYLE_TO_THEME.elegant;
    const rawActivity = formData?.businessType || formData?.activityType;
    const analysis = businessTypeRegistry.analyze(rawActivity);

    if (analysis.status === 'MISSING' || analysis.status === 'UNKNOWN' || analysis.status === 'AMBIGUOUS') {
      return NextResponse.json(
        {
          error: `Type d'activité non résolu (${analysis.status}) : ${analysis.reason}`,
          status: analysis.status,
          candidates: analysis.candidates || [],
        },
        { status: 400 }
      );
    }

    const businessType = analysis.canonicalId;

    // If no features selected, use defaults for the business type
    if (!formData.selectedFeatures || formData.selectedFeatures.length === 0) {
      formData.selectedFeatures = BT_DEFAULT_MODULES[businessType] || ['contact'];
    }

    // ─── 2. Déterminer les modules à créer ────────────────────────────────
    let headline = formData.businessName || 'Bienvenue';
    let subheadline = formData.description?.substring(0, 100) || 'Découvrez ce que nous proposons';

    if (process.env.MISTRAL_API_KEY && formData.description) {
      const mistralRes = await generateWithMistral(`Génère un titre accrocheur (max 6 mots) et un sous-titre vendeur (max 15 mots) pour une boutique nommée "${formData.businessName}" dont la description est: "${formData.description}". Réponds UNIQUEMENT au format JSON exact : {"headline": "...", "subheadline": "..."}`);
      try {
        const parsed = JSON.parse(mistralRes.replace(/```json|```/g, '').trim());
        if (parsed.headline) headline = parsed.headline;
        if (parsed.subheadline) subheadline = parsed.subheadline;
      } catch (e) { console.error('Mistral JSON parse error', e); }
    }

    // Toujours commencer par la Vitrine
    const modulesToCreate = [
      {
        type: 'vitrine', label: 'Accueil', icon: 'Home', position: 0, is_active: true,
        config: {
          headline,
          subheadline,
          ctaText: 'Découvrir', bgType: 'gradient', showSocials: true,
          location: formData.location,
        }
      }
    ];

    // Ajouter les modules basés sur les features sélectionnées
    let position = 1;
    for (const feature of (formData.selectedFeatures || [])) {
      const moduleDef = FEATURE_TO_MODULE[feature];
      if (moduleDef) {
        modulesToCreate.push({
          ...moduleDef, position, is_active: true, config: {},
        });
        position++;
      }
    }

    // Toujours finir par Contact si pas déjà là
    if (!formData.selectedFeatures?.includes('contact')) {
      modulesToCreate.push({
        type: 'contact', label: 'Contact', icon: 'Mail', position, is_active: true,
        config: { showPhone: !!formData.phone, showEmail: true, phone: formData.phone || '' }
      });
    }

    // ─── 3. Créer ou mettre à jour la boutique & draft_config ────────────
    let finalStoreId = storeId;

    const initialDraftConfig = {
      industry: businessType || 'general',
      theme: {
        mode: themeConfig.mode || 'light',
        isDark: themeConfig.mode === 'dark',
        primaryColor: themeConfig.primaryColor || '#128C7E',
        accentColor: themeConfig.accentColor || '#25D366',
        bgColor: themeConfig.secondaryColor || '#FFFFFF',
        textColor: themeConfig.mode === 'dark' ? '#FAF7F2' : '#0F172A',
        font: themeConfig.fontFamily || 'Inter',
        headingFont: themeConfig.fontFamily || 'Inter',
      },
      sections: [
        { id: 'sec_header_1', type: 'HEADER', variant: 'header_001', order: 0, config: { isSticky: true } },
        { id: 'sec_hero_1', type: 'HERO', variant: 'hero_001', order: 1, config: { headline, subheadline, ctaText: 'Découvrir', layout: 'split' } },
        { id: 'sec_products_1', type: 'PRODUCT', variant: 'grid_2_card', order: 2, config: { title: 'Nos Produits' } },
        { id: 'sec_reviews_1', type: 'TESTIMONIAL', variant: 'testimonial_001', order: 3, config: { title: 'Avis Clients' } },
        { id: 'sec_contact_1', type: 'CONTACT', variant: 'contact_whatsapp_first', order: 4, config: { phone: formData.phone, showPhone: !!formData.phone } },
        { id: 'sec_footer_1', type: 'FOOTER', variant: 'footer_001', order: 5, config: {} },
      ],
      conversionHooks: {
        whatsappFloatingEnabled: true,
        whatsappPhone: formData.phone || '',
        whatsappDefaultMessage: `Bonjour ! Je souhaite commander sur votre boutique ${formData.businessName || ''}.`,
      },
    };

    const canonicalDesignMap = {
      restaurant: 'vst_dsn_resto_terroir_002',
      food: 'vst_dsn_resto_terroir_002',
      product: 'vst_dsn_prestige_atelier_001',
      physical_product: 'vst_dsn_prestige_atelier_001',
      beauty: 'vst_dsn_services_vip_003',
      hair_salon: 'vst_dsn_services_vip_003',
      service: 'vst_dsn_services_vip_003',
      agropastoral: 'vst_dsn_agro_elevage_004',
      livestock_product: 'vst_dsn_agro_elevage_004',
      hotel: 'vst_dsn_location_standing_005',
    };
    initialDraftConfig.activeVstCode = canonicalDesignMap[businessType?.toLowerCase()] || 'vst_dsn_prestige_atelier_001';

    if (storeId) {
      const { data: currentStore } = await supabase.from('stores').select('status, draft_config').eq('id', storeId).single();
      const newStatus = currentStore?.status === 'published' ? 'published' : 'draft';

      // Mettre à jour la boutique existante sans changer le statut si déjà publié
      await supabase.from('stores').update({
        onboarding_data: formData,
        activity_type: formData.activityType,
        business_type: businessType,
        theme_config: themeConfig,
        draft_config: currentStore?.draft_config || initialDraftConfig,
        status: newStatus,
        phone: formData.phone || null,
        city: formData.location || null,
        updated_at: new Date().toISOString(),
      }).eq('id', storeId);
    } else {
      // Créer une nouvelle boutique
      const slug = generateSlug(formData.businessName || 'ma-boutique');
      const { data: newStore, error: storeError } = await supabase.from('stores').insert({
        owner_id: userId,
        name: formData.businessName || 'Ma Boutique',
        slug,
        description: formData.description || '',
        onboarding_data: formData,
        activity_type: formData.activityType,
        business_type: businessType,
        theme_config: themeConfig,
        draft_config: initialDraftConfig,
        status: 'draft',
        phone: formData.phone || null,
        city: formData.location || null,
      }).select().single();

      if (storeError) throw storeError;
      finalStoreId = newStore.id;
    }


    // ─── 4. Gestion des modules existants ──────────
    if (storeId) {
      const { data: existingModules } = await supabase.from('store_modules').select('*').eq('store_id', storeId);
      const existingTypes = existingModules?.map(m => m.type) || [];
      
      // Filtrer les modules à créer pour ne garder que ceux qui n'existent pas encore
      const newModulesToCreate = modulesToCreate.filter(m => !existingTypes.includes(m.type));
      
      if (newModulesToCreate.length > 0) {
        const maxPos = existingModules?.reduce((max, m) => Math.max(max, m.position), -1) || -1;
        const newModules = newModulesToCreate.map((m, index) => ({ ...m, store_id: storeId, position: maxPos + 1 + index }));
        await supabase.from('store_modules').insert(newModules);
      }
    } else {
      await supabase.from('store_modules').insert(
        modulesToCreate.map(m => ({ ...m, store_id: finalStoreId }))
      );
    }

    return NextResponse.json({ success: true, storeId: finalStoreId });

  } catch (error) {
    console.error('[AI Generate Store Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
