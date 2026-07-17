/**
 * API : Recherche Visuelle — VESTYLE
 * Moteur : Jina AI CLIP v2 (1024D) — ~0.5s par recherche
 * Pipeline : Image → Jina CLIP 1024D → Supabase pgvector
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { embedImage } from "@/lib/vectorSearchProvider.mjs";

export const maxDuration = 60;

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
    let imageBuffer, mimeType;
    let categoryFilter = null;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // Nouveau format : JSON avec image en base64 (meilleure compatibilité mobile)
      const body = await req.json();
      const imageUrlInput = body.image_url;
      const base64Data = body.image_base64;
      categoryFilter = body.category_id;

      if (!base64Data && !imageUrlInput) {
        return NextResponse.json({ error: "Une image est requise." }, { status: 400 });
      }

      if (base64Data) {
        // Format : data:image/jpeg;base64,/9j/...
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) throw new Error('Format base64 invalide');
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
        console.log(`[Visual Search] 📸 Upload base64 — ${Math.round(imageBuffer.byteLength / 1024)}KB`);
      } else {
        // URL fournie
        console.log('[Visual Search] 📸 Téléchargement image URL...');
        const imgRes = await fetch(imageUrlInput, { signal: AbortSignal.timeout(15000) });
        if (!imgRes.ok) throw new Error(`Fetch image: HTTP ${imgRes.status}`);
        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
        mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
      }
    } else {
      // Ancien format FormData (compatibilité )
      const formData = await req.formData();
      const imageFile = formData.get('image');
      const imageUrlInput = formData.get('image_url');
      categoryFilter = formData.get('category_id');

      if (!imageFile && !imageUrlInput) {
        return NextResponse.json({ error: 'Une image ou une URL est requise.' }, { status: 400 });
      }

      if (imageUrlInput) {
        console.log('[Visual Search] 📸 Téléchargement image URL...');
        const imgRes = await fetch(imageUrlInput, { signal: AbortSignal.timeout(15000) });
        if (!imgRes.ok) throw new Error(`Fetch image: HTTP ${imgRes.status}`);
        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
        mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
      } else {
        const bytes = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(bytes);
        mimeType = imageFile.type?.startsWith('image/') ? imageFile.type : 'image/jpeg';
        console.log(`[Visual Search] 📸 Upload FormData — ${Math.round(bytes.byteLength / 1024)}KB`);
      }
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
