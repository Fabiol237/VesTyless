import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testCohere() {
  const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
  });

  try {
    const embedResult = await cohere.embed({
      texts: ["testing visual search embedding"],
      model: "embed-english-v3.0",
      inputType: "search_query",
    });
    
    console.log("embedResult type:", typeof embedResult);
    console.log("embedResult keys:", Object.keys(embedResult));
    if (embedResult.embeddings) {
        console.log("embeddings type:", typeof embedResult.embeddings);
        console.log("is array?", Array.isArray(embedResult.embeddings));
        if (Array.isArray(embedResult.embeddings)) {
            console.log("first elem type:", typeof embedResult.embeddings[0]);
            console.log("first elem is array?", Array.isArray(embedResult.embeddings[0]));
            if (Array.isArray(embedResult.embeddings[0])) {
               console.log("length:", embedResult.embeddings[0].length);
            }
        }
    }
  } catch (err) {
    console.error("Cohere error:", err);
  }
}

testCohere();
