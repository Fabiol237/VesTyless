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

// Removed Cohere and Mistral
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

    // ============ ÉTAPE 2: Générer embedding avec Voyage AI ============
    let queryEmbedding = null;
    const content = [];
    if (name || description) {
      const textContext = [name, description].filter(Boolean).join(" - ");
      content.push({ type: "text", text: textContext });
    }
    
    // Convert to base64 if it's not already
    let finalBase64 = imageData;
    if (!imageData.startsWith('data:')) {
      finalBase64 = `data:image/jpeg;base64,${Buffer.from(await (await fetch(imageData)).arrayBuffer()).toString('base64')}`;
    }

    content.push({ type: "image_base64", image_base64: finalBase64 });

    try {
      const res = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "voyage-multimodal-3",
          inputs: [{ content }],
          input_type: "document"
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Voyage API ${res.status}: ${errText}`);
      }

      const data = await res.json();
      queryEmbedding = data.data[0].embedding;

      if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
        throw new Error(`Invalid embedding dimensions: ${queryEmbedding?.length}`);
      }

      console.log('[Embeddings] Voyage OK:', queryEmbedding.length, 'D');
    } catch (embedErr) {
      console.error('[Embeddings] Voyage failed:', embedErr.message);
      return NextResponse.json(
        { error: `Embedding generation failed: ${embedErr.message}` },
        { status: 500 }
      );
    }

    // ============ ÉTAPE 3: Retourner les résultats ============
    return NextResponse.json({
      success: true,
      embedding: queryEmbedding,
      text: [name, description].filter(Boolean).join(" "),
      visionAnalysis: "Voyage AI Multimodal", // Maintained for compatibility
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
