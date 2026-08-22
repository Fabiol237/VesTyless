/**
 * VeStyle — Template Loader (Block Engine)
 * 
 * Charge dynamiquement les templates JSON par ID.
 * Les templates sont créés un par un par l'architecte plateforme,
 * en analysant des sites de référence et en assemblant les blocs existants.
 * 
 * Workflow :
 *   1. L'architecte analyse un site de référence (lien ou fichier local)
 *   2. Il identifie les blocs nécessaires et leurs settings/variants
 *   3. Il crée un fichier JSON dans /templates/ avec l'assemblage
 *   4. Il enregistre le template ci-dessous dans TEMPLATES
 *   5. Il enregistre la fiche dans storeTemplates.js
 * 
 * Blocs disponibles : header, hero, collection, category, offer, contact,
 *   review, newsletter, footer, faq, feature, stats, cta, gallery, video,
 *   social, booking
 */

import boutiquelivresscolaires from './templates/boutique_livres_scolaires.json';

// ─── Registre des templates ─────────────────────────────────────────────────
// Ajouter ici chaque nouveau template après création du fichier JSON.
const TEMPLATES = {
  'boutique_livres_scolaires': boutiquelivresscolaires,
};

// ─── Instanciation ──────────────────────────────────────────────────────────
function instantiate(tpl) {
  if (!tpl) return { blocks: [] };
  return {
    ...tpl,
    blocks: (tpl.blocks || []).map((b, idx) => ({
      id: `block_${b.type}_${Date.now()}_${idx}`,
      type: b.type,
      variant: b.variant || 'default',
      enabled: b.enabled !== false,
      position: b.position ?? idx,
      settings: b.settings || {},
      content: b.content || {},
    })),
  };
}

/**
 * Charge un template par son ID.
 * @param {string} templateId - L'identifiant unique du template
 * @param {string} storeSector - Le secteur de la boutique (pour fallback)
 * @returns {{ blocks: Array }} Template instancié avec IDs uniques
 */
export function loadTemplate(templateId, storeSector) {
  if (TEMPLATES[templateId]) {
    return instantiate(TEMPLATES[templateId]);
  }
  // Aucun template trouvé → retourne un layout vide
  return { blocks: [] };
}

/**
 * Retourne tous les templates enregistrés.
 */
export function getAllTemplates() {
  return Object.values(TEMPLATES);
}
