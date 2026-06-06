import { CohereClient } from "cohere-ai";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testVisualAPI() {
  try {
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    
    // Transparent PNG
    const transparentPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    const base64Image = transparentPng.toString('base64');
    const mimeType = "image/png";

    let imageDescription = "";
    
    console.log("1. Calling Pixtral...");
    try {
      const visionResponse = await mistral.chat.complete({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                imageUrl: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
              {
                type: "text",
                text: "Describe this clothing item precisely for semantic search.",
              },
            ],
          },
        ],
        maxTokens: 120,
        temperature: 0.05,
      });

      imageDescription = visionResponse.choices[0]?.message?.content?.trim() || "";
      console.log("Pixtral success. Description:", imageDescription);
    } catch (visionErr) {
      console.error("Pixtral failed:", visionErr);
      imageDescription = "clothing fashion item test";
    }

    console.log("2. Calling Cohere...");
    const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
    const embedResult = await cohere.embed({
      texts: [imageDescription],
      model: "embed-english-v3.0",
      inputType: "search_query",
    });
    const queryEmbedding = embedResult.embeddings[0];
    console.log("Cohere success. Dim:", queryEmbedding.length);

    console.log("3. Calling Supabase RPC...");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: products, error } = await supabase.rpc("match_products_v2", {
      query_embedding: queryEmbedding,
      match_threshold: 0.40,
      match_count: 20,
    });

    if (error) {
      console.error("Supabase error:", error);
    } else {
      console.log(`Supabase success. Found ${products?.length ?? 0} products.`);
    }

  } catch (error) {
    console.error("General error:", error);
  }
}

testVisualAPI();
