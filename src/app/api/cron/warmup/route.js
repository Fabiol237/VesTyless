/**
 * CRON : Warm-up du HF Space toutes les 5 minutes
 *
 * Objectif : Empêcher le cold start (30-90s) du HuggingFace Space
 * en envoyant une requête légère régulièrement pour le garder actif.
 *
 * Appelé automatiquement par Vercel Cron : * /5 * * * *
 */

import { NextResponse } from "next/server";

export const maxDuration = 30;

const HF_SPACE_URL = "https://fabiol237-vestyle-ai-engine.hf.space";

export async function GET(req) {
  const startTime = Date.now();

  try {
    // Ping léger : on appelle juste la page d'accueil du Space
    // pour le garder en vie, sans faire tourner les modèles IA
    const pingRes = await fetch(`${HF_SPACE_URL}/`, {
      method: "GET",
      headers: { "User-Agent": "VESTYLE-Warmup/1.0" },
      signal: AbortSignal.timeout(20000), // 20s max
    });

    const elapsed = Date.now() - startTime;
    const status = pingRes.status;

    console.log(`[Warmup] HF Space ping → HTTP ${status} en ${elapsed}ms`);

    return NextResponse.json({
      ok: true,
      status,
      elapsed_ms: elapsed,
      timestamp: new Date().toISOString(),
      message: status < 400
        ? `✅ HF Space actif (${elapsed}ms)`
        : `⚠️ HF Space répond ${status}`,
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.warn(`[Warmup] Ping échoué en ${elapsed}ms :`, err.message);

    // Ne pas faire échouer le cron — juste logger
    return NextResponse.json({
      ok: false,
      elapsed_ms: elapsed,
      error: err.message,
      timestamp: new Date().toISOString(),
      message: "⚠️ HF Space injoignable — sera re-tenté dans 5 min",
    });
  }
}
