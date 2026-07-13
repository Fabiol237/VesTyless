/**
 * VESTYLE — Script de simulation complète
 * Vérifie que tout le pipeline fonctionne avant le démarrage
 *
 * Usage : node simulate.mjs
 */

import { createClient } from "@supabase/supabase-js";

// ── Config (récupérée depuis .env.local) ──────────────────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY || "";
const HF_SPACE_URL     = process.env.HF_SPACE_URL || "https://fabiol237-vestyle-ai-engine.hf.space";
const MISTRAL_KEY      = process.env.MISTRAL_API_KEY || "";
const HF_TOKEN         = process.env.HF_TOKEN || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);


// ── Utilitaires ────────────────────────────────────────────────────
const OK    = "✅";
const FAIL  = "❌";
const WARN  = "⚠️ ";
const INFO  = "ℹ️ ";
let passed = 0, failed = 0, warned = 0;

function log(icon, label, detail = "") {
  const color = icon === OK ? "\x1b[32m" : icon === FAIL ? "\x1b[31m" : "\x1b[33m";
  console.log(`  ${color}${icon}\x1b[0m  ${label.padEnd(45)} ${detail ? `\x1b[90m${detail}\x1b[0m` : ""}`);
}

async function check(label, fn) {
  try {
    const result = await fn();
    log(OK, label, result || "");
    passed++;
    return true;
  } catch (e) {
    log(FAIL, label, e.message?.slice(0, 80));
    failed++;
    return false;
  }
}

async function warn(label, fn) {
  try {
    const result = await fn();
    log(OK, label, result || "");
    passed++;
    return true;
  } catch (e) {
    log(WARN, label, e.message?.slice(0, 80) + " (non-bloquant)");
    warned++;
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════
console.log("\n\x1b[1m\x1b[36m╔══════════════════════════════════════════════════╗");
console.log("║   VESTYLE — Simulation Complète du Pipeline IA   ║");
console.log("╚══════════════════════════════════════════════════╝\x1b[0m\n");

// ── TEST 1 : Supabase Connection ───────────────────────────────────
console.log("\x1b[1m📡 [1/6] Connexion Supabase\x1b[0m");

await check("Connexion Supabase (anon key)", async () => {
  const c = createClient(SUPABASE_URL, SUPABASE_ANON);
  const { error } = await c.from("products").select("id").limit(1);
  if (error) throw new Error(error.message);
  return "OK";
});

await check("Connexion Supabase (service_role)", async () => {
  const { error } = await supabase.from("products").select("id").limit(1);
  if (error) throw new Error(error.message);
  return "OK";
});

// ── TEST 2 : Colonnes IA sur products ─────────────────────────────
console.log("\n\x1b[1m🗄️  [2/6] Colonnes IA dans la table products\x1b[0m");

await check("Colonne image_embedding_1024 existe", async () => {
  const { data, error } = await supabase
    .from("products")
    .select("image_embedding_1024")
    .limit(1);
  if (error) throw new Error(error.message);
  return "vector(1024) présent";
});

await check("Colonne ai_caption existe", async () => {
  const { data, error } = await supabase
    .from("products")
    .select("ai_caption")
    .limit(1);
  if (error) throw new Error(error.message);
  return "TEXT présent";
});

await check("Colonne ai_tags existe", async () => {
  const { data, error } = await supabase
    .from("products")
    .select("ai_tags")
    .limit(1);
  if (error) throw new Error(error.message);
  return "TEXT[] présent";
});

// ── TEST 3 : RPC Functions ─────────────────────────────────────────
console.log("\n\x1b[1m⚡ [3/6] Fonctions RPC pgvector\x1b[0m");

// Vecteur de test (1024 zéros normalisés)
const TEST_VECTOR = new Array(1024).fill(0).map((_, i) => (i === 0 ? 1.0 : 0.0));

await check("RPC match_products_v2() accessible", async () => {
  const { data, error } = await supabase.rpc("match_products_v2", {
    query_embedding: TEST_VECTOR,
    match_threshold: 0.01,
    match_count: 3,
  });
  if (error) throw new Error(error.message);
  return `Retourne ${(data || []).length} produit(s)`;
});

await check("RPC search_vestyle_hybrid() accessible", async () => {
  const { data, error } = await supabase.rpc("search_vestyle_hybrid", {
    query_embedding: TEST_VECTOR,
    query_text: "robe",
    match_threshold: 0.01,
    match_count: 3,
  });
  if (error) throw new Error(error.message);
  return `Retourne ${(data || []).length} produit(s)`;
});

await check("RPC get_ai_indexing_stats() accessible", async () => {
  const { data, error } = await supabase.rpc("get_ai_indexing_stats");
  if (error) throw new Error(error.message);
  const stats = data;
  return `${stats.indexed_products}/${stats.total_products} indexés (${stats.indexation_rate_pct}%)`;
});

// ── TEST 4 : Hugging Face Space ────────────────────────────────────
console.log("\n\x1b[1m🤗 [4/6] Hugging Face Space\x1b[0m");

await check("Token HF valide", async () => {
  const res = await fetch("https://huggingface.co/api/whoami-v2", {
    headers: { Authorization: `Bearer ${HF_TOKEN}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return `Connecté : ${data.name || data.login}`;
});

await warn("Space HF répond (peut prendre 1-2 min si endormi)", async () => {
  const res = await fetch(`${HF_SPACE_URL}/info`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — Space en cours de démarrage`);
  return "Space actif";
});

await warn("API /call/predict du Space répond", async () => {
  // Test avec un pixel blanc 1x1 — API Gradio v4+ utilise /call/predict
  const pixel1x1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
  // Étape 1 : soumettre
  const submitRes = await fetch(`${HF_SPACE_URL}/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [{ path: pixel1x1 }, 0.3, 5] }),
    signal: AbortSignal.timeout(20000),
  });
  if (!submitRes.ok) {
    const txt = await submitRes.text();
    throw new Error(`HTTP ${submitRes.status}: ${txt.slice(0, 100)}`);
  }
  const { event_id } = await submitRes.json();
  if (!event_id) throw new Error("Pas d'event_id retourné");
  return `event_id reçu: ${event_id.slice(0, 12)}... (✅ submit OK)`;
});

// ── TEST 5 : Mistral Pixtral (Fallback) ───────────────────────────
console.log("\n\x1b[1m🔮 [5/6] Mistral Pixtral (moteur fallback)\x1b[0m");

await warn("Clé Mistral valide", async () => {
  const res = await fetch("https://api.mistral.ai/v1/models", {
    headers: { Authorization: `Bearer ${MISTRAL_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const hasPixtral = data.data?.some(m => m.id.includes("pixtral"));
  return hasPixtral ? "Pixtral disponible" : "Modèles OK";
});

// ── TEST 6 : Statistiques base de données ─────────────────────────
console.log("\n\x1b[1m📊 [6/6] État de la base de données\x1b[0m");

await check("Produits actifs dans la DB", async () => {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  if (!count || count === 0) throw new Error("Aucun produit actif trouvé !");
  return `${count} produit(s) actif(s)`;
});

await check("Produits avec image_url", async () => {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .not("image_url", "is", null);
  if (error) throw new Error(error.message);
  return `${count} produit(s) avec image`;
});

await warn("Produits déjà indexés (vecteurs IA)", async () => {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .not("image_embedding_1024", "is", null);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Aucun produit encore indexé — normal si première installation");
  return `${count} produit(s) avec vecteur 1024D`;
});

// ── RÉSULTAT FINAL ──────────────────────────────────────────────────
console.log("\n\x1b[1m\x1b[36m═══════════════════════════════════════════════════\x1b[0m");

const total = passed + failed + warned;
const status = failed === 0 ? "\x1b[32m✅ TOUT EST PRÊT" : "\x1b[31m❌ PROBLÈMES DÉTECTÉS";

console.log(`\x1b[1m  ${status} — ${passed}/${total} tests réussis\x1b[0m`);
if (warned > 0)  console.log(`\x1b[33m  ⚠️  ${warned} avertissement(s) non-bloquant(s)\x1b[0m`);
if (failed > 0)  console.log(`\x1b[31m  ❌  ${failed} erreur(s) à corriger avant démarrage\x1b[0m`);

if (failed === 0) {
  console.log(`
\x1b[1m\x1b[32m  🚀 Tu peux lancer : npm run dev\x1b[0m
  
  📍 Pipeline actif :
     • Moteur principal → HF Space (Florence-2 + DINOv2 + SigLIP)
     • Moteur fallback  → Pixtral + Voyage AI
     • Base de données  → Supabase pgvector HNSW 1024D
  `);
} else {
  console.log(`
\x1b[31m  Corrige les erreurs ci-dessus puis relance :
  node simulate.mjs\x1b[0m
  `);
}
