/**
 * VesTyle / Vestin — Classe Utilitaires BusinessProfile
 * ─────────────────────────────────────────────────────────────────────────────
 * Méthodes helpers pures pour interagir avec une instance BusinessProfile.
 */

export class BusinessProfileHelper {
  constructor(profile) {
    this.profile = profile;
  }

  get id() { return this.profile.id; }
  get name() { return this.profile.identity.name; }
  get slug() { return this.profile.identity.slug; }
  get businessType() { return this.profile.business.type; }
  get theme() { return this.profile.storefront.theme; }
  get products() { return this.profile.catalog.products; }
  get activeProducts() { return this.profile.catalog.products.filter(p => p.isActive); }

  /**
   * Vérifie si une capacité est activée pour ce profil
   */
  hasCapability(capabilityName) {
    return Boolean(this.profile.capabilities?.[capabilityName]);
  }

  /**
   * Formate un montant dans la devise du commerce
   */
  formatPrice(amount) {
    const num = Number(amount) || 0;
    const formatted = new Intl.NumberFormat('fr-FR').format(num);
    return `${formatted} ${this.profile.commerce.currencySymbol || 'FCFA'}`;
  }

  /**
   * Retourne l'URL WhatsApp directe avec message pré-rempli
   */
  getWhatsAppUrl(customMessage = '') {
    const phone = (this.profile.identity.whatsapp || this.profile.identity.phone || '').replace(/\D/g, '');
    if (!phone) return null;
    const msg = encodeURIComponent(customMessage || `Bonjour ${this.name}, je visite votre vitrine en ligne !`);
    return `https://wa.me/${phone}?text=${msg}`;
  }
}

export const createProfileHelper = (profile) => new BusinessProfileHelper(profile);
