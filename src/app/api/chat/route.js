import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages, model = "HuggingFaceH4/zephyr-7b-beta" } = await req.json();
    
    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Hugging Face token not configured" }, { status: 500 });
    }

    // Using the OpenAI-compatible endpoint of Hugging Face (V1)
    // This is more reliable for Chat models.
    const response = await fetch(
      "https://api-inference.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: model,
          messages: messages, // Send the messages array directly!
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error Text:", errorText);
      return NextResponse.json({ error: `HF API Error: ${response.status}` }, { status: response.status });
    }

    const result = await response.json();
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // OpenAI format: result.choices[0].message.content
    const content = result.choices?.[0]?.message?.content;

    return NextResponse.json({ content: content || "Désolé, je ne peux pas répondre pour le moment." });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
