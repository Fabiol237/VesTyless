// Removed Cohere
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

    // === Texte complet pour embedding ===
    const fullText = [name, description].filter(Boolean).join(" | ");

    // === Embedding via Voyage AI ===
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "voyage-3", // Standard text model
        input: [fullText],
        input_type: "document"
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Voyage API ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const embedding = data.data[0].embedding;

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
