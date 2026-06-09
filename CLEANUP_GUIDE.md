# 🔧 Guide Nettoyage Base de Données VesTyle

## Problème Identifié
- ❌ Trop de fausses boutiques affichées (vieilles données de test)
- ❌ Certaines boutiques créées n'ont pas `is_active = true`
- ❌ Produits sans embeddings (Cohere API échouée)
- ❌ Dashboard des paramètres boutique ne met à jour aucun champ

## Solutions Appliquées ✅

### 1. **Code Fixes** (déjà fait)
- ✅ `src/app/boutiques/page.js` → Filtre `is_active = true`
- ✅ `src/context/AuthContext.js` → Crée boutiques avec `is_active = true`
- ✅ `src/app/dashboard/add-product/page.js` → Feedback si embedding échoue

### 2. **Endpoint de Nettoyage** (créé)
`POST /api/admin/cleanup-database`

Actions disponibles:
- `status` → Diagnostic rapide
- `report` → Rapport complet des boutiques
- `cleanup` → **Nettoie les données** (désactive vieilles boutiques vides)

### 3. **Interface Admin** (créée)
`/admin/cleanup`

## ⚡ UTILISATION RAPIDE

### Étape 1: Configurer le Token Admin
Dans `.env.local`, ajoute:
```bash
ADMIN_CLEANUP_TOKEN=TON_SECRET_TOKEN_ICI
```

Exemples sécurisés:
```
ADMIN_CLEANUP_TOKEN=vestyle_admin_2024_secretkey
ADMIN_CLEANUP_TOKEN=$(openssl rand -base64 32)  # Générer aléatoirement
```

### Étape 2: Accéder à la Page
```
http://localhost:3000/admin/cleanup
```

### Étape 3: Exécuter les Actions

**Option 1: Diagnostic (lecture seule)**
```bash
curl -X POST http://localhost:3000/api/admin/cleanup-database \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"TON_TOKEN","action":"status"}'
```

**Option 2: Voir Rapport Complet**
```bash
curl -X POST http://localhost:3000/api/admin/cleanup-database \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"TON_TOKEN","action":"report"}'
```

**Option 3: NETTOYER LA BD** ⚠️
```bash
curl -X POST http://localhost:3000/api/admin/cleanup-database \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"TON_TOKEN","action":"cleanup"}'
```

## 📋 Ce Que Fait le Nettoyage

```
1. Désactive les vieilles boutiques VIDES
   - Condition: created_at < 7 jours
   - Et: 0 produits + 0 commandes
   - Résultat: Ces boutiques disparaissent de /boutiques

2. Réactive les boutiques AVEC produits
   - Même si elles étaient marquées inactives
   - Résultat: Tes vraies boutiques redeviennent visibles

3. Corrige les produits cassés
   - stock_quantity NULL → 1
   - D'autres corrections si besoin
```

## 🚨 Erreur: "Unauthorized"
→ Ton token est incorrect
→ Vérifie que `.env.local` a `ADMIN_CLEANUP_TOKEN=...`

## 🚨 Erreur: "Database Error"
→ Supabase RPC peuvent ne pas exister
→ Le script utilise des fallbacks SQL (normal)

## 🆘 Si Ça Ne Marche Toujours Pas

**Option Manuelle: Exécuter le SQL directement**

Dans Supabase SQL Editor:
```sql
-- 1. Voir l'état actuel
SELECT name, is_active, 
  (SELECT COUNT(*) FROM products WHERE store_id = stores.id) as products
FROM stores
ORDER BY created_at DESC;

-- 2. Désactiver les vieilles boutiques vides
UPDATE stores
SET is_active = false
WHERE id NOT IN (SELECT DISTINCT store_id FROM products)
  AND id NOT IN (SELECT DISTINCT store_id FROM orders)
  AND created_at < NOW() - INTERVAL '7 days';

-- 3. Réactiver les boutiques avec produits
UPDATE stores
SET is_active = true
WHERE id IN (SELECT DISTINCT store_id FROM products);
```

---

## 📌 Récapitulatif Final

| Problème | Avant | Après |
|----------|-------|-------|
| Boutiques affichées | TOUTES (y compris vides) | Seulement `is_active=true` |
| Nouvelles boutiques | `is_active=NULL` (invisible) | `is_active=true` (visible) |
| Ajout produits | Échoue si Cohere down | Marche quand même + feedback |
| Vieilles données de test | Polluent l'app | Automatiquement désactivées |

**C'est terminé ! Ta BD devrait être propre maintenant.** ✨
