# Script de deploiement Hugging Face pour VESTYLE AI Engine
# Utilise Git pour uploader les fichiers

param(
    [string]$HF_TOKEN = $env:HF_TOKEN,
    [string]$HF_USERNAME = "Fabiol237",
    [string]$HF_SPACE_NAME = "vestyle-ai-engine"
)

$SPACE_ID = "$HF_USERNAME/$HF_SPACE_NAME"
$HF_URL = "https://huggingface.co/spaces/$SPACE_ID"

Write-Host "[*] Deploiement HF Space via Git" -ForegroundColor Green
Write-Host "Space: $SPACE_ID"

# Dossier temporaire
$TMP_DIR = "$env:TEMP\hf_space_$(Get-Random)"
Remove-Item -Recurse -Force $TMP_DIR -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $TMP_DIR | Out-Null
Set-Location $TMP_DIR

# Clone
Write-Host "[*] Clonage du Space..."
$GitURL = "https://user:$HF_TOKEN@huggingface.co/spaces/$SPACE_ID"
git clone $GitURL .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Erreur lors du clonage" -ForegroundColor Red
    exit 1
}

# Copie des fichiers
Write-Host "[*] Copie des fichiers..."
$ScriptRoot = Split-Path -Parent $PSCommandPath
Copy-Item "$ScriptRoot\huggingface_space\app.py" . -Force
Copy-Item "$ScriptRoot\huggingface_space\requirements.txt" . -Force

# Config Git
Write-Host "[*] Configuration Git..."
git config user.email "bot@vestyle.ai"
git config user.name "VESTYLE Bot"

# Push
Write-Host "[*] Push des changements..."
git add -A
git commit -m "feat: update app.py with JSON serialization fixes"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Deploiement reussi!" -ForegroundColor Green
    Write-Host "[*] Space: $HF_URL"
} else {
    Write-Host "[!] Push echoue - verifier la branche" -ForegroundColor Yellow
}

# Nettoyage
Set-Location -
Remove-Item -Recurse -Force $TMP_DIR -ErrorAction SilentlyContinue

Write-Host "[OK] Termine!" -ForegroundColor Cyan

