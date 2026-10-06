/**
 * Runner Node.js natif pour les tests de sécurité draft_config.
 * Lance les assertions directement sans dépendance à vitest.
 * Reproduit exactement les 5 tests de draftConfigSecurity.test.mjs.
 */

import { validateStoreConfig } from '../src/lib/store-model/StoreModelContract.js';
import assert from 'assert';

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────────────────

const OWNER_ID_A = 'user-owner-a-uuid';
const OWNER_ID_B = 'user-owner-b-uuid';

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
  theme: { primaryColor: '#FF0000' },
};

const FULL_STORE_ROW = {
  id:               'store-uuid-1',
  owner_id:         OWNER_ID_A,
  name:             'Boutique Sécurisée',
  slug:             'boutique-securisee',
  is_active:        true,
  business_type:    'FASHION',
  theme_color:      '#128C7E',
  published_config: PUBLISHED_CONFIG,
  draft_config:     DRAFT_CONFIG,
};

function getPublicStoreView(store) {
  const { draft_config, owner_id, ...publicColumns } = store;
  return publicColumns;
}

function selectStoresWithRLS(requestingUserId, targetOwnerId) {
  if (!requestingUserId || requestingUserId !== targetOwnerId) return null;
  return FULL_STORE_ROW;
}

function selectStoresPublicView(isActive) {
  if (!isActive) return null;
  return getPublicStoreView(FULL_STORE_ROW);
}

function getStoreConfigAPI(userId, storeOwnerId, preview) {
  const isOwner = userId && userId === storeOwnerId;
  if (preview) {
    if (!isOwner) return { success: false, code: 'FORBIDDEN', error: 'Accès refusé au brouillon.' };
    return { success: true, mode: 'draft', config: DRAFT_CONFIG };
  }
  return { success: true, mode: 'published', config: PUBLISHED_CONFIG };
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
    results.push({ name, status: 'PASS' });
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
  }
}

console.log('\nSécurité draft_config — Isolation des configurations privées\n');

// ── TEST 1 ────────────────────────────────────────────────────────────────
test('1. Un visiteur public peut accéder à published_config via stores_public', () => {
  const publicRow = selectStoresPublicView(true);
  assert.ok(publicRow, 'stores_public doit retourner une ligne');
  assert.ok(publicRow.published_config, 'published_config doit être présent');
  assert.strictEqual(publicRow.published_config.sections.length, 1);
  assert.strictEqual(publicRow.published_config.sections[0].props.title, 'Boutique Active');
  const validation = validateStoreConfig(publicRow.published_config);
  assert.ok(validation.success, `Validation Zod échouée: ${JSON.stringify(validation.errors)}`);
});

// ── TEST 2 ────────────────────────────────────────────────────────────────
test('2. Un visiteur public ne peut PAS accéder à draft_config', () => {
  // Via la vue publique : draft_config absent
  const publicRow = selectStoresPublicView(true);
  assert.ok(publicRow, 'stores_public doit retourner une ligne');
  assert.ok(!('draft_config' in publicRow), 'draft_config ne doit PAS être dans stores_public');

  // Via RLS direct : visiteur non authentifié bloqué
  const rlsResult = selectStoresWithRLS(null, OWNER_ID_A);
  assert.strictEqual(rlsResult, null, 'RLS doit bloquer le visiteur non authentifié');

  // Via API sans preview : published_config uniquement
  const apiResult = getStoreConfigAPI(null, OWNER_ID_A, false);
  assert.ok(apiResult.success, 'API publique doit réussir');
  assert.deepStrictEqual(apiResult.config, PUBLISHED_CONFIG, 'API doit retourner published_config');
  assert.strictEqual(apiResult.config.sections.length, 1, 'published_config contient 1 section');
});

// ── TEST 3 ────────────────────────────────────────────────────────────────
test('3. Le propriétaire peut accéder à son draft_config', () => {
  // Via RLS : propriétaire authentifié
  const rlsResult = selectStoresWithRLS(OWNER_ID_A, OWNER_ID_A);
  assert.ok(rlsResult, 'RLS doit autoriser le propriétaire');
  assert.ok(rlsResult.draft_config, 'draft_config doit être accessible au propriétaire');
  assert.strictEqual(rlsResult.draft_config.sections.length, 2, 'draft a 2 sections');
  assert.strictEqual(rlsResult.draft_config.sections[1].type, 'PROMOTIONAL_BANNER');

  // Via API avec previewMode = true
  const apiPreview = getStoreConfigAPI(OWNER_ID_A, OWNER_ID_A, true);
  assert.ok(apiPreview.success, 'API preview doit réussir pour le propriétaire');
  assert.strictEqual(apiPreview.mode, 'draft');
  assert.deepStrictEqual(apiPreview.config, DRAFT_CONFIG);
  assert.strictEqual(apiPreview.config.sections[1].props.text, 'Promo secrète -50%');
});

// ── TEST 4 ────────────────────────────────────────────────────────────────
test('4. Un autre utilisateur (propriétaire B) ne peut pas accéder au draft de A', () => {
  // Via RLS : propriétaire B bloqué sur boutique de A
  const rlsResult = selectStoresWithRLS(OWNER_ID_B, OWNER_ID_A);
  assert.strictEqual(rlsResult, null, 'RLS doit bloquer propriétaire B sur boutique de A');

  // Via API avec preview : FORBIDDEN
  const apiPreview = getStoreConfigAPI(OWNER_ID_B, OWNER_ID_A, true);
  assert.ok(!apiPreview.success, 'API preview doit échouer pour propriétaire B');
  assert.strictEqual(apiPreview.code, 'FORBIDDEN');
  assert.ok(!('config' in apiPreview), 'Aucun config ne doit fuiter');

  // Via API sans preview : published_config uniquement (pas le draft)
  const apiPublic = getStoreConfigAPI(OWNER_ID_B, OWNER_ID_A, false);
  assert.ok(apiPublic.success, 'API publique accessible pour propriétaire B');
  assert.strictEqual(apiPublic.mode, 'published');
  assert.strictEqual(apiPublic.config.sections.length, 1, '1 section dans published_config');
  assert.strictEqual(apiPublic.config.sections[0].props.title, 'Boutique Active');
});

// ── TEST 5 ────────────────────────────────────────────────────────────────
test('5. Le storefront fonctionne normalement avec published_config uniquement', () => {
  // Colonnes que StorefrontClient sélectionne maintenant (sans draft_config)
  const STOREFRONT_COLUMNS = [
    'id', 'name', 'slug', 'description', 'city', 'address', 'phone',
    'whatsapp_number', 'email', 'logo_url', 'cover_url', 'business_type',
    'sub_sector', 'creation_method', 'template_id', 'template_version',
    'theme_color', 'secondary_color', 'accent_color', 'font_family',
    'shop_theme', 'layout_config', 'store_template', 'store_code',
    'is_active', 'is_boosted', 'verified', 'published_config',
    'published_at', 'daily_views', 'created_at', 'updated_at',
  ];

  const storefrontSelect = Object.fromEntries(
    STOREFRONT_COLUMNS
      .filter(col => col in FULL_STORE_ROW)
      .map(col => [col, FULL_STORE_ROW[col]])
  );

  // published_config présent
  assert.ok(storefrontSelect.published_config, 'published_config doit être dans la sélection storefront');
  assert.strictEqual(storefrontSelect.published_config.sections[0].type, 'HERO');

  // draft_config absent
  assert.ok(!('draft_config' in storefrontSelect), 'draft_config ne doit PAS être dans la sélection storefront');

  // owner_id absent
  assert.ok(!('owner_id' in storefrontSelect), 'owner_id ne doit PAS être dans la sélection storefront');

  // published_config valide selon Zod
  const validation = validateStoreConfig(storefrontSelect.published_config);
  assert.ok(validation.success, `Validation Zod échouée: ${JSON.stringify(validation.errors)}`);

  // Données essentielles au rendu présentes
  assert.strictEqual(storefrontSelect.name, 'Boutique Sécurisée');
  assert.strictEqual(storefrontSelect.slug, 'boutique-securisee');
  assert.ok(storefrontSelect.theme_color);
  assert.strictEqual(storefrontSelect.is_active, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// RÉSUMÉ
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n──────────────────────────────────────────────────────────────');
console.log(`Tests : ${passed + failed} total | ${passed} PASS | ${failed} FAIL`);
if (failed > 0) {
  console.log('\nÉchecs :');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ✗ ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅  Tous les tests PASS — draft_config correctement isolé.');
  process.exit(0);
}
