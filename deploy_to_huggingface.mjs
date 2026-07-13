/**
 * VESTYLE — Déploiement automatique vers Hugging Face Space
 * Étapes 2 ET 3 : Upload fichiers + Ajout des Secrets
 *
 * Usage :
 *   $env:HF_TOKEN="hf_xxx"; $env:HF_USERNAME="Fabiol237"; node deploy_to_huggingface.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CONFIGURATION ───────────────────────────────────────────────
const CONFIG = {
  HF_TOKEN:       process.env.HF_TOKEN       || "",
  HF_USERNAME:    process.env.HF_USERNAME    || "Fabiol237",
  HF_SPACE_NAME:  process.env.HF_SPACE_NAME  || "vestyle-ai-engine",
  SUPABASE_URL:   process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_KEY:   process.env.SUPABASE_SERVICE_KEY     || "",
};

const SPACE_ID = `${CONFIG.HF_USERNAME}/${CONFIG.HF_SPACE_NAME}`;
const HF_API   = "https://huggingface.co/api";

// ─── Requête générique vers l'API HF ─────────────────────────────
async function hfRequest(endpoint, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${CONFIG.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(`${HF_API}${endpoint}`, opts);
  const text = await res.text();
  try   { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ─── ÉTAPE 2A : Vérifier / Créer le Space ────────────────────────
async function ensureSpaceExists() {
  console.log(`\n🔍 Vérification du Space : ${SPACE_ID}`);
  const check = await hfRequest(`/spaces/${SPACE_ID}`);

  if (check.ok) {
    console.log(`✅ Space existant : https://huggingface.co/spaces/${SPACE_ID}`);
    return true;
  }

  console.log(`⚙️  Space introuvable → Création en cours...`);
  const create = await hfRequest("/spaces", "POST", {
    name:    CONFIG.HF_SPACE_NAME,
    sdk:     "gradio",
    hardware:"zero-a10g",
    private: false,
    license: "mit",
  });

  if (create.ok) {
    console.log(`✅ Space créé : https://huggingface.co/spaces/${SPACE_ID}`);
    return true;
  }

  console.error("❌ Erreur création Space :", JSON.stringify(create.data).slice(0, 300));
  return false;
}

// ─── ÉTAPE 2B : Upload app.py + requirements.txt ─────────────────
async function uploadFiles() {
  console.log("\n📦 Upload des fichiers...");

  const files = [
    { hfPath: "app.py",           localPath: join(__dirname, "huggingface_space", "app.py") },
    { hfPath: "requirements.txt", localPath: join(__dirname, "huggingface_space", "requirements.txt") },
  ];

  for (const f of files) {
    if (!existsSync(f.localPath)) {
      console.error(`❌ Fichier introuvable : ${f.localPath}`);
      continue;
    }

    process.stdout.write(`   ⬆️  ${f.hfPath} ...`);
    const content = readFileSync(f.localPath, "utf-8");
    const base64Content = Buffer.from(content).toString("base64");

    const res = await fetch(
      `https://huggingface.co/api/repos/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONFIG.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_id: SPACE_ID,
          repo_type: "space",
          path: f.hfPath,
          content: base64Content,
          is_base64: true,
          commit_message: `feat: update ${f.hfPath}`,
        }),
      }
    );

    if (res.ok) {
      console.log(" ✅");
    } else {
      const err = await res.text();
      console.log(` ❌ (HTTP ${res.status})`);
      console.log("    →", err.slice(0, 250));
    }
  }
}

// ─── ÉTAPE 3 : Ajouter les Secrets ───────────────────────────────
async function addSecrets() {
  console.log("\n🔐 Ajout des Secrets dans le Space...");

  const secrets = [
    { key: "SUPABASE_URL",         value: CONFIG.SUPABASE_URL,  label: "URL Supabase" },
    { key: "SUPABASE_SERVICE_KEY", value: CONFIG.SUPABASE_KEY,  label: "Clé service_role" },
  ];

  for (const s of secrets) {
    process.stdout.write(`   🔑 ${s.key} (${s.label}) ...`);

    const res = await fetch(
      `https://huggingface.co/api/spaces/${SPACE_ID}/secrets`,
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${CONFIG.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: s.key, value: s.value }),
      }
    );

    if (res.ok) {
      console.log(" ✅");
    } else {
      const err = await res.text();
      console.log(` ❌ (HTTP ${res.status})`);
      console.log("    →", err.slice(0, 200));
    }
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   VESTYLE → Déploiement Hugging Face      ║");
  console.log(`║   Space : ${SPACE_ID.padEnd(32)}║`);
  console.log("╚══════════════════════════════════════════╝");

  const ok = await ensureSpaceExists();
  if (!ok) { console.error("Arrêt."); process.exit(1); }

  await uploadFiles();
  await addSecrets();

  console.log(`
╔══════════════════════════════════════════════════════════╗
║   ✅ DÉPLOIEMENT TERMINÉ !                                ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  🔗 https://huggingface.co/spaces/${SPACE_ID}
║                                                           ║
║  🔐 Secrets ajoutés :                                     ║
║     • SUPABASE_URL          ✅                             ║
║     • SUPABASE_SERVICE_KEY  ✅                             ║
║                                                           ║
║  ⏳ Build en cours (2-5 min) → Space actif ensuite        ║
╚══════════════════════════════════════════════════════════╝
  `);
}

main().catch(console.error);
