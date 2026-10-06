/**
 * VESTIN — Tests Suite Master 3.1 : Benchmark de Pertinence Sémantique Jina
 * ─────────────────────────────────────────────────────────────────────────────
 * Compare la pertinence et les performances de la découverte de templates :
 *   1. Requête Fashion Premium ("boutique de vêtements féminins premium")
 *   2. Requête Restaurant Moderne ("restaurant moderne à Douala")
 *   3. Requête Hôtel Luxe ("hôtel de luxe avec spa")
 *   4. Requête Boulangerie Artisanale ("boulangerie artisanale et pâtisserie fine")
 *
 * Mesures :
 *   - Top 1, Top 3, Top 6
 *   - Comparaison score sans Jina vs avec Jina
 *   - Temps d'exécution de chaque étape (Parsing, Embedding, Discovery, Total)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TemplateDiscoveryEngine,
} from '../src/lib/template-library/TemplateDiscoveryEngine.js';

import {
  TemplateEmbeddingService,
} from '../src/lib/template-library/TemplateEmbeddingService.js';

import { templateLibraryService } from '../src/lib/template-library/TemplateLibraryService.js';

// ── TEST BENCHMARK ───────────────────────────────────────────────────────────

test('Master 3.1 — Benchmark de Pertinence & Performance Jina', async (t) => {
  const embeddingService = new TemplateEmbeddingService();
  const discoveryEngine = new TemplateDiscoveryEngine(templateLibraryService, embeddingService);

  const BENCHMARK_CASES = [
    {
      id: 'fashion_premium',
      prompt: 'boutique de vêtements féminins premium',
      expectedSector: 'fashion',
      expectedTags: ['luxe', 'premium', 'minimal', 'moderne'],
    },
    {
      id: 'restaurant_moderne',
      prompt: 'restaurant moderne à Douala avec carte de plats gastronomiques',
      expectedSector: 'restaurant',
      expectedTags: ['moderne', 'gastronomie', 'sombre', 'chaleureux'],
    },
    {
      id: 'hotel_luxe',
      prompt: 'hôtel de luxe avec spa et suites de prestige',
      expectedSector: 'hotel',
      expectedTags: ['luxe', 'immersif', 'galerie'],
    },
    {
      id: 'bakery_artisanal',
      prompt: 'boulangerie artisanale et pâtisserie fine',
      expectedSector: 'bakery',
      expectedTags: ['artisanal', 'chaleureux'],
    },
  ];

  for (const tc of BENCHMARK_CASES) {
    await t.test(`Benchmark : "${tc.prompt}" (${tc.expectedSector})`, async () => {
      // 1. Découverte sans Jina (déterministe pure)
      const t0Sync = performance.now();
      const classicResult = discoveryEngine.discover(tc.prompt, { limit: 6 });
      const durationSync = performance.now() - t0Sync;

      // 2. Découverte avec Jina (sémantique)
      const t0Semantic = performance.now();
      const semanticResult = await discoveryEngine.discoverWithSemantic(tc.prompt, { limit: 6 });
      const durationSemantic = performance.now() - t0Semantic;

      // Assertions sur la pertinence
      assert.ok(classicResult.results.length > 0, 'Classic discovery doit trouver des résultats');
      assert.ok(semanticResult.results.length > 0, 'Semantic discovery doit trouver des résultats');

      const top1Classic = classicResult.results[0];
      const top1Semantic = semanticResult.results[0];

      const top1ClassicSector = top1Classic.business_type || top1Classic.sector;
      const top1SemanticSector = top1Semantic.business_type || top1Semantic.sector;

      assert.strictEqual(
        top1SemanticSector,
        tc.expectedSector,
        `Le Top 1 sémantique doit être du secteur ${tc.expectedSector} (obtenu: ${top1SemanticSector})`
      );

      // Score sémantique Top 1 doit être >= 70%
      assert.ok(
        top1Semantic.relevanceScore >= 70,
        `Le score de pertinence Top 1 doit être >= 70% (obtenu: ${top1Semantic.relevanceScore}%)`
      );

      // Log informatif pour le rapport
      console.log(`\n--- BENCHMARK RESULT : "${tc.prompt}" ---`);
      console.log(`  Sector: ${tc.expectedSector}`);
      console.log(`  Sans Jina Top 1 : [${top1Classic.id}] ${top1Classic.name} (Score: ${top1Classic.relevanceScore}%, Temps: ${durationSync.toFixed(2)}ms)`);
      console.log(`  Avec Jina Top 1 : [${top1Semantic.id}] ${top1Semantic.name} (Score: ${top1Semantic.relevanceScore}%, SemanticScore: ${top1Semantic.semanticScore}%, Temps: ${durationSemantic.toFixed(2)}ms)`);
      console.log(`  Top 3 Semantic  : ${semanticResult.results.slice(0, 3).map((r) => `${r.id} (${r.relevanceScore}%)`).join(', ')}`);
    });
  }
});
