/**
 * API: Recherche Visuelle Optimisée
 * 
 * Pipeline:
 * 1. Reçoit une image de recherche
 * 2. Analyse avec Pixtral Vision
 * 3. Génère embedding 1024D avec Cohere
 * 4. Cherche dans Supabase avec IVFFlat index
 * 5. Filtre par catégorie et pertinence
 * 
 * Objectif: < 5 secondes, résultats précis
 */

import { CohereClient } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 45;

const VISION_PROMPT = `You are a fashion product expert. Analyze this image precisely for semantic search.
Describe: exact item type, PRIMARY COLOR (very specific), secondary colors, fabric/material if visible, fit/cut, 
special features (pockets, patterns, embellishments, neckline, sleeve type, length).
Respond in 1 clear English sentence, max 60 words. Be very specific about colors and style.

Examples of good responses:
- "Navy blue slim-fit cotton chinos with flat front and straight hem"
- "White oversized hoodie with kangaroo pocket and drawstring hood, pure cotton"
- "Burgundy floral midi dress with short puff sleeves and V-neckline, lightweight material"

Now analyze the image:`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const categoryFilter = formData.get("category_id"); // Optional category filter

    if (!imageFile) {
      return NextResponse.json(
        { error: "Une image est requise." },
        { status: 400 }
      );
    }

    console.log('[Visual Search] Starting analysis...');
    const startTime = Date.now();

    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString("base64");
    let mimeType = imageFile.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      mimeType = "image/jpeg";
    }

    // ============ ÉTAPE 1: Vision Analysis ============
    let imageDescription = "";

    try {
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

      const visionResponse = await mistral.chat.complete({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                imageUrl: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
              {
                type: "text",
                text: VISION_PROMPT,
              },
            ],
          },
        ],
        maxTokens: 100,
        temperature: 0.05,
      });

      imageDescription = visionResponse.choices[0]?.message?.content?.trim() || "";
      console.log('[Visual Search] Vision:', imageDescription);
    } catch (visionErr) {
      console.warn("[Visual Search] Pixtral error:", visionErr.message);
      // Fallback
      if (imageFile.name) {
        imageDescription = imageFile.name
          .toLowerCase()
          .replace(/\.[^/.]+$/, "")
          .replace(/[_\-]/g, " ");
      }
      if (!imageDescription) imageDescription = "clothing fashion item";
    }

    // ============ ÉTAPE 2: Generate Embedding ============
    let queryEmbedding = null;

    try {
      const cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
      });

      const embedResult = await cohere.embed({
        texts: [imageDescription],
        model: "embed-english-v3.0",
        inputType: "search_query", // "search_query" pour les recherches
        embeddingTypes: ["float"]
      });

      queryEmbedding = embedResult.embeddings.float ? embedResult.embeddings.float[0] : embedResult.embeddings[0];
      
      if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
        throw new Error(`Invalid embedding: ${queryEmbedding?.length}D`);
      }

      console.log('[Visual Search] Embedding OK:', queryEmbedding.length, 'D');
    } catch (embedErr) {
      console.error("[Visual Search] Embedding error:", embedErr.message);
      return NextResponse.json(
        { error: `Embedding failed: ${embedErr.message}` },
        { status: 500 }
      );
    }

    // ============ ÉTAPE 3: Vector Search ============
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
      // Appel RPC avec threshold optimisé
      const { data: products, error } = await supabase.rpc("match_products_v2", {
        query_embedding: queryEmbedding,
        match_threshold: 0.35, // Seuil bas pour capturer plus de variantes
        match_count: 30, // Récupérer 30 pour ensuite filtrer
      });

      if (error) {
        console.error("[Visual Search] RPC error:", error);
        throw error;
      }

      // ============ ÉTAPE 4: Post-processing & Filtering ============
      let results = (products || []).slice(0, 20); // Top 20 results
      
      // Filtrer par catégorie si spécifiée
      if (categoryFilter) {
        results = results.filter(p => p.global_category_id === parseInt(categoryFilter));
      }

      // Limiter à 12 résultats finaux
      results = results.slice(0, 12);

      const elapsedMs = Date.now() - startTime;
      console.log(`[Visual Search] ✅ ${results.length} result(s) in ${elapsedMs}ms`);

      return NextResponse.json({
        success: true,
        description: imageDescription,
        products: results,
        count: results.length,
        elapsed_ms: elapsedMs,
        embedding_size: queryEmbedding.length,
      });
    } catch (searchErr) {
      console.error("[Visual Search] Search error:", searchErr.message);
      return NextResponse.json(
        { error: `Search failed: ${searchErr.message}` },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[Visual Search API]', err);
    return NextResponse.json(
      { error: err.message || 'Visual search failed' },
      { status: 500 }
    );
  }
}
