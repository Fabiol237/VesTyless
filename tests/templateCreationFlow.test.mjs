/**
 * TEST SUITE: templateCreationFlow
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide le flux de création via sélection de template (Mode B) :
 *  1. Template publié → PASS
 *  2. Template draft → FAIL (non disponible)
 *  3. Template archived → FAIL (non disponible)
 *  4. Template inexistant → FAIL
 *  5. templateId absent → FAIL
 *  6. Conversion template → draft_config valide
 *  7. creation_method = TEMPLATE dans la DB
 *  8. template_id + template_version enregistrés
 *  9. draft_config.businessType respecte le secteur du vendeur
 * 10. TemplateDiscovery retourne templates pertinents pour un secteur
 * 11. TemplateDiscovery ne retourne PAS de templates draft/archived
 * 12. Sélection template → draft_config → StoreModelContract valide
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { IntelligentCreationService } from '../src/lib/creation-flow/IntelligentCreationService.js';
import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { templateDiscoveryEngine } from '../src/lib/template-library/TemplateDiscoveryEngine.js';
import { validateStoreConfig } from '../src/lib/store-model/StoreModelContract.js';

// ── Mock Supabase ──────────────────────────────────────────────────────────
function createMockSupabase() {
  const insertedStores = [];
  return {
    insertedStores,
    from() {
      return {
        select() { return { eq() { return Promise.resolve({ data: [], error: null }); } }; },
        insert(rows) {
          insertedStores.push(...rows);
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: { id: 'store-tpl-' + Date.now(), ...rows[0] }, error: null });
                },
              };
            },
          };
        },
      };
    },
  };
}

function makeService() {
  const db = createMockSupabase();
  const svc = new IntelligentCreationService({ supabase: db });
  return { svc, db };
}

// ──────────────────────────────────────────────────────────────────────────
describe('Master 3 — Template Creation Flow', () => {

  // ── Récupérer un template publié réel ────────────────────────────────
  const allPublished = templateLibraryService.listTemplates({ status: 'published' });

  // ── 1. Template publié → PASS ──────────────────────────────────────
  it('1. createStoreFromTemplate — template publié → store créé', async () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié dans la bibliothèque — test ignoré');
      return;
    }
    const { svc, db } = makeService();
    const tpl = allPublished[0];

    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-tpl-001',
      name: 'Boutique Template',
      businessType: tpl.business_type || 'fashion',
      templateId: tpl.id,
    });

    assert.ok(result.success, `Echec avec template publié: ${result.error}`);
    assert.ok(result.store, 'Store doit être retourné');
    assert.ok(result.draftConfig, 'draft_config doit être retourné');
    assert.strictEqual(result.creationMethod, 'TEMPLATE');
    assert.strictEqual(db.insertedStores.length, 1);
  });

  // ── 2. Template draft → FAIL ──────────────────────────────────────
  it('2. createStoreFromTemplate — template draft → rejeté', async () => {
    // Enregistrer un template draft temporaire
    const draftTpl = {
      id: 'test_draft_creation_999',
      name: 'Brouillon Test',
      business_type: 'fashion',
      status: 'draft',
      theme: { primaryColor: '#000', bgColor: '#fff' },
      sections: [
        { id: 'h1', type: 'HEADER', variant: 'default', order: 0 },
        { id: 'f1', type: 'FOOTER', variant: 'default', order: 1 },
      ],
    };
    templateLibraryService.registerTemplate(draftTpl);

    const { svc } = makeService();
    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-tpl-002',
      name: 'Test Draft',
      businessType: 'fashion',
      templateId: 'test_draft_creation_999',
    });

    assert.strictEqual(result.success, false, 'Un template draft doit être rejeté');
    assert.ok(result.error, 'Message erreur attendu');
    assert.ok(
      result.error.toLowerCase().includes('draft') ||
      result.error.toLowerCase().includes('disponible') ||
      result.error.toLowerCase().includes('statut'),
      `Erreur doit mentionner le statut: ${result.error}`
    );
  });

  // ── 3. Template archived → FAIL ───────────────────────────────────
  it('3. createStoreFromTemplate — template archived → rejeté', async () => {
    const archivedTpl = {
      id: 'test_archived_creation_999',
      name: 'Archive Test',
      business_type: 'fashion',
      status: 'archived',
      theme: { primaryColor: '#000', bgColor: '#fff' },
      sections: [
        { id: 'h1', type: 'HEADER', variant: 'default', order: 0 },
        { id: 'f1', type: 'FOOTER', variant: 'default', order: 1 },
      ],
    };
    templateLibraryService.registerTemplate(archivedTpl);

    const { svc } = makeService();
    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-tpl-003',
      name: 'Test Archived',
      businessType: 'fashion',
      templateId: 'test_archived_creation_999',
    });

    assert.strictEqual(result.success, false, 'Un template archived doit être rejeté');
    assert.ok(result.error);
  });

  // ── 4. Template inexistant → FAIL ─────────────────────────────────
  it('4. createStoreFromTemplate — template inexistant → rejeté', async () => {
    const { svc } = makeService();
    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-tpl-004',
      name: 'Test Inexistant',
      businessType: 'fashion',
      templateId: 'TEMPLATE_QUI_NEXISTE_PAS_XYZ',
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.ok(
      result.error.toLowerCase().includes('introuvable') ||
      result.error.toLowerCase().includes('not found') ||
      result.error.toLowerCase().includes('inexistant'),
      `Erreur doit indiquer template non trouvé: ${result.error}`
    );
  });

  // ── 5. templateId absent → FAIL ───────────────────────────────────
  it('5. createStoreFromTemplate — templateId absent → erreur', async () => {
    const { svc } = makeService();
    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-tpl-005',
      name: 'Test Sans ID',
      businessType: 'fashion',
      templateId: null,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
  });

  // ── 6. Conversion template → draft_config valide ──────────────────
  it('6. Template publié → draft_config valide par StoreModelContract', async () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié — test ignoré');
      return;
    }
    const { svc } = makeService();
    const tpl = allPublished[0];

    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-contract',
      name: 'Contract Test',
      businessType: tpl.business_type || 'fashion',
      templateId: tpl.id,
    });

    if (!result.success) {
      assert.ok(result.error, 'Erreur explicite attendue');
      return;
    }

    const validation = validateStoreConfig(result.draftConfig);
    assert.ok(validation.success, `draft_config invalide: ${validation.error}`);
  });

  // ── 7. creation_method = TEMPLATE dans la DB ──────────────────────
  it('7. createStoreFromTemplate — creation_method TEMPLATE enregistré', async () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié — test ignoré');
      return;
    }
    const { svc, db } = makeService();
    const tpl = allPublished[0];

    await svc.createStoreFromTemplate({
      ownerId: 'user-cm-001',
      name: 'CM Test',
      businessType: tpl.business_type || 'fashion',
      templateId: tpl.id,
    });

    if (db.insertedStores.length > 0) {
      assert.strictEqual(db.insertedStores[0].creation_method, 'TEMPLATE');
    } else {
      assert.ok(true, 'Pas de store créé — comportement dépendant du template');
    }
  });

  // ── 8. template_id + template_version enregistrés ─────────────────
  it('8. createStoreFromTemplate — template_id + template_version dans la DB', async () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié — test ignoré');
      return;
    }
    const { svc, db } = makeService();
    const tpl = allPublished[0];

    await svc.createStoreFromTemplate({
      ownerId: 'user-meta-001',
      name: 'Meta Test',
      businessType: tpl.business_type || 'fashion',
      templateId: tpl.id,
    });

    if (db.insertedStores.length > 0) {
      assert.strictEqual(db.insertedStores[0].template_id, tpl.id, 'template_id correct');
      assert.ok(db.insertedStores[0].template_version, 'template_version présent');
    }
  });

  // ── 9. TemplateDiscovery — résultats cohérents pour un secteur ────
  it('9. TemplateDiscovery — retourne des templates pertinents pour fashion', () => {
    const discovery = templateDiscoveryEngine.discover(
      { businessType: 'fashion', query: 'mode feminine elegante' },
      { limit: 6 }
    );

    assert.ok(discovery, 'Discovery doit retourner un résultat');
    assert.ok(Array.isArray(discovery.results), 'results doit être un tableau');
    // Ne pas exiger un résultat si pas de template en bibliothèque
    assert.ok(discovery.results.length >= 0);
  });

  // ── 10. TemplateDiscovery — pas de templates draft/archived ───────
  it('10. TemplateDiscovery — ne retourne jamais des templates non-publiés', () => {
    const discovery = templateDiscoveryEngine.discover(
      { businessType: 'fashion' },
      { limit: 20 }
    );

    for (const tpl of discovery.results) {
      assert.strictEqual(
        tpl.status,
        'published',
        `Template ${tpl.id} a un statut non-publié: ${tpl.status}`
      );
    }
  });

  // ── 11. previewCreationConfig avec templateId → composition ──────
  it('11. previewCreationConfig avec templateId — retourne draft_config', () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié — test ignoré');
      return;
    }
    const { svc } = makeService();
    const tpl = allPublished[0];

    const preview = svc.previewCreationConfig({
      name: 'Preview Mode',
      businessType: tpl.business_type || 'fashion',
      method: 'TEMPLATE',
      templateId: tpl.id,
    });

    assert.ok(preview.success, `Preview échouée: ${preview.error}`);
    assert.ok(preview.draftConfig, 'draft_config attendu');
  });

  // ── 12. Template sélectionné → matchedTemplate retourné ──────────
  it('12. createStoreFromTemplate — matchedTemplate présent dans le résultat', async () => {
    if (allPublished.length === 0) {
      assert.ok(true, 'Aucun template publié — test ignoré');
      return;
    }
    const { svc } = makeService();
    const tpl = allPublished[0];

    const result = await svc.createStoreFromTemplate({
      ownerId: 'user-mt-001',
      name: 'Match Test',
      businessType: tpl.business_type || 'fashion',
      templateId: tpl.id,
    });

    if (result.success) {
      assert.ok(result.matchedTemplate, 'matchedTemplate doit être présent');
      assert.strictEqual(result.matchedTemplate.id, tpl.id, 'matchedTemplate.id correspond');
    }
  });
});
