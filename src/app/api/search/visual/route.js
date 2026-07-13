/**
 * API: Recherche Visuelle — VESTYLE AI Engine
 *
 * Pipeline PRINCIPAL (Hugging Face Space) :
 *   Image → HF Space (Florence-2 + DINOv2 + SigLIP) → Supabase pgvector
 *
 * Pipeline FALLBACK (si HF Space indisponible) :
 *   Image → Pixtral Vision → Voyage AI → Supabase pgvector
 */

import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const maxDuration = 60;

// ── URL du Hugging Face Space ──────────────────────────────────────
const HF_SPACE_URL = "https://fabiol237-vestyle-ai-engine.hf.space";

// ── Supabase client (service_role pour RPC) ─────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ════════════════════════════════════════════════════════════════════
// MOTEUR PRINCIPAL : Hugging Face Space
// Gradio v4 API : POST /call/search → SSE /call/search/{event_id}
// ════════════════════════════════════════════════════════════════════
async function searchViaHuggingFace(base64Image, mimeType, matchThreshold = 0.28, matchCount = 40) {
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  
  try {
    // 1. Connexion au Space Hugging Face
    const hfClient = await Client.connect("Fabiol237/vestyle-ai-engine");
    
    // 2. Appel de l'API (api_name="search")
    const result = await hfClient.predict("search", [
      dataUrl,
      matchThreshold,
      matchCount
    ]);
    
    const output = result.data[0];
    if (output.error) {
      throw new Error(`HF Space API Error: ${output.error}`);
    }
    
    return {
      success:     true,
      engine:      "huggingface",
      description: output.step?.florence?.caption || "",
      ocr:         output.step?.florence?.ocr || "",
      tags:        output.step?.florence?.tags || [],
      products:    output.products || [],
      count:       (output.products || []).length,
      vector_dims: output.metadata?.vector_dims || 1024,
    };
  } catch (err) {
    throw new Error(`HF Space failed: ${err.message}`);
  }
}

// ════════════════════════════════════════════════════════════════════
// MOTEUR FALLBACK : Pixtral + Voyage AI (ancien pipeline)
// ════════════════════════════════════════════════════════════════════
const VISION_PROMPT = `You are a professional fashion product cataloger for a visual search engine. Analyze this image with extreme precision.

Output format: [ITEM_TYPE] [EXACT_COLOR] [SECONDARY_COLORS_IF_ANY] [MATERIAL/FABRIC_IF_VISIBLE] [FIT_OR_CUT] [KEY_FEATURES]

Rules:
- ITEM_TYPE: be ultra-specific (e.g., "bomber jacket", "palazzo pants", NOT just "jacket" or "pants")
- EXACT_COLOR: use precise shade names (e.g., "navy blue", "dusty rose", "camel brown", NOT just "blue" or "pink")
- Include: patterns (floral, striped, plaid, solid, camo), neckline, sleeve length, hemline, embellishments, logos/brand if visible
- If multiple items visible, focus on the MAIN/FOREGROUND item
- Language: English only
- Length: max 70 words, 1-2 sentences

Now analyze:`;

async function searchViaFallback(base64Image, mimeType, supabase) {
  console.log("[Visual Search] 🔄 Fallback : Pixtral + Voyage AI");

  // Étape 1 : Description Pixtral
  let imageDescription = "clothing fashion item";
  try {
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const visionResponse = await mistral.chat.complete({
      model: "pixtral-12b-2409",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", imageUrl: { url: `data:${mimeType};base64,${base64Image}` } },
          { type: "text", text: VISION_PROMPT },
        ],
      }],
      maxTokens: 130,
      temperature: 0,
    });
    imageDescription = visionResponse.choices[0]?.message?.content?.trim() || imageDescription;
    console.log("[Fallback] Vision:", imageDescription.slice(0, 60));
  } catch (e) {
    console.warn("[Fallback] Pixtral error:", e.message);
  }

  // Étape 2 : Embedding Voyage AI
  const voyageRes = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "voyage-multimodal-3",
      inputs: [{ content: [
        { type: "text", text: imageDescription },
        { type: "image_base64", image_base64: `data:${mimeType};base64,${base64Image}` },
      ]}],
      input_type: "query",
    }),
  });

  if (!voyageRes.ok) {
    const err = await voyageRes.text();
    throw new Error(`Voyage API ${voyageRes.status}: ${err.slice(0, 150)}`);
  }

  const voyageData = await voyageRes.json();
  const embedding = voyageData.data[0].embedding;

  // Étape 3 : Recherche Supabase
  const { data: products, error } = await supabase.rpc("match_products_v2", {
    query_embedding: embedding,
    match_threshold: 0.28,
    match_count: 40,
  });

  if (error) throw new Error(`Supabase RPC: ${error.message}`);

  return {
    success: true,
    engine: "fallback_voyage",
    description: imageDescription,
    products: (products || []).slice(0, 20),
    count: (products || []).length,
    vector_dims: embedding.length,
  };
}

// ════════════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ════════════════════════════════════════════════════════════════════
export async function POST(req) {
  const startTime = Date.now();
  const supabase  = getSupabase();

  try {
    const formData     = await req.formData();
    const imageFile    = formData.get("image");
    const categoryFilter = formData.get("category_id");

    if (!imageFile) {
      return NextResponse.json({ error: "Une image est requise." }, { status: 400 });
    }

    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString("base64");
    const mimeType    = imageFile.type?.startsWith("image/") ? imageFile.type : "image/jpeg";

    console.log(`[Visual Search] 🚀 Démarrage — ${Math.round(imageBytes.byteLength / 1024)}KB`);

    // ── Tenter le moteur HF Space en premier ──
    let searchResult;
    try {
      console.log("[Visual Search] 🤗 Tentative HF Space (Florence-2 + DINOv2 + SigLIP)...");
      searchResult = await searchViaHuggingFace(base64Image, mimeType);
      console.log(`[Visual Search] ✅ HF Space OK — ${searchResult.count} produit(s) bruts`);
    } catch (hfErr) {
      console.warn(`[Visual Search] ⚠️ HF Space indisponible: ${hfErr.message}`);
      console.log("[Visual Search] 🔄 Bascule sur fallback Voyage AI...");
      searchResult = await searchViaFallback(base64Image, mimeType, supabase);
    }

    // ── Post-processing : filtre catégorie + top 12 ──
    let products = searchResult.products || [];
    if (categoryFilter) {
      products = products.filter(p => p.global_category_id === parseInt(categoryFilter));
    }
    products = products.slice(0, 12);

    const elapsedMs = Date.now() - startTime;
    console.log(`[Visual Search] 🏁 Terminé en ${elapsedMs}ms — moteur: ${searchResult.engine} — ${products.length} résultat(s)`);

    return NextResponse.json({
      success: true,
      engine:        searchResult.engine,
      description:   searchResult.description || "",
      ocr:           searchResult.ocr || "",
      tags:          searchResult.tags || [],
      products,
      count:         products.length,
      elapsed_ms:    elapsedMs,
      vector_dims:   searchResult.vector_dims || 1024,
    });

  } catch (err) {
    console.error("[Visual Search] ❌ Erreur fatale:", err.message);
    return NextResponse.json(
      { error: err.message || "Visual search failed" },
      { status: 500 }
    );
  }
}
