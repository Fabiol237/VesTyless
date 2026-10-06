/**
 * VesTyle / Vestine — Data Binding Engine v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture : COMPONENT -> DATA SOURCE -> FIELD
 *
 * RÈGLES STRICTES :
 * 1. Zéro fausse donnée commerciale en publication (produits, prix, promos, avis).
 * 2. Chaque donnée affichée porte sa provenance traçable (CONTENT_SOURCE).
 * 3. Les composants résolvent leurs données à partir de ce moteur.
 */

import { CONTENT_SOURCE, isPublicallySafe } from './ContentSource';

export const DATA_ENTITIES = {
  STORE: 'store',
  PRODUCTS: 'products',
  SERVICES: 'services',
  PROMOTIONS: 'promotions',
  REVIEWS: 'reviews',
  STAFF: 'staff',
  OPENING_HOURS: 'opening_hours',
  CONTACT: 'contact',
};

/**
 * Schémas de liaison par défaut selon le type de section
 */
export const DEFAULT_BINDINGS_BY_TYPE = {
  HEADER: {
    entity: DATA_ENTITIES.STORE,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      name: 'name',
      city: 'city',
      phone: 'whatsapp_number',
      logoUrl: 'logo_url',
    },
  },
  HERO: {
    entity: DATA_ENTITIES.STORE,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      title: 'slogan',
      subtitle: 'description',
      ctaText: 'ctaText',
    },
  },
  PRODUCT: {
    entity: DATA_ENTITIES.PRODUCTS,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      id: 'id',
      title: 'name',
      price: 'price',
      image: 'image_url',
      category: 'category',
      stock: 'stock',
    },
  },
  PRODUCTS: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PRODUCT_GRID: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PRODUCT_CAROUSEL: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PRODUCT_LIST: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PRODUCT_FEATURED: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PRODUCT_001: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  CATEGORY: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  CATEGORIES: { entity: DATA_ENTITIES.PRODUCTS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  SERVICE: {
    entity: DATA_ENTITIES.SERVICES,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      id: 'id',
      title: 'title',
      price: 'price',
      duration: 'duration',
      description: 'description',
    },
  },
  SERVICES: { entity: DATA_ENTITIES.SERVICES, source: CONTENT_SOURCE.REAL_STORE_DATA },
  SERVICE_GRID: { entity: DATA_ENTITIES.SERVICES, source: CONTENT_SOURCE.REAL_STORE_DATA },
  SERVICE_FEATURED: { entity: DATA_ENTITIES.SERVICES, source: CONTENT_SOURCE.REAL_SOURCE_DATA },
  SERVICE_001: { entity: DATA_ENTITIES.SERVICES, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PROMOTION: {
    entity: DATA_ENTITIES.PROMOTIONS,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      title: 'title',
      description: 'description',
      discount: 'discount_value',
      code: 'code',
      validUntil: 'valid_until',
    },
  },
  PROMOTIONS: { entity: DATA_ENTITIES.PROMOTIONS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  PROMO: { entity: DATA_ENTITIES.PROMOTIONS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  TESTIMONIAL: {
    entity: DATA_ENTITIES.REVIEWS,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      id: 'id',
      author: 'customer_name',
      quote: 'comment',
      rating: 'rating',
    },
  },
  TESTIMONIALS: { entity: DATA_ENTITIES.REVIEWS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  TESTIMONIAL_GRID: { entity: DATA_ENTITIES.REVIEWS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  TESTIMONIAL_001: { entity: DATA_ENTITIES.REVIEWS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  REVIEWS: { entity: DATA_ENTITIES.REVIEWS, source: CONTENT_SOURCE.REAL_STORE_DATA },
  FOOTER: {
    entity: DATA_ENTITIES.STORE,
    source: CONTENT_SOURCE.REAL_STORE_DATA,
    fields: {
      name: 'name',
      city: 'city',
      phone: 'whatsapp_number',
      address: 'address',
      openingHours: 'opening_hours',
    },
  },
};

export class DataBindingEngine {
  /**
   * Résout les données d'une section en fonction de son binding, du StoreConfig et des données réelles
   * @param {Object} section
   * @param {Object} storeConfig
   * @param {Object} context - { products, services, promotions, reviews, isEditing }
   * @returns {Object} { boundData, source, isPlaceholder, isMissingRealData }
   */
  static resolveSectionData(section, storeConfig = {}, context = {}) {
    if (!section) return { boundData: null, source: CONTENT_SOURCE.TEMPLATE_DEFAULT };

    const rawType = ((section.type || section.family || section.variant || '') + '').toUpperCase().trim();
    const binding = section.dataBinding || section.dataBindings || DEFAULT_BINDINGS_BY_TYPE[rawType] || {};
    let entity = binding.entity;

    // Normalisation préventive pour éviter qu'une section produit/service hérite de STORE
    if (!entity) {
      if (rawType.includes('PRODUCT') || rawType.includes('PROD') || rawType.includes('CATALOG') || rawType.includes('CATEGORY')) {
        entity = DATA_ENTITIES.PRODUCTS;
      } else if (rawType.includes('SERVICE') || rawType.includes('PRESTATION')) {
        entity = DATA_ENTITIES.SERVICES;
      } else if (rawType.includes('TESTIMONIAL') || rawType.includes('REVIEW') || rawType.includes('AVIS')) {
        entity = DATA_ENTITIES.REVIEWS;
      } else if (rawType.includes('PROMO') || rawType.includes('BANNER')) {
        entity = DATA_ENTITIES.PROMOTIONS;
      } else {
        entity = DATA_ENTITIES.STORE;
      }
    }

    const isEditing = Boolean(context.isEditing);

    switch (entity) {
      case DATA_ENTITIES.PRODUCTS: {
        const rawProducts = context.products || storeConfig.products || [];
        const validProducts = Array.isArray(rawProducts) ? rawProducts : [];

        if (validProducts.length > 0) {
          return {
            boundData: validProducts.map((p) => ({
              id: p.id || String(Math.random()),
              title: p.name || p.title || 'Article',
              price: typeof p.price === 'number' ? `${p.price.toLocaleString('fr-FR')} FCFA` : (p.price || '0 FCFA'),
              numericPrice: p.price || 0,
              image: p.image_url || p.image || p.assets?.imageUrl || '',
              category: p.category || p.category_name || 'Boutique',
              stock: p.stock ?? null,
              _source: CONTENT_SOURCE.REAL_STORE_DATA,
            })),
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: false,
          };
        }

        // Pas de produits réels
        if (!isEditing) {
          // INTERDICTION STRICTE : Zéro faux produit en mode public
          return {
            boundData: [],
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: true,
          };
        }

        // Mode édition : placeholder explicitement balisé TEMPLATE_DEFAULT
        return {
          boundData: [
            {
              id: 'demo_prod_1',
              title: 'Exemple de Produit (Ajoutez vos articles dans le Dashboard)',
              price: '0 FCFA',
              numericPrice: 0,
              image: '',
              category: 'Démonstration',
              _source: CONTENT_SOURCE.TEMPLATE_DEFAULT,
            },
          ],
          source: CONTENT_SOURCE.TEMPLATE_DEFAULT,
          isPlaceholder: true,
          isMissingRealData: true,
        };
      }

      case DATA_ENTITIES.PROMOTIONS: {
        const promo = storeConfig.activePromotion || context.promotions?.[0] || null;
        if (promo && (promo.message || promo.title || promo.discount_value)) {
          return {
            boundData: {
              title: promo.title || promo.message || '',
              message: promo.message || promo.title || '',
              discount: promo.discount_value || promo.discount || null,
              code: promo.code || '',
              _source: CONTENT_SOURCE.REAL_STORE_DATA,
            },
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: false,
          };
        }

        // En public : aucune fausse promo
        return {
          boundData: null,
          source: CONTENT_SOURCE.TEMPLATE_DEFAULT,
          isPlaceholder: !promo,
          isMissingRealData: true,
        };
      }

      case DATA_ENTITIES.SERVICES: {
        const rawServices = context.services || storeConfig.services || [];
        const validServices = Array.isArray(rawServices) ? rawServices : [];
        if (validServices.length > 0) {
          return {
            boundData: validServices.map((s, idx) => ({
              id: s.id || `srv_${idx}`,
              title: s.title || s.name || 'Prestation',
              price: typeof s.price === 'number' ? `${s.price.toLocaleString('fr-FR')} FCFA` : (s.price || 'Sur devis'),
              duration: s.duration || '30 min',
              description: s.description || '',
              _source: CONTENT_SOURCE.REAL_STORE_DATA,
            })),
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: false,
          };
        }

        if (!isEditing) {
          return {
            boundData: [],
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: true,
          };
        }

        return {
          boundData: [
            {
              id: 'demo_srv_1',
              title: 'Exemple de Prestation (À configurer)',
              price: '0 FCFA',
              duration: '30 min',
              description: 'Configurez vos prestations dans le tableau de bord.',
              _source: CONTENT_SOURCE.TEMPLATE_DEFAULT,
            },
          ],
          source: CONTENT_SOURCE.TEMPLATE_DEFAULT,
          isPlaceholder: true,
          isMissingRealData: true,
        };
      }

      case DATA_ENTITIES.REVIEWS: {
        const rawReviews = context.reviews || storeConfig.reviews || [];
        const validReviews = Array.isArray(rawReviews) ? rawReviews : [];
        if (validReviews.length > 0) {
          return {
            boundData: validReviews.map((r, idx) => ({
              id: r.id || `rev_${idx}`,
              author: r.customer_name || r.author || 'Client Vérifié',
              quote: r.comment || r.quote || '',
              rating: r.rating || 5,
              _source: CONTENT_SOURCE.REAL_STORE_DATA,
            })),
            source: CONTENT_SOURCE.REAL_STORE_DATA,
            isPlaceholder: false,
            isMissingRealData: false,
          };
        }

        return {
          boundData: [],
          source: CONTENT_SOURCE.REAL_STORE_DATA,
          isPlaceholder: false,
          isMissingRealData: true,
        };
      }

      case DATA_ENTITIES.STORE:
      default: {
        const desc = storeConfig.businessDescription || {};
        return {
          boundData: {
            name: desc.name || storeConfig.name || 'Ma Boutique',
            slogan: desc.slogan || '',
            description: desc.description || '',
            city: desc.city || 'Douala',
            address: desc.address || '',
            whatsappNumber: desc.whatsappNumber || storeConfig.whatsapp_number || '',
            phone: desc.phone || storeConfig.phone || '',
            logoUrl: storeConfig.logo_url || storeConfig.assets?.logoUrl || '',
            bannerUrl: storeConfig.banner_url || storeConfig.assets?.bannerUrl || '',
            _source: CONTENT_SOURCE.REAL_STORE_DATA,
          },
          source: CONTENT_SOURCE.REAL_STORE_DATA,
          isPlaceholder: false,
          isMissingRealData: false,
        };
      }
    }
  }
}
