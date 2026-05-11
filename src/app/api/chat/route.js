import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const token = process.env.HUGGINGFACE_TOKEN;
    
    if (!token) {
      console.error("AI Error: HUGGINGFACE_TOKEN is missing in .env.local");
      return NextResponse.json({ error: "Token non configuré" }, { status: 500 });
    }

    const hf = new HfInference(token);

    // Liste de modèles ultra-fiables (souvent "warm")
    const models = [
      "mistralai/Mistral-7B-Instruct-v0.3",
      "meta-llama/Llama-3.2-3B-Instruct",
      "Qwen/Qwen2.5-7B-Instruct",
      "HuggingFaceH4/zephyr-7b-beta"
    ];

    let lastError = "";
    let content = "";

    for (const model of models) {
      try {
        console.log(`AI: Attempting with model ${model}...`);
        const response = await hf.chatCompletion({
          model: model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        });

        if (response.choices?.[0]?.message?.content) {
          content = response.choices[0].message.content;
          console.log(`AI: Success with ${model}`);
          break;
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`AI: Model ${model} failed:`, lastError);
        if (lastError.includes("loading")) {
          // Si le modèle charge, on peut soit attendre soit passer au suivant
          continue; 
        }
      }
    }

    if (!content) {
      if (lastError.includes("loading")) {
        return NextResponse.json({ 
          error: "Le serveur IA est en cours de démarrage. Réessayez dans quelques secondes.",
          is_loading: true 
        }, { status: 503 });
      }
      return NextResponse.json({ error: `Tous les modèles IA ont échoué. ${lastError}` }, { status: 500 });
    }

    return NextResponse.json({ content });

  } catch (error) {
    console.error("Chat API Global Error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
