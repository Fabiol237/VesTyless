/**
 * VesTyle Design Intelligence — Command: npm run design-intelligence:retrieve
 * ─────────────────────────────────────────────────────────────────────────────
 * Effectue les 6 tests de retrieval hybride sémantique sur la mémoire apprise
 * (similarité sémantique 1024D + filtrage structuré + compatibilité de graphe).
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { supabaseAdmin } from '../src/lib/supabaseAdmin.js';
import { DesignPatternRetriever } from '../src/lib/design-intelligence/DesignPatternRetriever.js';
import { DesignKnowledgeStore } from '../src/lib/design-intelligence/DesignKnowledgeStore.js';
import { DesignReferenceFetcher } from '../src/lib/design-intelligence/DesignReferenceFetcher.js';

const TEST_QUERIES = [
  {
    query: 'premium African fashion',
    industry: 'fashion',
    businessType: 'product',
    positioning: 'premium',
    audience: 'general',
  },
  {
    query: 'luxury restaurant',
    industry: 'restaurant',
    businessType: 'restaurant',
    positioning: 'luxury',
    audience: 'general',
  },
  {
    query: 'modern beauty salon',
    industry: 'beauty',
    businessType: 'service',
    positioning: 'accessible',
    audience: 'women',
  },
  {
    query: 'gaming electronics',
    industry: 'electronics',
    businessType: 'product',
    positioning: 'technical',
    audience: 'youth',
  },
  {
    query: 'luxury hotel',
    industry: 'hotel',
    businessType: 'hospitality',
    positioning: 'luxury',
    audience: 'general',
  },
  {
    query: 'artisan jewelry',
    industry: 'fashion',
    businessType: 'product',
    positioning: 'artisanal',
    audience: 'general',
  },
];

async function runRetrievalTests(providedStore = null) {
  console.log('================================================================');
  console.log('VESTYLE — TEST DE RETRIEVAL RÉEL SUR CONNAISSANCES APPRISES');
  console.log('================================================================\n');

  let store = providedStore;

  if (!store) {
    store = new DesignKnowledgeStore();
    // Charger depuis Supabase si connecté
    const { data: dbPatterns, error } = await supabaseAdmin
      .from('design_patterns')
      .select('*')
      .order('confidence', { ascending: false });

    if (error || !dbPatterns || dbPatterns.length === 0) {
      console.warn('⚠️ Aucun pattern trouvé dans Supabase. Veuillez exécuter `npm run design-intelligence:ingest` d’abord.');
    } else {
      console.log(`✓ Chargement de ${dbPatterns.length} patterns depuis Supabase LIVE...\n`);
      for (const row of dbPatterns) {
        store.savePattern({
          id: row.id,
          name: row.pattern_name,
          category: row.pattern_type,
          industry: row.industry,
          businessType: row.business_type,
          positioning: row.positioning,
          audience: row.audience,
          visualStyle: row.visual_style,
          attributes: row.pattern_data?.attributes || {},
          evidenceCount: row.evidence_count,
          confidence: Number(row.confidence),
          sources: row.source_metadata?.sources || [],
          embedding: row.embedding ? (typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding) : null,
          industry_distribution: row.pattern_data?.industry_distribution || { [row.industry]: 1 },
          is_cross_industry: row.pattern_data?.is_cross_industry || false,
        });
      }
    }
  }

  const fetcher = new DesignReferenceFetcher({ apiKey: process.env.JINA_API_KEY });
  const retriever = new DesignPatternRetriever(store, fetcher);
  const results = [];

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const q = TEST_QUERIES[i];
    console.log(`\n────────────────────────────────────────────────────────────────`);
    console.log(`REQUÊTE [${i + 1}/${TEST_QUERIES.length}] : "${q.query}"`);
    console.log(`Intention : Industrie=${q.industry} | Positionnement=${q.positioning} | Audience=${q.audience}`);
    console.log(`────────────────────────────────────────────────────────────────`);

    // Calcul de l'embedding de requête LIVE via Jina Embeddings API
    let queryEmbedding = null;
    try {
      queryEmbedding = await fetcher.generateEmbedding(q.query);
    } catch (err) {
      console.warn(`(Embedding fallback) ${err.message}`);
    }

    const retrieved = retriever.retrievePatterns(
      {
        text: q.query,
        industry: q.industry,
        businessType: q.businessType,
        positioning: q.positioning,
        audience: q.audience,
      },
      { limit: 3, queryEmbedding }
    );

    console.log(`Patterns récupérés (${retrieved.length}) :`);
    retrieved.forEach((item, idx) => {
      const p = item.pattern;
      const indDistStr = p.industry_distribution
        ? Object.entries(p.industry_distribution).map(([k, v]) => `${k}:${v}`).join(', ')
        : p.industry;

      console.log(`  ${idx + 1}. [${p.category.toUpperCase()}] ${p.name}`);
      console.log(`     • score global        : ${item.score}`);
      console.log(`     • similarité sém.     : ${(item.semanticSimilarity * 100).toFixed(1)}%`);
      console.log(`     • confiance           : ${p.confidence}`);
      console.log(`     • evidence_count      : ${p.evidenceCount}`);
      console.log(`     • source_count        : ${p.sourceCount || p.sources?.length || 1}`);
      console.log(`     • industry distribution: { ${indDistStr} }`);
      console.log(`     • justification       : ${item.matchReasons.join(' | ')}`);
    });

    results.push({
      query: q.query,
      retrievedPatterns: retrieved.map((r) => ({
        id: r.pattern.id,
        name: r.pattern.name,
        category: r.pattern.category,
        score: r.score,
        similarity: r.semanticSimilarity,
        confidence: r.pattern.confidence,
        evidence_count: r.pattern.evidenceCount,
        source_count: r.pattern.sourceCount || r.pattern.sources?.length || 1,
        industry_distribution: r.pattern.industry_distribution,
      })),
    });
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRetrievalTests().catch((err) => {
    console.error('❌ RETRIEVAL TEST ERROR:', err);
    process.exit(1);
  });
}

export { runRetrievalTests };
