import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 15;

/**
 * POST /api/products/generate-embeddings
 * Génère un embedding texte via Gemini text-embedding-004
 * à partir du nom + description + analyse image du produit.
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // === ÉTAPE 1 (optionnel) : Si image fournie, Gemini Vision décrit le produit ===
    let imageDescription = '';
    if (imageUrl) {
      try {
        // Télécharger l'image pour l'envoyer à Gemini
        const imgRes = await fetch(imageUrl);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(imgBuffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

        const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const visionResult = await visionModel.generateContent([
          { inlineData: { data: base64, mimeType } },
          `Décris très brièvement ce produit en 10 mots maximum. Inclus : type, couleur, matière, style.`
        ]);
        imageDescription = visionResult.response.text()?.trim() || '';
      } catch (e) {
        console.warn('[generate-embeddings] Vision failed (non-bloquant):', e.message);
      }
    }

    // === ÉTAPE 2 : Texte complet pour embedding ===
    const fullText = [name, description, imageDescription].filter(Boolean).join(' | ');

    // === ÉTAPE 3 : Embedding via text-embedding-004 ===
    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embedResult = await embedModel.embedContent(fullText);
    const embedding = embedResult.embedding.values.slice(0, 512);

    return NextResponse.json({ success: true, embedding: `[${embedding.join(',')}]`, text: fullText });

  } catch (error) {
    console.error('[generate-embeddings] Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
