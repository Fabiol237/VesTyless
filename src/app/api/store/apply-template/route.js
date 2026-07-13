import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getTemplate } from '@/lib/storeTemplates';

// Types de blocs uniques qui ne doivent pas exister en double (Garde-fous)
const SINGLETON_BLOCK_TYPES = [
  'hero', 'statsBar', 'newsletterSignup', 'socialLinks', 'contactForm', 'faqAccordion', 'countdown'
];

export async function POST(request) {
  try {
    const { storeId, templateId, keepExisting = false } = await request.json();
    if (!storeId || !templateId) return NextResponse.json({ error: 'storeId et templateId requis' }, { status: 400 });

    const template = getTemplate(templateId);
    if (!template) return NextResponse.json({ error: 'Template introuvable' }, { status: 404 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Récupérer l'état actuel de la boutique
    const [{ data: currentModules }, { data: store }] = await Promise.all([
      supabase.from('store_modules').select('*').eq('store_id', storeId).order('position'),
      supabase.from('stores').select('*').eq('id', storeId).single(),
    ]);

    // Snapshot de sécurité automatique avant modification
    await supabase.from('store_versions').insert({
      store_id:      storeId,
      label:         `🎨 Avant fusion template "${template.name}" (auto)`,
      description:   'Sauvegarde automatique avant application adaptative d\'un template',
      modules_count: (currentModules || []).length,
      modules_data:  currentModules || [],
      theme_data: {
        theme_color:     store?.theme_color,
        secondary_color: store?.secondary_color,
        accent_color:    store?.accent_color,
        font_family:     store?.font_family,
        theme_mode:      store?.theme_mode,
      },
    });

    const modulesToUpsert = [];
    const modulesToDelete = [];

    if (!keepExisting) {
      // ── FUSION ADAPTATIVE (Sans écraser le contenu personnalisé de l'utilisateur) ──
      const existingByType = {};
      (currentModules || []).forEach(m => {
        existingByType[m.type] = m;
      });

      template.blocks.forEach((tplBlock, index) => {
        const isSingleton = SINGLETON_BLOCK_TYPES.includes(tplBlock.type);
        const existing = existingByType[tplBlock.type];

        if (isSingleton && existing) {
          // Mettre à jour l'existant en fusionnant la config (conserver le contenu custom mais appliquer le style du template)
          modulesToUpsert.push({
            ...existing,
            position: index,
            config: {
              ...existing.config,
              // On priorise le style du template
              backgroundGradient: tplBlock.config?.backgroundGradient,
              titleGradient: tplBlock.config?.titleGradient,
              bgColor: tplBlock.config?.bgColor,
              textColor: tplBlock.config?.textColor,
              valueColor: tplBlock.config?.valueColor,
              buttonBg: tplBlock.config?.buttonBg,
              ctaStyle: tplBlock.config?.ctaStyle,
              ctaColor: tplBlock.config?.ctaColor,
              // Conserver les textes de l'utilisateur s'ils existent, sinon prendre ceux du template
              title: existing.config?.title || tplBlock.config?.title,
              subtitle: existing.config?.subtitle || tplBlock.config?.subtitle,
              ctaText: existing.config?.ctaText || tplBlock.config?.ctaText,
            },
            updated_at: new Date().toISOString(),
          });
          // Retirer de la liste pour ne pas le supprimer
          delete existingByType[tplBlock.type];
        } else {
          // Créer le bloc car il n'existe pas encore
          const id = `block_${tplBlock.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${index}`;
          modulesToUpsert.push({
            id,
            store_id: storeId,
            type: tplBlock.type,
            label: tplBlock.type,
            position: index,
            is_active: true,
            config: tplBlock.config || {},
            block_version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });

      // Supprimer les modules orphelins qui n'ont pas été fusionnés ou réutilisés
      Object.values(existingByType).forEach(m => {
        modulesToDelete.push(m.id);
      });

    } else {
      // ── AJOUT ADAPTATIF SANS DOUBLONS ──
      const existingTypes = new Set((currentModules || []).map(m => m.type));
      let nextPos = (currentModules || []).reduce((m, mod) => Math.max(m, mod.position), -1) + 1;

      template.blocks.forEach((tplBlock) => {
        const isSingleton = SINGLETON_BLOCK_TYPES.includes(tplBlock.type);
        const alreadyExists = existingTypes.has(tplBlock.type);

        // Si le bloc est unique (ex: un Hero) et existe déjà, on refuse de le dupliquer !
        if (isSingleton && alreadyExists) {
          // On met simplement à jour sa config de style pour l'harmoniser avec le nouveau template
          const existing = currentModules.find(m => m.type === tplBlock.type);
          if (existing) {
            modulesToUpsert.push({
              ...existing,
              config: { ...existing.config, ...tplBlock.config },
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          // Insérer le bloc normalement à la fin
          const id = `block_${tplBlock.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          modulesToUpsert.push({
            id,
            store_id: storeId,
            type: tplBlock.type,
            label: tplBlock.type,
            position: nextPos++,
            is_active: true,
            config: tplBlock.config || {},
            block_version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });
    }

    // Effectuer les opérations en base
    if (modulesToDelete.length > 0) {
      await supabase.from('store_modules').delete().in('id', modulesToDelete);
    }
    if (modulesToUpsert.length > 0) {
      await supabase.from('store_modules').upsert(modulesToUpsert);
    }

    // Appliquer le thème du template
    await supabase.from('stores').update({
      theme_color:     template.theme.primaryColor,
      secondary_color: template.theme.secondaryColor,
      accent_color:    template.theme.accentColor,
      font_family:     template.theme.fontFamily,
      theme_mode:      template.theme.mode,
      updated_at:      new Date().toISOString(),
    }).eq('id', storeId);

    // Récupérer la liste finale ordonnée
    const { data: updated } = await supabase
      .from('store_modules').select('*').eq('store_id', storeId).order('position');

    // Réordonner les positions de 0 à N pour éviter les trous
    const reordered = (updated || []).map((m, i) => ({ ...m, position: i }));
    await supabase.from('store_modules').upsert(reordered);

    return NextResponse.json({
      success: true,
      template: { id: template.id, name: template.name },
      updatedModules: reordered,
      themeConfig: {
        primaryColor:   template.theme.primaryColor,
        secondaryColor: template.theme.secondaryColor,
        accentColor:    template.theme.accentColor,
        fontFamily:     template.theme.fontFamily,
        mode:           template.theme.mode,
      },
    });
  } catch (err) {
    console.error('[Apply Template Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
