import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query, threshold = 0.5, limit = 12 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "La requête (query) est requise." }, { status: 400 });
    }

    // 1. Initialiser les clients
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Note: on utilise la clé anonyme ici car c'est une requête publique
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 2. Générer l'embedding pour la recherche de l'utilisateur
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // 3. Appeler la fonction Supabase pour chercher les produits similaires
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
    console.error("Erreur sémantique search:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
