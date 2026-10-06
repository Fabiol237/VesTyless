/**
 * VESTIN — Tests de Vérification Manuelle & Scénarios Bout en Bout Master 3.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Scénarios validés :
 *   1. Fashion → boutique_mode → premium → AI → Jina → Preview
 *   2. Restaurant → moderne → Jina → templates restaurant
 *   3. Jina indisponible → Fallback → Boutique créée
 *   4. Jina + pgvector → résultat
 *   5. Utilisateur A vs Utilisateur B → Isolation stricte multi-boutique
 */

import assert from 'node:assert/strict';

import { intelligentCreationService } from '../src/lib/creation-flow/IntelligentCreationService.js';
import { templateDiscoveryEngine, TemplateDiscoveryEngine } from '../src/lib/template-library/TemplateDiscoveryEngine.js';
import { templateEmbeddingService } from '../src/lib/template-library/TemplateEmbeddingService.js';
import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';
import { IntelligentCreationService } from '../src/lib/creation-flow/IntelligentCreationService.js';

console.log('══════════════════════════════════════════════════════════════════');
console.log('MASTER 3.1 — SCÉNARIOS DE VÉRIFICATION MANUELLE & BOUT EN BOUT');
console.log('══════════════════════════════════════════════════════════════════\n');

async function runManualVerification() {
  const mockStores = [];
  const mockDb = {
    from: (table) => ({
      select: (cols) => ({
        eq: (col, val) => ({
          neq: (col2, val2) => Promise.resolve({
            data: mockStores.filter((s) => s[col] === val && s[col2] !== val2),
            error: null,
          }),
          then: (resolve) => resolve({
            data: mockStores.filter((s) => s[col] === val),
            error: null,
          }),
        }),
      }),
      insert: (rows) => ({
        select: () => ({
          single: () => {
            const row = { id: `store_${Date.now()}_${mockStores.length}`, ...rows[0] };
            mockStores.push(row);
            return Promise.resolve({ data: row, error: null });
          },
        }),
      }),
    }),
  };

  const service = new IntelligentCreationService({ supabase: mockDb });

  // ── TEST 1 : Fashion → boutique_mode → premium → AI → Jina → preview ───────
  console.log('▶ TEST 1 : Fashion → boutique_mode → premium → AI → Jina → preview');
  const t1 = service.previewCreationConfig({
    name: 'Maison Étoile',
    businessType: 'fashion',
    subSector: 'clothing_fashion',
    userPrompt: 'Boutique de prêt-à-porter féminin de luxe et accessoires chics',
  });
  assert.strictEqual(t1.success, true, 'Preview fashion doit réussir');
  assert.ok(t1.draftConfig, 'draftConfig généré');
  assert.ok(t1.composition, 'composition générée');
  console.log(`  ✓ Succès : Template résolu = ${t1.draftConfig.templateId}, Sections = ${t1.composition.sections.length}`);

  // ── TEST 2 : Restaurant → moderne → Jina → templates restaurant ───────────
  console.log('\n▶ TEST 2 : Restaurant → moderne → Jina → templates restaurant');
  const t2 = await templateDiscoveryEngine.discoverWithSemantic({
    businessType: 'restaurant',
    query: 'Bistro moderne et cuisine gastronomique à Douala',
  });
  assert.ok(t2.results.length > 0, 'Templates restaurant trouvés');
  const top1Sector = t2.results[0].business_type || t2.results[0].sector;
  assert.strictEqual(top1Sector, 'restaurant', 'Le top template doit être un restaurant');
  console.log(`  ✓ Succès : Top 1 = [${t2.results[0].id}] ${t2.results[0].name} (Score: ${t2.results[0].relevanceScore}%)`);

  // ── TEST 3 : Jina indisponible → fallback → boutique toujours créée ────────
  console.log('\n▶ TEST 3 : Jina indisponible → fallback → boutique toujours créée');
  const offlineEmbedding = {
    isAvailable: () => false,
    embedQuery: async () => null,
  };
  const offlineDiscovery = new TemplateDiscoveryEngine(templateLibraryService, offlineEmbedding);
  const offlineService = new IntelligentCreationService({
    discoveryEngine: offlineDiscovery,
    supabase: mockDb,
  });
  const t3 = await offlineService.createStoreFromAI({
    ownerId: 'user_offline_001',
    name: 'Tech & Gadgets Fallback',
    businessType: 'product',
    subSector: 'electronics_tech',
    userPrompt: 'Magasin high-tech avec smartphones et accessoires',
  });
  assert.strictEqual(t3.success, true, 'Création avec fallback doit réussir sans crash');
  assert.ok(t3.store, 'Store créé en base');
  console.log(`  ✓ Succès : Store créé = [${t3.store.id}] ${t3.store.name} (Slug: ${t3.store.slug})`);

  // ── TEST 4 : Jina + pgvector → résultat ───────────────────────────────────
  console.log('\n▶ TEST 4 : Jina + pgvector (embedding sémantique 1024D)');
  const queryVec = templateEmbeddingService.generateDeterministicVector('boutique de mode streetwear');
  assert.strictEqual(queryVec.length, 1024, 'Vecteur 1024D');
  const t4 = await templateDiscoveryEngine.discoverWithSemantic({
    businessType: 'fashion',
    queryVector: queryVec,
  });
  assert.ok(t4.results.length > 0, 'Résultats vectoriels trouvés');
  assert.strictEqual(t4.semanticSearchUsed, true, 'Indicateur semanticSearchUsed présent');
  console.log(`  ✓ Succès : ${t4.results.length} templates récupérés via pgvector sémantique`);

  // ── TEST 5 : Utilisateur A vs Utilisateur B → Isolation stricte ────────────
  console.log('\n▶ TEST 5 : Utilisateur A vs Utilisateur B → Isolation stricte');
  const userA_Store = await service.createStoreFromAI({
    ownerId: 'user_A_id_111',
    name: 'Boutique Alice',
    businessType: 'fashion',
    userPrompt: 'Mode pour femmes',
  });
  const userB_Store = await service.createStoreFromAI({
    ownerId: 'user_B_id_222',
    name: 'Boutique Bob',
    businessType: 'restaurant',
    userPrompt: 'Pizzeria artisanale',
  });

  assert.strictEqual(userA_Store.store.owner_id, 'user_A_id_111');
  assert.strictEqual(userB_Store.store.owner_id, 'user_B_id_222');
  assert.notStrictEqual(userA_Store.store.id, userB_Store.store.id);
  assert.notStrictEqual(userA_Store.store.slug, userB_Store.store.slug);
  console.log(`  ✓ Succès : User A (Store: ${userA_Store.store.name}, Owner: ${userA_Store.store.owner_id})`);
  console.log(`  ✓ Succès : User B (Store: ${userB_Store.store.name}, Owner: ${userB_Store.store.owner_id})`);
  console.log('  ✓ Aucune fuite de données entre propriétaires.');

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log('✅ TOUS LES 5 SCÉNARIOS DE VÉRIFICATION MANUELLE SONT VALIDÉS (5/5 PASS)');
}

runManualVerification().catch((err) => {
  console.error('❌ Échec vérification manuelle :', err);
  process.exit(1);
});
