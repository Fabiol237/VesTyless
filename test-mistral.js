import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testMistral() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("MISTRAL_API_KEY manquante");
    process.exit(1);
  }

  try {
    const client = new Mistral({ apiKey });
    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: "Dis bonjour en JSON { \"message\": \"bonjour\" }" }],
      responseFormat: { type: "json_object" },
    });
    console.log("Mistral OK:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Erreur Mistral:", error.message);
  }
}

testMistral();
