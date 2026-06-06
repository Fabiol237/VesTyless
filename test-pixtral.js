import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testPixtral() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("MISTRAL_API_KEY manquante");
    process.exit(1);
  }

  try {
    const mistral = new Mistral({ apiKey });
    
    // A 1x1 black pixel base64 encoded
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    
    const visionResponse = await mistral.chat.complete({
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              imageUrl: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "What color is this image?",
            },
          ],
        },
      ],
      maxTokens: 120,
    });
    console.log("Pixtral OK:", visionResponse.choices[0]?.message?.content);
  } catch (error) {
    console.error("Erreur Pixtral:", error.message);
  }
}

testPixtral();
