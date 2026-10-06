/**
 * VesTyle — Master Blueprint Registry & Catalog
 * ─────────────────────────────────────────────────────────────────────────────
 * Catalogue central des architectures de vitrines maîtresses (Master Blueprints).
 *
 * Un Master Blueprint définit l'ossature structurelle, la hiérarchie de sections
 * canoniques, les métiers compatibles et le thème par défaut pour un archétype
 * de commerce donné.
 *
 * Blueprints de référence :
 *   1. BP01_RETAIL_ECOM    — Vente de produits physiques & e-commerce
 *   2. BP02_SERVICE_PRO    — Prestataires de services, formations & consultations
 *   3. BP03_HYBRID_MARKET  — Commerces mixtes multi-activités (Vêtements + Cours, etc.)
 *   4. BP04_LIVESTOCK_FARM — Élevage, bétail et produits agropastoraux
 */

import { z } from 'zod';
import type { BusinessType, Section } from '@/types/storefront';
import type { BusinessMeta, SectionPayload } from './blueprintInjector';

// ── 1. CONTRAT DE DONNÉES DU MASTER BLUEPRINT ─────────────────────────────────

export const MasterBlueprintSchema = z.object({
  /** Identifiant court normalisé (ex: 'BP01', 'BP02') */
  id: z.string().min(2),
  /** Code complet d'identification (ex: 'BP01_RETAIL_ECOM') */
  code: z.string().min(4),
  /** Nom public du blueprint */
  name: z.string().min(1),
  /** Description du positionnement et de la structure */
  description: z.string(),
  /** Catégorie architecturale */
  category: z.enum(['RETAIL', 'SERVICE', 'HYBRID', 'AGROPASTORAL', 'RESTAURANT', 'CUSTOM']),
  /** Métiers compatibles dans VesTyle */
  businessTypes: z.array(z.string()),
  /** Seed de thème recommandé par défaut */
  recommendedThemeSeed: z.string(),
  /** Séquence de sections canoniques composant le blueprint */
  sections: z.array(
    z.object({
      type: z.string(),
      variant: z.string().default('default'),
      order: z.number().int().nonnegative().default(0),
      visible: z.boolean().default(true),
      styles: z.record(z.string(), z.unknown()).optional().default({}),
      content: z.record(z.string(), z.unknown()).default({}),
    }),
  ),
  /** Tags de recherche et mots-clés sémantiques */
  tags: z.array(z.string()).default([]),
});

export type MasterBlueprint = z.infer<typeof MasterBlueprintSchema>;

// ── 2. CATALOGUE DES MASTER BLUEPRINTS DE RÉFÉRENCE ───────────────────────────

/**
 * BP01 — RETAIL & E-COMMERCE
 * Optimisé pour les boutiques de produits physiques (mode, chaussures, high-tech, beauté).
 * CTA directs WhatsApp, grille filtrable, avis vérifiés et paiements Mobile Money.
 */
export const BP01_RETAIL_ECOM: MasterBlueprint = {
  id: 'BP01',
  code: 'BP01_RETAIL_ECOM',
  name: 'Boutique E-commerce & Produits Physiques',
  description: 'Architecture optimisée pour la conversion e-commerce : Hero immersif, grille de produits 2 colonnes, filtres par catégorie, avis clients et commande WhatsApp directe.',
  category: 'RETAIL',
  businessTypes: ['PHYSICAL_PRODUCT', 'ARTISAN', 'RETAIL'],
  recommendedThemeSeed: 'VST-BP01-CLR01-F01-VB', // Emerald Luxury, Inter, Smooth
  tags: ['mode', 'vetements', 'chaussures', 'accessoires', 'beaute', 'ecommerce', 'boutique', 'produits', 'retail'],
  sections: [
    {
      type: 'HEADER',
      variant: 'header_001',
      order: 0,
      visible: true,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
        showCart: true,
        showSearch: true,
        badgeText: 'Livraison express disponible',
      },
    },
    {
      type: 'HERO',
      variant: 'hero_001',
      order: 1,
      visible: true,
      styles: {
        paddingTop: '64px',
        paddingBottom: '72px',
      },
      content: {
        title: 'Nouvelle Collection Disponible',
        subtitle: 'Commandez directement en ligne et recevez votre livraison à domicile avec paiement sécurisé MTN & Orange Money.',
        ctaText: 'Commander sur WhatsApp',
        badgeText: '✨ Boutique Officielle Vérifiée',
        showSocialProof: true,
      },
    },
    {
      type: 'CATEGORY',
      variant: 'category_pills',
      order: 2,
      visible: true,
      styles: {},
      content: {
        title: 'Parcourir les Catégories',
        categories: ['Tous les articles', 'Nouveautés', 'Meilleures Ventes', 'Promotions', 'Tendances'],
      },
    },
    {
      type: 'PRODUCT',
      variant: 'product_grid',
      order: 3,
      visible: true,
      styles: {},
      content: {
        title: 'Notre Catalogue',
        columns: 2,
        showPrice: true,
        showBadge: true,
        showCurrency: true,
        ctaText: 'Acheter via WhatsApp',
      },
    },
    {
      type: 'TESTIMONIAL',
      variant: 'testimonial_carousel',
      order: 4,
      visible: true,
      styles: {},
      content: {
        title: 'Ce que disent nos clients',
        subtitle: 'Plus de 500 clients satisfaits à Douala et Yaoundé.',
        items: [
          {
            name: 'Aïcha M.',
            comment: 'Qualité exceptionnelle et livraison en moins de 24h. Je recommande vivement !',
            rating: 5,
            city: 'Douala',
          },
          {
            name: 'Brice T.',
            comment: 'Très réactif sur WhatsApp, produit conforme aux photos. Paiement OM rapide.',
            rating: 5,
            city: 'Yaoundé',
          },
        ],
      },
    },
    {
      type: 'CONTACT',
      variant: 'contact_card',
      order: 5,
      visible: true,
      styles: {},
      content: {
        title: 'Contact & Emplacement',
        subtitle: 'Une question sur un article ? Notre équipe vous répond immédiatement.',
        showWhatsapp: true,
        showPhone: true,
        showAddress: true,
        openingHours: 'Lun - Sam : 08h30 - 19h30',
      },
    },
    {
      type: 'FOOTER',
      variant: 'footer_minimal',
      order: 6,
      visible: true,
      styles: {},
      content: {
        showCopyright: true,
        paymentMethods: ['MTN Mobile Money', 'Orange Money', 'Paiement à la livraison'],
        showSocialLinks: true,
      },
    },
  ],
};

/**
 * BP02 — SERVICE PROFESSIONNEL & FORMATION
 * Optimisé pour les prestataires de services, cabinets, cours particuliers, coiffure et consultants.
 * Mise en avant de l'expertise, grilles de forfaits tarifaires et réservation directe.
 */
export const BP02_SERVICE_PRO: MasterBlueprint = {
  id: 'BP02',
  code: 'BP02_SERVICE_PRO',
  name: 'Prestations de Services & Formations Pro',
  description: 'Architecture orientée crédibilité et prise de rendez-vous : Hero à forte proposition de valeur, catalogue de prestations détaillées, grille tarifaire transparente et formulaire de contact direct.',
  category: 'SERVICE',
  businessTypes: ['SERVICE', 'ARTISAN', 'CONSULTING', 'EDUCATION'],
  recommendedThemeSeed: 'VST-BP02-CLR04-F02-VA', // Tech Violet, Playfair Elegance, Sharp
  tags: ['service', 'cours', 'formation', 'consultant', 'coiffure', 'reparation', 'expertise', 'prestation', 'devis'],
  sections: [
    {
      type: 'HEADER',
      variant: 'header_001',
      order: 0,
      visible: true,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
        showCart: false,
        showSearch: false,
        ctaText: 'Prendre Rendez-vous',
      },
    },
    {
      type: 'HERO',
      variant: 'hero_001',
      order: 1,
      visible: true,
      styles: {
        paddingTop: '64px',
        paddingBottom: '72px',
      },
      content: {
        title: 'Expertise & Solutions Sur Mesure',
        subtitle: 'Profitez d\'un accompagnement professionnel de haute qualité adapté à vos exigences.',
        ctaText: 'Demander un Devis Gratuit',
        badgeText: '⭐ Prestataire Certifié & Recommandé',
        showSocialProof: true,
      },
    },
    {
      type: 'SERVICES',
      variant: 'services_grid',
      order: 2,
      visible: true,
      styles: {},
      content: {
        title: 'Nos Domaines d\'Intervention',
        subtitle: 'Des formules claires adaptées à chaque besoin.',
        items: [
          {
            id: 'srv_1',
            name: 'Consultation Initiale & Diagnostic',
            description: 'Audit complet de votre situation et plan d\'action personnalisé.',
            duration: '45 min',
            price: 'Sur devis',
          },
          {
            id: 'srv_2',
            name: 'Accompagnement Complet',
            description: 'Prise en charge intégrale avec suivi régulier et livrables dédiés.',
            duration: 'Sur mesure',
            price: 'Sur devis',
            badge: 'POPULAIRE',
          },
        ],
      },
    },
    {
      type: 'PRICING',
      variant: 'pricing_cards',
      order: 3,
      visible: true,
      styles: {},
      content: {
        title: 'Tarifs & Forfaits',
        subtitle: 'Une tarification transparente sans frais cachés.',
        tiers: [
          {
            name: 'Formule Essentielle',
            price: '15 000 FCFA',
            features: ['Diagnostic de base', 'Compte-rendu écrit', 'Support WhatsApp 48h'],
          },
          {
            name: 'Formule Complète',
            price: '45 000 FCFA',
            highlighted: true,
            features: ['Accompagnement dédié', 'Intervention prioritaire', 'Garantie de résultat', 'Support 7j/7'],
          },
        ],
      },
    },
    {
      type: 'TESTIMONIAL',
      variant: 'testimonial_carousel',
      order: 4,
      visible: true,
      styles: {},
      content: {
        title: 'Témoignages & Références',
        subtitle: 'Le retour de nos clients et partenaires de confiance.',
        items: [
          {
            name: 'Dr. Jean-Paul K.',
            comment: 'Un professionnalisme irréprochable et des délais respectés au millimètre.',
            rating: 5,
          },
          {
            name: 'Sandrine N.',
            comment: 'Très satisfaite de la prestation. Suivi impeccable sur WhatsApp.',
            rating: 5,
          },
        ],
      },
    },
    {
      type: 'CONTACT',
      variant: 'contact_card',
      order: 5,
      visible: true,
      styles: {},
      content: {
        title: 'Réserver ou Demander un Devis',
        subtitle: 'Réponse garantie en moins de 2 heures pendant les horaires ouvrés.',
        showWhatsapp: true,
        showPhone: true,
        showEmail: true,
        showAddress: true,
      },
    },
    {
      type: 'FOOTER',
      variant: 'footer_minimal',
      order: 6,
      visible: true,
      styles: {},
      content: {
        showCopyright: true,
        showSocialLinks: true,
      },
    },
  ],
};

/**
 * BP03 — HYBRIDE & MULTI-ACTIVITÉS
 * Structuré pour les entrepreneurs camerounais cumulant plusieurs activités
 * (ex: Vente de vêtements + Cours de soutien, Élevage + Vente de matériel, Artisanat + Ateliers).
 */
export const BP03_HYBRID_MARKET: MasterBlueprint = {
  id: 'BP03',
  code: 'BP03_HYBRID_MARKET',
  name: 'Commerce Hybride & Multi-Activités',
  description: 'Architecture tout-en-un pour les commerçants polyvalents : combine catalogue de produits physiques, grille de prestations de services, forfaits tarifaires et commande centralisée WhatsApp.',
  category: 'HYBRID',
  businessTypes: ['HYBRID', 'PHYSICAL_PRODUCT', 'SERVICE', 'ARTISAN'],
  recommendedThemeSeed: 'VST-BP03-CLR02-F08-VB', // Gold Dark, Outfit Future, Smooth
  tags: ['hybride', 'multi-activites', 'mixte', 'produits-services', 'polyvalent', 'boutique-cours', 'polyactivite'],
  sections: [
    {
      type: 'HEADER',
      variant: 'header_001',
      order: 0,
      visible: true,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
        showCart: true,
        showSearch: true,
        badgeText: 'Boutique & Services Réunis',
      },
    },
    {
      type: 'HERO',
      variant: 'hero_001',
      order: 1,
      visible: true,
      styles: {
        paddingTop: '64px',
        paddingBottom: '72px',
      },
      content: {
        title: 'Produits Sélectionnés & Services Experts',
        subtitle: 'Découvrez notre sélection de produits exclusifs et profitez de nos prestations sur mesure.',
        ctaText: 'Nous Contacter sur WhatsApp',
        badgeText: '🌟 Commerce Multi-Activités de Référence',
        showSocialProof: true,
      },
    },
    {
      type: 'SERVICES',
      variant: 'services_grid',
      order: 2,
      visible: true,
      styles: {},
      content: {
        title: 'Nos Prestations & Formations',
        subtitle: 'Des services qualifiés pour accompagner nos clients au quotidien.',
      },
    },
    {
      type: 'PRODUCT',
      variant: 'product_grid',
      order: 3,
      visible: true,
      styles: {},
      content: {
        title: 'Notre Sélection de Produits',
        subtitle: 'Articles de qualité disponibles immédiatement en stock.',
        columns: 2,
        showPrice: true,
        ctaText: 'Commander sur WhatsApp',
      },
    },
    {
      type: 'PRICING',
      variant: 'pricing_cards',
      order: 4,
      visible: true,
      styles: {},
      content: {
        title: 'Nos Formules & Packs Mixtes',
        subtitle: 'Profitez de nos offres combinées produits + accompagnement.',
      },
    },
    {
      type: 'TESTIMONIAL',
      variant: 'testimonial_carousel',
      order: 5,
      visible: true,
      styles: {},
      content: {
        title: 'Les Avis de nos Clients',
        subtitle: 'Tant sur nos produits que sur nos prestations.',
      },
    },
    {
      type: 'CONTACT',
      variant: 'contact_card',
      order: 6,
      visible: true,
      styles: {},
      content: {
        title: 'Contact & Point de Vente',
        subtitle: 'Échangez avec nous directement pour vos commandes de produits ou demandes de services.',
        showWhatsapp: true,
        showPhone: true,
        showAddress: true,
      },
    },
    {
      type: 'FOOTER',
      variant: 'footer_minimal',
      order: 7,
      visible: true,
      styles: {},
      content: {
        showCopyright: true,
        paymentMethods: ['MTN MoMo', 'Orange Money', 'Espèces au point de vente'],
        showSocialLinks: true,
      },
    },
  ],
};

/**
 * BP04 — ÉLEVAGE, BÉTAIL & AGROPASTORAL
 * Structuré pour les fermes avicoles, éleveurs de porcs, caprins, bétail et producteurs locaux.
 * Fiches de bétail avec badges de santé/vaccination, zone de provenance et options d'acompte/abattage.
 */
export const BP04_LIVESTOCK_FARM: MasterBlueprint = {
  id: 'BP04',
  code: 'BP04_LIVESTOCK_FARM',
  name: 'Élevage, Bétail & Produits Agropastoraux',
  description: 'Architecture dédiée aux fermes et éleveurs du Cameroun : Fiches de cheptel avec certificats sanitaires et âges, commande en gros ou détail, services vétérinaires/abattage et logistique de livraison.',
  category: 'AGROPASTORAL',
  businessTypes: ['LIVESTOCK_PRODUCT', 'PHYSICAL_PRODUCT', 'AGRICULTURE', 'AGROPASTORAL'],
  recommendedThemeSeed: 'VST-BP04-CLR08-F07-VA', // Forest Green, DM Sans, Sharp
  tags: ['elevage', 'poulets', 'betail', 'porcs', 'cheptel', 'ferme', 'agropastoral', 'agriculture', 'volailles', 'caprins', 'viande'],
  sections: [
    {
      type: 'HEADER',
      variant: 'header_001',
      order: 0,
      visible: true,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
        showCart: true,
        showSearch: true,
        badgeText: '🐔 Élevage Certifié — Suivi Vétérinaire Garanti',
      },
    },
    {
      type: 'HERO',
      variant: 'hero_001',
      order: 1,
      visible: true,
      styles: {
        paddingTop: '64px',
        paddingBottom: '72px',
      },
      content: {
        title: 'Bétail Sain, Volailles & Produits de la Ferme',
        subtitle: 'Approvisionnez votre restaurant, commerce ou foyer avec des sujets élevés dans le respect des normes sanitaires strictes.',
        ctaText: 'Commander le Cheptel sur WhatsApp',
        badgeText: '🌿 100% Suivi Vétérinaire & Alimentation Contrôlée',
        showSocialProof: true,
      },
    },
    {
      type: 'CATEGORY',
      variant: 'category_pills',
      order: 2,
      visible: true,
      styles: {},
      content: {
        title: 'Nos Espèces & Catégories',
        categories: ['Poulets de chair', 'Pondeuses', 'Porcs & Porcelets', 'Chèvres & Moutons', 'Aliments & Matériel'],
      },
    },
    {
      type: 'PRODUCT',
      variant: 'product_grid',
      order: 3,
      visible: true,
      styles: {},
      content: {
        title: 'Notre Cheptel Disponible Immédiatement',
        subtitle: 'Pesée garantie, carnet de vaccination à jour et possibilité de réservation sur acompte.',
        columns: 2,
        showPrice: true,
        showBadge: true,
        ctaText: 'Réserver un Lot sur WhatsApp',
      },
    },
    {
      type: 'SERVICES',
      variant: 'services_grid',
      order: 4,
      visible: true,
      styles: {},
      content: {
        title: 'Nos Services Agropastoraux',
        subtitle: 'Un accompagnement complet pour les particuliers et les revendeurs.',
        items: [
          {
            id: 'srv_vet_1',
            name: 'Abattage & Nettoyage Professionnel',
            description: 'Préparation hygiénique sur place selon vos instructions de découpe.',
            price: 'Inclus dès 5 sujets',
          },
          {
            id: 'srv_vet_2',
            name: 'Livraison Frigorifique Express',
            description: 'Acheminement direct à Douala, Yaoundé et périphérie.',
            price: 'Sur devis kilométrique',
            badge: 'RAPIDE',
          },
          {
            id: 'srv_vet_3',
            name: 'Conseil & Suivi Vétérinaire',
            description: 'Assistance technique pour jeunes éleveurs et fermes partenaires.',
            price: 'Sur demande',
          },
        ],
      },
    },
    {
      type: 'TESTIMONIAL',
      variant: 'testimonial_carousel',
      order: 5,
      visible: true,
      styles: {},
      content: {
        title: 'Avis des Restaurateurs & Éleveurs Partenaires',
        subtitle: 'Ils nous font confiance pour leur approvisionnement régulier.',
        items: [
          {
            name: 'Chef Martin — Restaurant Le Baobab',
            comment: 'Des poulets bien calibrés et une hygiène irréprochable. Livraison toujours à l\'heure.',
            rating: 5,
            city: 'Douala - Bonanjo',
          },
          {
            name: 'Ferdinand N. — Revendeur Marché Ndokoti',
            comment: 'Taux de mortalité zéro, bêtes très vigoureuses. Partenaire fiable depuis 2 ans.',
            rating: 5,
            city: 'Douala',
          },
        ],
      },
    },
    {
      type: 'CONTACT',
      variant: 'contact_card',
      order: 6,
      visible: true,
      styles: {},
      content: {
        title: 'Visiter la Ferme ou Commander',
        subtitle: 'Commandes en gros ou au détail. Réservation immédiate via WhatsApp.',
        showWhatsapp: true,
        showPhone: true,
        showAddress: true,
        farmLocation: 'Zone Agropastorale, Axe Lourd Douala-Nkongsamba',
      },
    },
    {
      type: 'FOOTER',
      variant: 'footer_minimal',
      order: 7,
      visible: true,
      styles: {},
      content: {
        showCopyright: true,
        paymentMethods: ['MTN MoMo', 'Orange Money', 'Virement bancaire', 'Paiement à la livraison'],
        showSocialLinks: true,
      },
    },
  ],
};

/**
 * BP05 — RESTAURATION, SNACK & TRAITEUR
 * Structuré pour les restaurants, snacks, traiteurs et services de livraison de repas.
 */
export const BP05_RESTAURANT_FOOD: MasterBlueprint = {
  id: 'BP05',
  code: 'BP05_RESTAURANT_FOOD',
  name: 'Restauration, Snack & Traiteur',
  description: 'Architecture dédiée aux restaurants et traiteurs : Menu numérique, plats du jour avec commande WhatsApp, galerie d\'ambiance et localisation.',
  category: 'RESTAURANT',
  businessTypes: ['RESTAURANT', 'FOOD', 'PHYSICAL_PRODUCT'],
  recommendedThemeSeed: 'VST-BP05-CLR05-F03-VB', // Terracotta Warm, Poppins, Smooth
  tags: ['restaurant', 'snack', 'traiteur', 'repas', 'plat', 'menu', 'cuisine', 'livraison-repas', 'nourriture'],
  sections: [
    {
      type: 'HEADER',
      variant: 'header_001',
      order: 0,
      visible: true,
      styles: {},
      content: {
        isSticky: true,
        showCity: true,
        showCart: true,
        showSearch: true,
        badgeText: '🍽️ Menu & Livraison Ouverts',
      },
    },
    {
      type: 'HERO',
      variant: 'hero_001',
      order: 1,
      visible: true,
      styles: { paddingTop: '64px', paddingBottom: '72px' },
      content: {
        title: 'Saveurs Authentiques & Plats Fait Maison',
        subtitle: 'Dégustez nos spécialités culinaires sur place ou faites-vous livrer rapidement à domicile et au bureau.',
        ctaText: 'Commander le Menu sur WhatsApp',
        badgeText: '👨‍🍳 Ingrédients Frais & Cuisine Locale',
      },
    },
    {
      type: 'CATEGORY',
      variant: 'category_pills',
      order: 2,
      visible: true,
      styles: {},
      content: {
        title: 'Notre Menu',
        categories: ['Plats du Jour', 'Grillades & Poissons', 'Accompagnements', 'Boissons & Jus Frais', 'Desserts'],
      },
    },
    {
      type: 'PRODUCT',
      variant: 'product_grid',
      order: 3,
      visible: true,
      styles: {},
      content: {
        title: 'Plats du Jour & Spécialités',
        columns: 2,
        showPrice: true,
        showBadge: true,
        ctaText: 'Commander sur WhatsApp',
      },
    },
    {
      type: 'GALLERY',
      variant: 'gallery_masonry',
      order: 4,
      visible: true,
      styles: {},
      content: {
        title: 'Notre Ambiance & Nos Créations',
        subtitle: 'Une immersion dans notre univers gourmand et convivial.',
      },
    },
    {
      type: 'CONTACT',
      variant: 'contact_card',
      order: 5,
      visible: true,
      styles: {},
      content: {
        title: 'Réservation de Table & Livraison Express',
        subtitle: 'Passez commande directement sur WhatsApp ou réservez votre table.',
        showWhatsapp: true,
        showPhone: true,
        showAddress: true,
      },
    },
    {
      type: 'FOOTER',
      variant: 'footer_minimal',
      order: 6,
      visible: true,
      styles: {},
      content: {
        showCopyright: true,
        paymentMethods: ['MTN MoMo', 'Orange Money', 'Paiement à la livraison', 'Espèces'],
        showSocialLinks: true,
      },
    },
  ],
};

// ── 3. REGISTRE CENTRAL DES MASTER BLUEPRINTS ─────────────────────────────────

class MasterBlueprintRegistryStore {
  private registry = new Map<string, MasterBlueprint>();

  constructor() {
    this.register(BP01_RETAIL_ECOM);
    this.register(BP02_SERVICE_PRO);
    this.register(BP03_HYBRID_MARKET);
    this.register(BP04_LIVESTOCK_FARM);
    this.register(BP05_RESTAURANT_FOOD);
  }

  /**
   * Enregistre un Master Blueprint dans le catalogue
   */
  public register(blueprint: MasterBlueprint): void {
    const parsed = MasterBlueprintSchema.safeParse(blueprint);
    if (!parsed.success) {
      console.error(`[MasterBlueprintRegistry] Blueprint invalide id=${blueprint?.id}:`, parsed.error.flatten());
      return;
    }
    const data = parsed.data;
    // Enregistrement par ID court (BP01) et code complet (BP01_RETAIL_ECOM)
    this.registry.set(data.id.toUpperCase(), data);
    this.registry.set(data.code.toUpperCase(), data);
  }

  /**
   * Récupère un Blueprint par son ID ou son Code
   */
  public get(idOrCode: string): MasterBlueprint | undefined {
    if (!idOrCode || typeof idOrCode !== 'string') return undefined;
    return this.registry.get(idOrCode.trim().toUpperCase());
  }

  /**
   * Vérifie la présence d'un Blueprint
   */
  public has(idOrCode: string): boolean {
    if (!idOrCode || typeof idOrCode !== 'string') return false;
    return this.registry.has(idOrCode.trim().toUpperCase());
  }

  /**
   * Retourne la liste dédoublonnée de tous les Blueprints maîtres
   */
  public getAll(): MasterBlueprint[] {
    const seen = new Set<string>();
    const result: MasterBlueprint[] = [];

    for (const bp of this.registry.values()) {
      if (!seen.has(bp.id)) {
        seen.add(bp.id);
        result.push(bp);
      }
    }
    return result;
  }

  /**
   * Instancie les sections canoniques d'un blueprint adaptées aux métadonnées métier
   */
  public instantiateSections(
    blueprint: MasterBlueprint,
    businessMeta: BusinessMeta,
  ): SectionPayload[] {
    const storeName = (businessMeta.storeName || '').trim() || 'Notre Boutique';
    const city = (businessMeta.city || 'Douala').trim();
    const slogan = (businessMeta.slogan || '').trim();
    const description = (businessMeta.description || '').trim();
    const whatsapp = (businessMeta.whatsapp || businessMeta.phone || '').trim();

    return blueprint.sections.map((sec, idx) => {
      const clonedContent = { ...sec.content };

      // Injection contextuelle des métadonnées dans les sections appropriées
      if (sec.type === 'HERO') {
        if (slogan) clonedContent.title = slogan;
        if (description) clonedContent.subtitle = description;
      } else if (sec.type === 'HEADER') {
        clonedContent.storeName = storeName;
        clonedContent.city = city;
      } else if (sec.type === 'CONTACT') {
        clonedContent.whatsapp = whatsapp;
        clonedContent.city = city;
        if (businessMeta.address) clonedContent.address = businessMeta.address;
      }

      return {
        id: `sec_${sec.type.toLowerCase()}_${idx + 1}`,
        type: sec.type,
        variant: sec.variant,
        order: sec.order,
        visible: sec.visible,
        styles: { ...sec.styles },
        content: clonedContent,
      };
    });
  }
}

export const MasterBlueprintRegistry = new MasterBlueprintRegistryStore();

// ── 4. EXPORT DES CONSTANTES UTILES ───────────────────────────────────────────

export const MASTER_BLUEPRINTS: MasterBlueprint[] = [
  BP01_RETAIL_ECOM,
  BP02_SERVICE_PRO,
  BP03_HYBRID_MARKET,
  BP04_LIVESTOCK_FARM,
  BP05_RESTAURANT_FOOD,
];
