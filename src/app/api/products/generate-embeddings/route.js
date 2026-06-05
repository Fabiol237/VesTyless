import { CohereClient } from "cohere-ai";
import { NextResponse } from "next/server";

export const maxDuration = 15;

/**
 * POST /api/products/generate-embeddings
 * Génère un embedding texte via Cohere
 * à partir du nom + description du produit.
 * 
 * Body: { name, description, imageUrl }
 * Returns: { embedding: number[] }
 */
export async function POST(req) {
  try {
    const { name, description, imageUrl } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Le nom du produit est requis." }, { status: 400 });
    }

    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    // === Texte complet pour embedding ===
    const fullText = [name, description].filter(Boolean).join(" | ");

    // === Embedding via Cohere ===
    const embedResult = await cohere.embed({
      texts: [fullText],
      model: "embed-multilingual-v3.0",
      inputType: "search_document",
    });

    const embedding = embedResult.embeddings[0]; // Array de floats

    return NextResponse.json({ 
      success: true, 
      embedding: embedding, 
      text: fullText,
      dimensions: embedding.length
    });

  } catch (error) {
    console.error("[generate-embeddings - Cohere] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
