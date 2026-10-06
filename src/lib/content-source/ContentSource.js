/**
 * VesTyle / Vestine — Content Source System
 * ─────────────────────────────────────────────────────────────────────────────
 * RÈGLE FONDAMENTALE :
 * Chaque donnée affichée dans une boutique doit avoir une provenance traçable.
 *
 * Une donnée ne peut JAMAIS être affichée publiquement si sa source est DEMO_DATA.
 * Une donnée AI_GENERATED_DRAFT doit attendre validation du vendeur avant publication.
 */

/**
 * Sources de données possibles
 */
export const CONTENT_SOURCE = {
  /** Vraie donnée du commerçant (produit, service, prix, contact, etc.) */
  REAL_STORE_DATA: 'REAL_STORE_DATA',
  /** Paramètre système non modifiable par le vendeur */
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  /** Valeur par défaut fournie par le template — doit être remplacée */
  TEMPLATE_DEFAULT: 'TEMPLATE_DEFAULT',
  /** Donnée de démonstration — JAMAIS affichée en mode public */
  DEMO_DATA: 'DEMO_DATA',
  /** Suggestion générée par l'IA — nécessite validation du vendeur avant publication */
  AI_GENERATED_DRAFT: 'AI_GENERATED_DRAFT',
};

/**
 * Marque un objet comme donnée de démo
 * → ne sera jamais affiché publiquement
 */
export function markAsDemo(data) {
  if (!data || typeof data !== 'object') return data;
  return { ...data, _source: CONTENT_SOURCE.DEMO_DATA, _isPublic: false };
}

/**
 * Marque un objet comme suggestion IA en attente de validation
 */
export function markAsAIDraft(data) {
  if (!data || typeof data !== 'object') return data;
  return { ...data, _source: CONTENT_SOURCE.AI_GENERATED_DRAFT, _isPublic: false, _requiresValidation: true };
}

/**
 * Marque un objet comme vraie donnée validée du vendeur
 */
export function markAsRealData(data) {
  if (!data || typeof data !== 'object') return data;
  return { ...data, _source: CONTENT_SOURCE.REAL_STORE_DATA, _isPublic: true };
}

/**
 * Marque un objet comme valeur par défaut de template (placeholder)
 */
export function markAsTemplateDefault(data) {
  if (!data || typeof data !== 'object') return data;
  return { ...data, _source: CONTENT_SOURCE.TEMPLATE_DEFAULT, _isPublic: false };
}

/**
 * Vérifie si une donnée peut être affichée publiquement
 * Une donnée sans marquage est considérée sûre par défaut (compatibilité descendante)
 */
export function isPublicallySafe(data) {
  if (!data || typeof data !== 'object') return true;
  // Données explicitement marquées non publiques
  if (data._isPublic === false) return false;
  // Données de démo interdites en public
  if (data._source === CONTENT_SOURCE.DEMO_DATA) return false;
  // Brouillons IA non validés interdits en public
  if (data._source === CONTENT_SOURCE.AI_GENERATED_DRAFT) return false;
  return true;
}

/**
 * Retourne la source d'une donnée
 */
export function getSource(data) {
  if (!data || typeof data !== 'object') return CONTENT_SOURCE.REAL_STORE_DATA;
  return data._source || CONTENT_SOURCE.REAL_STORE_DATA;
}

/**
 * Filtre une liste de données pour n'exposer que les données sûres en mode public
 */
export function filterPublicData(items = []) {
  return items.filter(isPublicallySafe);
}

/**
 * Nettoie les métadonnées internes avant envoi API ou rendu final
 * (supprime _source, _isPublic, _requiresValidation des données exportées)
 */
export function stripSourceMetadata(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(stripSourceMetadata);
  const { _source, _isPublic, _requiresValidation, ...clean } = data;
  return clean;
}
