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

// ─── Map activityType (onboarding) → business_type (builder) ──────────────
const ACTIVITY_TO_BT = {
  ecommerce: 'ecommerce', services: 'services', restaurant: 'restaurant',
  creative: 'creative', events: 'event', wellness: 'services',
  education: 'services', content: 'creative', real_estate: 'services',
  hotel: 'hotel', other: 'ecommerce',
};

// ─── Modules auto-suggérés par secteur si pas de features ──────────────────
const BT_DEFAULT_MODULES = {
  ecommerce: ['products', 'reviews', 'newsletter', 'contact'],
  hotel: ['services', 'booking', 'reviews', 'contact'],
  restaurant: ['restaurant', 'booking', 'reviews', 'contact'],
  services: ['services', 'booking', 'devis', 'reviews', 'contact'],
  creative: ['portfolio', 'services', 'reviews', 'contact'],
  event: ['events', 'newsletter', 'contact'],
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

    // ─── 1. Construire la config du thème ─────────────────────────────────
    const themeConfig = STYLE_TO_THEME[formData.style] || STYLE_TO_THEME.elegant;
    const businessType = ACTIVITY_TO_BT[formData.activityType] || 'ecommerce';

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

    // ─── 3. Créer ou mettre à jour la boutique ────────────────────────────
    let finalStoreId = storeId;

    if (storeId) {
      const { data: currentStore } = await supabase.from('stores').select('status').eq('id', storeId).single();
      const newStatus = currentStore?.status === 'published' ? 'published' : 'draft';

      // Mettre à jour la boutique existante sans changer le statut si déjà publié
      await supabase.from('stores').update({
        onboarding_data: formData,
        activity_type: formData.activityType,
        business_type: businessType,
        theme_config: themeConfig,
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
