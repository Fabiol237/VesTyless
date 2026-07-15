/**
 * API : Recherche Sémantique (Texte) — VESTYLE
 * Moteur : Jina AI CLIP v2 (1024D) — ~0.3s
 * Pipeline : Texte → Jina CLIP 1024D → Supabase pgvector
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { embedText } from "@/lib/vectorSearchProvider.mjs";

export const maxDuration = 30;

export async function POST(req) {
  const startTime = Date.now();

  try {
    const { query, threshold = 0.2, limit = 12 } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "La requête (query) est requise." },
        { status: 400 }
      );
    }

    console.log(`[Semantic Search] 🔍 "${query.slice(0, 60)}" — Jina CLIP v2...`);

    // 1. Embedding texte via Jina CLIP v2
    const queryEmbedding = await embedText(query.trim());
    const embedTime = Date.now() - startTime;
    console.log(
      `[Semantic Search] ✅ Embedding 1024D en ${embedTime}ms`
    );

    // 2. Recherche Supabase pgvector
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: products, error } = await supabase.rpc("match_products_v2", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error("[Semantic Search] Supabase RPC error:", error);
      throw new Error(`Supabase: ${error.message}`);
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `[Semantic Search] 🏁 ${(products || []).length} résultat(s) en ${elapsed}ms`
    );

    return NextResponse.json({
      success:    true,
      products:   products || [],
      count:      (products || []).length,
      elapsed_ms: elapsed,
      embed_ms:   embedTime,
      model:      "jina-clip-v2",
      dimensions: queryEmbedding.length,
    });

  } catch (err) {
    console.error("[Semantic Search] ❌ Erreur:", err.message);
    return NextResponse.json(
      { error: err.message, products: [] },
      { status: 500 }
    );
  }
}
