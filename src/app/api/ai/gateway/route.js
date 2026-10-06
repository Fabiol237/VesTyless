import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le champ "prompt" est requis.' },
        { status: 400 }
      );
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json({
        success: true,
        text: 'Clé API Mistral non configurée en local.',
      });
    }

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`Mistral API HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error('[API /api/ai/gateway] Erreur serveur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur interne de la passerelle IA.',
      },
      { status: 500 }
    );
  }
}
