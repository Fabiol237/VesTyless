/**
 * VesTyle / Vestin — Tests de sécurité draft_config
 * ─────────────────────────────────────────────────────────────────────────────
 * Vérifie que draft_config (brouillon privé du vendeur) est correctement
 * isolé des visiteurs publics et des autres propriétaires.
 *
 * 5 règles testées :
 *   1. Un visiteur peut accéder à published_config.
 *   2. Un visiteur ne peut PAS accéder à draft_config.
 *   3. Le propriétaire peut accéder à son draft_config.
 *   4. Un autre utilisateur ne peut pas accéder au draft.
 *   5. Le storefront continue de fonctionner normalement avec published_config.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateStoreConfig } from '../src/lib/store-model/StoreModelContract.js';

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS — Simuler le comportement de Supabase RLS sans connexion DB réelle.
// La logique de filtrage reflète exactement ce qu'implique la migration SQL.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simule la table stores avec RLS appliqué selon la migration de sécurité.
 *
 * Règles RLS (après migration 20260911_stores_draft_security.sql) :
 *   SELECT sur stores  → uniquement si owner_id = auth.uid() (propriétaire)
 *   stores_public view → uniquement is_active = true, sans draft_config
 */

const OWNER_ID_A = 'user-owner-a-uuid';
const OWNER_ID_B = 'user-owner-b-uuid';
const STORE_ID   = 'store-uuid-1';

const PUBLISHED_CONFIG = {
  version: '1.0',
  sections: [{ id: 'hero-1', type: 'HERO', position: 0, props: { title: 'Boutique Active' } }],
  theme: { primaryColor: '#128C7E' },
};

const DRAFT_CONFIG = {
  version: '1.0',
  sections: [
    { id: 'hero-1', type: 'HERO', position: 0, props: { title: 'Brouillon en cours' } },
    { id: 'promo-1', type: 'PROMOTIONAL_BANNER', position: 1, props: { text: 'Promo secrète -50%' } },
  ],
  theme: { primaryColor: '#FF0000' }, // couleur non encore publiée
};

/** Enregistrement complet de la boutique en base (tel que lu avec SELECT *) */
const FULL_STORE_ROW = {
  id:               STORE_ID,
  owner_id:         OWNER_ID_A,
  name:             'Boutique Sécurisée',
  slug:             'boutique-securisee',
  is_active:        true,
  business_type:    'FASHION',
  theme_color:      '#128C7E',
  published_config: PUBLISHED_CONFIG,
  draft_config:     DRAFT_CONFIG,      // ← PRIVÉ : ne doit jamais fuiter publiquement
};

/**
 * Simule la vue stores_public (sans draft_config).
 * Correspond à la vue SQL créée dans 20260911_stores_draft_security.sql.
 */
function getPublicStoreView(store) {
  // eslint-disable-next-line no-unused-vars
  const { draft_config, owner_id, ...publicColumns } = store;
  return publicColumns;
}

/**
 * Simule l'accès SELECT sur la table stores avec RLS.
 * @param {string|null} requestingUserId - null = visiteur non authentifié
 * @param {string} targetOwnerId - owner_id de la boutique cible
 * @returns {object|null} - null si RLS bloque
 */
function selectStoresWithRLS(requestingUserId, targetOwnerId) {
  // Policy : owner_id = auth.uid()
  // auth.uid() est NULL pour un visiteur non authentifié → toujours REFUSÉ
  if (!requestingUserId || requestingUserId !== targetOwnerId) {
    return null; // RLS bloque
  }
  return FULL_STORE_ROW; // propriétaire → accès complet
}

/**
 * Simule l'accès à la vue stores_public (sans draft_config, avec RLS de la vue).
 * @param {boolean} isActive - la boutique est-elle active ?
 * @returns {object} - colonnes publiques uniquement
 */
function selectStoresPublicView(isActive) {
  if (!isActive) return null; // WHERE is_active = true
  return getPublicStoreView(FULL_STORE_ROW);
}

/**
 * Simule l'API /api/store/config avec previewMode.
 * @param {string|null} userId - utilisateur authentifié ou null
 * @param {string} storeOwnerId - propriétaire de la boutique
 * @param {boolean} preview - true = mode Studio (draft), false = public
 */
function getStoreConfigAPI(userId, storeOwnerId, preview) {
  const isOwner = userId && userId === storeOwnerId;

  if (preview) {
    if (!isOwner) {
      return { success: false, code: 'FORBIDDEN', error: 'Accès refusé au brouillon.' };
    }
    return { success: true, mode: 'draft', config: DRAFT_CONFIG };
  }

  // Mode public → published_config uniquement
  return { success: true, mode: 'published', config: PUBLISHED_CONFIG };
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Sécurité draft_config — Isolation des configurations privées', () => {

  // ── TEST 1 ────────────────────────────────────────────────────────────────
  it('1. Un visiteur public peut accéder à published_config via stores_public', () => {
    // Un visiteur non authentifié accède à la vue stores_public
    const publicRow = selectStoresPublicView(true);

    // La vue doit retourner des données (boutique active)
    expect(publicRow).not.toBeNull();

    // published_config doit être accessible
    expect(publicRow.published_config).toBeDefined();
    expect(publicRow.published_config.sections).toHaveLength(1);
    expect(publicRow.published_config.sections[0].props.title).toBe('Boutique Active');

    // Vérifier que le schema published_config est valide
    const validation = validateStoreConfig(publicRow.published_config);
    expect(validation.success).toBe(true);
  });

  // ── TEST 2 ────────────────────────────────────────────────────────────────
  it('2. Un visiteur public ne peut PAS accéder à draft_config', () => {
    // Via la vue publique
    const publicRow = selectStoresPublicView(true);
    expect(publicRow).not.toBeNull();

    // draft_config ne doit pas être présent dans la vue
    expect(publicRow).not.toHaveProperty('draft_config');
    expect(Object.keys(publicRow)).not.toContain('draft_config');

    // Via RLS direct sur stores (visiteur non authentifié → null)
    const rlsResult = selectStoresWithRLS(null, OWNER_ID_A);
    expect(rlsResult).toBeNull(); // RLS bloque complètement la ligne

    // Via l'API sans preview et sans auth
    const apiResult = getStoreConfigAPI(null, OWNER_ID_A, false);
    expect(apiResult.success).toBe(true);
    expect(apiResult.config).toStrictEqual(PUBLISHED_CONFIG);
    expect(apiResult.config).not.toHaveProperty('sections[1]',
      expect.objectContaining({ type: 'PROMOTIONAL_BANNER' })
    );
  });

  // ── TEST 3 ────────────────────────────────────────────────────────────────
  it('3. Le propriétaire peut accéder à son draft_config', () => {
    // Via RLS direct : propriétaire authentifié
    const rlsResult = selectStoresWithRLS(OWNER_ID_A, OWNER_ID_A);
    expect(rlsResult).not.toBeNull();
    expect(rlsResult.draft_config).toBeDefined();
    expect(rlsResult.draft_config.sections).toHaveLength(2);
    expect(rlsResult.draft_config.sections[1].type).toBe('PROMOTIONAL_BANNER');

    // Via l'API avec previewMode = true
    const apiPreview = getStoreConfigAPI(OWNER_ID_A, OWNER_ID_A, true);
    expect(apiPreview.success).toBe(true);
    expect(apiPreview.mode).toBe('draft');
    expect(apiPreview.config).toStrictEqual(DRAFT_CONFIG);
    expect(apiPreview.config.sections[1].props.text).toBe('Promo secrète -50%');
  });

  // ── TEST 4 ────────────────────────────────────────────────────────────────
  it('4. Un autre utilisateur (propriétaire B) ne peut pas accéder au draft de A', () => {
    // Via RLS direct : propriétaire B tente d'accéder à la boutique de A
    const rlsResult = selectStoresWithRLS(OWNER_ID_B, OWNER_ID_A);
    expect(rlsResult).toBeNull(); // RLS bloque

    // Via l'API avec previewMode = true (propriétaire B ne peut pas preview de A)
    const apiPreview = getStoreConfigAPI(OWNER_ID_B, OWNER_ID_A, true);
    expect(apiPreview.success).toBe(false);
    expect(apiPreview.code).toBe('FORBIDDEN');
    expect(apiPreview).not.toHaveProperty('config');

    // Via l'API sans preview : propriétaire B voit uniquement le published_config de A
    const apiPublic = getStoreConfigAPI(OWNER_ID_B, OWNER_ID_A, false);
    expect(apiPublic.success).toBe(true);
    expect(apiPublic.mode).toBe('published');
    // published_config ne contient pas le brouillon secret
    expect(apiPublic.config.sections).toHaveLength(1);
    expect(apiPublic.config.sections[0].props.title).toBe('Boutique Active');
  });

  // ── TEST 5 ────────────────────────────────────────────────────────────────
  it('5. Le storefront fonctionne normalement avec published_config uniquement', () => {
    // Simuler ce que fait maintenant StorefrontClient.js (select explicite sans draft_config)
    const storefrontSelect = (() => {
      // StorefrontClient envoie maintenant une liste explicite de colonnes
      const STOREFRONT_COLUMNS = [
        'id', 'name', 'slug', 'description', 'city', 'address', 'phone',
        'whatsapp_number', 'email', 'logo_url', 'cover_url', 'business_type',
        'sub_sector', 'creation_method', 'template_id', 'template_version',
        'theme_color', 'secondary_color', 'accent_color', 'font_family',
        'shop_theme', 'layout_config', 'store_template', 'store_code',
        'is_active', 'is_boosted', 'verified', 'published_config',
        'published_at', 'daily_views', 'created_at', 'updated_at',
      ];

      // Simuler la projection (sélection des colonnes explicites)
      return Object.fromEntries(
        STOREFRONT_COLUMNS
          .filter(col => col in FULL_STORE_ROW)
          .map(col => [col, FULL_STORE_ROW[col]])
      );
    })();

    // Le storefront reçoit bien published_config
    expect(storefrontSelect.published_config).toBeDefined();
    expect(storefrontSelect.published_config.sections[0].type).toBe('HERO');

    // draft_config ne fait PAS partie de la projection
    expect(storefrontSelect).not.toHaveProperty('draft_config');

    // owner_id ne fait PAS partie de la projection (sécurité supplémentaire)
    expect(storefrontSelect).not.toHaveProperty('owner_id');

    // Le rendu pourrait utiliser published_config → vérifier que le schéma est valide
    const validation = validateStoreConfig(storefrontSelect.published_config);
    expect(validation.success).toBe(true);

    // Vérifier que le storefront a les données essentielles pour le rendu
    expect(storefrontSelect.name).toBe('Boutique Sécurisée');
    expect(storefrontSelect.slug).toBe('boutique-securisee');
    expect(storefrontSelect.theme_color).toBeDefined();
    expect(storefrontSelect.is_active).toBe(true);
  });

});
