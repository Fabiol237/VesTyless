import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages, model = "HuggingFaceH4/zephyr-7b-beta" } = await req.json();
    const token = process.env.HUGGINGFACE_TOKEN;
    
    if (!token) return NextResponse.json({ error: "Token non configuré" }, { status: 500 });

    // Tentative via le nouveau routeur unifié de Hugging Face (URL 2026)
    const tryChat = async (modelId) => {
      const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          "x-use-cache": "false" 
        },
        method: "POST",
        body: JSON.stringify({ 
          model: modelId, 
          messages, 
          max_tokens: 500, 
          temperature: 0.7 
        })
      });
      return res;
    };

    // Modèle recommandé pour le routeur unifié
    let response = await tryChat("meta-llama/Llama-3.2-3B-Instruct");

    if (!response.ok) {
      console.warn("Llama échoué, tentative Qwen...");
      response = await tryChat("Qwen/Qwen2.5-7B-Instruct");
    }

    // Fallback 2: Si toujours erreur, tenter Qwen 2.5
    if (!response.ok) {
      console.warn("Fallback 1 échoué, tentative Fallback 2 (Qwen)...");
      response = await tryChat("Qwen/Qwen2.5-7B-Instruct");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `Erreur API ${response.status}`;
      
      if (errorMsg.includes("loading")) {
        return NextResponse.json({ error: "Le serveur IA démarre...", is_loading: true }, { status: 503 });
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    return NextResponse.json({ content: content || "Désolé, je suis un peu fatigué. Réessayez ?" });

  } catch (error) {
    console.error("Chat API Global Error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
