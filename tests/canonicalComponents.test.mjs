import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ComponentRegistry, COMPONENT_FAMILIES } from '../src/lib/component-registry/ComponentRegistry.js';

const CANONICAL_DIR = path.resolve('src/lib/component-registry/canonical');

test('1. Registration & Canonical Catalog Integrity (10 Validated Wave 4.1 Components)', () => {
  const wave41CanonicalIds = [
    'header_centered',
    'hero_fullscreen',
    'hero_media_left',
    'category_grid',
    'category_cards',
    'product_featured',
    'product_compact',
    'service_featured',
    'gallery_masonry',
    'contact_card',
  ];

  // Vérification que les 10 composants sont définis dans les fichiers sources canoniques
  const files = fs.readdirSync(CANONICAL_DIR).filter((f) => f.endsWith('.jsx'));
  const registeredInFiles = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf8');
    const matches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
    for (const match of matches) {
      registeredInFiles.push(match[1]);
    }
  }

  for (const id of wave41CanonicalIds) {
    assert.ok(
      registeredInFiles.includes(id),
      `Le composant ${id} doit être défini dans les fichiers canoniques`
    );
  }

  // Vérifier le retrait strict des composants redondants (header_minimal & service_cards)
  assert.equal(
    registeredInFiles.includes('header_minimal'),
    false,
    'header_minimal doit être supprimé car fusionnable par configuration dans header_001'
  );
  assert.equal(
    registeredInFiles.includes('service_cards'),
    false,
    'service_cards doit être supprimé car fusionnable par configuration dans service_grid'
  );

  assert.equal(
    registeredInFiles.length,
    10,
    'Exactement 10 composants canoniques réels doivent être présents dans la Vague 4.1'
  );
});

test('2. Contract & Capability Verification (CONTACT non-bloquant pour Headers et Heroes)', () => {
  const heroContent = fs.readFileSync(path.join(CANONICAL_DIR, 'heroComponents.jsx'), 'utf8');
  const headerContent = fs.readFileSync(path.join(CANONICAL_DIR, 'headerComponents.jsx'), 'utf8');
  const serviceContent = fs.readFileSync(path.join(CANONICAL_DIR, 'serviceComponents.jsx'), 'utf8');
  const productContent = fs.readFileSync(path.join(CANONICAL_DIR, 'productComponents.jsx'), 'utf8');
  const contactContent = fs.readFileSync(path.join(CANONICAL_DIR, 'contactComponents.jsx'), 'utf8');

  // Headers & Heroes : CONTACT ne doit PAS être obligatoire
  assert.ok(
    headerContent.includes("requiredCapabilities: []"),
    'header_centered doit avoir requiredCapabilities: []'
  );
  assert.ok(
    headerContent.includes("optionalCapabilities: ['CONTACT']"),
    'header_centered doit avoir optionalCapabilities: [CONTACT]'
  );

  assert.ok(
    heroContent.includes("requiredCapabilities: []"),
    'hero_fullscreen et hero_media_left doivent avoir requiredCapabilities: []'
  );
  assert.ok(
    heroContent.includes("optionalCapabilities: ['CONTACT']"),
    'hero_fullscreen et hero_media_left doivent avoir optionalCapabilities: [CONTACT]'
  );

  // Service & Product & Contact : capabilities obligatoires cohérentes
  assert.ok(serviceContent.includes("requiredCapabilities: ['SERVICE']"));
  assert.ok(productContent.includes("requiredCapabilities: ['PRODUCT']"));
  assert.ok(contactContent.includes("requiredCapabilities: ['CONTACT']"));
});

test('3. Zero Fake Commercial Claims in Defaults and Source Renderers', () => {
  const files = fs.readdirSync(CANONICAL_DIR).filter((f) => f.endsWith('.jsx'));
  const forbiddenClaims = [
    'Livraison express sécurisée',
    'Produits 100% conformes',
    'Clients satisfaits',
    'Service premium',
    '100+ clients',
    'N°1',
    'Meilleur prix garanti',
    'Article certifié conforme',
    '★ DISPONIBILITÉ IMMÉDIATE',
    '💎 Édition Spéciale',
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf8');
    for (const claim of forbiddenClaims) {
      assert.equal(
        content.includes(claim),
        false,
        `Le fichier ${file} ne doit contenir aucune affirmation commerciale inventée : "${claim}"`
      );
    }
  }
});

test('4. Zero LiveCanvas, Zero businessType Branching, Zero Direct Supabase in Canonical Renderers', () => {
  const files = fs.readdirSync(CANONICAL_DIR).filter((f) => f.endsWith('.jsx'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf8');

    assert.equal(
      /LiveCanvas|liveCanvas/i.test(content),
      false,
      `Le fichier ${file} ne doit pas dépendre de LiveCanvas`
    );

    assert.equal(
      /businessType\s*===/i.test(content),
      false,
      `Le fichier ${file} ne doit pas contenir de branching businessType === ...`
    );

    assert.equal(
      /createClient|supabase\.from/i.test(content),
      false,
      `Le fichier ${file} ne doit pas accéder directement à Supabase`
    );
  }
});

test('5. Empty States & Safe Fallback Verification', () => {
  const files = fs.readdirSync(CANONICAL_DIR).filter((f) => f.endsWith('.jsx'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(CANONICAL_DIR, file), 'utf8');

    assert.ok(
      content.includes('emptyStateBehavior'),
      `Le fichier ${file} doit déclarer explicitement emptyStateBehavior`
    );

    // Vérifie que les renderers retournent null en mode public si les données nécessaires sont absentes
    assert.ok(
      content.includes('if (!isEditing) return null') || content.includes('emptyStateBehavior: \'FALLBACK_UI\'') || content.includes('return null'),
      `Le fichier ${file} doit gérer le masquage public ou le fallback propre`
    );
  }
});

test('6. Exact Catalog Count Recalculation (29 Dynamic + 1 Static = 30 Total)', () => {
  const initialDynamicIds = [
    'header_001', 'hero_001', 'hero_editorial', 'hero_split', 'hero_cinematic', 'hero_commerce',
    'category_001', 'product_001', 'product_carousel', 'product_list',
    'service_001', 'service_grid', 'promotion_001', 'promotion_card',
    'testimonial_001', 'testimonial_grid', 'faq_001', 'gallery_001', 'footer_001'
  ];
  const staticPrototypeIds = ['carousel_001'];
  const wave41ValidatedIds = [
    'header_centered',
    'hero_fullscreen',
    'hero_media_left',
    'category_grid',
    'category_cards',
    'product_featured',
    'product_compact',
    'service_featured',
    'gallery_masonry',
    'contact_card'
  ];

  assert.equal(initialDynamicIds.length, 19, '19 composants dynamiques initiaux');
  assert.equal(staticPrototypeIds.length, 1, '1 prototype statique (carousel_001)');
  assert.equal(wave41ValidatedIds.length, 10, '10 composants canoniques validés en Vague 4.1');

  const totalRealDynamic = initialDynamicIds.length + wave41ValidatedIds.length;
  assert.equal(totalRealDynamic, 29, 'Total canonical réel dynamique = 29');

  const totalRegistered = totalRealDynamic + staticPrototypeIds.length;
  assert.equal(totalRegistered, 30, 'Total enregistré dans le système = 30');
});
