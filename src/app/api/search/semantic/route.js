import { CohereClient } from "cohere-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query, threshold = 0.5, limit = 12 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "La requête (query) est requise." }, { status: 400 });
    }

    // 1. Initialiser Cohere
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    // 2. Générer l'embedding avec Cohere
    const embedResult = await cohere.embed({
      texts: [query],
      model: "embed-english-v3.0",
      inputType: "search_query",
    });

    const queryEmbedding = embedResult.embeddings[0]; // Array de floats

    // 3. Recherche Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Adapter la requête RPC pour Cohere (dimensions peuvent varier)
    const { data: products, error } = await supabase.rpc('search_products_text', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error("Erreur RPC Supabase:", error);
      throw error;
    }

    return NextResponse.json({ success: true, products });

  } catch (error) {
    console.error("Erreur recherche sémantique (Cohere):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
