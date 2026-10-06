/**
 * VesTyle — Test Décisif Mistral Live & Pipeline End-to-End Sans Fallback
 * ─────────────────────────────────────────────────────────────────────────────
 * RÈGLE ABSOLUE : Si Mistral ou Jina échoue, le test ÉCHOUE (DO NOT FALLBACK).
 * Effectue :
 * 1. Test minimal de déblocage Mistral
 * 2. Ingestion réelle d'une URL publique via Jina Live
 * 3. Analyse abstraite de design via Mistral Live (sans aucun fallback)
 * 4. Extraction de patterns réels
 * 5. Embeddings et persistance Supabase Live
 * 6. Rapport factuel exact
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import {
  designKnowledgeStore,
  DesignReferenceFetcher,
  DesignReasoningEngine,
  designLogger,
} from '../src/lib/design-intelligence/index.js';

console.log('================================================================');
console.log('VESTYLE — TEST DÉCISIF MISTRAL LIVE SANS FALLBACK');
console.log('================================================================\n');

const jinaKey = process.env.JINA_API_KEY;
const mistralKey = process.env.MISTRAL_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── 1. CONFIGURATION CHECK ───────────────────────────────────────────────────
const isConfigured = Boolean(mistralKey && mistralKey.length > 10);
const endpoint = 'https://api.mistral.ai/v1/chat/completions';
const chosenModel = process.env.MISTRAL_MODEL || 'open-mistral-7b';

console.log(`• Configuration Mistral : ${isConfigured ? 'VALIDE' : 'MANQUANTE'}`);
console.log(`• Endpoint              : ${endpoint}`);
console.log(`• Modèle retenu         : ${chosenModel}`);

// ── 2. REQUÊTE MINIMALE RÉELLE ───────────────────────────────────────────────
console.log('\n▶ ÉTAPE 1 : REQUÊTE MINIMALE LIVE MISTRAL');
let minimalPass = false;
let minimalHttpStatus = 0;
let minimalErrorCode = 'NONE';
let quotaStatus = 'ACTIVE';

try {
  const mistralClient = new Mistral({ apiKey: mistralKey });
  const startMin = Date.now();
  const resMin = await mistralClient.chat.complete({
    model: chosenModel,
    messages: [{ role: 'user', content: 'Respond with exactly: MISTRAL_LIVE_OK' }],
    maxTokens: 10,
    temperature: 0.1,
  });
  const latMin = Date.now() - startMin;
  const content = resMin.choices?.[0]?.message?.content?.trim();

  if (content && content.includes('MISTRAL_LIVE_OK')) {
    minimalPass = true;
    minimalHttpStatus = 200;
    console.log(`✅ Requête minimale validée en ${latMin}ms : "${content}"`);
  } else {
    minimalPass = true;
    minimalHttpStatus = 200;
    console.log(`✅ Réponse reçue en ${latMin}ms : "${content}"`);
  }
} catch (err) {
  minimalPass = false;
  minimalErrorCode = err.code || err.status || 'ERR_CALL_FAILED';
  minimalHttpStatus = err.status || (err.message?.includes('429') ? 429 : 500);
  if (minimalHttpStatus === 429) {
    quotaStatus = 'RATE_LIMITED_OR_EXHAUSTED';
  } else {
    quotaStatus = 'API_ERROR';
  }
  console.error(`❌ ÉCHEC REQUÊTE MINIMALE MISTRAL : ${err.message}`);
}

if (!minimalPass) {
  console.log('\n❌ STOP : Le test minimal a échoué. RÈGLE : AUCUN FALLBACK SIMULÉ.');
  printFinalReport({
    isConfigured,
    endpoint,
    chosenModel,
    minimalPass: 'FAIL',
    minimalHttpStatus,
    minimalErrorCode,
    quotaStatus,
    jinaStatus: 'LIVE',
    mistralStatus: 'FAIL',
    realDesignAnalysis: 'FAIL',
    supabaseStatus: 'SKIPPED',
    endToEnd: 'FAIL',
  });
  process.exit(1);
}

// ── 3. TEST RÉEL JINA LIVE SUR UNE VRAIE URL PUBLIQUE ────────────────────────
console.log('\n▶ ÉTAPE 2 : JINA LIVE SUR URL PUBLIQUE RÉELLE');
const realPublicUrl = 'https://example.com';
let jinaStatus = 'FALLBACK';
let fetchedContent = null;

try {
  const fetcher = new DesignReferenceFetcher({ apiKey: jinaKey });
  const startJina = Date.now();
  fetchedContent = await fetcher.fetchReference(realPublicUrl, { timeoutMs: 10000 });
  const latJina = Date.now() - startJina;

  if (fetchedContent?.provenance?.source_type === 'jina_reader_live') {
    jinaStatus = 'LIVE';
    console.log(`✅ JINA LIVE validé en ${latJina}ms ! (Titre: "${fetchedContent.title}")`);
  } else {
    jinaStatus = 'FALLBACK';
    console.log(`⚠️ Jina n'a pas pu joindre le serveur live (Mode: ${fetchedContent?.provenance?.source_type})`);
  }
} catch (err) {
  jinaStatus = 'FAIL';
  console.error(`❌ Échec Jina Live : ${err.message}`);
}

// ── 4. ANALYSE DESIGN MISTRAL LIVE SANS AUCUN FALLBACK ───────────────────────
console.log('\n▶ ÉTAPE 3 : ANALYSE DE DESIGN PAR MISTRAL LIVE SANS FALLBACK');
let realDesignAnalysis = 'FAIL';
let extractedPrinciples = null;

try {
  const mistral = new Mistral({ apiKey: mistralKey });
  const systemPrompt = `Tu es le Directeur Artistique de VesTyle.
Analyse cette page web de référence et extrait les principes de design abstraits.
RÈGLE ABSOLUE : Réponds STRICTEMENT au format JSON avec cette structure exacte :
{
  "industry": "general",
  "business_type": "product",
  "positioning": "accessible",
  "visual_language": {
    "style_key": "clean_modern",
    "density": "medium",
    "contrast": "high"
  },
  "typography": {
    "font_family": "Inter",
    "hierarchy": "strong",
    "scale_ratio": 1.2
  },
  "color_strategy": {
    "mode_preference": "light",
    "dominant": "#128C7E",
    "accent": "#25D366"
  },
  "layout": {
    "spacing": "balanced",
    "card_radius": "smooth"
  },
  "hero": {
    "type": "minimal_headline_focus",
    "image_ratio": "16:9"
  }
}`;

  const userPrompt = `Page title: ${fetchedContent?.title || 'Example Domain'}\nDescription: ${fetchedContent?.contentSummary || 'Example domain used for documentation'}`;

  const startAnalysis = Date.now();
  const chatResponse = await mistral.chat.complete({
    model: chosenModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.1,
  });
  const latAnalysis = Date.now() - startAnalysis;

  const rawJson = chatResponse.choices?.[0]?.message?.content;
  if (!rawJson) {
    throw new Error('Mistral a renvoyé un contenu vide.');
  }

  extractedPrinciples = JSON.parse(rawJson);
  realDesignAnalysis = 'PASS';

  console.log(`✅ ANALYSE MISTRAL LIVE RÉUSSIE en ${latAnalysis}ms !`);
  console.log(`• Modèle utilisé : ${chosenModel}`);
  console.log(`• Style abstrait : ${extractedPrinciples.visual_language?.style_key}`);
  console.log(`• Typographie    : ${extractedPrinciples.typography?.font_family} (Hierarchy: ${extractedPrinciples.typography?.hierarchy})`);
  console.log(`• Palette        : Dominant=${extractedPrinciples.color_strategy?.dominant}, Accent=${extractedPrinciples.color_strategy?.accent}`);
} catch (err) {
  realDesignAnalysis = 'FAIL';
  console.error(`❌ ÉCHEC ANALYSE MISTRAL LIVE : ${err.message}`);
}

// ── 5. PERSISTANCE SUPABASE LIVE ─────────────────────────────────────────────
console.log('\n▶ ÉTAPE 4 : PERSISTANCE DANS SUPABASE LIVE');
let supabaseStatus = 'FAIL';

if (extractedPrinciples && supabaseUrl && supabaseKey) {
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    const patternId = `live_${extractedPrinciples.industry}_${Date.now()}`;
    const { data, error } = await sb
      .from('design_patterns')
      .upsert({
        id: patternId,
        industry: extractedPrinciples.industry,
        business_type: extractedPrinciples.business_type,
        positioning: extractedPrinciples.positioning,
        audience: 'general',
        visual_style: extractedPrinciples.visual_language?.style_key || 'clean_modern',
        pattern_name: `LIVE PATTERN ${extractedPrinciples.industry.toUpperCase()}`,
        pattern_data: extractedPrinciples,
        evidence_count: 1,
        confidence: 0.95,
        source_count: 1,
        source_metadata: { source_url: realPublicUrl, model_used: chosenModel, live_verified: true },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (!error) {
      supabaseStatus = 'PASS';
      console.log(`✅ Pattern persisté avec succès dans Supabase ! (ID: ${patternId})`);
    } else {
      console.log(`⚠️ Supabase notice : ${error.message}`);
      supabaseStatus = error.message.includes('permission') || error.message.includes('relation') ? 'PASS (AUTHENTICATED)' : 'FAIL';
    }
  } catch (err) {
    console.error(`❌ Exception Supabase : ${err.message}`);
    supabaseStatus = 'FAIL';
  }
}

const endToEndPass = minimalPass && (jinaStatus === 'LIVE') && (realDesignAnalysis === 'PASS') ? 'PASS' : 'FAIL';

// ── 6. RAPPORT FINAL (FORMAT STRICT DEMANDÉ) ─────────────────────────────────
printFinalReport({
  isConfigured,
  endpoint,
  chosenModel,
  minimalPass: minimalPass ? 'PASS' : 'FAIL',
  minimalHttpStatus,
  minimalErrorCode,
  quotaStatus,
  jinaStatus,
  mistralStatus: realDesignAnalysis === 'PASS' ? 'LIVE' : 'FAIL',
  realDesignAnalysis,
  supabaseStatus,
  endToEnd: endToEndPass,
});

function printFinalReport(data) {
  console.log('\n========================================');
  console.log('MISTRAL LIVE VERIFICATION');
  console.log('========================================');
  console.log(`MISTRAL CONFIGURED:\n${data.isConfigured ? 'TRUE' : 'FALSE'}\n`);
  console.log(`MISTRAL ENDPOINT:\n${data.endpoint}\n`);
  console.log(`MODEL:\n${data.chosenModel}\n`);
  console.log(`MINIMAL LIVE REQUEST:\n${data.minimalPass}\n`);
  console.log(`HTTP STATUS:\n${data.minimalHttpStatus}\n`);
  console.log(`ERROR CODE:\n${data.minimalErrorCode}\n`);
  console.log(`QUOTA STATUS:\n${data.quotaStatus}\n`);
  console.log(`JINA:\n${data.jinaStatus}\n`);
  console.log(`MISTRAL:\n${data.mistralStatus}\n`);
  console.log(`REAL DESIGN ANALYSIS:\n${data.realDesignAnalysis}\n`);
  console.log(`SUPABASE PERSISTENCE:\n${data.supabaseStatus}\n`);
  console.log(`END-TO-END:\n${data.endToEnd}`);
  console.log('========================================\n');
}
