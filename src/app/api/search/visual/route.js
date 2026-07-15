/**
 * API : Recherche Visuelle — VESTYLE
 * Moteur : Jina AI CLIP v2 (1024D) — ~0.5s par recherche
 * Pipeline : Image → Jina CLIP 1024D → Supabase pgvector
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { embedImage } from "@/lib/vectorSearchProvider.mjs";

export const maxDuration = 30;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(req) {
  const startTime = Date.now();
  const supabase = getSupabase();

  try {
    const formData      = await req.formData();
    const imageFile     = formData.get("image");
    const imageUrlInput = formData.get("image_url");
    const categoryFilter = formData.get("category_id");

    if (!imageFile && !imageUrlInput) {
      return NextResponse.json(
        { error: "Une image ou une URL est requise." },
        { status: 400 }
      );
    }

    let imageBuffer, mimeType;

    if (imageUrlInput) {
      // URL fournie → télécharger l'image
      console.log("[Visual Search] 📸 Téléchargement image URL...");
      const imgRes = await fetch(imageUrlInput, {
        signal: AbortSignal.timeout(10000),
      });
      if (!imgRes.ok) throw new Error(`Fetch image: HTTP ${imgRes.status}`);
      const buf   = await imgRes.arrayBuffer();
      imageBuffer = Buffer.from(buf);
      mimeType    = imgRes.headers.get("content-type") || "image/jpeg";
    } else {
      // Fichier uploadé directement
      const bytes = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
      mimeType    = imageFile.type?.startsWith("image/") ? imageFile.type : "image/jpeg";
      console.log(`[Visual Search] 📸 Upload direct — ${Math.round(bytes.byteLength / 1024)}KB`);
    }

    // ── Génération embedding via Jina CLIP v2 ──
    console.log("[Visual Search] 🔍 Jina CLIP v2 embedding...");
    const embedding = await embedImage(imageBuffer, mimeType);
    const embedTime = Date.now() - startTime;
    console.log(`[Visual Search] ✅ Embedding 1024D en ${embedTime}ms`);

    // ── Recherche Supabase pgvector ──
    const { data: products, error } = await supabase.rpc("match_products_v2", {
      query_embedding: embedding,
      match_threshold: 0.15,
      match_count: 40,
    });

    if (error) throw new Error(`Supabase RPC: ${error.message}`);

    // ── Post-processing ──
    let results = products || [];
    if (categoryFilter) {
      results = results.filter(
        (p) => p.global_category_id === parseInt(categoryFilter)
      );
    }
    results = results.slice(0, 12);

    const elapsed = Date.now() - startTime;
    console.log(
      `[Visual Search] 🏁 ${elapsed}ms — ${results.length} résultat(s)`
    );

    return NextResponse.json({
      success:     true,
      engine:      "jina-clip-v2",
      products:    results,
      count:       results.length,
      elapsed_ms:  elapsed,
      vector_dims: 1024,
    });

  } catch (err) {
    console.error("[Visual Search] ❌ Erreur:", err.message);
    return NextResponse.json(
      { error: err.message || "Visual search failed", products: [] },
      { status: 500 }
    );
  }
}
