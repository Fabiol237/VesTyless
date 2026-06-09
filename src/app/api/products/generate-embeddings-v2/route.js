/**
 * API: Génération optimisée des embeddings pour les produits
 * 
 * Workflow:
 * 1. Reçoit une image de produit (base64 ou URL)
 * 2. Analyse l'image avec Pixtral Vision (1024D visual features)
 * 3. Génère description textuelle précise
 * 4. Crée embedding avec Cohere (1024D)
 * 5. Retourne l'embedding + description
 * 
 * Spécialisé pour: 7 catégories de mode
 * Objectif: < 5 secondes, haute précision
 */

import { CohereClient } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Prompts spécialisés par catégorie
const CATEGORY_PROMPTS = {
  1: `Describe this clothing item precisely for visual search. Focus on: exact type, PRIMARY COLOR (be very specific), secondary colors, fabric/material, fit/cut, neckline, sleeves, patterns, style. Respond in 1 sentence max 50 words in English.`,
  2: `Analyze this footwear item. Include: shoe type, color details, material (leather/canvas/synthetic), sole type, lace style if applicable, heel height, closure type. One sentence max 50 words in English.`,
  3: `Describe this accessory. Focus on: type (bag/belt/hat/jewelry), color(s), material, size impression, design details, embellishments. Max 50 words in English.`,
  4: `Analyze this outerwear piece. Include: coat/jacket type, exact color, lapel style, button count, pocket style, length, sleeve type, collar. Max 50 words in English.`,
  5: `Describe these pants/bottoms. Focus on: exact type, color, fit (slim/skinny/regular/wide), material, length (crop/ankle/full), waist style, embellishments. Max 50 words in English.`,
  6: `Analyze this dress/skirt. Include: garment type, exact color, pattern, length (mini/knee/midi/maxi), neckline, sleeve type, waist style, material. Max 50 words in English.`,
  7: `Describe this active/sportswear item. Focus on: type, color scheme, material (performance fabric), fit, design features, branding visible. Max 50 words in English.`,
};

export async function POST(req) {
  try {
    const { imageUrl, categoryId = null, name = '', description = '' } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Une URL d'image est requise." },
        { status: 400 }
      );
    }

    // ============ ÉTAPE 1: Récupérer l'image ============
    let imageData = imageUrl;
    let mimeType = 'image/jpeg';

    // Si ce n'est pas un data URI, télécharger l'image
    if (!imageUrl.startsWith('data:')) {
      try {
        const imgRes = await fetch(imageUrl, { timeout: 10000 });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
        
        mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        const buffer = await imgRes.arrayBuffer();
        imageData = `data:${mimeType};base64,${Buffer.from(buffer).toString('base64')}`;
      } catch (e) {
        console.error('[Embeddings] Image fetch failed:', e.message);
        // Utiliser directement l'URL si le téléchargement échoue
        imageData = imageUrl;
      }
    }

    // ============ ÉTAPE 2: Analyser avec Pixtral Vision ============
    let detailedDescription = '';
    
    try {
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const categoryPrompt = CATEGORY_PROMPTS[categoryId] || CATEGORY_PROMPTS[1];

      const visionResponse = await mistral.chat.complete({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                imageUrl: {
                  url: imageData.startsWith('data:') ? imageData : imageUrl,
                },
              },
              {
                type: "text",
                text: categoryPrompt,
              },
            ],
          },
        ],
        maxTokens: 80,
        temperature: 0.05,
      });

      detailedDescription = visionResponse.choices[0]?.message?.content?.trim() || '';
      console.log('[Embeddings] Pixtral:', detailedDescription);
    } catch (visionErr) {
      console.warn('[Embeddings] Pixtral failed:', visionErr.message);
      // Fallback: utiliser le nom du produit
      detailedDescription = name || 'fashion clothing item';
    }

    // ============ ÉTAPE 3: Combiner les infos pour le texte de recherche ============
    // Enrichir avec le nom et la description fournie
    const searchText = [
      name,
      detailedDescription,
      description
    ].filter(Boolean).join(' ').substring(0, 500);

    // ============ ÉTAPE 4: Générer embedding avec Cohere ============
    let queryEmbedding = null;

    try {
      const cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
      });

      const embedResult = await cohere.embed({
        texts: [searchText],
        model: "embed-english-v3.0",
        inputType: "search_document", // "search_document" pour les produits stockés
      });

      queryEmbedding = embedResult.embeddings[0];

      if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
        throw new Error(`Invalid embedding dimensions: ${queryEmbedding?.length}`);
      }

      console.log('[Embeddings] Cohere OK:', queryEmbedding.length, 'D');
    } catch (embedErr) {
      console.error('[Embeddings] Cohere failed:', embedErr.message);
      return NextResponse.json(
        { error: `Embedding generation failed: ${embedErr.message}` },
        { status: 500 }
      );
    }

    // ============ ÉTAPE 5: Retourner les résultats ============
    return NextResponse.json({
      success: true,
      embedding: queryEmbedding,
      text: searchText.substring(0, 200),
      visionAnalysis: detailedDescription,
      dimensions: queryEmbedding.length,
    });
  } catch (err) {
    console.error('[Embeddings API]', err);
    return NextResponse.json(
      { error: err.message || 'Embedding generation failed' },
      { status: 500 }
    );
  }
}
