import { CohereClient } from "cohere-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 30;

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

    // === ÉTAPE 1 : Description simple de l'image (basée sur le nom/type) ===
    // En production, utiliser un modèle vision (Claude, etc.)
    const mimeType = imageFile.type || "image/jpeg";
    let imageDescription = "article de mode coloré"; // Fallback simple

    // Tentative : extraire des métadonnées du fichier
    if (imageFile.name) {
      const nameClues = imageFile.name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ");
      if (nameClues) {
        imageDescription = nameClues;
      }
    }

    console.log("[Visual Search - Cohere] Description:", imageDescription);

    // === ÉTAPE 2 : Embedding avec Cohere ===
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    const embedResult = await cohere.embed({
      texts: [imageDescription],
      model: "embed-multilingual-v3.0",
      inputType: "search_query",
    });

    const queryEmbedding = embedResult.embeddings[0];

    // === ÉTAPE 3 : Recherche vectorielle Supabase ===
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: products, error } = await supabase.rpc("match_products_v2", {
      query_embedding: queryEmbedding,
      match_threshold: 0.45,
      match_count: 12,
    });

    if (error) {
      console.error("[Visual Search] Erreur Supabase RPC:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      description: imageDescription,
      products: products || [],
    });
  } catch (error) {
    console.error("[Visual Search - Cohere] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
