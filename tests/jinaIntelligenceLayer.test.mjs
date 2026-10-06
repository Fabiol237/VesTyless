/**
 * VESTIN — Tests Suite Master 3.1 : Jina Intelligence Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation complète :
 *   1. Provider Jina (jina-clip-v2) & Normalisation L2
 *   2. Dimension stricte 1024D (alignée avec migration Supabase vector(1024))
 *   3. Textes sémantiques compacts (sans HTML/JSX/fake data)
 *   4. Recherche sémantique vectorielle & similarité cosinus
 *   5. Filtrage strict par status (published uniquement, draft/archived exclus)
 *   6. Filtrage & compatibilité sectorielle (fashion vs restaurant vs hotel)
 *   7. Compatibilité des sous-secteurs
 *   8. Fallback instantané en cas d'erreur/panne Jina
 *   9. Fallback en cas d'erreur pgvector/RPC
 *   10. Sécurité : ZÉRO fuite de clé API JINA côté client
 *   11. Budget d'appels IA strict : Max 1 Mistral + Max 1 Jina par création
 *   12. ZÉRO fake data dans la configuration générée
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  templateEmbeddingService,
  TemplateEmbeddingService,
  buildTemplateEmbeddingText,
  buildQueryEmbeddingText,
  cosineSimilarity,
  normalizeSimilarityToScore,
} from '../src/lib/template-library/TemplateEmbeddingService.js';

import {
  templateDiscoveryEngine,
  TemplateDiscoveryEngine,
  SCORING_WEIGHTS,
  SCORING_WEIGHTS_SEMANTIC,
} from '../src/lib/template-library/TemplateDiscoveryEngine.js';

import {
  IntelligentCreationService,
} from '../src/lib/creation-flow/IntelligentCreationService.js';

import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { businessTypeRegistry } from '../src/lib/business-types/BusinessTypeRegistry.js';
import { normalizeEmbedding } from '../src/lib/vectorSearchProvider.mjs';

// ── MOCKS & HELPERS ──────────────────────────────────────────────────────────

function createMockSupabase(initialStores = []) {
  const stores = [...initialStores];
  return {
    from: (table) => {
      if (table === 'stores') {
        return {
          select: (cols) => ({
            eq: (col, val) => ({
              neq: (col2, val2) => Promise.resolve({
                data: stores.filter((s) => s[col] === val && s[col2] !== val2),
                error: null,
              }),
              then: (resolve) => resolve({
                data: stores.filter((s) => s[col] === val),
                error: null,
              }),
            }),
          }),
          insert: (rows) => ({
            select: () => ({
              single: () => {
                const inserted = { id: `store_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...rows[0] };
                stores.push(inserted);
                return Promise.resolve({ data: inserted, error: null });
              },
            }),
          }),
        };
      }
      return {};
    },
    rpc: (fnName, params) => {
      if (fnName === 'match_templates') {
        const templates = templateLibraryService.listTemplates({ status: 'published' });
        return Promise.resolve({
          data: templates.map((t) => ({ ...t, similarity: 0.85 })),
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    },
  };
}

// ── TESTS ────────────────────────────────────────────────────────────────────

test('Master 3.1 — Jina Intelligence Layer', async (t) => {

  // ── 1. Provider Jina & Normalisation L2 ─────────────────────────────────────
  await t.test('1. normalizeEmbedding normalise un vecteur à norme L2 = 1.0', () => {
    const raw = [3, 4, 0, 0];
    const norm = normalizeEmbedding(raw);
    const length = Math.sqrt(norm.reduce((sum, val) => sum + val * val, 0));
    assert.ok(Math.abs(length - 1.0) < 1e-6, `La norme L2 doit être 1.0 (obtenu: ${length})`);
    assert.strictEqual(norm[0], 0.6);
    assert.strictEqual(norm[1], 0.8);
  });

  // ── 2. Dimension stricte 1024D ─────────────────────────────────────────────
  await t.test('2. Dimension stricte 1024D du modèle Jina CLIP v2', () => {
    const service = new TemplateEmbeddingService();
    assert.strictEqual(service.dimension, 1024, 'La dimension du service doit être exactement 1024');
    assert.strictEqual(service.modelName, 'jina-clip-v2', 'Le modèle doit être jina-clip-v2');

    const vector = service.generateDeterministicVector('boutique de mode streetwear');
    assert.strictEqual(vector.length, 1024, 'Le vecteur généré doit faire exactement 1024 composantes');
    
    // Vérifier norme L2 = 1
    const l2Norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
    assert.ok(Math.abs(l2Norm - 1.0) < 1e-4, 'Le vecteur 1024D doit être normalisé L2');
  });

  // ── 3. Textes sémantiques compacts ─────────────────────────────────────────
  await t.test('3. buildTemplateEmbeddingText & buildQueryEmbeddingText produisent des textes compacts et propres', () => {
    const template = {
      name: 'Modern Fashion Store',
      business_type: 'fashion',
      sub_sector: 'mode_femme',
      template_category: 'ecommerce',
      style_tags: ['luxe', 'minimal'],
      description: '<p>Une boutique avec {props.theme} moderne et élégante.</p>',
    };

    const text = buildTemplateEmbeddingText(template);
    assert.ok(!text.includes('<p>'), 'HTML doit être retiré');
    assert.ok(!text.includes('{props.theme}'), 'JSX/JSON doit être retiré');
    assert.ok(text.includes('fashion'), 'Doit inclure le business type');
    assert.ok(text.includes('mode_femme'), 'Doit inclure le sub sector');
    assert.ok(text.includes('luxe minimal'), 'Doit inclure les tags');
    assert.ok(text.length < 500, 'Le texte doit rester compact');

    const queryText = buildQueryEmbeddingText({
      businessType: 'restaurant',
      subSector: 'gastronomie',
      styleTags: ['sombre', 'chaleureux'],
      rawPrompt: 'Je veux un restaurant gastronomique à Douala',
    });

    assert.ok(queryText.includes('restaurant'), 'Query doit inclure businessType');
    assert.ok(queryText.includes('gastronomie'), 'Query doit inclure subSector');
    assert.ok(queryText.includes('sombre'), 'Query doit inclure tags');
    assert.ok(queryText.length < 300, 'Query text doit rester compact');
  });

  // ── 4. Similarité cosinus & scoring sémantique ──────────────────────────────
  await t.test('4. cosineSimilarity calcule correctement la similarité entre vecteurs normalisés', () => {
    const service = new TemplateEmbeddingService();
    const vecA = service.generateDeterministicVector('fashion mode streetwear');
    const vecB = service.generateDeterministicVector('fashion mode streetwear'); // identique
    const vecC = service.generateDeterministicVector('restaurant gastronomie pizza'); // différent

    const simIdentical = cosineSimilarity(vecA, vecB);
    const simDifferent = cosineSimilarity(vecA, vecC);

    assert.ok(Math.abs(simIdentical - 1.0) < 1e-4, 'Similarité de deux vecteurs identiques doit être 1.0');
    assert.ok(simDifferent < simIdentical, 'Similarité avec un secteur différent doit être inférieure');

    const scoreIdentical = normalizeSimilarityToScore(simIdentical);
    assert.strictEqual(scoreIdentical, 100, 'Score 100 pour identical');
  });

  // ── 5. Filtrage strict par status (published vs draft/archived) ─────────────
  await t.test('5. discoverWithSemantic exclut les templates non publiés (draft, archived)', async () => {
    const mockLibrary = {
      listTemplates: (filter) => {
        assert.strictEqual(filter?.status, 'published', 'Doit demander uniquement status=published');
        return [
          { id: 't_pub', name: 'Published Template', business_type: 'fashion', status: 'published' },
        ];
      },
    };

    const discovery = new TemplateDiscoveryEngine(mockLibrary);
    const result = await discovery.discoverWithSemantic({ businessType: 'fashion' });

    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0].id, 't_pub');
  });

  // ── 6. Filtrage sectoriel (fashion vs restaurant vs hotel) ─────────────────
  await t.test('6. discoverWithSemantic favorise les templates du secteur demandé', async () => {
    const discovery = new TemplateDiscoveryEngine();
    
    const fashionResult = await discovery.discoverWithSemantic({
      businessType: 'fashion',
      query: 'boutique de vêtements chics',
    });

    assert.ok(fashionResult.results.length > 0, 'Doit retourner des résultats');
    assert.strictEqual(fashionResult.results[0].business_type || fashionResult.results[0].sector, 'fashion');

    const restoResult = await discovery.discoverWithSemantic({
      businessType: 'restaurant',
      query: 'bistro et plats gastronomiques',
    });

    assert.ok(restoResult.results.length > 0, 'Doit retourner des résultats');
    assert.strictEqual(restoResult.results[0].business_type || restoResult.results[0].sector, 'restaurant');
  });

  // ── 7. Sous-secteur compatible vs incompatible ─────────────────────────────
  await t.test('7. Sous-secteur compatible donne un meilleur score qu\'incompatible', async () => {
    const discovery = new TemplateDiscoveryEngine();

    const matched = discovery.calculateRelevanceScore(
      { business_type: 'restaurant', sub_sector: 'gastronomie', quality_score: 90 },
      { businessType: 'restaurant', subSector: 'gastronomie' }
    );

    const mismatched = discovery.calculateRelevanceScore(
      { business_type: 'restaurant', sub_sector: 'fast_food', quality_score: 90 },
      { businessType: 'restaurant', subSector: 'gastronomie' }
    );

    assert.ok(matched > mismatched, `Score compatible (${matched}) doit être supérieur à incompatible (${mismatched})`);
  });

  // ── 8. Fallback instantané en cas de panne Jina ─────────────────────────────
  await t.test('8. Fallback instantané vers discover() classique si Jina échoue ou est hors service', async () => {
    const failingEmbeddingService = {
      isAvailable: () => true,
      embedQuery: async () => {
        throw new Error('Jina API 503 Service Unavailable');
      },
    };

    const discovery = new TemplateDiscoveryEngine(templateLibraryService, failingEmbeddingService);
    
    // Ne doit PAS lancer d'exception
    const result = await discovery.discoverWithSemantic({
      businessType: 'hotel',
      query: 'suite de luxe avec spa',
    });

    assert.ok(result.results.length > 0, 'Doit retourner des templates via fallback synchrone');
    assert.strictEqual(result.results[0].business_type || result.results[0].sector, 'hotel');
  });

  // ── 9. Fallback en cas d'erreur pgvector / RPC ──────────────────────────────
  await t.test('9. Fallback sans crash si pgvector / RPC Supabase retourne une erreur', async () => {
    const mockSupabaseWithRpcError = {
      from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }),
      rpc: () => Promise.resolve({ data: null, error: { message: 'pgvector connection timed out' } }),
    };

    const creationService = new IntelligentCreationService({
      supabase: mockSupabaseWithRpcError,
    });

    const preview = creationService.previewCreationConfig({
      name: 'Boutique Test',
      businessType: 'fashion',
      userPrompt: 'Vêtements modernes pour hommes',
    });

    assert.strictEqual(preview.success, true, 'La prévisualisation doit réussir malgré l\'erreur RPC');
    assert.ok(preview.draftConfig, 'draftConfig doit être généré');
  });

  // ── 10. Sécurité : Aucune fuite de clé API côté client ──────────────────────
  await t.test('10. Sécurité : Aucune clé API Jina n\'est exposée dans les résultats ou objets publics', async () => {
    const discovery = new TemplateDiscoveryEngine();
    const result = await discovery.discoverWithSemantic({ businessType: 'electronics' });

    const resultStr = JSON.stringify(result);
    assert.ok(!resultStr.includes('JINA_API_KEY'), 'Ne doit pas contenir JINA_API_KEY');
    assert.ok(!resultStr.includes('NEXT_PUBLIC_JINA'), 'Ne doit pas contenir NEXT_PUBLIC_JINA');

    // Vérifier que le template ne contient pas de données privées internes
    for (const item of result.results) {
      assert.strictEqual(item.author_id, undefined, 'author_id interne ne doit pas être exposé');
      assert.strictEqual(item.template_embedding, undefined, 'vecteur brut 1024D ne doit pas être exposé');
    }
  });

  // ── 11. Budget d'appels IA strict (Max 1 Mistral + Max 1 Jina) ──────────────
  await t.test('11. Budget d\'appels IA : Exactement max 1 appel Mistral et max 1 appel Jina par création', async () => {
    let mistralCallCount = 0;
    let jinaCallCount = 0;

    const mockEmbeddingService = {
      isAvailable: () => true,
      embedQuery: async (intent) => {
        jinaCallCount += 1;
        return new Array(1024).fill(0.01);
      },
    };

    const customDiscovery = new TemplateDiscoveryEngine(templateLibraryService, mockEmbeddingService);
    const mockDb = createMockSupabase();

    const creationService = new IntelligentCreationService({
      discoveryEngine: customDiscovery,
      supabase: mockDb,
    });

    // Mock du fetch pour capturer les appels Mistral
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
      if (typeof url === 'string' && url.includes('mistral.ai')) {
        mistralCallCount += 1;
        return {
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({
                  businessType: 'bakery',
                  subSector: 'patisserie',
                  styleTags: ['artisanal', 'chaleureux'],
                  themeMode: 'light',
                }),
              },
            }],
          }),
        };
      }
      return originalFetch(url, opts);
    };

    try {
      const result = await creationService.createStoreFromAI({
        ownerId: 'user_test_budget_123',
        name: 'Le Fournil Parisien',
        businessType: 'restaurant',
        subSector: 'bakery_pastry',
        userPrompt: 'Une délicieuse boulangerie artisanale avec baguettes chaudes et viennoiseries',
      });

      assert.strictEqual(result.success, true, 'Création doit réussir');
      assert.ok(mistralCallCount <= 1, `Mistral appelé ${mistralCallCount} fois (doit être <= 1)`);
      assert.ok(jinaCallCount <= 1, `Jina appelé ${jinaCallCount} fois (doit être <= 1)`);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // ── 12. Zéro fausse donnée commerciale dans le draft ───────────────────────
  await t.test('12. ZÉRO fake data : pas de faux produits ni prix fictifs dans draft_config', async () => {
    const mockDb = createMockSupabase();
    const creationService = new IntelligentCreationService({ supabase: mockDb });

    const result = await creationService.createStoreFromAI({
      ownerId: 'user_no_fake_data',
      name: 'Mode Zen',
      businessType: 'fashion',
      userPrompt: 'Mode minimaliste et épurée',
    });

    assert.strictEqual(result.success, true);
    const draft = result.draftConfig;

    // Vérifier les sections
    assert.ok(Array.isArray(draft.sections), 'sections doit être un tableau');
    for (const sec of draft.sections) {
      if (sec.config?.products) {
        assert.fail('Interdit d\'injecter des faux produits dans les sections');
      }
    }
  });
});
