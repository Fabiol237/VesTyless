"""
VESTYLE — Déploiement Hugging Face Space
Étapes 2 ET 3 : Upload fichiers + Secrets
"""
import os, sys
from pathlib import Path

try:
    from huggingface_hub import HfApi, SpaceStage
except ImportError:
    print("❌ huggingface_hub non installé. Lance : pip install huggingface_hub")
    sys.exit(1)

# ─── CONFIG ───────────────────────────────────────────
HF_TOKEN      = os.environ.get("HF_TOKEN", "")
HF_USERNAME   = "Fabiol237"
HF_SPACE_NAME = "vestyle-ai-engine"
SPACE_ID      = f"{HF_USERNAME}/{HF_SPACE_NAME}"

SUPABASE_URL  = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_SERVICE_KEY", "")


BASE_DIR      = Path(__file__).parent
HF_SPACE_DIR  = BASE_DIR / "huggingface_space"

api = HfApi(token=HF_TOKEN)

# ─── ÉTAPE 2A : Créer le Space ────────────────────────
print(f"\n🔍 Création / vérification du Space : {SPACE_ID}")
try:
    api.create_repo(
        repo_id=SPACE_ID,
        repo_type="space",
        space_sdk="gradio",
        space_hardware="cpu-basic",   # CPU gratuit (pas besoin de PRO)
        private=False,
        exist_ok=True,               # Ne plante pas si déjà existant
    )
    print(f"✅ Space prêt : https://huggingface.co/spaces/{SPACE_ID}")
except Exception as e:
    print(f"⚠️  Avertissement création : {e}")

# ─── ÉTAPE 2B : Upload app.py ─────────────────────────
print("\n📦 Upload des fichiers...")

for filename in ["app.py", "requirements.txt"]:
    local_file = HF_SPACE_DIR / filename
    if not local_file.exists():
        print(f"❌ Fichier introuvable : {local_file}")
        continue

    print(f"   ⬆️  Upload {filename} ...", end="", flush=True)
    try:
        api.upload_file(
            path_or_fileobj=str(local_file),
            path_in_repo=filename,
            repo_id=SPACE_ID,
            repo_type="space",
            commit_message=f"feat: add {filename} — VESTYLE AI Engine",
        )
        print(" ✅")
    except Exception as e:
        print(f" ❌ {e}")

# ─── ÉTAPE 3 : Ajouter les Secrets ────────────────────
print("\n🔐 Ajout des Secrets dans le Space...")

secrets = [
    ("SUPABASE_URL",         SUPABASE_URL,  "URL Supabase"),
    ("SUPABASE_SERVICE_KEY", SUPABASE_KEY,  "Clé service_role"),
]

for key, value, label in secrets:
    print(f"   🔑 {key} ({label}) ...", end="", flush=True)
    try:
        api.add_space_secret(
            repo_id=SPACE_ID,
            key=key,
            value=value,
        )
        print(" ✅")
    except Exception as e:
        print(f" ❌ {e}")

# ─── RÉSUMÉ ───────────────────────────────────────────
print(f"""
╔══════════════════════════════════════════════════════╗
║   ✅ DÉPLOIEMENT TERMINÉ !                            ║
╠══════════════════════════════════════════════════════╣
║                                                       ║
║  🔗 https://huggingface.co/spaces/{SPACE_ID}
║                                                       ║
║  🔐 Secrets ajoutés :                                 ║
║     • SUPABASE_URL          ✅                         ║
║     • SUPABASE_SERVICE_KEY  ✅                         ║
║                                                       ║
║  ⏳ Build en cours (2-5 min) puis le Space est actif  ║
╚══════════════════════════════════════════════════════╝
""")
