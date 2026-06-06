import { CohereClient } from "cohere-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function seedRealCohere() {
  try {
    console.log("Fetching products...");
    const { data: products, error } = await supabase.from("products").select("id, name, description");
    
    if (error) throw error;
    console.log(`Found ${products.length} products. Generating real Cohere embeddings...`);

    let updated = 0;
    for (const p of products) {
      const textToEmbed = [p.name, p.description].filter(Boolean).join(" | ");
      
      const embedResult = await cohere.embed({
        texts: [textToEmbed],
        model: "embed-english-v3.0",
        inputType: "search_document",
      });

      const embedding = embedResult.embeddings[0];

      const { error: updateError } = await supabase
        .from("products")
        .update({
          text_embedding_1024: embedding,
          image_embedding_1024: embedding, // We use the same for image for now since we don't have actual images to embed with vision
        })
        .eq("id", p.id);

      if (updateError) {
        console.error(`Failed to update ${p.id}:`, updateError);
      } else {
        updated++;
        console.log(`Updated ${updated}/${products.length}: ${p.name}`);
      }
    }
    console.log(`Successfully updated ${updated} products with real Cohere embeddings!`);
  } catch (err) {
    console.error("Error:", err);
  }
}

seedRealCohere();
