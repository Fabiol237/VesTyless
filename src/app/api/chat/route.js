import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { messages, tts = false } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY manquante dans la configuration." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Modèle économique : gemini-1.5-flash (rapide + peu cher)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    // Séparer le system prompt des messages utilisateur
    const systemMsg = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    // Convertir l'historique au format Gemini
    const history = chatMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastUserMessage =
      chatMessages[chatMessages.length - 1]?.content || "";

    const chat = model.startChat({
      history,
      systemInstruction: systemMsg
        ? { role: "user", parts: [{ text: systemMsg.content }] }
        : undefined,
    });

    const result = await chat.sendMessage(lastUserMessage);
    const content = result.response.text();

    // === TTS optionnel via Google Cloud TTS REST API ===
    let audioBase64 = null;
    if (tts && content) {
      try {
        const ttsResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: { text: content.slice(0, 500) }, // Limite pour économie
              voice: {
                languageCode: "fr-FR",
                name: "fr-FR-Wavenet-C", // Voix féminine naturelle française
                ssmlGender: "FEMALE",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 1.0,
                pitch: 0.0,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioBase64 = ttsData.audioContent;
        } else {
          console.warn("[Chat TTS] Erreur TTS:", await ttsResponse.text());
        }
      } catch (ttsError) {
        console.warn("[Chat TTS] TTS échoué (non bloquant):", ttsError.message);
      }
    }

    return NextResponse.json({ content, audioBase64 });
  } catch (error) {
    console.error("[Chat API] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
