/**
 * VesTyle — Intelligent Blueprint Selector Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Moteur de sélection intelligente du Master Blueprint optimal.
 *
 * Analyse le type d'activité du marchand (`BusinessType`) ainsi que les signaux
 * contextuels (secteur, description, mots-clés) pour résoudre l'architecture
 * de vitrine la plus performante.
 *
 * Règles de résolution :
 *   1. Résolution explicite directe par BusinessType
 *   2. Raffinement sémantique par mots-clés d'intention (intentData)
 *   3. Fallback intelligent vers BP03_HYBRID_MARKET si activité mixte ou indéterminée
 */

import type { BusinessType } from '@/types/storefront';
import {
  MasterBlueprintRegistry,
  BP01_RETAIL_ECOM,
  BP02_SERVICE_PRO,
  BP03_HYBRID_MARKET,
  BP04_LIVESTOCK_FARM,
  BP05_RESTAURANT_FOOD,
  type MasterBlueprint,
} from './masterBlueprints';

// ── 1. DICTIONNAIRES SÉMANTIQUES D'INTENTION ──────────────────────────────────

const LIVESTOCK_KEYWORDS = [
  'elevage', 'élevage', 'poulet', 'poulets', 'volaille', 'volailles', 'porc',
  'porcs', 'porcelet', 'porcelets', 'ferme', 'cheptel', 'betail', 'bétail',
  'agropastoral', 'agriculture', 'caprin', 'caprins', 'mouton', 'moutons',
  'poussin', 'poussins', 'pondeuse', 'pondeuses', 'chair', 'gésier', 'lapin',
];

const SERVICE_KEYWORDS = [
  'service', 'services', 'cours', 'formation', 'formations', 'soutien',
  'consultant', 'consulting', 'cabinet', 'coiffure', 'coiffeur', 'salon',
  'reparation', 'réparation', 'depannage', 'dépannage', 'prestation', 'prestations',
  'agence', 'avocat', 'comptable', 'devis', 'rdv', 'rendez-vous', 'atelier',
];

const RESTAURANT_KEYWORDS = [
  'restaurant', 'snack', 'traiteur', 'repas', 'plat', 'plats', 'menu', 'cuisine',
  'grillades', 'poisson braise', 'poisson braisé', 'livraison repas', 'nourriture',
];

const RETAIL_KEYWORDS = [
  'vetement', 'vêtement', 'vetements', 'vêtements', 'mode', 'robe', 'robes',
  'chaussure', 'chaussures', 'sneakers', 'sac', 'sacs', 'accessoire', 'accessoires',
  'telephone', 'téléphone', 'bijoux', 'beaute', 'beauté', 'cosmetique', 'cosmétique',
  'boutique', 'ecom', 'ecommerce', 'articles', 'collection', 'stock',
];

// ── 2. TYPES D'INTENTION ──────────────────────────────────────────────────────

export interface IntentData {
  sector?: string;
  description?: string;
  slogan?: string;
  storeName?: string;
  keywords?: string[];
  text?: string;
}

// ── 3. FONCTION DE SÉLECTION INTELLIGENTE ──────────────────────────────────────

/**
 * Sélectionne le Master Blueprint optimal selon le profil du marchand et ses intentions.
 *
 * @param businessType - Type d'activité déclaré ou détecté (ex: 'PHYSICAL_PRODUCT', 'SERVICE', 'HYBRID', 'LIVESTOCK_PRODUCT')
 * @param intentData   - Données d'intention textuelles (secteur, nom, description, mots-clés)
 * @returns Le Master Blueprint optimal
 */
export function selectOptimalBlueprint(
  businessType?: BusinessType | string,
  intentData?: IntentData | string,
): MasterBlueprint {
  const bt = (businessType || '').toString().trim().toUpperCase();
  const intentText = extractIntentText(intentData).toLowerCase();

  // ── Règle 1 : Résolution déterministe prioritaire si BusinessType explicite ───
  if (bt === 'HYBRID' || bt === 'MIXED') {
    return BP03_HYBRID_MARKET;
  }
  if (bt === 'LIVESTOCK_PRODUCT' || bt === 'AGROPASTORAL' || bt === 'AGRICULTURE') {
    return BP04_LIVESTOCK_FARM;
  }
  if (bt === 'SERVICE' || bt === 'CONSULTING' || bt === 'EDUCATION') {
    return BP02_SERVICE_PRO;
  }
  if (bt === 'RESTAURANT' || bt === 'FOOD') {
    return BP05_RESTAURANT_FOOD;
  }
  if (bt === 'PHYSICAL_PRODUCT' || bt === 'RETAIL') {
    // Si intention d'élevage explicite malgré le type physique générique
    if (intentText.length > 0 && matchesKeywords(intentText, LIVESTOCK_KEYWORDS)) {
      return BP04_LIVESTOCK_FARM;
    }
    return BP01_RETAIL_ECOM;
  }
  if (bt === 'ARTISAN') {
    // Artisanat : orienté service si formation / atelier explicite, sinon produit
    if (intentText.includes('cours') || intentText.includes('formation') || intentText.includes('atelier')) {
      return BP02_SERVICE_PRO;
    }
    return BP01_RETAIL_ECOM;
  }

  // ── Règle 2 : Analyse sémantique si BusinessType non fourni ou indéterminé ───
  if (intentText.length > 0) {
    if (intentText.includes('hybride') || intentText.includes('mixte')) {
      return BP03_HYBRID_MARKET;
    }

    const hasLivestock  = matchesKeywords(intentText, LIVESTOCK_KEYWORDS);
    const hasService    = matchesKeywords(intentText, SERVICE_KEYWORDS);
    const hasRestaurant = matchesKeywords(intentText, RESTAURANT_KEYWORDS);
    const hasRetail     = matchesKeywords(intentText, RETAIL_KEYWORDS);

    const activeCount = [hasLivestock, hasService, hasRestaurant, hasRetail].filter(Boolean).length;
    if (activeCount >= 2) {
      return BP03_HYBRID_MARKET;
    }

    if (hasLivestock)  return BP04_LIVESTOCK_FARM;
    if (hasService)    return BP02_SERVICE_PRO;
    if (hasRestaurant) return BP05_RESTAURANT_FOOD;
    if (hasRetail)     return BP01_RETAIL_ECOM;
  }

  // ── Règle 3 : Fallback intelligent universel ─────────────────────────────────
  return BP03_HYBRID_MARKET;
}

// ── 4. HELPERS UTILITAIRES ───────────────────────────────────────────────────

/**
 * Récupère un Blueprint par son identifiant ou code
 */
export function getBlueprintById(idOrCode: string): MasterBlueprint | undefined {
  return MasterBlueprintRegistry.get(idOrCode);
}

/**
 * Retourne la liste complète des Master Blueprints disponibles
 */
export function getAllBlueprints(): MasterBlueprint[] {
  return MasterBlueprintRegistry.getAll();
}

/**
 * Trouve tous les blueprints compatibles avec un BusinessType donné
 */
export function findBlueprintsForBusinessType(businessType: BusinessType | string): MasterBlueprint[] {
  const bt = (businessType || '').toString().trim().toUpperCase();
  const all = MasterBlueprintRegistry.getAll();

  const matched = all.filter(bp =>
    bp.businessTypes.some(t => t.toUpperCase() === bt),
  );

  // Si aucun match direct, retourner au moins le blueprint hybride
  return matched.length > 0 ? matched : [BP03_HYBRID_MARKET];
}

// ── 5. FONCTIONS INTERNES D'ANALYSE ──────────────────────────────────────────

function extractIntentText(intentData?: IntentData | string): string {
  if (!intentData) return '';
  if (typeof intentData === 'string') return intentData;

  const parts: string[] = [];
  if (intentData.sector) parts.push(intentData.sector);
  if (intentData.storeName) parts.push(intentData.storeName);
  if (intentData.slogan) parts.push(intentData.slogan);
  if (intentData.description) parts.push(intentData.description);
  if (intentData.text) parts.push(intentData.text);
  if (Array.isArray(intentData.keywords)) parts.push(...intentData.keywords);

  return parts.join(' ');
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(kw => text.includes(kw));
}
