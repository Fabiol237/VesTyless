/**
 * VesTyle V1 — @/lib/capability-engine/CapabilityEngine (Stub)
 * ─────────────────────────────────────────────────────────────────────────────
 * Définit les capacités disponibles pour chaque type de business Vestin.
 * Utilisé par businessProfileAdapter pour résoudre les fonctionnalités actives.
 */

export const CAPABILITIES = {
  PRODUCTS: 'PRODUCTS',
  INVENTORY: 'INVENTORY',
  ORDERS: 'ORDERS',
  DELIVERY: 'DELIVERY',
  PROMOTIONS: 'PROMOTIONS',
  WHATSAPP: 'WHATSAPP',
  REVIEWS: 'REVIEWS',
  BOOKINGS: 'BOOKINGS',
  RESERVATIONS: 'RESERVATIONS',
  ROOMS: 'ROOMS',
  MENU: 'MENU',
  APPOINTMENTS: 'APPOINTMENTS',
  GALLERY: 'GALLERY',
  SERVICES: 'SERVICES',
  CUSTOMERS: 'CUSTOMERS',
  LEADS: 'LEADS',
  CHAT: 'CHAT',
  AI_ASSISTANT: 'AI_ASSISTANT',
  CATALOG_PDF: 'CATALOG_PDF',
  LIVE_SALES: 'LIVE_SALES',
  NOTIFICATIONS: 'NOTIFICATIONS',
};

/** Capacités par type de business legacy (business_type Supabase). */
const BUSINESS_TYPE_CAPABILITIES = {
  product: [CAPABILITIES.PRODUCTS, CAPABILITIES.INVENTORY, CAPABILITIES.ORDERS, CAPABILITIES.DELIVERY, CAPABILITIES.PROMOTIONS, CAPABILITIES.WHATSAPP, CAPABILITIES.REVIEWS],
  ecommerce: [CAPABILITIES.PRODUCTS, CAPABILITIES.INVENTORY, CAPABILITIES.ORDERS, CAPABILITIES.DELIVERY, CAPABILITIES.PROMOTIONS, CAPABILITIES.WHATSAPP, CAPABILITIES.REVIEWS, CAPABILITIES.LIVE_SALES],
  hotel: [CAPABILITIES.ROOMS, CAPABILITIES.BOOKINGS, CAPABILITIES.GALLERY, CAPABILITIES.REVIEWS],
  restaurant: [CAPABILITIES.MENU, CAPABILITIES.RESERVATIONS, CAPABILITIES.GALLERY, CAPABILITIES.REVIEWS],
  services: [CAPABILITIES.SERVICES, CAPABILITIES.APPOINTMENTS, CAPABILITIES.LEADS, CAPABILITIES.REVIEWS],
  fashion: [CAPABILITIES.PRODUCTS, CAPABILITIES.INVENTORY, CAPABILITIES.ORDERS, CAPABILITIES.WHATSAPP, CAPABILITIES.REVIEWS],
  beauty: [CAPABILITIES.SERVICES, CAPABILITIES.APPOINTMENTS, CAPABILITIES.GALLERY, CAPABILITIES.REVIEWS],
  pharmacy: [CAPABILITIES.PRODUCTS, CAPABILITIES.INVENTORY, CAPABILITIES.ORDERS, CAPABILITIES.WHATSAPP],
  creative: [CAPABILITIES.GALLERY, CAPABILITIES.SERVICES, CAPABILITIES.LEADS],
  event: [CAPABILITIES.SERVICES, CAPABILITIES.BOOKINGS, CAPABILITIES.GALLERY],
  real_estate: [CAPABILITIES.GALLERY, CAPABILITIES.LEADS, CAPABILITIES.APPOINTMENTS],
  default: [CAPABILITIES.PRODUCTS, CAPABILITIES.WHATSAPP, CAPABILITIES.REVIEWS],
};

export const capabilityEngine = {
  /**
   * Retourne la liste des capacités pour un type de business donné.
   * @param {string} businessType
   * @returns {string[]}
   */
  getCapabilities(businessType) {
    return BUSINESS_TYPE_CAPABILITIES[businessType] || BUSINESS_TYPE_CAPABILITIES.default;
  },

  /**
   * Vérifie si un business type a une capacité spécifique.
   * @param {string} businessType
   * @param {string} capability
   * @returns {boolean}
   */
  hasCapability(businessType, capability) {
    return this.getCapabilities(businessType).includes(capability);
  },

  /**
   * Retourne un objet map capacité→boolean pour un type donné.
   * @param {string} businessType
   * @returns {Record<string, boolean>}
   */
  getCapabilityMap(businessType) {
    const caps = this.getCapabilities(businessType);
    return Object.values(CAPABILITIES).reduce((acc, cap) => {
      acc[cap] = caps.includes(cap);
      return acc;
    }, {});
  },
};

export default capabilityEngine;
