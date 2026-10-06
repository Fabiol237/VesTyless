/**
 * VesTyle — Diagnostic Forensic Mistral Live
 * ─────────────────────────────────────────────────────────────────────────────
 * Effectue des tests HTTP bruts directs vers l'API Mistral pour capturer :
 * 1. La réponse de GET https://api.mistral.ai/v1/models (Vérification des droits et accès de la clé)
 * 2. La requête minimale POST https://api.mistral.ai/v1/chat/completions (avec headers rate-limit)
 * 3. Le test de plusieurs modèles (mistral-small-latest, open-mistral-7b, ministral-8b-latest)
 * 4. L'analyse détaillée de la cause du 429 (RPM vs TPM vs Monthly Quota vs Account Tier)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.MISTRAL_API_KEY;

console.log('================================================================');
console.log('VESTYLE — MISTRAL LIVE FORENSIC DIAGNOSTIC');
console.log('================================================================\n');

if (!apiKey) {
  console.log('❌ MISTRAL_API_KEY : ABSENTE dans .env.local');
  process.exit(1);
}

const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
console.log(`🔑 Clé détectée : ${maskedKey} (Longueur: ${apiKey.length} caractères)\n`);

// ── 1. TEST DIRECT GET /v1/models (Vérification de validité de la clé) ────────
console.log('▶ TEST 1 : Vérification de la clé via GET https://api.mistral.ai/v1/models');
try {
  const start = Date.now();
  const resModels = await fetch('https://api.mistral.ai/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });
  const duration = Date.now() - start;
  const status = resModels.status;
  const headersObj = Object.fromEntries(resModels.headers.entries());

  console.log(`• HTTP Status      : ${status}`);
  console.log(`• Latence          : ${duration}ms`);
  console.log(`• RateLimit Headers:`, {
    limitRequests: headersObj['ratelimit-limit-req'] || headersObj['x-ratelimit-limit-req'] || 'n/a',
    remainingRequests: headersObj['ratelimit-remaining-req'] || headersObj['x-ratelimit-remaining-req'] || 'n/a',
    limitTokens: headersObj['ratelimit-limit-tokens'] || headersObj['x-ratelimit-limit-tokens'] || 'n/a',
    remainingTokens: headersObj['ratelimit-remaining-tokens'] || headersObj['x-ratelimit-remaining-tokens'] || 'n/a',
    reset: headersObj['ratelimit-reset'] || headersObj['retry-after'] || 'n/a',
  });

  const body = await resModels.text();
  if (resModels.ok) {
    const json = JSON.parse(body);
    const modelIds = json.data?.map((m) => m.id) || [];
    console.log(`✅ Clé VALIDE et reconnue par Mistral API !`);
    console.log(`• Modèles accessibles (${modelIds.length}) : ${modelIds.slice(0, 8).join(', ')}...`);
  } else {
    console.log(`❌ Réponse erreur GET /v1/models :`);
    console.log(`• Body : ${body}`);
  }
} catch (err) {
  console.log(`❌ Exception réseau lors de GET /v1/models : ${err.message}`);
}

// ── 2. TEST MINIMAL CHAT COMPLETION (1 token) ────────────────────────────────
console.log('\n----------------------------------------------------------------');
console.log('▶ TEST 2 : Requête Chat Minimaliste POST /v1/chat/completions');
console.log('----------------------------------------------------------------');

const candidateModels = [
  'mistral-small-latest',
  'open-mistral-7b',
  'ministral-8b-latest',
];

let successfulModel = null;
let lastErrorDetails = null;

for (const model of candidateModels) {
  console.log(`\nTesting model: "${model}" ...`);
  try {
    const start = Date.now();
    const resChat = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Return exactly: MISTRAL_LIVE_OK' }],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });
    const duration = Date.now() - start;
    const status = resChat.status;
    const headersObj = Object.fromEntries(resChat.headers.entries());
    const rawBody = await resChat.text();

    console.log(`• HTTP Status      : ${status}`);
    console.log(`• Latence          : ${duration}ms`);
    console.log(`• RateLimit Headers:`, {
      limitRequests: headersObj['ratelimit-limit-req'] || headersObj['x-ratelimit-limit-req'] || 'n/a',
      remainingRequests: headersObj['ratelimit-remaining-req'] || headersObj['x-ratelimit-remaining-req'] || 'n/a',
      limitTokens: headersObj['ratelimit-limit-tokens'] || headersObj['x-ratelimit-limit-tokens'] || 'n/a',
      remainingTokens: headersObj['ratelimit-remaining-tokens'] || headersObj['x-ratelimit-remaining-tokens'] || 'n/a',
      retryAfter: headersObj['retry-after'] || 'n/a',
    });

    if (resChat.ok) {
      const json = JSON.parse(rawBody);
      const reply = json.choices?.[0]?.message?.content?.trim();
      console.log(`✅ SUCCÈS LIVE MISTRAL sur "${model}" !`);
      console.log(`• Réponse reçue    : "${reply}"`);
      console.log(`• Usage tokens     : Prompt=${json.usage?.prompt_tokens}, Completion=${json.usage?.completion_tokens}`);
      successfulModel = model;
      break;
    } else {
      console.log(`❌ Erreur sur "${model}" :`);
      console.log(`• Body : ${rawBody}`);
      lastErrorDetails = { status, body: rawBody, headers: headersObj, model };
    }
  } catch (err) {
    console.log(`❌ Exception sur "${model}" : ${err.message}`);
    lastErrorDetails = { exception: err.message, model };
  }
}

// ── 3. DIAGNOSTIC CAUSAL ─────────────────────────────────────────────────────
console.log('\n================================================================');
console.log('ANALYSE CAUSALE DU RÉSULTAT MISTRAL');
console.log('================================================================');

if (successfulModel) {
  console.log(`MISTRAL LIVE = TRUE (Modèle validé: ${successfulModel})`);
} else {
  console.log(`MISTRAL LIVE = FALSE`);
  if (lastErrorDetails?.status === 429) {
    let specificCause = 'UNKNOWN_RATE_LIMIT';
    const bodyStr = lastErrorDetails.body || '';
    if (bodyStr.includes('quota') || bodyStr.includes('credits') || bodyStr.includes('billing')) {
      specificCause = 'ACCOUNT_QUOTA_OR_BILLING_EXHAUSTED';
    } else if (bodyStr.includes('Rate limit exceeded') || bodyStr.includes('rate_limited')) {
      // Vérifier si code 1300
      if (bodyStr.includes('1300')) {
        specificCause = 'MONTHLY_USAGE_TIER_QUOTA_EXHAUSTED (Code 1300: Mistral Free/Tier limit exceeded)';
      } else {
        specificCause = 'BURST_REQUESTS_OR_TOKENS_PER_MINUTE_LIMIT';
      }
    }
    console.log(`• Cause exacte : ${specificCause}`);
    console.log(`• Détails bruts : ${bodyStr}`);
  } else if (lastErrorDetails?.status === 401) {
    console.log(`• Cause : Clé API invalide ou révoquée`);
  } else {
    console.log(`• Cause : ${JSON.stringify(lastErrorDetails)}`);
  }
}
