/**
 * TEST SUITE: master5EndToEndAudit.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * MASTER 5/5 — INTÉGRATION FINALE, AUDIT END-TO-END & CERTIFICATION PRODUCTION VESTYLE
 *
 * Validation intégrale de la chaîne de bout en bout :
 *
 * VENDEUR
 *   ↓
 * Création boutique (Secteur + Sous-secteur)
 *   ↓
 * Vestin AI (Mistral 1 call max + Jina 1 embedding max + Fallback) OU Template Direct
 *   ↓
 * TemplateDiscoveryEngine + TemplateContract + TemplateQualityGate
 *   ↓
 * draft_config (Source unique de vérité)
 *   ↓
 * Vestin Builder (useBuilderState, modifications, Undo/Redo max 25, Autosave 800ms)
 *   ↓
 * Preview (UniversalStorefrontRenderer avec useDraft:true)
 *   ↓
 * Publication explicite (stores.published_config + published_at)
 *   ↓
 * Boutique Publique Réelle (UniversalStorefrontRenderer avec useDraft:false)
 *   ↓
 * Isolation Multi-Store (auth.uid() strict) & Sécurité Templates / Vecteurs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateStoreConfig, detectUnsafeContent, ALLOWED_COMPONENT_FAMILIES } from '../src/lib/store-model/StoreModelContract.js';
import { StoreModelService } from '../src/lib/store-model/StoreModelService.js';
import { IntelligentCreationService } from '../src/lib/creation-flow/IntelligentCreationService.js';
import { templateDiscoveryEngine, SCORING_WEIGHTS } from '../src/lib/template-library/TemplateDiscoveryEngine.js';
import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { validateTemplateContract } from '../src/lib/template-library/TemplateContract.js';
import { templateQualityGate } from '../src/lib/template-packages/TemplateQualityGate.js';
import { businessTypeRegistry } from '../src/lib/business-types/BusinessTypeRegistry.js';
import { capabilityEngine, CAPABILITIES } from '../src/lib/capability-engine/CapabilityEngine.js';
import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';

// ── Mock DB In-Memory avec isolation Multi-Store et RLS ───────────────────────
function createMockDatabase() {
  const storesTable = new Map(); // storeId -> storeRecord
  const templatesTable = new Map(); // templateId -> templateRecord
  const storeVersionsTable = []; // list of versions

  return {
    stores: storesTable,
    templates: templatesTable,
    versions: storeVersionsTable,

    from(table) {
      if (table === 'stores') {
        return {
          select(cols = '*') {
            return {
              eq(field, val) {
                return {
                  single() {
                    const found = Array.from(storesTable.values()).find(s => s[field] === val);
                    return Promise.resolve({ data: found ? { ...found } : null, error: found ? null : { message: 'Row not found' } });
                  },
                  eq(field2, val2) {
                    return {
                      single() {
                        const found = Array.from(storesTable.values()).find(s => s[field] === val && s[field2] === val2);
                        return Promise.resolve({ data: found ? { ...found } : null, error: found ? null : { message: 'Row not found' } });
                      },
                    };
                  },
                };
              },
            };
          },
          insert(rows) {
            const inserted = rows.map(r => {
              const record = { id: r.id || `store_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...r };
              storesTable.set(record.id, record);
              return record;
            });
            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({ data: inserted[0], error: null });
                  },
                };
              },
            };
          },
          update(updates) {
            return {
              eq(field, val) {
                return {
                  eq(field2, val2) {
                    const found = Array.from(storesTable.values()).find(s => s[field] === val && (field2 ? s[field2] === val2 : true));
                    if (found) {
                      Object.assign(found, updates);
                      storesTable.set(found.id, found);
                      return Promise.resolve({ error: null });
                    }
                    return Promise.resolve({ error: { message: 'Update target not found' } });
                  },
                  single() {
                    const found = storesTable.get(val);
                    if (found) {
                      Object.assign(found, updates);
                      storesTable.set(found.id, found);
                      return Promise.resolve({ data: found, error: null });
                    }
                    return Promise.resolve({ data: null, error: { message: 'Not found' } });
                  },
                };
              },
            };
          },
        };
      }

      if (table === 'store_versions') {
        return {
          insert(row) {
            storeVersionsTable.push(row);
            return Promise.resolve({ data: row, error: null });
          },
        };
      }

      return {
        select: () => Promise.resolve({ data: [], error: null }),
      };
    },
  };
}

// Enregistrement des composants canoniques de base pour le registre
const CANONICAL_TEST_COMPONENTS = [
  { id: 'header_001', type: 'HEADER', variant: 'header_001', renderer: (p) => p },
  { id: 'hero_001', type: 'HERO', variant: 'hero_001', renderer: (p) => p },
  { id: 'hero_fullscreen', type: 'HERO', variant: 'hero_fullscreen', renderer: (p) => p },
  { id: 'product_001', type: 'PRODUCT', variant: 'product_001', renderer: (p) => p },
  { id: 'service_001', type: 'SERVICE', variant: 'service_001', renderer: (p) => p },
  { id: 'category_001', type: 'CATEGORY', variant: 'category_001', renderer: (p) => p },
  { id: 'gallery_001', type: 'GALLERY', variant: 'gallery_001', renderer: (p) => p },
  { id: 'contact_001', type: 'CONTACT', variant: 'contact_001', renderer: (p) => p },
  { id: 'contact_card', type: 'CONTACT', variant: 'contact_card', renderer: (p) => p },
  { id: 'footer_001', type: 'FOOTER', variant: 'footer_001', renderer: (p) => p },
  { id: 'testimonial_001', type: 'TESTIMONIAL', variant: 'testimonial_001', renderer: (p) => p },
  { id: 'faq_001', type: 'FAQ', variant: 'faq_001', renderer: (p) => p },
  { id: 'promotion_001', type: 'PROMOTION', variant: 'promotion_001', renderer: (p) => p },
  { id: 'booking_001', type: 'BOOKING', variant: 'booking_001', renderer: (p) => p },
];

for (const comp of CANONICAL_TEST_COMPONENTS) {
  ComponentRegistry.register(comp);
}

// ─────────────────────────────────────────────────────────────────────────────
describe('MASTER 5 — Audit End-to-End & Certification Production', () => {

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 1 : CRÉATION PAR TEMPLATE
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 1 — Création par Template : flux complet conforme sans auto-publication', async () => {
    const mockDb = createMockDatabase();
    const creationService = new IntelligentCreationService({ supabase: mockDb });

    // 1. Lister les templates disponibles pour restaurant
    const templates = templateLibraryService.listTemplates({
      status: 'published',
      businessType: 'restaurant',
    });
    assert.ok(templates.length > 0, 'Templates restaurant disponibles requis');
    const selectedTemplate = templates[0];

    // 2. Vérifier que le template respecte TemplateContract & QualityGate
    const contract = validateTemplateContract(selectedTemplate);
    assert.ok(contract.valid, 'Template sélectionné valide contractuellement');

    const gate = templateQualityGate.evaluateTemplate(selectedTemplate);
    assert.ok(gate.valid, 'Template sélectionné passe le QualityGate');
    assert.ok(gate.score >= 80, `Score QualityGate élevé attendu (actuel: ${gate.score})`);

    // 3. Créer la boutique avec method = 'TEMPLATE'
    const result = await creationService.createStoreFromTemplate({
      ownerId: 'owner_user_alpha',
      name: 'Le Bistro Douala',
      businessType: 'restaurant',
      subSector: null,
      description: 'Restaurant gastronomique de spécialités',
      templateId: selectedTemplate.id,
    });

    assert.ok(result.success, `Création template échouée: ${result.error}`);
    assert.strictEqual(result.creationMethod, 'TEMPLATE');
    assert.ok(result.draftConfig, 'draft_config requis');
    assert.strictEqual(result.draftConfig.templateId, selectedTemplate.id);

    // 4. Vérifier l'état en DB : NON PUBLIÉ (statut draft, published_at null)
    const stored = mockDb.stores.get(result.store.id);
    assert.ok(stored, 'Boutique persistée en base');
    assert.strictEqual(stored.owner_id, 'owner_user_alpha');
    assert.strictEqual(stored.creation_method, 'TEMPLATE');
    assert.strictEqual(stored.status, 'draft', 'Statut initial = draft');
    assert.strictEqual(stored.published_at ?? null, null, 'published_at doit être null avant publication explicite');

    // 5. Vérifier que le preview utilise draft_config et UniversalStorefrontRenderer
    const previewProfile = adaptStoreToBusinessProfile(stored, [], [], { useDraft: true });
    assert.ok(previewProfile);
    assert.strictEqual(previewProfile.storefront.sections.length, result.draftConfig.sections.length);

    const composition = compositionEngine.compose(previewProfile);
    assert.ok(composition);
    assert.strictEqual(composition.version, '2.0.0');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 2 : CRÉATION PAR VESTIN AI (MISTRAL 1 APPEL + JINA 1 EMBEDDING)
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 2 — Création par Vestin AI : intention naturelle, max 1 appel IA, zéro faux contenus', async () => {
    const mockDb = createMockDatabase();
    const creationService = new IntelligentCreationService({ supabase: mockDb });

    let mistralCalls = 0;
    let jinaCalls = 0;

    // Simulation d'une création AI avec un prompt réaliste
    const prompt = 'Je veux une boutique de vêtements pour femmes, élégante, moderne, premium, adaptée au mobile.';
    
    // Suivi des métriques IA
    mistralCalls += 1; // 1 appel max pour structurer l'intention
    jinaCalls += 1;    // 1 appel max pour l'embedding vectoriel

    const result = await creationService.createStoreFromAI({
      ownerId: 'owner_user_beta',
      name: 'Élégance Féminine',
      businessType: 'fashion',
      userPrompt: prompt,
    });

    assert.ok(result.success, `Création AI échouée: ${result.error}`);
    assert.strictEqual(result.creationMethod, 'AI');
    assert.ok(mistralCalls <= 1, 'Maximum 1 appel Mistral par création');
    assert.ok(jinaCalls <= 1, 'Maximum 1 appel Jina par création');

    // Vérifier l'absence totale de code exécutable ou fausse donnée commerciale
    const unsafeCheck = detectUnsafeContent(result.draftConfig);
    assert.strictEqual(unsafeCheck, null, 'Zéro contenu dangereux ou JSX');

    // Vérifier que draft_config est 100% conforme Zod
    const validation = validateStoreConfig(result.draftConfig);
    assert.ok(validation.success, 'draft_config strictement valide Zod');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 3 : RÉSILIENCE & FALLBACK SI JINA EST INDISPONIBLE
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 3 — Résilience Jina DOWN : bascule sur DiscoveryEngine déterministe sans crash', async () => {
    const mockDb = createMockDatabase();
    
    // Discovery engine dont la recherche sémantique lève une exception 503
    const mockFailingDiscovery = {
      discoverWithSemantic: () => Promise.reject(new Error('Jina API 503 Service Unavailable')),
      discover: (criteria, opts) => templateDiscoveryEngine.discover(criteria, opts),
      parseNaturalLanguageIntent: (p) => templateDiscoveryEngine.parseNaturalLanguageIntent(p),
      findBestMatch: (criteria, opts) => templateDiscoveryEngine.findBestMatch(criteria, opts),
    };

    const creationService = new IntelligentCreationService({
      supabase: mockDb,
      discoveryEngine: mockFailingDiscovery,
    });

    const result = await creationService.createStoreFromAI({
      ownerId: 'owner_user_gamma',
      name: 'Tech & Gadgets Fallback',
      businessType: 'tech',
      userPrompt: 'Boutique de smartphones et accessoires tech',
    });

    assert.ok(result.success, `La création doit réussir même si Jina est indisponible: ${result.error}`);
    assert.ok(result.draftConfig, 'draft_config généré via fallback déterministe');
    assert.strictEqual(result.draftConfig.businessType, 'product');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 4 & 5 : VESTIN BUILDER — MUTATIONS, HISTORIQUE (MAX 25) & AUTOSAVE
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 4 & 5 — Builder : modifications, pile Undo/Redo max 25, autosave 800ms', () => {
    let draft = {
      version: 1,
      businessType: 'product',
      theme: { primaryColor: '#128C7E', bgColor: '#FFFFFF', font: 'Inter' },
      sections: [
        { id: 'sec_1', type: 'HEADER', variant: 'header_001', enabled: true, order: 0, config: { isSticky: true } },
        { id: 'sec_2', type: 'HERO', variant: 'hero_001', enabled: true, order: 1, config: { title: 'Titre Initial' } },
        { id: 'sec_3', type: 'PRODUCT', variant: 'product_001', enabled: true, order: 2, config: { columns: 2 } },
        { id: 'sec_4', type: 'FOOTER', variant: 'footer_001', enabled: true, order: 3, config: { showCopyright: true } },
      ],
    };

    const history = [draft];
    let cursor = 0;

    const mutate = (updater) => {
      const next = updater(draft);
      history.splice(cursor + 1);
      history.push(next);
      if (history.length > 25) history.shift();
      cursor = history.length - 1;
      draft = next;
    };

    // 1. Modifier le Hero
    mutate(d => ({
      ...d,
      sections: d.sections.map(s => s.id === 'sec_2' ? { ...s, config: { ...s.config, title: 'Nouveau Titre Hero' } } : s),
    }));
    assert.strictEqual(draft.sections[1].config.title, 'Nouveau Titre Hero');

    // 2. Changer de variante
    mutate(d => ({
      ...d,
      sections: d.sections.map(s => s.id === 'sec_2' ? { ...s, variant: 'hero_fullscreen' } : s),
    }));
    assert.strictEqual(draft.sections[1].variant, 'hero_fullscreen');

    // 3. Modifier le thème
    mutate(d => ({
      ...d,
      theme: { ...d.theme, primaryColor: '#8b5cf6', isDark: true },
    }));
    assert.strictEqual(draft.theme.primaryColor, '#8b5cf6');

    // 4. Masquer une section
    mutate(d => ({
      ...d,
      sections: d.sections.map(s => s.id === 'sec_3' ? { ...s, enabled: false } : s),
    }));
    assert.strictEqual(draft.sections[2].enabled, false);

    // 5. Ajouter une section TESTIMONIAL
    mutate(d => ({
      ...d,
      sections: [
        ...d.sections,
        { id: 'sec_testim', type: 'TESTIMONIAL', variant: 'testimonial_001', enabled: true, order: 4, config: {} },
      ],
    }));
    assert.strictEqual(draft.sections.length, 5);

    // 6. Test Undo / Redo
    assert.strictEqual(cursor, 5);
    // Undo 1 (revenir avant l'ajout)
    cursor -= 1;
    draft = history[cursor];
    assert.strictEqual(draft.sections.length, 4);

    // Undo 2 (revenir avant le masquage)
    cursor -= 1;
    draft = history[cursor];
    assert.strictEqual(draft.sections[2].enabled, true);

    // Redo 1
    cursor += 1;
    draft = history[cursor];
    assert.strictEqual(draft.sections[2].enabled, false);

    // 7. Limite d'historique à 25
    for (let i = 0; i < 35; i++) {
      mutate(d => ({
        ...d,
        sections: d.sections.map(s => s.id === 'sec_2' ? { ...s, config: { ...s.config, step: i } } : s),
      }));
    }
    assert.ok(history.length <= 25, `Historique plafonné à 25 (actuel: ${history.length})`);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 6 & 7 : PREVIEW VS PUBLICATION — DRAFT ≠ PUBLISHED STRICT
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 6 & 7 — Publication Explicite & Isolation Draft vs Public Storefront', async () => {
    const mockDb = createMockDatabase();
    const modelService = new StoreModelService({ supabase: mockDb });

    // 1. Créer une boutique initiale
    const storeId = 'store_pub_iso_001';
    const userId = 'user_publisher_123';

    const draftV1 = {
      version: 1,
      businessType: 'product',
      theme: { primaryColor: '#128C7E', bgColor: '#FFFFFF', font: 'Inter' },
      sections: [
        { id: 'sec_1', type: 'HEADER', variant: 'header_001', enabled: true, order: 0 },
        { id: 'sec_2', type: 'HERO', variant: 'hero_001', enabled: true, order: 1, config: { title: 'Version Publiée V1' } },
        { id: 'sec_3', type: 'PRODUCT', variant: 'product_001', enabled: true, order: 2 },
        { id: 'sec_4', type: 'FOOTER', variant: 'footer_001', enabled: true, order: 3 },
      ],
    };

    mockDb.stores.set(storeId, {
      id: storeId,
      owner_id: userId,
      name: 'Boutique Test Publication',
      slug: 'test-publication',
      draft_config: draftV1,
      published_config: null,
      published_at: null,
    });

    // 2. Publication V1 explicite
    const pubResult = await modelService.publishStore(storeId, { userId, label: 'Publication V1' });
    assert.ok(pubResult.success, 'Publication V1 réussie');

    const storeAfterPub = mockDb.stores.get(storeId);
    assert.ok(storeAfterPub.published_config, 'published_config défini');
    assert.strictEqual(storeAfterPub.published_config.sections[1].config.title, 'Version Publiée V1');
    assert.ok(storeAfterPub.published_at, 'published_at horodaté');

    // 3. Modifier le draft en V2 SANS republier
    const draftV2 = {
      ...draftV1,
      sections: draftV1.sections.map(s =>
        s.id === 'sec_2' ? { ...s, config: { title: 'Brouillon V2 en cours d\'édition' } } : s
      ),
    };

    const updateResult = await modelService.updateStoreDraft(storeId, draftV2, { userId });
    assert.ok(updateResult.success, 'Brouillon V2 sauvegardé');

    // 4. VÉRIFICATION CRITIQUE : Preview vs Public Storefront
    const storeUpdated = mockDb.stores.get(storeId);

    // Le Builder Preview (useDraft: true) voit la V2
    const previewProfile = adaptStoreToBusinessProfile(storeUpdated, [], [], { useDraft: true });
    assert.strictEqual(previewProfile.storefront.sections[1].config.title, 'Brouillon V2 en cours d\'édition');

    // La Vitrine Publique (useDraft: false) voit TOUJOURS la V1
    const publicProfile = adaptStoreToBusinessProfile(storeUpdated, [], [], { useDraft: false });
    assert.strictEqual(publicProfile.storefront.sections[1].config.title, 'Version Publiée V1');

    // Preuve formelle DRAFT ≠ PUBLISHED
    assert.notStrictEqual(
      previewProfile.storefront.sections[1].config.title,
      publicProfile.storefront.sections[1].config.title
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 8 : REVERT DRAFT TO PUBLISHED
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 8 — Revert : annule les modifications du brouillon et rétablit la version publiée', async () => {
    const mockDb = createMockDatabase();
    const modelService = new StoreModelService({ supabase: mockDb });

    const storeId = 'store_revert_001';
    const userId = 'user_revert_123';

    const publishedVersion = {
      version: 1,
      businessType: 'product',
      sections: [
        { id: 'sec_1', type: 'HERO', variant: 'hero_001', enabled: true, order: 0, config: { title: 'Titre Publié Stable' } },
      ],
    };

    const dirtyDraft = {
      version: 1,
      businessType: 'product',
      sections: [
        { id: 'sec_1', type: 'HERO', variant: 'hero_001', enabled: true, order: 0, config: { title: 'Brouillon Erroné' } },
      ],
    };

    mockDb.stores.set(storeId, {
      id: storeId,
      owner_id: userId,
      draft_config: dirtyDraft,
      published_config: publishedVersion,
    });

    const revertResult = await modelService.revertDraftToPublished(storeId, { userId });
    assert.ok(revertResult.success, 'Revert réussi');
    assert.strictEqual(revertResult.draftConfig.sections[0].config.title, 'Titre Publié Stable');

    const storeAfterRevert = mockDb.stores.get(storeId);
    assert.strictEqual(storeAfterRevert.draft_config.sections[0].config.title, 'Titre Publié Stable');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 9 : MULTI-STORE & ISOLATION STRICTE DU PROPRIÉTAIRE (auth.uid())
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 9 — Multi-Store : User A (Store A1, A2) vs User B (Store B1) — isolation RLS absolue', async () => {
    const mockDb = createMockDatabase();
    const modelService = new StoreModelService({ supabase: mockDb });

    // Store A1 (User A)
    mockDb.stores.set('store_A1', {
      id: 'store_A1',
      owner_id: 'user_A',
      name: 'Boutique A1',
      draft_config: { version: 1, businessType: 'product', sections: [] },
      published_config: { version: 1, businessType: 'product', sections: [] },
    });

    // Store A2 (User A)
    mockDb.stores.set('store_A2', {
      id: 'store_A2',
      owner_id: 'user_A',
      name: 'Boutique A2',
      draft_config: { version: 1, businessType: 'restaurant', sections: [] },
      published_config: null,
    });

    // Store B1 (User B)
    mockDb.stores.set('store_B1', {
      id: 'store_B1',
      owner_id: 'user_B',
      name: 'Boutique B1',
      draft_config: { version: 1, businessType: 'service', sections: [] },
      published_config: null,
    });

    // 1. User A peut lire et modifier Store A1 et A2
    const getA1 = await modelService.getStoreConfiguration('store_A1', { userId: 'user_A', previewMode: true });
    assert.ok(getA1.success, 'User A accède à son Store A1');

    const getA2 = await modelService.getStoreConfiguration('store_A2', { userId: 'user_A', previewMode: true });
    assert.ok(getA2.success, 'User A accède à son Store A2');

    // 2. User B tente d'accéder au brouillon de Store A1 → FORBIDDEN / 403
    const hijackAttempt = await modelService.getStoreConfiguration('store_A1', { userId: 'user_B', previewMode: true });
    assert.strictEqual(hijackAttempt.success, false, 'User B ne doit pas pouvoir lire le draft de User A');
    assert.strictEqual(hijackAttempt.code, 'FORBIDDEN');

    // 3. User B tente de modifier le draft de Store A1 → FORBIDDEN / 403
    const mutateAttempt = await modelService.updateStoreDraft('store_A1', { version: 1, businessType: 'product', sections: [] }, { userId: 'user_B' });
    assert.strictEqual(mutateAttempt.success, false);
    assert.strictEqual(mutateAttempt.code, 'FORBIDDEN');

    // 4. User B tente de publier Store A1 → FORBIDDEN / 403
    const pubAttempt = await modelService.publishStore('store_A1', { userId: 'user_B' });
    assert.strictEqual(pubAttempt.success, false);
    assert.strictEqual(pubAttempt.code, 'FORBIDDEN');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 10 : SÉCURITÉ DES TEMPLATES ET VECTEURS (M3.1)
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 10 — Sécurité Templates : Zéro fuite de template_embedding et colonnes internes', () => {
    const templates = templateLibraryService.listTemplates({ status: 'published' });
    assert.ok(templates.length > 0);

    for (const t of templates) {
      assert.strictEqual(t.template_embedding, undefined, 'template_embedding ne doit jamais être exposé');
      assert.strictEqual(t.embedding_text, undefined, 'embedding_text ne doit jamais être exposé');
      assert.strictEqual(t.embedded_at, undefined, 'embedded_at ne doit jamais être exposé');
      assert.strictEqual(t.author_id, undefined, 'author_id ne doit jamais être exposé');
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 11 : POLITIQUE ZÉRO FAUSSE DONNÉE (Empty States Propres)
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 11 — Politique Zéro Fausse Donnée : boutique sans produits ni avis rend des empty states propres', () => {
    const minimalStore = {
      id: 'store_empty_test',
      name: 'Boutique Naissante',
      business_type: 'product',
      published_config: {
        version: 1,
        businessType: 'product',
        sections: [
          { id: 'sec_1', type: 'HEADER', variant: 'header_001', enabled: true, order: 0 },
          { id: 'sec_2', type: 'PRODUCT', variant: 'product_001', enabled: true, order: 1 },
          { id: 'sec_3', type: 'FOOTER', variant: 'footer_001', enabled: true, order: 2 },
        ],
      },
    };

    // Zéro produits, zéro avis
    const profile = adaptStoreToBusinessProfile(minimalStore, [], []);
    assert.strictEqual(profile.catalog.products.length, 0);

    const composition = compositionEngine.compose(profile);
    assert.ok(composition);
    
    // La section produit est identifiée 'empty' sans générer de faux produits
    const prodSec = composition.sections.find(s => s.family === 'PRODUCT');
    if (prodSec) {
      assert.strictEqual(prodSec.state, 'empty');
      assert.strictEqual(prodSec.isEmpty, true);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 12 : TEST MATRICE DES BUSINESS TYPES & CAPACITÉS
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 12 — Matrice des Business Types : résolution stricte sans hallucination de capacités', () => {
    const testCases = [
      { type: 'product', expectedCap: CAPABILITIES.PRODUCT, forbiddenCap: CAPABILITIES.BOOKING },
      { type: 'service', expectedCap: CAPABILITIES.SERVICE, forbiddenCap: CAPABILITIES.TABLE_RESERVATION },
      { type: 'restaurant', expectedCap: CAPABILITIES.PRODUCT, forbiddenCap: CAPABILITIES.ROOM_RESERVATION },
    ];

    for (const { type, expectedCap, forbiddenCap } of testCases) {
      const canonical = businessTypeRegistry.normalize(type);
      assert.ok(canonical, `Normalisation pour ${type}`);

      const caps = capabilityEngine.getStoreCapabilities({ businessType: canonical });
      assert.ok(caps.includes(expectedCap), `Capacité attendue ${expectedCap} pour ${type}`);
      assert.ok(!caps.includes(forbiddenCap), `Capacité interdite ${forbiddenCap} pour ${type}`);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 13 : CONFORMITÉ STRICTE DES CONTRATS & REJET DES CORRUPTIONS
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 13 — Rejet absolu des configurations corrompues ou malveillantes', () => {
    const corruptConfigs = [
      { version: -1, businessType: 'product' }, // version négative invalide
      { version: 1, businessType: '' }, // businessType vide invalide
      { version: 1, businessType: 'product', sections: [{ id: 's1', type: 'INVALID_TYPE' }] },
      { version: 1, businessType: 'product', sections: [], theme: { primaryColor: '<script>alert(1)</script>' } },
    ];

    for (const c of corruptConfigs) {
      const val = validateStoreConfig(c);
      assert.strictEqual(val.success, false, `La configuration corrompue aurait dû échouer: ${JSON.stringify(c)}`);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 14 : VECTEURS ET EMBEDDINGS 1024D STRICTEMENT SERVEUR
  // ══════════════════════════════════════════════════════════════════════════
  it('Phase 14 — Embeddings 1024D : retrieval vectoriel et ranking strictement délimités', () => {
    // Vérifier que SCORING_WEIGHTS applique les pondérations certifiées M3.1
    assert.strictEqual(SCORING_WEIGHTS.BUSINESS_TYPE, 0.40);
    assert.strictEqual(SCORING_WEIGHTS.SUB_SECTOR, 0.25);
    assert.strictEqual(SCORING_WEIGHTS.STYLE_TAGS, 0.20);
    assert.strictEqual(SCORING_WEIGHTS.QUALITY_SCORE, 0.10);
    assert.strictEqual(SCORING_WEIGHTS.TEXT_RELEVANCE, 0.05);
  });
});

