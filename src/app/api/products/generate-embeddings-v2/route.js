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
  1: `You are a fashion cataloger. Describe this clothing item for a search index. Include: exact item type (be ultra-specific), primary color (precise shade), secondary colors, fabric/material, fit/silhouette, neckline, sleeve style, length, patterns, embellishments, and any visible brand. English only, max 70 words.`,
  2: `You are a footwear cataloger. Describe these shoes/boots for a search index. Include: exact shoe type, primary color, material (leather/suede/canvas/synthetic), sole type, heel height, toe shape, closure (lace/zip/slip-on/buckle), ankle coverage, and any visible brand. English only, max 70 words.`,
  3: `You are an accessories cataloger. Describe this accessory for a search index. Include: exact type (bag/belt/hat/jewelry/scarf/watch), primary color, secondary colors, material, size impression, shape, design details, hardware color, closures, and any visible brand. English only, max 70 words.`,
  4: `You are an outerwear cataloger. Describe this coat/jacket for a search index. Include: exact type (trench/parka/blazer/puffer/denim), color (precise shade), material, collar/lapel style, closure type, pocket style, length (waist/hip/knee/maxi), lining visible, and any visible brand. English only, max 70 words.`,
  5: `You are a bottomwear cataloger. Describe these pants/shorts/skirt for a search index. Include: exact type (skinny jeans/cargo pants/midi skirt/etc.), color, material, fit (slim/regular/wide/relaxed), rise (high/mid/low), length, embellishments/distressing, waistband type, and any visible brand. English only, max 70 words.`,
  6: `You are a dress/skirt cataloger. Describe this garment for a search index. Include: exact type (wrap dress/slip dress/maxi skirt/etc.), primary color, pattern (solid/floral/striped/etc.), length (mini/knee/midi/maxi), neckline, sleeve style, silhouette (A-line/fitted/flowy/etc.), material, and any visible brand. English only, max 70 words.`,
  7: `You are a sportswear cataloger. Describe this athletic item for a search index. Include: exact type (leggings/sports bra/joggers/cycling shorts/etc.), color scheme, fabric (compression/moisture-wicking/etc.), fit, design features (mesh panels/reflective strips/etc.), and any visible brand/logo. English only, max 70 words.`,
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
        maxTokens: 100,
        temperature: 0,
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
