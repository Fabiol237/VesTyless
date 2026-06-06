import { createClient } from "@supabase/supabase-js";
import { CohereClient } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runDiagnostics() {
  console.log("=== DÉMARRAGE DU DIAGNOSTIC DES APIS ===");
  const results = {};

  // 1. Test Supabase
  try {
    console.log("Testing Supabase...");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("Clés Supabase manquantes dans .env.local");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from("products").select("id").limit(1);
    
    if (error) throw error;
    results.supabase = "✅ OK (Produits trouvés)";
    
    // Test RPC
    const dummyEmbedding = Array(1024).fill(0.0);
    const { error: rpcError } = await supabase.rpc("match_products_v2", {
      query_embedding: dummyEmbedding,
      match_threshold: 0.1,
      match_count: 1,
    });
    
    if (rpcError) {
      results.supabase_rpc = `❌ ERREUR: ${rpcError.message}`;
    } else {
      results.supabase_rpc = "✅ OK (Fonction match_products_v2 trouvée)";
    }
  } catch (e) {
    results.supabase = `❌ ERREUR: ${e.message}`;
  }

  // 2. Test Cohere
  try {
    console.log("Testing Cohere...");
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) throw new Error("Clé COHERE_API_KEY manquante");
    
    const cohere = new CohereClient({ token: cohereKey });
    const embedResult = await cohere.embed({
      texts: ["test"],
      model: "embed-english-v3.0",
      inputType: "search_query",
    });
    
    if (embedResult && embedResult.embeddings) {
      results.cohere = "✅ OK (Génération d'embeddings réussie)";
    } else {
      throw new Error("Pas d'embeddings retournés");
    }
  } catch (e) {
    results.cohere = `❌ ERREUR: ${e.message}`;
  }

  // 3. Test Mistral
  try {
    console.log("Testing Mistral...");
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) throw new Error("Clé MISTRAL_API_KEY manquante");
    
    const mistral = new Mistral({ apiKey: mistralKey });
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "Dis OK" }],
    });
    
    if (response && response.choices && response.choices[0]) {
      results.mistral = "✅ OK (Chatbot actif)";
    } else {
      throw new Error("Réponse Mistral invalide");
    }
  } catch (e) {
    results.mistral = `❌ ERREUR: ${e.message}`;
  }

  console.log("\n=== RÉSULTATS DU DIAGNOSTIC ===");
  for (const [key, status] of Object.entries(results)) {
    console.log(`${key.toUpperCase()}: ${status}`);
  }
}

runDiagnostics();
