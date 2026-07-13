"""
VESTYLE AI ENGINE — Hugging Face Space
Architecture : Florence-2 + DINOv2 + SigLIP
Stockage     : Supabase pgvector (1024 dimensions)
"""

import os
import io
import json
import base64
import numpy as np
from PIL import Image
import gradio as gr
import torch
import requests
from supabase import create_client, Client


# ──────────────────────────────────────────────
# 🔑 Variables d'environnement (Secrets HF Space)
# ──────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Initialisation Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ──────────────────────────────────────────────
# 🔧 PATCH FLORENCE-2 — Fix Python 3.13
# ──────────────────────────────────────────────
# Bug : Florence2LanguageConfig.__init__() appelle
#   self.forced_bos_token_id
# AVANT que PretrainedConfig.__init__() ne le définisse.
# Fix : remplacer par getattr(self, 'forced_bos_token_id', None)
# dans le fichier de config téléchargé depuis HF Hub.
def _patch_florence2_config():
    from huggingface_hub import hf_hub_download

    repos = [
        "microsoft/Florence-2-base",
        "microsoft/Florence-2-base-ft",
    ]

    # ── Patch 1 : configuration_florence2.py ──────────────────────
    # Bug : accès à self.forced_bos_token_id avant super().__init__()
    CFG_BAD  = 'if self.forced_bos_token_id is None and'
    CFG_GOOD = 'if getattr(self, "forced_bos_token_id", None) is None and'

    # ── Patch 2 : processing_florence2.py ─────────────────────────
    # Bug : tokenizer.additional_special_tokens inexistant sur RobertaTokenizer
    PROC_BAD  = 'tokenizer.additional_special_tokens +'
    PROC_GOOD = 'getattr(tokenizer, "additional_special_tokens", []) +'

    # ── Patch 3 : modeling_florence2.py ───────────────────────────
    # Bug : Florence2ForConditionalGeneration n'a pas _supports_sdpa
    MODEL_BAD3  = 'class Florence2ForConditionalGeneration(Florence2PreTrainedModel):'
    MODEL_GOOD3 = 'class Florence2ForConditionalGeneration(Florence2PreTrainedModel):\n    _supports_sdpa = False  # Fix Python 3.13 / transformers>=4.47'

    # ── Patch 4 : modeling_florence2.py — past_key_values[idx] ────────
    # Bug : 'EncoderDecoderCache' object is not subscriptable (ligne ~1873)
    MODEL_BAD4  = 'past_key_value = past_key_values[idx] if past_key_values is not None else None'
    MODEL_GOOD4 = 'past_key_value = (past_key_values[idx] if isinstance(past_key_values, (tuple, list)) else None) if past_key_values is not None else None'

    # ── Patch 5 : modeling_florence2.py — past_key_values_length ──────
    # Bug : 'EncoderDecoderCache' not subscriptable (ligne ~1791)
    MODEL_BAD5  = 'past_key_values_length = past_key_values[0][0].shape[2] if past_key_values is not None else 0'
    MODEL_GOOD5 = 'past_key_values_length = (past_key_values[0][0].shape[2] if isinstance(past_key_values, (tuple, list)) else (past_key_values.self_attention_cache.key_cache[0].shape[2] if hasattr(past_key_values, "self_attention_cache") and past_key_values.self_attention_cache.key_cache else 0)) if past_key_values is not None else 0'

    patches = [
        ("configuration_florence2.py", CFG_BAD,   CFG_GOOD),
        ("processing_florence2.py",    PROC_BAD,  PROC_GOOD),
        ("modeling_florence2.py",      MODEL_BAD3, MODEL_GOOD3),
        ("modeling_florence2.py",      MODEL_BAD4, MODEL_GOOD4),
        ("modeling_florence2.py",      MODEL_BAD5, MODEL_GOOD5),
    ]

    for repo in repos:
        for filename, bad, good in patches:
            try:
                path = hf_hub_download(repo_id=repo, filename=filename)
                with open(path, "r", encoding="utf-8") as f:
                    src = f.read()

                if bad in src:
                    src = src.replace(bad, good)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(src)
                    print(f"✅ Patch OK : {repo}/{filename}")
                else:
                    print(f"ℹ️  Déjà patché : {repo}/{filename}")

            except Exception as e:
                print(f"⚠️  Patch ignoré {repo}/{filename} : {e}")

_patch_florence2_config()


# ──────────────────────────────────────────────
# 🔧 MONKEY-PATCH EncoderDecoderCache (transformers >= 4.47)
# ──────────────────────────────────────────────
# Florence-2 accède à past_key_values[idx] et past_key_values[0][0].shape
# mais transformers 4.47 a remplacé les tuples par EncoderDecoderCache
# qui ne supporte pas l'indexation par entier.
# Solution : ajouter __getitem__ et get_seq_length à EncoderDecoderCache.
def _patch_encoder_decoder_cache():
    try:
        from transformers.cache_utils import EncoderDecoderCache
        import torch

        if hasattr(EncoderDecoderCache, '_vestyle_patched'):
            return

        def _edc_getitem(self, idx):
            """Permet past_key_values[idx] → (k_self, v_self, k_cross, v_cross)"""
            sa = self.self_attention_cache
            ca = self.cross_attention_cache

            def _get(cache, i):
                if hasattr(cache, 'key_cache') and i < len(cache.key_cache):
                    k = cache.key_cache[i]
                    v = cache.value_cache[i]
                    if k is not None and v is not None:
                        return k, v
                # Tenseur vide compatible (batch=1, heads=1, seq=0, dim=1)
                empty = torch.zeros(1, 1, 0, 1)
                return empty, empty

            sk, sv = _get(sa, idx)
            ck, cv = _get(ca, idx)
            return (sk, sv, ck, cv)

        def _edc_seq_length(self):
            sa = self.self_attention_cache
            if hasattr(sa, 'key_cache') and sa.key_cache:
                k = sa.key_cache[0]
                if k is not None:
                    return k.shape[2]
            return 0

        EncoderDecoderCache.__getitem__    = _edc_getitem
        EncoderDecoderCache.get_seq_length = _edc_seq_length
        EncoderDecoderCache._vestyle_patched = True
        print("✅ Monkey-patch EncoderDecoderCache OK")
    except Exception as e:
        print(f"⚠️  Monkey-patch EncoderDecoderCache ignoré : {e}")

_patch_encoder_decoder_cache()


# ──────────────────────────────────────────────
# 🧠 Chargement des modèles (une seule fois au démarrage)
# ──────────────────────────────────────────────
print("⏳ Chargement des modèles IA...")

from transformers import AutoProcessor, AutoModelForCausalLM

# Florence-2 — chargé APRÈS les patches
# attn_implementation='eager' : bypasse le check _supports_sdpa (incompatible Python 3.13)
try:
    florence_processor = AutoProcessor.from_pretrained(
        "microsoft/Florence-2-base-ft",
        trust_remote_code=True,
    )
    florence_model = AutoModelForCausalLM.from_pretrained(
        "microsoft/Florence-2-base-ft",
        trust_remote_code=True,
        torch_dtype=torch.float32,
        attn_implementation="eager",
    )
    print("✅ Florence-2-base-ft chargé")
except Exception as e:
    print(f"⚠️  Florence-2-base-ft erreur : {e} — fallback sur base")
    florence_processor = AutoProcessor.from_pretrained(
        "microsoft/Florence-2-base",
        trust_remote_code=True,
    )
    florence_model = AutoModelForCausalLM.from_pretrained(
        "microsoft/Florence-2-base",
        trust_remote_code=True,
        torch_dtype=torch.float32,
        attn_implementation="eager",
    )

# DINOv2 : Vecteur visuel structurel (768 dim)
from transformers import AutoImageProcessor, AutoModel as DinoModel
dino_processor = AutoImageProcessor.from_pretrained("facebook/dinov2-base")
dino_model = DinoModel.from_pretrained("facebook/dinov2-base")

# SigLIP : Vecteur sémantique vision-langage (768 dim)
from transformers import AutoProcessor as SiglipProcessor, AutoModel as SiglipModel
siglip_processor = SiglipProcessor.from_pretrained("google/siglip-base-patch16-224")
siglip_model = SiglipModel.from_pretrained("google/siglip-base-patch16-224")

print("✅ Tous les modèles chargés !")

# ──────────────────────────────────────────────
# 🎛️ ZeroGPU — Activation à la demande
# ──────────────────────────────────────────────
try:
    import spaces
    HAS_ZEROGPU = True
    print("⚡ ZeroGPU disponible")
except ImportError:
    HAS_ZEROGPU = False
    print("⚠️ ZeroGPU non disponible — mode CPU")

def zerogpu_decorator(func):
    """Applique @spaces.GPU uniquement si ZeroGPU est dispo"""
    if HAS_ZEROGPU:
        return spaces.GPU(func)
    return func


# ──────────────────────────────────────────────
# 🔍 ÉTAPE 1 : Florence-2 — Extraction de texte
# ──────────────────────────────────────────────
@zerogpu_decorator
def extract_text_with_florence(image: Image.Image) -> dict:
    """
    Extrait le texte et décrit l'image avec Florence-2.
    Retourne : { 'caption': str, 'tags': list[str], 'ocr': str }
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    florence_model.to(device)

    results = {}

    # Caption détaillée
    inputs = florence_processor(
        text="<DETAILED_CAPTION>",
        images=image,
        return_tensors="pt"
    ).to(device, torch.float16 if device == "cuda" else torch.float32)

    with torch.no_grad():
        # Désactiver le cache pour bypasser l'incompatibilité
        # EncoderDecoderCache / DynamicCache de transformers >= 4.47
        _orig_use_cache = getattr(florence_model.config, 'use_cache', True)
        florence_model.config.use_cache = False
        try:
            generated_ids = florence_model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=256,
                do_sample=False,
                num_beams=1,
                use_cache=False,
            )
        finally:
            florence_model.config.use_cache = _orig_use_cache
    caption = florence_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    results["caption"] = caption

    # OCR — Lecture du texte dans l'image (prix, marque, etc.)
    inputs_ocr = florence_processor(
        text="<OCR>",
        images=image,
        return_tensors="pt"
    ).to(device, torch.float16 if device == "cuda" else torch.float32)

    with torch.no_grad():
        _orig_use_cache2 = getattr(florence_model.config, 'use_cache', True)
        florence_model.config.use_cache = False
        try:
            generated_ids_ocr = florence_model.generate(
                input_ids=inputs_ocr["input_ids"],
                pixel_values=inputs_ocr["pixel_values"],
                max_new_tokens=64,
                num_beams=1,
                use_cache=False,
            )
        finally:
            florence_model.config.use_cache = _orig_use_cache2
    ocr_text = florence_processor.batch_decode(generated_ids_ocr, skip_special_tokens=True)[0]
    results["ocr"] = ocr_text.strip()

    # Tags rapides (catégories visuelles)
    inputs_tags = florence_processor(
        text="<CAPTION_TO_PHRASE_GROUNDING>",
        images=image,
        return_tensors="pt"
    ).to(device, torch.float16 if device == "cuda" else torch.float32)

    # Extraction de tags depuis la caption
    words = caption.lower().replace(",", " ").replace(".", " ").split()
    fashion_keywords = [
        "robe", "dress", "shirt", "jean", "pantalon", "veste", "jacket",
        "chaussure", "shoe", "sneaker", "sac", "bag", "montre", "watch",
        "bijou", "jewelry", "chemise", "pull", "sweater", "manteau", "coat",
        "rouge", "bleu", "vert", "noir", "blanc", "rose", "jaune", "orange",
        "red", "blue", "green", "black", "white", "pink", "yellow"
    ]
    tags = [w for w in words if w in fashion_keywords]
    results["tags"] = list(set(tags))

    return results


# ──────────────────────────────────────────────
# 🧬 ÉTAPE 2 : DINOv2 — Vecteur structurel
# ──────────────────────────────────────────────
@zerogpu_decorator
def generate_dino_embedding(image: Image.Image) -> list:
    """
    Génère un vecteur DINOv2 (768 dim) capturant la structure visuelle.
    Idéal pour : forme, coupe, silhouette du vêtement.
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dino_model.to(device)

    inputs = dino_processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = dino_model(**inputs)

    # Utiliser le token [CLS] comme représentation globale
    embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

    # Normalisation L2 pour cosine similarity
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding.tolist()


# ──────────────────────────────────────────────
# 🌐 ÉTAPE 3 : SigLIP — Vecteur sémantique
# ──────────────────────────────────────────────
@zerogpu_decorator
def generate_siglip_embedding(image: Image.Image, text_description: str = "") -> list:
    """
    Génère un vecteur SigLIP (768 dim) capturant le sens visuel + sémantique.
    Idéal pour : couleur, style, texture, correspondance texte-image.
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    siglip_model.to(device)

    inputs = siglip_processor(
        images=image,
        text=[text_description] if text_description else ["fashion product"],
        return_tensors="pt",
        padding="max_length",
        truncation=True
    ).to(device)

    with torch.no_grad():
        outputs = siglip_model(**inputs)

    # Embedding visuel de SigLIP
    image_features = outputs.image_embeds.squeeze().cpu().numpy()

    # Normalisation L2
    norm = np.linalg.norm(image_features)
    if norm > 0:
        image_features = image_features / norm

    return image_features.tolist()


# ──────────────────────────────────────────────
# 🔗 FUSION — Combine DINOv2 (60%) + SigLIP (40%)
# ──────────────────────────────────────────────
def fuse_embeddings(dino_vec: list, siglip_vec: list) -> list:
    """
    Fusionne DINOv2 et SigLIP en un seul vecteur de 1024 dimensions.
    Compatible avec votre colonne image_embedding_1024 dans Supabase.

    Stratégie : Concaténation pondérée puis normalisation
    - DINOv2 768 dim × 0.6 → capte la STRUCTURE
    - SigLIP 256 dim (réduit) × 0.4 → capte le SENS
    
    Résultat : 768 + 256 = 1024 dimensions ✅
    """
    dino_arr = np.array(dino_vec)       # 768 dim
    siglip_arr = np.array(siglip_vec)  # 768 dim

    # Réduction SigLIP : garder les 256 premières composantes les + importantes
    siglip_reduced = siglip_arr[:256]

    # Pondération
    dino_weighted = dino_arr * 0.6
    siglip_weighted = siglip_reduced * 0.4

    # Concaténation → 1024 dim
    fused = np.concatenate([dino_weighted, siglip_weighted])

    # Normalisation finale L2
    norm = np.linalg.norm(fused)
    if norm > 0:
        fused = fused / norm

    return fused.tolist()


# ──────────────────────────────────────────────
# 🗄️ SUPABASE — Recherche pgvector
# ──────────────────────────────────────────────
def search_in_supabase(
    image_vector: list,
    text_query: str = "",
    match_threshold: float = 0.3,
    match_count: int = 12
) -> list:
    """
    Envoie le vecteur à Supabase et récupère les produits matchant.
    Utilise la RPC match_products_v2 avec pgvector cosine similarity.
    """
    try:
        # Recherche vectorielle visuelle
        result = supabase.rpc(
            "match_products_v2",
            {
                "query_embedding": image_vector,
                "match_threshold": match_threshold,
                "match_count": match_count
            }
        ).execute()

        products = result.data or []

        # Si on a du texte, on peut affiner avec search_products_text
        if text_query and len(products) == 0:
            # Fallback : recherche textuelle dans Supabase
            text_result = supabase.table("products").select(
                "id, name, price, image_url, store_id, description"
            ).ilike("name", f"%{text_query}%").limit(match_count).execute()
            products = text_result.data or []

        return products

    except Exception as e:
        print(f"❌ Erreur Supabase : {e}")
        return []


# ──────────────────────────────────────────────
# 🎯 PIPELINE COMPLET — Point d'entrée principal
# ──────────────────────────────────────────────
def analyze_and_search(image_input, match_threshold: float = 0.3, max_results: int = 12):
    """
    Pipeline complet :
    Photo → Florence-2 → DINOv2 + SigLIP → Fusion 1024D → Supabase → Résultats

    Args:
        image_input : Image PIL ou path
        match_threshold : Seuil de similarité (0.0 à 1.0)
        max_results : Nombre max de produits à retourner

    Returns:
        dict avec produits trouvés + métadonnées
    """
    if image_input is None:
        return {"error": "Aucune image fournie", "products": []}

    # Préparation de l'image
    if not isinstance(image_input, Image.Image):
        image = Image.fromarray(image_input).convert("RGB")
    else:
        image = image_input.convert("RGB")

    # Redimensionnement optimal (224x224 pour les modèles)
    image_224 = image.resize((224, 224), Image.LANCZOS)

    results = {"step": {}, "products": [], "metadata": {}}

    # ── ÉTAPE 1 : Extraction textuelle Florence-2 ──
    print("🔍 [1/4] Florence-2 : extraction du texte...")
    florence_data = extract_text_with_florence(image_224)
    caption = florence_data.get("caption", "")
    ocr_text = florence_data.get("ocr", "")
    tags = florence_data.get("tags", [])

    results["step"]["florence"] = {
        "caption": caption,
        "ocr": ocr_text,
        "tags": tags
    }
    print(f"   📝 Caption : {caption[:80]}...")
    print(f"   🔤 OCR : {ocr_text}")
    print(f"   🏷️  Tags : {tags}")

    # ── ÉTAPE 2 : DINOv2 — Vecteur structurel ──
    print("🧬 [2/4] DINOv2 : génération vecteur structurel...")
    dino_vec = generate_dino_embedding(image_224)
    results["step"]["dino_dims"] = len(dino_vec)
    print(f"   ✅ Vecteur DINOv2 : {len(dino_vec)} dimensions")

    # ── ÉTAPE 3 : SigLIP — Vecteur sémantique ──
    print("🌐 [3/4] SigLIP : génération vecteur sémantique...")
    siglip_vec = generate_siglip_embedding(image_224, caption)
    results["step"]["siglip_dims"] = len(siglip_vec)
    print(f"   ✅ Vecteur SigLIP : {len(siglip_vec)} dimensions")

    # ── ÉTAPE 4 : Fusion 1024D → Supabase ──
    print("🔗 [4/4] Fusion + Recherche Supabase pgvector...")
    fused_vector = fuse_embeddings(dino_vec, siglip_vec)
    results["step"]["fused_dims"] = len(fused_vector)

    # Requête Supabase
    text_for_search = f"{caption} {' '.join(tags)} {ocr_text}".strip()
    products = search_in_supabase(
        image_vector=fused_vector,
        text_query=text_for_search,
        match_threshold=match_threshold,
        match_count=max_results
    )

    results["products"] = products
    results["metadata"] = {
        "total_found": len(products),
        "vector_dims": len(fused_vector),
        "search_text": text_for_search[:100],
        "threshold": match_threshold,
        "embedding": fused_vector.tolist() if hasattr(fused_vector, 'tolist') else fused_vector,   # vecteur 1024D pour indexation
    }

    print(f"🎉 {len(products)} produit(s) trouvé(s) !")
    return results


# ──────────────────────────────────────────────
# 📥 ENDPOINT D'INDEXATION — Ajouter un produit
# ──────────────────────────────────────────────
def index_product(
    product_id: str,
    product_image: Image.Image,
    product_name: str = "",
    product_description: str = ""
) -> dict:
    """
    Indexe un produit dans Supabase avec ses vecteurs.
    Appelé par le vendeur lors de l'ajout d'un produit.
    """
    if product_image is None:
        return {"error": "Image requise"}

    image = product_image.convert("RGB").resize((224, 224), Image.LANCZOS)

    # Génération des vecteurs
    dino_vec = generate_dino_embedding(image)
    siglip_vec = generate_siglip_embedding(image, f"{product_name} {product_description}")
    fused_vec = fuse_embeddings(dino_vec, siglip_vec)

    # Extraction du texte
    florence_data = extract_text_with_florence(image)

    # Mise à jour dans Supabase
    try:
        update_result = supabase.table("products").update({
            "image_embedding_1024": fused_vec,
            "ai_description": florence_data.get("caption", ""),
            "ai_tags": json.dumps(florence_data.get("tags", []))
        }).eq("id", product_id).execute()

        return {
            "success": True,
            "product_id": product_id,
            "vector_dims": len(fused_vec),
            "ai_caption": florence_data.get("caption", "")[:100]
        }
    except Exception as e:
        return {"error": str(e)}


# ──────────────────────────────────────────────
# 🖥️ INTERFACE GRADIO (optionnel pour tests)
# ──────────────────────────────────────────────
def gradio_search_interface(image, threshold, max_results):
    """Interface Gradio pour tester la recherche visuelle — retourne du Markdown"""
    result = analyze_and_search(image, threshold, int(max_results))
    products = result.get("products", [])
    metadata = result.get("metadata", {})
    florence_data = result.get("step", {}).get("florence", {})
    output_text = f"""
\U0001f50d **Analyse Florence-2** :
- Caption : {florence_data.get('caption', 'N/A')[:150]}
- OCR d\u00e9tect\u00e9 : {florence_data.get('ocr', 'Rien') or 'Rien'}
- Tags mode : {', '.join(florence_data.get('tags', [])) or 'Aucun'}

\U0001f4ca **Vecteurs g\u00e9n\u00e9r\u00e9s** :
- DINOv2 : {result.get('step', {}).get('dino_dims', 0)} dimensions
- SigLIP  : {result.get('step', {}).get('siglip_dims', 0)} dimensions
- Fusionn\u00e9 : {result.get('step', {}).get('fused_dims', 0)} dimensions \u2192 Supabase \u2705

\U0001f6cd\ufe0f **{metadata.get('total_found', 0)} produit(s) trouv\u00e9(s)** :
"""
    for i, p in enumerate(products[:5], 1):
        sim = p.get("similarity", 0)
        output_text += f"\n{i}. **{p.get('name', 'N/A')}** \u2014 {p.get('price', 0)} FCFA (similarit\u00e9: {sim:.1%})"
    return output_text


def api_search(image_b64: str, threshold: float = 0.3, max_results: int = 12) -> dict:
    """
    Endpoint API JSON pour Next.js.
    Accepte une image en base64 (data:image/...;base64,...)
    Retourne le dict complet avec products, metadata, step.
    """
    try:
        from PIL import ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = True

        # D\u00e9codage base64
        if "," in image_b64:
            _, data = image_b64.split(",", 1)
        else:
            data = image_b64
            
        # Correction automatique du padding base64
        data += "=" * ((4 - len(data) % 4) % 4)
        
        image_bytes = base64.b64decode(data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # S'assurer que l'image est compl\u00e8tement charg\u00e9e en m\u00e9moire
        image.load()
        
        return analyze_and_search(image, float(threshold), int(max_results))
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"[API_SEARCH_ERROR] {e}\n{trace}")
        return {"error": str(e), "products": [], "metadata": {}, "step": {}, "trace": trace}


def api_index(product_id: str, image_b64: str, product_name: str = "") -> dict:
    """
    Endpoint d'indexation : calcule le vecteur d'une image et le sauvegarde
    dans Supabase pour le produit donné.
    """
    try:
        from PIL import ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = True

        if not product_id:
            return {"error": "product_id requis"}

        if "," in image_b64:
            _, data = image_b64.split(",", 1)
        else:
            data = image_b64
        data += "=" * ((4 - len(data) % 4) % 4)
        image = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
        image.load()

        image_224 = image.resize((224, 224), Image.LANCZOS)
        dino_vec    = generate_dino_embedding(image_224)
        siglip_vec  = generate_siglip_embedding(image_224, product_name)
        fused_vec   = fuse_embeddings(dino_vec, siglip_vec)

        # Florence-2 caption (optionnel)
        try:
            florence_data = extract_text_with_florence(image_224)
            caption = florence_data.get("caption", "")
            tags    = florence_data.get("tags", [])
        except Exception:
            caption, tags = "", []

        # Sauvegarde dans Supabase
        update = supabase.table("products").update({
            "image_embedding_1024": fused_vec,
            "ai_caption":           caption,
            "ai_tags":              tags,
            "ai_indexed_at":        __import__('datetime').datetime.utcnow().isoformat()
        }).eq("id", product_id).execute()

        return {
            "success":    True,
            "product_id": product_id,
            "vector_dims": len(fused_vec),
            "caption":    caption[:100],
            "embedding": fused_vec.tolist() if hasattr(fused_vec, 'tolist') else fused_vec
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()[:500]}


# Interface Gradio minimale pour démo/test
with gr.Blocks(
    title="VESTYLE AI Engine",
    theme=gr.themes.Glass(),
    css="""
    .gradio-container { max-width: 900px; margin: auto; }
    h1 { text-align: center; color: #6C63FF; }
    """
) as demo:
    gr.HTML("""
    <h1>🧠 VESTYLE AI Engine</h1>
    <p style='text-align:center;color:#888'>
        Florence-2 + DINOv2 + SigLIP → Supabase pgvector<br>
        <small>Prenez une photo → Trouvez le produit exact en 50ms</small>
    </p>
    """)

    with gr.Row():
        with gr.Column(scale=1):
            image_input = gr.Image(
                label="📸 Photo du produit",
                type="pil",
                height=300
            )
            threshold = gr.Slider(
                minimum=0.1, maximum=0.9, value=0.3, step=0.05,
                label="🎯 Seuil de similarité"
            )
            max_res = gr.Slider(
                minimum=1, maximum=20, value=12, step=1,
                label="📦 Nombre de résultats"
            )
            search_btn = gr.Button("🔍 Rechercher", variant="primary", size="lg")

        with gr.Column(scale=1):
            output = gr.Markdown(label="Résultats")

    search_btn.click(
        fn=gradio_search_interface,
        inputs=[image_input, threshold, max_res],
        outputs=output,
        api_name=False,
    )

    # ── Endpoint API caché pour Next.js ───────────────────────────────
    # POST /call/search  → { event_id }
    # GET  /call/search/{event_id} → SSE avec { products, metadata, step }
    with gr.Row(visible=False):
        _img_in   = gr.Text(label="base64_image")
        _thresh   = gr.Number(value=0.3)
        _maxres   = gr.Number(value=12)
        _result   = gr.JSON()
        _api_btn  = gr.Button()

    _api_btn.click(
        fn=api_search,
        inputs=[_img_in, _thresh, _maxres],
        outputs=_result,
        api_name="search",
    )

    # ── Endpoint d'indexation ─────────────────────────────────────────
    with gr.Row(visible=False):
        _idx_prod_id  = gr.Text(label="product_id")
        _idx_img      = gr.Text(label="image_b64")
        _idx_name     = gr.Text(label="product_name")
        _idx_result   = gr.JSON()
        _idx_btn      = gr.Button()

    _idx_btn.click(
        fn=api_index,
        inputs=[_idx_prod_id, _idx_img, _idx_name],
        outputs=_idx_result,
        api_name="index",
    )

    gr.HTML("""
    <hr>
    <p style='text-align:center;color:#555;font-size:12px'>
        🔌 API JSON : /call/search | VESTYLE — Le premier marketplace de mode au Cameroun
    </p>
    """)


# ──────────────────────────────────────────────
# 🚀 LANCEMENT
# ──────────────────────────────────────────────
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )
