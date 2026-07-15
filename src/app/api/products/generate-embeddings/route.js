/**
 * API: Génération d'embeddings pour les produits — VESTYLE
 * Moteur : Jina AI CLIP v2 (1024D)
 * Pipeline : Image URL → Jina CLIP 1024D → retourne embedding
 */

import { NextResponse } from "next/server";
import { embedImage } from "@/lib/vectorSearchProvider.mjs";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { imageUrl, name = "", description = "" } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Une URL d'image est requise." },
        { status: 400 }
      );
    }

    // ── Télécharger l'image ──
    let imageBuffer, mimeType;
    try {
      const imgRes = await fetch(imageUrl, {
        signal: AbortSignal.timeout(10000),
      });
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      mimeType    = imgRes.headers.get("content-type") || "image/jpeg";
      const buf   = await imgRes.arrayBuffer();
      imageBuffer = Buffer.from(buf);
    } catch (e) {
      return NextResponse.json(
        { error: `Impossible de télécharger l'image: ${e.message}` },
        { status: 400 }
      );
    }

    // ── Générer l'embedding via Jina CLIP v2 ──
    console.log("[Embeddings] Jina CLIP v2...");
    const embedding = await embedImage(imageBuffer, mimeType);

    if (!Array.isArray(embedding) || embedding.length !== 1024) {
      throw new Error(`Dimensions invalides: ${embedding?.length} (attendu 1024)`);
    }

    console.log("[Embeddings] ✅ OK:", embedding.length, "D");

    return NextResponse.json({
      success:       true,
      embedding,
      dimensions:    embedding.length,
      model:         "jina-clip-v2",
      text:          [name, description].filter(Boolean).join(" "),
      visionAnalysis: "",
    });

  } catch (err) {
    console.error("[Embeddings API]", err.message);
    return NextResponse.json(
      { error: err.message || "Embedding generation failed" },
      { status: 500 }
    );
  }
}
