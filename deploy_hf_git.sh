#!/bin/bash

# Configuration
HF_TOKEN="${HF_TOKEN:-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}"
HF_USERNAME="${HF_USERNAME:-Fabiol237}"
HF_SPACE_NAME="${HF_SPACE_NAME:-vestyle-ai-engine}"
SPACE_ID="$HF_USERNAME/$HF_SPACE_NAME"

echo "🚀 Déploiement HF Space via Git"
echo "Space: $SPACE_ID"

# Clone temporaire
TMP_DIR="/tmp/hf_space_$$"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
cd "$TMP_DIR"

echo "📥 Clonage du Space..."
git clone "https://$HF_USERNAME:$HF_TOKEN@huggingface.co/spaces/$SPACE_ID" .

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du clonage"
    exit 1
fi

echo "📋 Copie des fichiers..."
cp "$(dirname "$0")/huggingface_space/app.py" .
cp "$(dirname "$0")/huggingface_space/requirements.txt" .

echo "🔧 Configuration Git..."
git config user.email "bot@vestyle.ai"
git config user.name "VESTYLE Bot"

echo "📤 Push des changements..."
git add -A
git commit -m "feat: update app.py with JSON fixes"
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
else
    echo "⚠️ Push échoué mais Space devrait se mettre à jour"
fi

# Nettoyage
cd /
rm -rf "$TMP_DIR"

echo "✨ Terminé!"
