/**
 * VesTyle Design Intelligence — Command: npm run design-intelligence:ingest
 * ─────────────────────────────────────────────────────────────────────────────
 * Ingestion en direct des 20 références web réelles via Jina Live + Mistral Live,
 * consolidation des patterns, génération des embeddings 1024D et persistance Supabase.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { DesignLearningPipeline } from '../src/lib/design-intelligence/DesignLearningPipeline.js';
import { REAL_20_CORPUS } from './curated-references-corpus.js';

async function runIngestion() {
  const pipeline = new DesignLearningPipeline({
    jinaApiKey: process.env.JINA_API_KEY,
    mistralApiKey: process.env.MISTRAL_API_KEY,
    mistralModel: process.env.MISTRAL_MODEL || 'open-mistral-7b',
  });

  const liveStatus = pipeline.getLiveStatus();
  console.log('================================================================');
  console.log('VESTYLE — INGESTION RÉELLE DE 20 RÉFÉRENCES WEB');
  console.log('================================================================');
  console.log(`• Jina API LIVE     : ${liveStatus.jinaLive ? 'TRUE' : 'FALSE'}`);
  console.log(`• Mistral API LIVE  : ${liveStatus.mistralLive ? 'TRUE' : 'FALSE'} (${liveStatus.mistralModel})`);
  console.log(`• Supabase LIVE     : ${liveStatus.supabaseLive ? 'TRUE' : 'FALSE'}`);
  console.log('================================================================\n');

  if (!liveStatus.jinaLive || !liveStatus.mistralLive) {
    console.error('❌ ERREUR: Clés API LIVE manquantes. L’ingestion requiert Jina et Mistral en direct.');
    process.exit(1);
  }

  const report = await pipeline.ingestCorpus(REAL_20_CORPUS);

  console.log('\n========================================');
  console.log('REAL DESIGN LEARNING');
  console.log('========================================\n');
  console.log(`REFERENCES:\n${report.referencesTotal}\n`);
  console.log(`JINA LIVE:\n${report.jinaLiveCount}\n`);
  console.log(`MISTRAL LIVE:\n${report.mistralLiveCount}\n`);
  console.log(`OBSERVATIONS:\n${report.observationsCount}\n`);
  console.log(`UNIQUE PATTERNS:\n${report.uniquePatternsCount}\n`);
  console.log(`CONFIRMED BY 2+ SOURCES:\n${report.confirmedBy2PlusSources}\n`);
  console.log(`CONFIRMED BY 3+ SOURCES:\n${report.confirmedBy3PlusSources}\n`);
  console.log(`CROSS INDUSTRY:\n${report.crossIndustryCount}\n`);
  console.log(`INDUSTRY SPECIFIC:\n${report.industrySpecificCount}\n`);
  console.log(`RELATIONS:\n${report.relationsCount}\n`);
  console.log(`EMBEDDINGS:\n${report.embeddingsCount}\n`);
  console.log(`SUPABASE:\n${report.supabaseStatus}\n`);
  console.log(`FALLBACK:\n${report.fallbackCount}\n`);
  console.log('========================================\n');

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion().catch((err) => {
    console.error('❌ FATAL INGESTION ERROR:', err);
    process.exit(1);
  });
}

export { runIngestion };
