/**
 * VESTYLE — Ré-indexation de tous les produits avec Jina AI CLIP v2
 * Usage : node fill-embeddings-jina.mjs
 *
 * Ce script :
 * 1. Récupère tous les produits sans embedding dans Supabase
 * 2. Génère un embedding 1024D pour chaque image via Jina CLIP v2
 * 3. Sauvegarde dans image_embedding_1024
 * 4. Traite par batch de 3 (respecte les limites API)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// Charger .env.local
try {
  const envContent = readFileSync(".env.local", "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  });
} catch {}
dotenv.config();

const JINA_API_KEY = process.env.JINA_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!JINA_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Variables manquantes : JINA_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Embedding image via Jina CLIP v2 ───
async function embedImageUrl(imageUrl) {
  // Télécharger l'image
  const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
  if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status} — ${imageUrl}`);
  const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
  const buf      = await imgRes.arrayBuffer();
  const base64   = `data:${mimeType};base64,${Buffer.from(buf).toString("base64")}`;

  // Appel Jina
  const res = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "jina-clip-v2",
      input: [{ image: base64 }],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jina ${res.status}: ${err.slice(0, 200)}`);
  }

  const data      = await res.json();
  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length !== 1024) {
    throw new Error(`Embedding invalide: ${embedding?.length} dims`);
  }

  // Normalisation L2
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? embedding.map((v) => v / norm) : embedding;
}

// ─── Pause entre requêtes ───
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Programme principal ───
async function main() {
  console.log("🚀 VESTYLE — Ré-indexation Jina CLIP v2 (1024D)");
  console.log("─".repeat(50));

  // Récupérer les produits sans embedding
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url")
    .eq("is_active", true)
    .is("image_embedding_1024", null)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur Supabase:", error.message);
    process.exit(1);
  }

  console.log(`📦 ${products.length} produits à indexer\n`);

  let success = 0;
  let failed  = 0;
  const BATCH = 3;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(
      `[${i + 1}/${products.length}] ${p.name?.slice(0, 40).padEnd(40)} — `
    );

    try {
      const embedding = await embedImageUrl(p.image_url);

      const { error: upErr } = await supabase
        .from("products")
        .update({
          image_embedding_1024: embedding,
          ai_indexed_at: new Date().toISOString(),
        })
        .eq("id", p.id);

      if (upErr) throw new Error(upErr.message);

      console.log(`✅ 1024D`);
      success++;
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 60)}`);
      failed++;
    }

    // Pause tous les BATCH produits (éviter le rate limit)
    if ((i + 1) % BATCH === 0 && i + 1 < products.length) {
      await sleep(1000);
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Succès : ${success} produits`);
  console.log(`❌ Échecs : ${failed} produits`);
  console.log(`📊 Total  : ${products.length} produits traités`);
  console.log("\n🎉 Ré-indexation terminée ! La recherche visuelle est opérationnelle.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
