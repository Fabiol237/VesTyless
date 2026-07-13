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

import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { imageUrl, categoryId = null, name = '', description = '' } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Une URL d'image est requise." },
        { status: 400 }
      );
    }

    // ============ ÉTAPE 1: Préparer l'image ============
    let imageData = imageUrl;
    let mimeType = 'image/jpeg';

    if (!imageUrl.startsWith('data:')) {
      try {
        const imgRes = await fetch(imageUrl, { timeout: 10000 });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
        
        mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        const buffer = await imgRes.arrayBuffer();
        imageData = `data:${mimeType};base64,${Buffer.from(buffer).toString('base64')}`;
      } catch (e) {
        console.error('[Embeddings] Image fetch failed:', e.message);
        return NextResponse.json({ error: "Impossible de télécharger l'image" }, { status: 400 });
      }
    }

    // ============ ÉTAPE 2: Appeler HF Space (Florence+DINO+SigLIP) ============
    let queryEmbedding = null;
    let visionAnalysis = '';
    
    try {
      console.log('[Embeddings] Appel du HF Space...');
      const hf = await Client.connect("Fabiol237/vestyle-ai-engine");
      
      if (!hf) {
        throw new Error('Impossible de connecter au HF Space');
      }

      const result = await hf.predict("search", [imageData, 0.01, 1]);
      
      // Validation stricte de la réponse
      if (!result || !result.data) {
        throw new Error('HF Space retourna une réponse invalide (pas de data)');
      }

      if (!Array.isArray(result.data) || result.data.length === 0) {
        throw new Error(`HF Space retourna un data invalide: ${JSON.stringify(result).slice(0, 200)}`);
      }

      const data = result.data[0];
      
      if (!data) {
        throw new Error('HF Space retourna data[0] = null/undefined');
      }

      if (typeof data === 'string') {
        throw new Error(`HF Space retourna une chaîne au lieu d'un objet: ${data}`);
      }

      if (data.error) {
        throw new Error(`HF Space: ${data.error}`);
      }

      queryEmbedding = data.metadata?.embedding;
      visionAnalysis = data.step?.florence?.caption || '';

      if (!queryEmbedding) {
        throw new Error('Pas d\'embedding retourné par HF Space');
      }

      if (!Array.isArray(queryEmbedding)) {
        throw new Error(`Embedding n'est pas un array: ${typeof queryEmbedding}`);
      }

      if (queryEmbedding.length !== 1024) {
        throw new Error(`Dimensions d'embedding invalides: ${queryEmbedding.length} (attendu 1024)`);
      }

      console.log('[Embeddings] HF Space OK:', queryEmbedding.length, 'D');
    } catch (embedErr) {
      console.error('[Embeddings] HF Space failed:', embedErr.message);
      console.error('[Embeddings] Full error:', embedErr.stack);
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
      visionAnalysis: visionAnalysis,
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
