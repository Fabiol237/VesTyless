import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Lire l'image en base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBytes = Buffer.from(imageBuffer);
    const base64Image = imageBytes.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // === ÉTAPE 1 : Gemini Vision décrit l'image ===
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const visionResult = await visionModel.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      `Décris précisément cet article vestimentaire ou produit visible dans l'image.
Inclus : type de vêtement/produit, couleur principale, matière apparente, style, coupe, détails distinctifs.
Réponds en une seule phrase courte et dense, sans ponctuation finale, optimisée pour une recherche vectorielle.
Exemple : "robe longue rouge fluide à motifs floraux col V style bohème"`,
    ]);

    const imageDescription =
      visionResult.response.text()?.trim() ||
      "article de mode";

    console.log("[Visual Search] Description Gemini:", imageDescription);

    // === ÉTAPE 2 : Embedding du texte décrit ===
    const embedModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const embedResult = await embedModel.embedContent(imageDescription);
    const queryEmbedding = embedResult.embedding.values.slice(0, 512); // text-embedding-004 gère Matryoshka, on coupe à 512 pour coller à la BDD existante

    // === ÉTAPE 3 : Recherche vectorielle Supabase ===
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: products, error } = await supabase.rpc(
      "match_products_v2",
      {
        query_embedding: `[${queryEmbedding.join(",")}]`, // Format attendu par l'ancienne fonction (string array)
        match_threshold: 0.45,
        match_count: 12,
      }
    );

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
    console.error("[Visual Search] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
