# ✅ Checklist de Déploiement - Recherche Visuelle Optimisée

## PHASE 1: Vérification (5 minutes)

### Clés API
- [ ] `COHERE_API_KEY` présente dans `.env.local`
  - Test: Voir dans les logs "Cohere OK: 1024 D"
- [ ] `MISTRAL_API_KEY` présente dans `.env.local`
  - Test: Voir "Pixtral:" dans les logs
- [ ] `NEXT_PUBLIC_SUPABASE_URL` présente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` présente

### Base de Données
- [ ] Colonnes créées: `image_embedding_1024`, `text_embedding_1024`
  - Vérifier: `SELECT COUNT(*) FROM products;` → doit retourner > 0
- [ ] Indice IVFFlat créé: `products_image_embedding_1024_idx`
  - Vérifier dans Supabase SQL: `\d products_image_embedding_1024_idx`

### Code
- [ ] `/src/app/api/products/generate-embeddings-v2/route.js` existe
- [ ] `/src/app/api/search/visual/route.js` modifié
- [ ] `/src/app/dashboard/add-product/page.js` modifié
- [ ] `fill-embeddings.mjs` créé

---

## PHASE 2: Test du Dashboard (10 minutes)

### Test 1: Ajouter un Produit
1. [ ] Ouvrir http://localhost:3000/dashboard/add-product
2. [ ] Upload une image de vêtement
3. [ ] Remplir:
   - [ ] Nom: "Test Produit"
   - [ ] Description: "Vêtement de test"
   - [ ] Catégorie: "Vêtements" (ID 1)
   - [ ] Prix: "10000"
4. [ ] Cliquer "Ajouter le Produit"
5. [ ] Attendre 2-3 secondes
6. [ ] Vérifier:
   - [ ] Pas d'erreur "Embedding generation failed"
   - [ ] Message: "✅ Produit créé avec succès!"
   - [ ] Vous êtes redirigé vers `/dashboard`

### Vérifier en Base de Données
```sql
SELECT id, name, image_embedding_1024 IS NOT NULL as has_embedding 
FROM products 
ORDER BY created_at DESC 
LIMIT 1;
```
- [ ] `has_embedding` = `true`

---

## PHASE 3: Test de Recherche (10 minutes)

### Test 1: Recherche d'un Produit Existant
1. [ ] Aller sur http://localhost:3000/search
2. [ ] Cliquer l'icône caméra (🎥)
3. [ ] Upload l'image d'un produit que vous venez de créer (ou existant)
4. [ ] Attendre 3-4 secondes
5. [ ] Vérifier:
   - [ ] Pas d'erreur dans la console
   - [ ] Au moins 1 résultat trouvé
   - [ ] Le produit cherché est dans les résultats
   - [ ] Temps affiché: "< 5 secondes"

### Test 2: Recherche avec Image Différente
1. [ ] Tester avec une image différente (couleur/fond différent)
2. [ ] Vérifier:
   - [ ] Produits similaires trouvés
   - [ ] Résultats pertinents (pas de faux positifs évidents)

### Vérifier les Logs Serveur
- [ ] Voir: `[Visual Search] Vision: ...`
- [ ] Voir: `[Visual Search] Embedding OK: 1024 D`
- [ ] Voir: `[Visual Search] ✅ X result(s) in XXms`

---

## PHASE 4: Remplissage des Embeddings (Optionnel - 30-60 minutes)

### Avant de Lancer
```bash
# Vérifier combien de produits ont besoin d'embeddings
sqlite3 (ou psql)
SELECT COUNT(*) FROM products WHERE image_embedding_1024 IS NULL AND image_url IS NOT NULL;
```

### Lancer le Script
```bash
npm run fill-embeddings
```

### Monitoring
- [ ] Voir les logs: `🚀 Remplissage des embeddings...`
- [ ] Voir: `📊 X produits ont besoin d'embeddings`
- [ ] Voir pour chaque produit:
  - [ ] `📸 Analyse...`
  - [ ] `✅ Description...`
  - [ ] `🧮 Embedding...`
  - [ ] `💾 Sauvegarde...`
  - [ ] `✅ Succès!`
- [ ] À la fin: voir le résumé
  - [ ] `✅ Succès: X`
  - [ ] `❌ Échoués: Y` (devrait être 0 ou très petit)

### Si le Script S'arrête
- [ ] C'est OK! Peut être relancé
- [ ] Il va reprendre où il s'est arrêté (contrôle par `image_embedding_1024 IS NULL`)
- [ ] Relancer: `npm run fill-embeddings`

---

## PHASE 5: Optimisations (Optionnel)

### Vérifier l'Indice
```sql
-- Vérifier taille indice IVFFlat
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'products' 
AND indexname LIKE '%embedding%';
```
- [ ] Indice IVFFlat existe avec `lists = 100`

### Performance
```sql
-- Voir combien de produits avec embeddings
SELECT COUNT(*) FROM products WHERE image_embedding_1024 IS NOT NULL;
```
- [ ] Devrait être = nombre total de produits (ou très proche)

---

## PHASE 6: Validation Finale (5 minutes)

### Checklist de Confiance
- [ ] Ajouter un produit fonctionne ✅
- [ ] Embedding généré automatiquement ✅
- [ ] Recherche visuelle fonctionne ✅
- [ ] Résultats pertinents ✅
- [ ] Temps < 5 secondes ✅
- [ ] Pas d'erreurs en console ✅
- [ ] Produits existants ont embeddings ✅

### Performance Metrics
- [ ] Pixtral Vision: 1-2 secondes
- [ ] Cohere Embedding: 0.5-1 seconde
- [ ] Supabase Search: 0.2-0.5 secondes
- [ ] **Total: < 4 secondes**

---

## 🆘 Si Quelque Chose Ne Fonctionne Pas

### "Embedding generation failed"
1. [ ] Vérifier les clés API dans `.env.local`
2. [ ] Vérifier que l'image est accessível (pas d'erreur 404)
3. [ ] Voir les logs: `[Embeddings API]` ou `[Visual Search]`

### "No results found"
1. [ ] Vérifier que des produits existent avec embeddings
   ```sql
   SELECT COUNT(*) FROM products WHERE image_embedding_1024 IS NOT NULL;
   ```
2. [ ] Si 0, lancer: `npm run fill-embeddings`
3. [ ] Si non-zéro, augmenter `match_threshold` (0.35 → 0.30)

### Recherche très lente (> 10 secondes)
1. [ ] Vérifier connexion internet
2. [ ] Vérifier que Cohere/Mistral API répond
3. [ ] Vérifier l'indice IVFFlat est créé
4. [ ] Voir les logs de timing

### Résultats non pertinents
1. [ ] Vérifier que `categoryId` est correct (1-7)
2. [ ] Vérifier le prompt pour cette catégorie
3. [ ] Relancer `npm run fill-embeddings` pour les anciens produits
4. [ ] Tester avec une image plus claire

---

## 📊 Metriques à Tracker

Après quelques tests:
- [ ] Nombre de recherches réussies: `_`
- [ ] Temps moyen de recherche: `_ secondes`
- [ ] Taux de précision (produit trouvé): `_%`
- [ ] Taux de pertinence (résultats corrects): `_%`

---

## 🎉 Status Final

- [ ] ✅ Dashboard fonctionne
- [ ] ✅ Recherche fonctionne
- [ ] ✅ Précision OK
- [ ] ✅ Performance OK
- [ ] ✅ Prêt pour la production!

---

**Date de Déploiement**: `__________`
**Testeur**: `__________`
**Notes**: 

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Support & Maintenance

**En cas de problème**:
1. Voir VISUAL_SEARCH_GUIDE.md → Section Troubleshooting
2. Vérifier les logs serveur
3. Relancer `npm run fill-embeddings` si besoin
4. Vérifier la base de données directement

**Logs Importants**:
- `/dashboard/add-product`: `[AddProduct]` logs
- `/api/products/generate-embeddings-v2`: `[Embeddings API]` logs
- `/search` + recherche visuelle: `[Visual Search]` logs
