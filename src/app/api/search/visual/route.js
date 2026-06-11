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

// Removed CohereClient
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 45;

const VISION_PROMPT = `You are a professional fashion product cataloger for a visual search engine. Analyze this image with extreme precision.

Output format: [ITEM_TYPE] [EXACT_COLOR] [SECONDARY_COLORS_IF_ANY] [MATERIAL/FABRIC_IF_VISIBLE] [FIT_OR_CUT] [KEY_FEATURES]

Rules:
- ITEM_TYPE: be ultra-specific (e.g., "bomber jacket", "palazzo pants", NOT just "jacket" or "pants")
- EXACT_COLOR: use precise shade names (e.g., "navy blue", "dusty rose", "camel brown", NOT just "blue" or "pink")
- Include: patterns (floral, striped, plaid, solid, camo), neckline, sleeve length, hemline, embellishments, logos/brand if visible
- If multiple items visible, focus on the MAIN/FOREGROUND item
- Language: English only
- Length: max 70 words, 1-2 sentences

Examples:
- "Oversized burgundy velvet blazer with peak lapels, gold buttons, single-breasted, padded shoulders, below-hip length"
- "High-waist sky-blue denim wide-leg jeans with distressed knees, frayed hem, five-pocket design"
- "Fitted forest-green ribbed turtleneck sweater, long sleeves, cropped length above waist, stretch fabric"
- "Black leather ankle boots with chunky block heel 5cm, almond toe, side zip closure, matte finish"

Now analyze:`;

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
        maxTokens: 130,
        temperature: 0,
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
      const content = [];
      if (imageDescription) {
        content.push({ type: "text", text: imageDescription });
      }
      content.push({ type: "image_base64", image_base64: `data:${mimeType};base64,${base64Image}` });

      const res = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "voyage-multimodal-3",
          inputs: [{ content }],
          input_type: "query"
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Voyage API ${res.status}: ${errText}`);
      }

      const data = await res.json();
      queryEmbedding = data.data[0].embedding;
      
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
        match_threshold: 0.28, // Seuil abaissé pour meilleur rappel
        match_count: 40, // Récupérer plus pour filtrer ensuite
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
