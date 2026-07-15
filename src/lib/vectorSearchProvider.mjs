/**
 * VESTYLE — Vector Search Provider
 * Moteur : Jina AI CLIP v2 (1024D)
 * - Image → embedding 1024D en ~0.5s (direct, sans étape description)
 * - Texte  → embedding 1024D en ~0.3s
 * - Gratuit, rapide, scalable pour 100+ utilisateurs
 */

const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_EMBED_URL = "https://api.jina.ai/v1/embeddings";
const JINA_MODEL = "jina-clip-v2";

// ─────────────────────────────────────────────────────────────────────────────
// Normalise un vecteur (norme L2 = 1) pour la similarité cosine
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeEmbedding(embedding) {
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  if (norm === 0) return embedding;
  return embedding.map((v) => v / norm);
}

// ─────────────────────────────────────────────────────────────────────────────
// Embedding TEXTE via Jina CLIP v2 → 1024D
// ─────────────────────────────────────────────────────────────────────────────
export async function embedText(text) {
  if (!JINA_API_KEY) throw new Error("JINA_API_KEY manquant dans .env.local");

  const res = await fetch(JINA_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      input: [{ text }],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jina text embed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length < 100) {
    throw new Error(`Jina: embedding texte invalide (${embedding?.length} dims)`);
  }

  return normalizeEmbedding(embedding);
}

// ─────────────────────────────────────────────────────────────────────────────
// Embedding IMAGE via Jina CLIP v2 → 1024D
// Accepte : Buffer (imageBuffer + mimeType) ou base64 string
// ─────────────────────────────────────────────────────────────────────────────
export async function embedImage(imageBuffer, mimeType = "image/jpeg") {
  if (!JINA_API_KEY) throw new Error("JINA_API_KEY manquant dans .env.local");

  // Convertir le buffer en data URI base64
  const base64 = Buffer.isBuffer(imageBuffer)
    ? `data:${mimeType};base64,${imageBuffer.toString("base64")}`
    : imageBuffer; // déjà une data URI

  const res = await fetch(JINA_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      input: [{ image: base64 }],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jina image embed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length < 100) {
    throw new Error(`Jina: embedding image invalide (${embedding?.length} dims)`);
  }

  return normalizeEmbedding(embedding);
}
