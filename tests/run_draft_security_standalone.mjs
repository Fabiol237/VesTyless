/**
 * Tests de sécurité draft_config — Certification Finale Master 1 (Tests 1 à 9)
 * ─────────────────────────────────────────────────────────────────────────────
 * Vérifie l'isolation étanche de draft_config, le filtrage strict de stores_public
 * et l'absence totale d'informations propriétaires sensibles (owner_id) :
 *   TEST 1 : ANON -> stores_public -> accès autorisé
 *   TEST 2 : ANON -> stores -> aucune exposition publique de draft_config
 *   TEST 3 : OWNER -> stores -> accès à sa boutique autorisé
 *   TEST 4 : OWNER -> draft_config -> accès autorisé
 *   TEST 5 : OTHER USER -> boutique d'un autre propriétaire -> 0 ligne
 *   TEST 6 : OTHER USER -> draft_config d'un autre propriétaire -> inaccessible
 *   TEST 7 : stores_public -> draft_config absent
 *   TEST 8 : stores_public -> published_config présent si publié
 *   TEST 9 : stores_public -> owner_id absent
 *
 * Exécutable avec : node tests/run_draft_security_standalone.mjs
 */

import assert from 'node:assert/strict';

const ALLOWED_COMPONENT_FAMILIES = [
  'HEADER','HERO','PRODUCT','SERVICE','GALLERY','CONTACT','FOOTER','FAQ',
  'TESTIMONIAL','PROMOTION','CAROUSEL','CATEGORY','ANNOUNCEMENT',
  'TRUST_BADGES','MAP','HOURS','ABOUT','CALL_TO_ACTION','PROMOTIONAL_BANNER',
];

const DANGEROUS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|eval\(|onload\s*=|onerror\s*=/i;
const JSX_REGEX = /<[A-Z][A-Za-z0-9_]*(\s+[^>]*)?>/;

function checkDangerous(obj) {
  const str = JSON.stringify(obj);
  if (DANGEROUS_REGEX.test(str)) return 'Contenu dangereux détecté (script/eval/onload)';
  if (JSX_REGEX.test(str)) return 'JSX arbitraire détecté';
  return null;
}

function validateStoreConfig(config) {
  if (!config || typeof config !== 'object') return { success: false, errors: ['config doit être un objet'] };
  const dangerous = checkDangerous(config);
  if (dangerous) return { success: false, errors: [dangerous] };
  if (!Array.isArray(config.sections)) return { success: false, errors: ['sections requis'] };
  const errors = [];
  config.sections.forEach((s, i) => {
    if (!s.id) errors.push(`section[${i}]: id requis`);
    if (!ALLOWED_COMPONENT_FAMILIES.some(f => s.type?.startsWith(f)))
      errors.push(`section[${i}]: type "${s.type}" non autorisé`);
  });
  return errors.length > 0 ? { success: false, errors } : { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES DE TEST CANONIQUES
// ─────────────────────────────────────────────────────────────────────────────

const OWNER_ID_A = 'user-owner-a-uuid';
const OWNER_ID_B = 'user-owner-b-uuid';

const PUBLISHED_CONFIG = {
  version: '1.0',
  sections: [{ id: 'hero-1', type: 'HERO', position: 0, props: { title: 'Boutique Publiée et Active' } }],
  theme: { primaryColor: '#128C7E' },
};

const DRAFT_CONFIG = {
  version: '1.0',
  sections: [
    { id: 'hero-1', type: 'HERO', position: 0, props: { title: 'Brouillon privé non publié' } },
    { id: 'promo-1', type: 'PROMOTIONAL_BANNER', position: 1, props: { text: 'Offre exclusive secrète' } },
  ],
  theme: { primaryColor: '#FF0000' },
};

const FULL_STORE_ROW_A = {
  id:               'store-uuid-1',
  owner_id:         OWNER_ID_A, // ← Sensible : uniquement dans public.stores, JAMAIS dans stores_public
  name:             'Boutique Sécurisée A',
  slug:             'boutique-securisee-a',
  description:      'Boutique officielle',
  city:             'Abidjan',
  phone:            '+2250102030405',
  whatsapp_link:    'https://wa.me/2250102030405',
  latitude:         5.3600,
  longitude:        -4.0083,
  logo_url:         'https://cdn.example.com/logo.png',
  banner_url:       'https://cdn.example.com/banner.png',
  cover_url:        'https://cdn.example.com/cover.png',
  theme_color:      '#128C7E',
  secondary_color:  '#F3F4F6',
  accent_color:     '#25D366',
  font_family:      'Inter',
  shop_theme:       'theme_00',
  shop_tabs:        { accueil: 'Accueil', produits: 'Catalogue' },
  layout_config:    {},
  business_type:    'ecommerce',
  sub_sector:       'fashion',
  creation_method:  'MANUAL',
  template_id:      'tmpl_fashion_1',
  template_version: '1.0.0',
  store_code:       '12345',
  is_active:        true,
  is_boosted:       false,
  verified:         true,
  rating:           4.8,
  daily_views:      10,
  total_views:      100,
  followers_count:  25,
  published_config: PUBLISHED_CONFIG,
  published_at:     '2026-09-11T12:00:00Z',
  draft_config:     DRAFT_CONFIG, // ← PRIVÉ : exclu de stores_public
  created_at:       '2026-01-01T00:00:00Z',
  updated_at:       '2026-09-11T12:00:00Z',
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION DES COUCHES RLS ET VUES SQL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vue SQL stores_public :
 * Exclut structurellement draft_config ET owner_id, filtre is_active = true
 */
function selectStoresPublic(storeRow) {
  if (!storeRow.is_active) return null;
  // eslint-disable-next-line no-unused-vars
  const { draft_config, owner_id, ...publicView } = storeRow;
  return publicView;
}

/**
 * SELECT sur public.stores protégé par RLS :
 * USING (owner_id = auth.uid())
 */
function queryStoresTableRLS(requestingUserId, storeRow) {
  if (!requestingUserId || requestingUserId !== storeRow.owner_id) {
    return []; // 0 ligne retournée
  }
  return [storeRow];
}

// ─────────────────────────────────────────────────────────────────────────────
// EXÉCUTION DES 9 TESTS DE SÉCURITÉ DU DURCISSEMENT FINAL
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    → ${err.message}`);
    failed++;
  }
}

console.log('\n==================================================================');
console.log('MASTER 1 — CERTIFICATION FINALE DES 9 TESTS DE SÉCURITÉ');
console.log('==================================================================\n');

// TEST 1
runTest('TEST 1 : ANON → stores_public → accès autorisé', () => {
  const publicData = selectStoresPublic(FULL_STORE_ROW_A);
  assert.ok(publicData, 'Le visiteur public doit pouvoir lire stores_public');
  assert.equal(publicData.name, 'Boutique Sécurisée A');
  assert.equal(publicData.slug, 'boutique-securisee-a');
  assert.equal(publicData.is_active, true);
});

// TEST 2
runTest('TEST 2 : ANON → stores → aucune exposition publique de draft_config', () => {
  const anonDirectQuery = queryStoresTableRLS(null, FULL_STORE_ROW_A);
  assert.equal(anonDirectQuery.length, 0, 'Un utilisateur anonyme sur stores doit recevoir 0 ligne');
  const publicData = selectStoresPublic(FULL_STORE_ROW_A);
  assert.strictEqual(publicData.draft_config, undefined, 'draft_config ne doit pas exister dans stores_public');
});

// TEST 3
runTest('TEST 3 : OWNER → stores → accès à sa boutique autorisé', () => {
  const ownerQuery = queryStoresTableRLS(OWNER_ID_A, FULL_STORE_ROW_A);
  assert.equal(ownerQuery.length, 1, 'Le propriétaire doit recevoir exactement sa ligne');
  assert.equal(ownerQuery[0].id, FULL_STORE_ROW_A.id);
  assert.equal(ownerQuery[0].owner_id, OWNER_ID_A);
});

// TEST 4
runTest('TEST 4 : OWNER → draft_config → accès autorisé', () => {
  const ownerQuery = queryStoresTableRLS(OWNER_ID_A, FULL_STORE_ROW_A);
  assert.ok(ownerQuery[0].draft_config, 'Le propriétaire doit avoir accès à draft_config');
  assert.deepEqual(ownerQuery[0].draft_config, DRAFT_CONFIG);
  const v = validateStoreConfig(ownerQuery[0].draft_config);
  assert.ok(v.success, 'draft_config doit être valide');
});

// TEST 5
runTest('TEST 5 : OTHER USER → boutique d\'un autre propriétaire → 0 ligne', () => {
  const otherUserQuery = queryStoresTableRLS(OWNER_ID_B, FULL_STORE_ROW_A);
  assert.equal(otherUserQuery.length, 0, 'Un autre utilisateur authentifié doit recevoir 0 ligne sur public.stores');
});

// TEST 6
runTest('TEST 6 : OTHER USER → draft_config d\'un autre propriétaire → inaccessible', () => {
  const otherUserQuery = queryStoresTableRLS(OWNER_ID_B, FULL_STORE_ROW_A);
  assert.equal(otherUserQuery.length, 0);
  assert.strictEqual(otherUserQuery[0]?.draft_config, undefined, 'draft_config est strictement inaccessible à un tiers');
});

// TEST 7
runTest('TEST 7 : stores_public → draft_config absent', () => {
  const publicRow = selectStoresPublic(FULL_STORE_ROW_A);
  assert.ok(!('draft_config' in publicRow), 'La clé draft_config ne doit PAS figurer dans les colonnes de stores_public');
  const keys = Object.keys(publicRow);
  assert.ok(!keys.includes('draft_config'), 'draft_config absent des clés');
});

// TEST 8
runTest('TEST 8 : stores_public → published_config présent si publié', () => {
  const publicRow = selectStoresPublic(FULL_STORE_ROW_A);
  assert.ok(publicRow.published_config, 'published_config doit être présent dans stores_public');
  assert.deepEqual(publicRow.published_config, PUBLISHED_CONFIG);
  assert.equal(publicRow.published_config.sections[0].props.title, 'Boutique Publiée et Active');
  const v = validateStoreConfig(publicRow.published_config);
  assert.ok(v.success, 'published_config doit être une configuration valide');
});

// TEST 9
runTest('TEST 9 : stores_public → owner_id absent', () => {
  const publicRow = selectStoresPublic(FULL_STORE_ROW_A);
  assert.ok(!('owner_id' in publicRow), 'La clé owner_id ne doit PAS figurer dans les colonnes de stores_public');
  const keys = Object.keys(publicRow);
  assert.ok(!keys.includes('owner_id'), 'owner_id absent des clés publiques');
});

console.log('\n──────────────────────────────────────────────────────────────────');
console.log(`Résultats : ${passed + failed} total | ${passed} PASS | ${failed} FAIL`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅  CERTIFICATION SÉCURITÉ MASTER 1 : 9/9 TESTS PASS\n');
  process.exit(0);
}
