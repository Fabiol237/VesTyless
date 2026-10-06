# AUDIT FORENSIC VESTYLE — 08_OBSOLETE_CODE.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Identification et mise en quarantaine documentaire des composants, tables, APIs et scripts obsolètes ou redondants.

---

## 1. RÈGLE DE SÉCURITÉ ABSOLUE

> [!CAUTION]
> **AUCUNE SUPPRESSION N'EST RÉALISÉE DURANT CETTE PHASE D'AUDIT.**  
> Les éléments listés ci-dessous sont identifiés, cartographiés et documentés pour être **isolés**, puis dépréciés de manière contrôlée lors de la phase d'exécution ultérieure, sans jamais impacter les boutiques marchandes en production.

---

## 2. INVENTAIRE DU CODE OBSOLÈTE, REDONDANT OU DÉPRÉCIÉ

---

### ÉLÉMENT : Liens Orphelins vers `/builder/*`
* **EMPLACEMENT :** 
  - `src/app/dashboard/page.js` (lignes 345, 417, 476, 542)
  - `src/app/dashboard/settings/page.js` (ligne 148)
* **TYPE :** Liens de navigation JSX pointant vers une route inexistante
* **UTILISÉ PAR :** Dashboard Vendeur
* **DÉPENDANCES :** Aucune cible existante dans `src/app/builder/`
* **ÉTAT :** 🔴 OBSOLÈTE
* **RISQUE :** Moyen (404 au clic pour l'utilisateur).
* **RECOMMANDATION :** Rediriger ces liens vers l'onglet "Sections" interne existant (`studioMode === 'studio'`) ou le futur studio de design sans toucher au reste de la page.

---

### ÉLÉMENT : Système Relationnel `store_modules`
* **EMPLACEMENT :** `supabase/modules_migration.sql`, `src/lib/storeModuleUtils.mjs`
* **TYPE :** Table SQL et utilitaire de conversion
* **UTILISÉ PAR :** `/api/ai/generate-store`, `StorefrontClient.js` (en fallback)
* **DÉPENDANCES :** `stores(id)`
* **ÉTAT :** 🟠 À ISOLER / 🔴 OBSOLÈTE pour les nouvelles créations
* **RISQUE :** Élevé si modifié brutalement (dédoublement de vérité).
* **RECOMMANDATION :** Isoler. Cesser toute nouvelle écriture dans `store_modules`. Toutes les futures modifications devront s'écrire exclusivement dans `stores.draft_config` et `stores.published_config`.

---

### ÉLÉMENT : Templates JSX Monolithiques Codés en Dur
* **EMPLACEMENT :** `src/templates/TemplateBoutique.jsx`, `TemplateBoutiquePro.jsx`, `TemplateTechPro.jsx`, `TemplateResto.jsx`, `TemplatePresta.jsx`
* **TYPE :** Composants React JSX statiques non paramétrables par arbre déclaratif
* **UTILISÉ PAR :** `StorefrontClient.js` (en tant que `legacyTemplateFallback`)
* **DÉPENDANCES :** Lucide React, `CartContext`
* **ÉTAT :** 🟠 À ISOLER
* **RISQUE :** Faible tant qu'ils servent de fallback.
* **RECOMMANDATION :** Les conserver comme filet de sécurité pendant la transition. Ne plus créer de nouveaux templates dans ce format. Les remplacer à terme par des **Designs Déclaratifs conformes au contrat DesignDefinition v3.0**.

---

### ÉLÉMENT : Tables Métier SQL Inertes (Schéma V2 Non Connecté)
* **EMPLACEMENT :** Base Supabase (créées via `supabase/modules_migration.sql`)
  - `reservations`
  - `services`
  - `events`
  - `tickets`
  - `portfolio_items`
  - `testimonials`
  - `restaurant_menu`
  - `store_clients`
  - `devis_requests`
  - `subscriptions`
* **TYPE :** Tables SQL relationnelles
* **UTILISÉ PAR :** Aucun dashboard actif (le dashboard actuel est exclusivement centré sur les produits et commandes).
* **DÉPENDANCES :** Liées par clé étrangère à `stores(id)`.
* **ÉTAT :** 🔴 OBSOLÈTE sous leur forme actuelle / 🟡 RÉUTILISABLE comme référence
* **RISQUE :** Nul si on ne les modifie pas.
* **RECOMMANDATION :** **Ne pas faire de DROP TABLE**. Conserver en base sans y toucher. Les schémas des 8 nouveaux domaines seront conçus proprement selon l'architecture cible et remplaceront ces tables lors de la migration des domaines respectifs.

---

### ÉLÉMENT : Scripts d'Expérimentation & Fichiers Temporaires Racines
* **EMPLACEMENT :** Racine du projet :
  - `add-product-4jpg.mjs`, `add_hero_product.mjs`, `add_products_auto.js`
  - `assign-categories-auto.mjs`, `check-vector-search.mjs`, `check_hero_product.mjs`
  - `clean-categories.mjs`, `cleanup_database.js`, `diagnostic-apis.mjs`
  - `fill-embeddings-jina.mjs`, `fill-embeddings-voyage.mjs`, `fill-embeddings.mjs`
  - `find_region.js`, `fix_categories_and_add_product.mjs`, `fix_rpc.js`
  - `insert_hero_product_debug.mjs`, `insert_hero_product_fixed.mjs`
  - `inspect_categories.mjs`, `inspect_schema.mjs`, `inspect_stores.mjs`
  - `modules_debug.json`, `reindex-products.mjs`, `scratch_test_engines.mjs`
  - `setup_test_data.mjs`, `simulate.mjs`, `sync_env.js`
  - `test-add-product.mjs`, `test-api-json.mjs`, `test-apis.js`, `test-cohere-embed.mjs`
  - `test-endpoints.js`, `test-mango-search.mjs`, `test-mistral.js`, `test-pixtral.js`
  - `test-vector-complete.mjs`, `test-visual-full.mjs`, `test_e2e.mjs`, `test_email_blast.mjs`
  - `test_embed_api.mjs`, `test_insert_full_vector.mjs`, `test_insert_vector.mjs`
  - `test_live.js`, `test_live_notify.js`, `test_products.js`, `test_rpc.js`
  - `test_search_products.js`, `test_supabase_key.mjs`, `test_vector_cast.mjs`
  - `tmp_query_categories.mjs`, `verify-categories.mjs`, `verify-product.mjs`, `verify-setup.mjs`
* **TYPE :** Scripts Node.js / MJS ponctuels de diagnostic et de debug
* **UTILISÉ PAR :** Développeurs lors des phases de prototypage
* **DÉPENDANCES :** Supabase, Clés API locales
* **ÉTAT :** 🟠 À ISOLER (À regrouper ultérieurement dans un dossier `scripts/legacy_tools/`)
* **RISQUE :** Nul (fichiers hors build Next.js).
* **RECOMMANDATION :** Ne rien supprimer maintenant. Laisser à la racine pendant l'audit.

---

### ÉLÉMENT : Composant Démonstrateur `PolymorphicDashboard.tsx` Non Connecté
* **EMPLACEMENT :** `src/components/dashboard/PolymorphicDashboard.tsx` (68 KB, 1763 lignes)
* **TYPE :** Composant monolithique expérimental de dashboard multi-verticaux
* **UTILISÉ PAR :** Uniquement son test unitaire `src/engine/__tests__/polymorphicDashboard.test.ts`. Il n'est **pas importé** dans `src/app/dashboard/page.js`.
* **DÉPENDANCES :** `themeSeed.ts`, Lucide React
* **ÉTAT :** 🟡 À RÉUTILISER / ADAPTER (Mine d'or d'inspiration UI pour les 8 nouveaux dashboards).
* **RISQUE :** Nul (non connecté en production).
* **RECOMMANDATION :** Découper ses blocs par domaine cible plutôt que de maintenir un fichier monolithique de 1700 lignes.
