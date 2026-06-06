import { CohereClient } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 45;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json(
        { error: "Une image est requise." },
        { status: 400 }
      );
    }

    // === ÉTAPE 1 : Analyser l'image avec Mistral Pixtral (Vision IA) ===
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

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
                text: `You are a fashion product search assistant. Describe this clothing/fashion item precisely for semantic search.
Focus on: exact item type, primary color, secondary colors, fabric/material if visible, cut/fit (slim, oversized, etc.), neckline, sleeves, patterns (stripes, floral, plain), style category (sportswear, casual, formal, streetwear, etc.).
Respond ONLY in English, in 1 concise sentence, max 40 words. Be highly specific and descriptive.
Examples:
- "Dark navy blue slim-fit chino pants with straight hem and flat front"
- "White oversized cotton hoodie with kangaroo pocket and drawstring hood"
- "Red floral summer dress midi length with short puff sleeves"
Now describe the item in the image:`,
              },
            ],
          },
        ],
        maxTokens: 120,
        temperature: 0.05,
      });

      imageDescription =
        visionResponse.choices[0]?.message?.content?.trim() || "";
      console.log("[Visual Search - Pixtral] Description:", imageDescription);
    } catch (visionErr) {
      console.warn("[Visual Search] Erreur Pixtral, fallback nom fichier:", visionErr.message);
      // Fallback sur le nom du fichier
      if (imageFile.name) {
        imageDescription = imageFile.name
          .toLowerCase()
          .replace(/\.[^/.]+$/, "")
          .replace(/[_\-]/g, " ");
      }
      if (!imageDescription) imageDescription = "clothing fashion item";
    }

    // === ÉTAPE 2 : Embedding avec Cohere ===
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    const embedResult = await cohere.embed({
      texts: [imageDescription],
      model: "embed-english-v3.0",
      inputType: "search_query", // ✅ "search_query" pour les recherches (pas "search_document")
    });

    const queryEmbedding = embedResult.embeddings[0];

    // === ÉTAPE 3 : Recherche vectorielle Supabase (seuil plus strict) ===
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: products, error } = await supabase.rpc("match_products_v2", {
      query_embedding: queryEmbedding,
      match_threshold: 0.40, // ✅ Seuil optimisé → plus de résultats pertinents
      match_count: 20,
    });

    if (error) {
      console.error("[Visual Search] Erreur Supabase RPC:", error);
      throw error;
    }

    console.log(`[Visual Search] ${products?.length ?? 0} produit(s) trouvé(s) pour "${imageDescription}"`);

    return NextResponse.json({
      success: true,
      description: imageDescription,
      products: products || [],
    });
  } catch (error) {
    console.error("[Visual Search - Cohere+Pixtral] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
