// Template registry — maps store_template IDs to React components
import TemplateBoutique from './TemplateBoutique';
import TemplateBoutiquePro from './TemplateBoutiquePro';
import TemplateResto from './TemplateResto';
import TemplatePresta from './TemplatePresta';

const MAP = {
  // Secteur 1 : Boutique (E-Commerce)
  'boutique_pro': TemplateBoutiquePro,
  'boutique_luxe': TemplateBoutique,
  'boutique_market': TemplateBoutiquePro,
  'boutique_fashion': TemplateBoutique,

  // Secteur 2 : Artisan & Restaurant
  'artisan_resto_gourmet': TemplateResto,
  'artisan_atelier_beaute': TemplateResto,
  'artisan_cafe_moderne': TemplateResto,
  'artisan_atelier': TemplateResto,
  'artisan_salon_beaute': TemplateResto,

  // Secteur 3 : Prestataire & Services
  'presta_agence_corporate': TemplatePresta,
  'presta_freelance_portfolio': TemplatePresta,
  'presta_immobilier': TemplatePresta,
};

export function getTemplate(modules = [], store = {}) {
  if (store?.store_template && MAP[store.store_template]) {
    return MAP[store.store_template];
  }

  // Fallback selon le business_type ou par défaut boutique pro
  if (store?.business_type === 'restaurant' || store?.business_type === 'artisan') {
    return TemplateResto;
  }
  if (store?.business_type === 'service' || store?.business_type === 'prestataire') {
    return TemplatePresta;
  }

  // Defaut si non défini
  return TemplateBoutiquePro;
}

export const TEMPLATES = MAP;
