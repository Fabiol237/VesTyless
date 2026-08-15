/**
 * VeStyle — Variantes de pages configurables
 * Chaque page clé peut avoir plusieurs layouts au choix du vendeur.
 * Ces variantes s'appliquent en temps réel via la config du module.
 */

export const PAGE_CONFIGS = {
  // ─── PAGE : ACCUEIL ──────────────────────────────────────────────────────
  accueil: {
    label: "Page d'accueil",
    emoji: '🏠',
    description: 'Choisissez la mise en scène de votre page principale',
    variantes: [
      {
        id: 'carousel',
        label: 'Carrousel Immersif',
        emoji: '🎠',
        description: 'Diaporama automatique plein écran avec vos meilleures photos',
        preview: 'linear-gradient(135deg, #1a1208, #C9960C)',
        previewIcon: '🎠',
        suitable: ['boutique_luxe', 'boutique_fashion', 'artisan_resto_gourmet', 'artisan_salon_beaute'],
      },
      {
        id: 'banner_fixed',
        label: 'Bannière Fixe',
        emoji: '🖼️',
        description: 'Une grande image statique avec titre et bouton d\'action centré',
        preview: 'linear-gradient(135deg, #0f0c29, #6366f1)',
        previewIcon: '🖼️',
        suitable: ['presta_agence_corporate', 'presta_immobilier', 'boutique_market'],
      },
      {
        id: 'search_hero',
        label: 'Héros Recherche',
        emoji: '🔍',
        description: 'Barre de recherche proéminente au centre pour trouver rapidement',
        preview: 'linear-gradient(135deg, #0f4c3a, #25D366)',
        previewIcon: '🔍',
        suitable: ['boutique_market', 'presta_immobilier'],
      },
      {
        id: 'profile_hero',
        label: 'Profil Personnel',
        emoji: '👤',
        description: 'Photo de profil avec présentation courte, stats et CTA',
        preview: 'linear-gradient(135deg, #667eea, #f64f59)',
        previewIcon: '👤',
        suitable: ['presta_freelance_portfolio'],
      },
      {
        id: 'minimal',
        label: 'Minimal & Épuré',
        emoji: '✨',
        description: 'Typographie large, fond blanc ou sombre, pas d\'image',
        preview: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        previewIcon: '✨',
        suitable: ['artisan_atelier', 'artisan_cafe_moderne'],
      },
      {
        id: 'video_bg',
        label: 'Vidéo en fond',
        emoji: '🎬',
        description: 'Ambiance cinématographique avec vidéo en arrière-plan',
        preview: 'linear-gradient(135deg, #0a0a0a, #374151)',
        previewIcon: '🎬',
        suitable: ['artisan_resto_gourmet', 'presta_agence_corporate'],
        comingSoon: true,
      },
    ],
  },

  // ─── PAGE : CATALOGUE / GRILLE PRODUITS ──────────────────────────────────
  catalogue: {
    label: 'Catalogue & Grille',
    emoji: '🛍️',
    description: 'Organisation visuelle de vos produits',
    variantes: [
      {
        id: 'grid_3col',
        label: 'Grille 3 colonnes',
        emoji: '▦',
        description: 'Disposition classique, idéale pour de nombreux produits',
        preview: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
        previewIcon: '▦',
        suitable: ['boutique_market', 'boutique_luxe'],
      },
      {
        id: 'grid_2col',
        label: 'Grille 2 colonnes',
        emoji: '▪▪',
        description: 'Produits plus grands, photos mises en valeur',
        preview: 'linear-gradient(135deg, #fdf2f8, #ec4899)',
        previewIcon: '▪▪',
        suitable: ['boutique_fashion', 'boutique_luxe'],
      },
      {
        id: 'masonry',
        label: 'Masonry (Pinterest)',
        emoji: '🧱',
        description: 'Disposition libre, photos de hauteurs variées',
        preview: 'linear-gradient(135deg, #FBF9F5, #8B5E3C)',
        previewIcon: '🧱',
        suitable: ['artisan_atelier', 'boutique_fashion'],
      },
      {
        id: 'list',
        label: 'Liste verticale',
        emoji: '📋',
        description: 'Chaque produit sur une ligne avec détails',
        preview: 'linear-gradient(135deg, #f0f9ff, #0284c7)',
        previewIcon: '📋',
        suitable: ['boutique_market'],
      },
    ],
  },

  // ─── PAGE : RÉSERVATION ──────────────────────────────────────────────────
  reservation: {
    label: 'Réservation',
    emoji: '📅',
    description: 'Comment les clients prennent rendez-vous',
    variantes: [
      {
        id: 'whatsapp',
        label: 'Via WhatsApp',
        emoji: '📱',
        description: 'Un bouton qui ouvre WhatsApp avec message pré-rempli',
        preview: 'linear-gradient(135deg, #25D366, #128C7E)',
        previewIcon: '📱',
        suitable: ['artisan_resto_gourmet', 'artisan_salon_beaute', 'artisan_cafe_moderne'],
      },
      {
        id: 'calendar_form',
        label: 'Formulaire + Calendrier',
        emoji: '📆',
        description: 'Sélection de date/heure + formulaire de contact',
        preview: 'linear-gradient(135deg, #f59e0b, #92400e)',
        previewIcon: '📆',
        suitable: ['artisan_salon_beaute', 'presta_agence_corporate'],
      },
      {
        id: 'simple_form',
        label: 'Formulaire Simple',
        emoji: '📝',
        description: 'Formulaire minimaliste nom, date souhaitée, message',
        preview: 'linear-gradient(135deg, #f8fafc, #64748b)',
        previewIcon: '📝',
        suitable: ['artisan_atelier', 'artisan_cafe_moderne'],
      },
    ],
  },

  // ─── PAGE : DEVIS ────────────────────────────────────────────────────────
  devis: {
    label: 'Demande de Devis',
    emoji: '📋',
    description: 'Format de votre formulaire devis',
    variantes: [
      {
        id: 'full_form',
        label: 'Formulaire Complet',
        emoji: '📋',
        description: 'Budget, délai, description du projet, contact',
        preview: 'linear-gradient(135deg, #0f0c29, #6366f1)',
        previewIcon: '📋',
        suitable: ['presta_agence_corporate', 'presta_freelance_portfolio'],
      },
      {
        id: 'whatsapp_devis',
        label: 'WhatsApp Direct',
        emoji: '📱',
        description: 'Envoi du devis directement sur WhatsApp',
        preview: 'linear-gradient(135deg, #25D366, #128C7E)',
        previewIcon: '📱',
        suitable: ['presta_immobilier', 'artisan_atelier'],
      },
      {
        id: 'email_form',
        label: 'Formulaire Email',
        emoji: '✉️',
        description: 'Formulaire envoyé par email, réponse sous 24h',
        preview: 'linear-gradient(135deg, #667eea, #764ba2)',
        previewIcon: '✉️',
        suitable: ['presta_freelance_portfolio', 'presta_agence_corporate'],
      },
    ],
  },
};

/** Retourne les variantes disponibles pour une page */
export function getPageVariants(pageKey) {
  return PAGE_CONFIGS[pageKey]?.variantes || [];
}

/** Retourne la variante par défaut pour un template donné */
export function getDefaultVariant(pageKey, templateId) {
  const config = PAGE_CONFIGS[pageKey];
  if (!config) return null;
  const suitable = config.variantes.find(v => v.suitable?.includes(templateId));
  return suitable || config.variantes[0] || null;
}
