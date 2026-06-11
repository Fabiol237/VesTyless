// Removed CohereClient
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query, threshold = 0.5, limit = 12 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "La requête (query) est requise." }, { status: 400 });
    }

    // 1. Générer l'embedding avec Voyage AI
    const res = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "voyage-multimodal-3",
        inputs: [{ content: [{ type: "text", text: query }] }],
        input_type: "query"
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur Voyage API: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const queryEmbedding = data.data[0].embedding; // Array de floats

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
