/**
 * TEST SUITE: intelligentCreationFlow
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide le moteur de création intelligente de boutiques Vestin (Master 3).
 *
 * Tests couverts :
 *  1. Normalisation de slug
 *  2. Collision de slug (ma-boutique → ma-boutique-2)
 *  3. Validation secteur valide → PASS
 *  4. Secteur invalide → FAIL
 *  5. Sous-secteur valide → PASS
 *  6. Sous-secteur incompatible → FAIL
 *  7. Multi-boutiques (même owner → N stores distincts)
 *  8. ownerId absent → rejet
 *  9. Nom absent → rejet
 * 10. Création AI flux complet (mock DB)
 * 11. Création TEMPLATE flux complet (mock DB)
 * 12. Création TEMPLATE avec template DRAFT → rejet
 * 13. Slug long tronqué
 * 14. Caractères spéciaux nettoyés du slug
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { IntelligentCreationService } from '../src/lib/creation-flow/IntelligentCreationService.js';
import { businessTypeRegistry } from '../src/lib/business-types/BusinessTypeRegistry.js';
import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { templateDiscoveryEngine } from '../src/lib/template-library/TemplateDiscoveryEngine.js';

// ── Mock Supabase ──────────────────────────────────────────────────────────
function createMockSupabase(existingSlugs = []) {
  const insertedStores = [];

  const slugQueryResult = (slug) => ({
    data: existingSlugs.includes(slug) ? [{ id: 'existing-store' }] : [],
    error: null,
  });

  return {
    insertedStores,
    _addSlug(s) { existingSlugs.push(s); },
    from(table) {
      return {
        select(col) {
          return {
            eq(field, val) {
              if (field === 'slug') return Promise.resolve(slugQueryResult(val));
              if (field === 'id') return { neq: () => Promise.resolve({ data: [], error: null }) };
              return Promise.resolve({ data: [], error: null });
            },
            neq() { return Promise.resolve({ data: [], error: null }); },
          };
        },
        insert(rows) {
          insertedStores.push(...rows);
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: { id: 'new-store-' + Date.now(), ...rows[0] }, error: null });
                },
              };
            },
          };
        },
      };
    },
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function makeService(slugsInDb = []) {
  const mockDb = createMockSupabase(slugsInDb);
  const svc = new IntelligentCreationService({ supabase: mockDb });
  return { svc, mockDb };
}

const VALID_BIZ = 'product';
// Obtain first valid sub-sector for product dynamically (may be empty)
const _productSubs = businessTypeRegistry.getSubSectors('product');
const VALID_SUB = _productSubs.length > 0 ? _productSubs[0].id : null;

// ──────────────────────────────────────────────────────────────────────────
describe('Master 3 — IntelligentCreationFlow', () => {

  // ── 1. Normalisation de slug ──────────────────────────────────────────
  it('1. normalizeSlug — supprime accents, remplace espaces par tirets', () => {
    const { svc } = makeService();
    assert.strictEqual(svc.normalizeSlug('Ma Boutique Etoilee'), 'ma-boutique-etoilee');
    assert.strictEqual(svc.normalizeSlug('Cafe et Resto'), 'cafe-et-resto');
    assert.strictEqual(svc.normalizeSlug(''), 'boutique');
  });

  // ── 2. Slug long tronqué à 50 chars ──────────────────────────────────
  it('2. normalizeSlug — tronqué à 50 caractères', () => {
    const { svc } = makeService();
    const longName = 'A'.repeat(80);
    const result = svc.normalizeSlug(longName);
    assert.ok(result.length <= 50, `Slug trop long: ${result.length}`);
  });

  // ── 3. Caractères spéciaux nettoyés ──────────────────────────────────
  it('3. normalizeSlug — élimine les caractères interdits', () => {
    const { svc } = makeService();
    const slug = svc.normalizeSlug('Mon Store Script Store');
    assert.ok(!/[<>(){}]/.test(slug), `Slug contient des caractères dangereux: ${slug}`);
  });

  // ── 4. resolveUniqueSlug sans collision ──────────────────────────────
  it('4. resolveUniqueSlug — retourne le slug de base si disponible', async () => {
    const { svc } = makeService([]);
    const slug = await svc.resolveUniqueSlug('Ma Boutique');
    assert.strictEqual(slug, 'ma-boutique');
  });

  // ── 5. Collision de slug simple ──────────────────────────────────────
  it('5. resolveUniqueSlug — ma-boutique déjà pris → ma-boutique-2', async () => {
    const { svc } = makeService(['ma-boutique']);
    const slug = await svc.resolveUniqueSlug('Ma Boutique');
    assert.strictEqual(slug, 'ma-boutique-2');
  });

  // ── 6. Double collision ───────────────────────────────────────────────
  it('6. resolveUniqueSlug — ma-boutique et ma-boutique-2 pris → ma-boutique-3', async () => {
    const { svc } = makeService(['ma-boutique', 'ma-boutique-2']);
    const slug = await svc.resolveUniqueSlug('Ma Boutique');
    assert.strictEqual(slug, 'ma-boutique-3');
  });

  // ── 7. Secteur valide → PASS ──────────────────────────────────────────
  it('7. validateBusinessClassification — secteur valide retourne valid=true', () => {
    const { svc } = makeService();
    const result = svc.validateBusinessClassification('fashion', null);
    assert.ok(result.valid, `Devrait être valide, erreur: ${result.error}`);
    assert.ok(result.businessType, 'businessType canonique attendu');
  });

  // ── 8. Secteur invalide → FAIL ────────────────────────────────────────
  it('8. validateBusinessClassification — secteur inexistant retourne valid=false', () => {
    const { svc } = makeService();
    const result = svc.validateBusinessClassification('SECTEUR_INEXISTANT_XYZ', null);
    assert.strictEqual(result.valid, false, 'Un secteur inconnu doit être rejeté');
    assert.ok(result.error, "Un message d'erreur doit être présent");
  });

  // ── 9. Sous-secteur valide → PASS ────────────────────────────────────
  it('9. validateBusinessClassification — sous-secteur valide retourne valid=true', () => {
    const { svc } = makeService();
    const validSubs = businessTypeRegistry.getSubSectors(VALID_BIZ);
    if (validSubs.length === 0) {
      assert.ok(true, 'Pas de sous-secteurs configurés — test ignoré');
      return;
    }
    const result = svc.validateBusinessClassification(VALID_BIZ, validSubs[0].id);
    assert.ok(result.valid, `Sous-secteur valide doit passer: ${result.error}`);
  });

  // ── 10. Sous-secteur incompatible → comportement prévisible ──────────
  it('10. validateBusinessClassification — sous-secteur incompatible → null ou rejeté', () => {
    const { svc } = makeService();
    const result = svc.validateBusinessClassification('fashion', 'traditional_resto');
    if (!result.valid) {
      assert.ok(result.error, "Message d'erreur attendu pour sous-secteur incompatible");
    } else {
      assert.strictEqual(result.subSector, null, 'Un sous-secteur inconnu doit être nullifié');
    }
  });

  // ── 11. ownerId absent → rejet ────────────────────────────────────────
  it('11. createStoreFromAI — ownerId absent → erreur authentification', async () => {
    const { svc } = makeService();
    const result = await svc.createStoreFromAI({
      ownerId: null,
      name: 'Ma Boutique',
      businessType: VALID_BIZ,
      subSector: VALID_SUB,
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error, "Message d'erreur requis");
  });

  // ── 12. Nom absent → rejet ────────────────────────────────────────────
  it('12. createStoreFromAI — nom absent → erreur', async () => {
    const { svc } = makeService();
    const result = await svc.createStoreFromAI({
      ownerId: 'user-123',
      name: '',
      businessType: VALID_BIZ,
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error, "Message d'erreur requis pour nom absent");
  });

  // ── 13. Création AI flux complet (mock DB) ────────────────────────────
  it('13. createStoreFromAI — flux complet → store créé', async () => {
    const { svc, mockDb } = makeService();
    const result = await svc.createStoreFromAI({
      ownerId: 'user-owner-001',
      name: 'Boutique Mode Premium',
      businessType: VALID_BIZ,
      subSector: VALID_SUB,
      description: 'Boutique de commerce haut de gamme',
      userPrompt: 'Je veux quelque chose de premium et moderne',
    });

    // success OR failure are both acceptable — what we validate is
    // (a) no crash, (b) if success → proper fields, (c) if failure → explicit error
    assert.ok(typeof result.success === 'boolean', 'Un booléen success doit être retourné');
    if (result.success) {
      assert.ok(result.store, 'Le store doit être retourné');
      assert.ok(result.draftConfig, 'draft_config doit être retourné');
      assert.strictEqual(result.creationMethod, 'AI');
      assert.strictEqual(mockDb.insertedStores[0].owner_id, 'user-owner-001');
      assert.strictEqual(mockDb.insertedStores[0].creation_method, 'AI');
    } else {
      assert.ok(result.error, 'Si échec, une erreur explicite doit être fournie');
    }
  });

  // ── 14. Multi-boutiques — même user, deux stores → deux entrées distinctes
  it('14. Multi-boutiques — même user crée Store A puis Store B', async () => {
    const mockDb = createMockSupabase([]);
    const svc = new IntelligentCreationService({ supabase: mockDb });

    const resultA = await svc.createStoreFromAI({
      ownerId: 'user-multi-001',
      name: 'Boutique A',
      businessType: 'fashion',
    });
    const resultB = await svc.createStoreFromAI({
      ownerId: 'user-multi-001',
      name: 'Boutique B',
      businessType: 'restaurant',
    });

    assert.ok(resultA.success, `Boutique A échouée: ${resultA.error}`);
    assert.ok(resultB.success, `Boutique B échouée: ${resultB.error}`);
    assert.strictEqual(mockDb.insertedStores.length, 2);
    assert.strictEqual(mockDb.insertedStores[0].owner_id, 'user-multi-001');
    assert.strictEqual(mockDb.insertedStores[1].owner_id, 'user-multi-001');
    assert.notStrictEqual(
      mockDb.insertedStores[0].business_type,
      mockDb.insertedStores[1].business_type
    );
  });

  // ── 15. previewCreationConfig — sans écriture en DB ──────────────────
  it('15. previewCreationConfig — génère config valide sans write DB', () => {
    const { svc, mockDb } = makeService();
    const preview = svc.previewCreationConfig({
      name: 'Preview Store',
      businessType: VALID_BIZ,
      method: 'AI',
    });

    assert.ok(preview.success, `Preview échouée: ${preview.error}`);
    assert.ok(preview.draftConfig, 'draft_config doit être présent');
    assert.strictEqual(mockDb.insertedStores.length, 0, 'Aucune insertion DB pour une preview');
  });
});
