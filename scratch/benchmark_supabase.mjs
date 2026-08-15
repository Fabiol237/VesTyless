import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

// ── Client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Benchmark Supabase under increasing concurrency levels
 * Tests SELECT queries on products & stores
 */
async function runLoadBenchmark() {
  console.log('🚀 DEMARRAGE DU BENCHMARK DE CHARGE SUPABASE VESTYLE');
  console.log(`URL DB: ${SUPABASE_URL}`);
  console.log('------------------------------------------------------------\n');

  const concurrencyLevels = [1, 5, 10, 25, 50, 100];
  const DURATION_PER_STAGE_MS = 4000; // 4 seconds per stage

  const results = [];

  for (const concurrency of concurrencyLevels) {
    console.log(`⏱️  Test avec ${concurrency} requêtes simultanées en parallèle (pendant 4 sec)...`);

    const latencies = [];
    let errors = 0;
    let totalRequests = 0;

    const startTime = Date.now();
    const endTime = startTime + DURATION_PER_STAGE_MS;

    // Worker async function
    const worker = async () => {
      while (Date.now() < endTime) {
        const reqStart = performance.now();
        try {
          // Alternative entre 2 requêtes typiques d'un utilisateur
          const choice = Math.random();
          let res;
          if (choice < 0.6) {
            // Lecture produits (page d'accueil / boutique)
            res = await supabase
              .from('products')
              .select('id, name, price, image_url, stores(name, slug)')
              .eq('is_active', true)
              .limit(12);
          } else if (choice < 0.9) {
            // Lecture boutiques
            res = await supabase
              .from('stores')
              .select('id, name, slug, city, logo_url')
              .eq('is_active', true)
              .limit(8);
          } else {
            // Recherche par texte
            res = await supabase
              .from('products')
              .select('id, name, price')
              .ilike('name', '%robe%')
              .limit(5);
          }

          const reqDuration = performance.now() - reqStart;
          if (res.error) {
            errors++;
          } else {
            latencies.push(reqDuration);
          }
        } catch (err) {
          errors++;
        }
        totalRequests++;
      }
    };

    // Lancer 'concurrency' workers en parallèle
    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    const actualDurationSec = (Date.now() - startTime) / 1000;
    const rps = totalRequests / actualDurationSec;

    // Calcul des percentiles
    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    console.log(`   └─ Total reqs: ${totalRequests} | RPS: ${rps.toFixed(1)} req/s | Erreurs: ${errors}`);
    console.log(`   └─ Latence moy: ${avg.toFixed(1)}ms | P50: ${p50.toFixed(1)}ms | P95: ${p95.toFixed(1)}ms | P99: ${p99.toFixed(1)}ms\n`);

    results.push({
      concurrency,
      totalRequests,
      rps: Number(rps.toFixed(1)),
      errors,
      avgMs: Number(avg.toFixed(1)),
      p50Ms: Number(p50.toFixed(1)),
      p95Ms: Number(p95.toFixed(1)),
      p99Ms: Number(p99.toFixed(1)),
    });
  }

  console.log('============================================================');
  console.log('📊 RÉSUMÉ DES PERFORMANCES SIMULÉES :');
  console.table(results);
}

runLoadBenchmark();
