# AUDIT FORENSIC VESTYLE — 04_OLD_ARCHITECTURES.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Identification, traçage des dépendances et analyse médico-légale des 5 générations d'architectures sédimentées dans le projet.

---

## 1. HISTORIQUE ET SÉDIMENTATION ARCHITECTURALE

L'audit révèle que le projet VesTyle actuel est le résultat de **5 vagues successives de développement**, chacune ayant apporté son propre paradigme sans que les vagues précédentes n'aient été totalement retirées.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CHRONOLOGIE DES 5 GÉNÉRATIONS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. GÉNÉRATION 1 (MVP E-Commerce Supabase Direct)                            │
│    • Tables : stores, products, orders, categories, profiles                │
│    • Rendu : Pages React classiques avec requêtes Supabase directes         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. GÉNÉRATION 2 (Système Modulaire Multipage "store_modules")               │
│    • Table store_modules (1 ligne SQL par section/page)                     │
│    • Tables spécialisées : reservations, services, events, tickets...       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. GÉNÉRATION 3 (Templates JSX Monolithiques Codés en Dur)                  │
│    • Fichiers : TemplateBoutique.jsx, TemplateTechPro.jsx, TemplateResto.jsx│
│    • Tableaux de configuration : storeTemplates.js, themeResolver.js        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. GÉNÉRATION 4 (Architecture Déclarative Vestin Master 1 & Master 2)       │
│    • Document JSON unique : stores.draft_config & stores.published_config   │
│    • Rendu : UniversalStorefrontRenderer.jsx, StorefrontEditor.tsx          │
│    • Table canonique : templates (JSON déclaratif pur, zéro JSX)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. GÉNÉRATION 5 (Design Intelligence, Master Blueprints & VST-CODE V3.0)    │
│    • Contrat Zod : designDefinition.ts (VisualNodeTree, SemanticRole)       │
│    • Moteurs : VestinAdaptationEngine.ts, blueprintInjector.ts              │
│    • Écosystème : vst_dsn_001 à 006, design_patterns (pgvector 1024D)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. INVENTAIRE ÉLÉMENT PAR ÉLÉMENT DES ANCIENNES ARCHITECTURES

---

### ÉLÉMENT : Table et Système `store_modules`
* **EMPLACEMENT :** `supabase/modules_migration.sql`, `supabase/migrations/001_block_config_schema.sql`, `src/lib/storeModuleUtils.mjs`
* **TYPE :** Schéma de données relationnel V2
* **UTILISÉ PAR :** 
  - `src/app/api/ai/generate-store/route.js` (insère des lignes dans `store_modules` lors de la génération IA).
  - `src/app/boutique/[slug]/StorefrontClient.js` (requête `supabase.from('store_modules')`).
* **DÉPENDANCES :** Table `stores`, utilitaire `normalizeStoreModules`.
* **ÉTAT :** 🟠 Ancienne architecture (Génération V2)
* **RISQUE :** Élevé. Crée un double système de vérité : une boutique possède à la fois des modules sous forme de lignes dans `store_modules` et une configuration globale dans `stores.published_config` ou `stores.layout_config`.
* **RECOMMANDATION :** Isoler. Lors de la phase de migration future, les données de `store_modules` seront converties en document déclaratif unique sans modifier la base immédiatement.

---

### ÉLÉMENT : Templates JSX Monolithiques (`src/templates/*`)
* **EMPLACEMENT :** 
  - `src/templates/TemplateBoutique.jsx` (21 KB)
  - `src/templates/TemplateBoutiquePro.jsx` (33 KB)
  - `src/templates/TemplateTechPro.jsx` (65 KB)
  - `src/templates/TemplateResto.jsx` (19 KB)
  - `src/templates/TemplatePresta.jsx` (18 KB)
  - `src/templates/index.js`
* **TYPE :** Composants React monolithiques JSX avec code HTML/CSS et logique commerciale entremêlés.
* **UTILISÉ PAR :** `StorefrontClient.js` (en tant que `legacyTemplateFallback` ou lorsque le `businessProfile` ne résout pas de sections).
* **DÉPENDANCES :** Lucide React, Supabase Client, Panier, Thèmes statiques (`themes/index.js`).
* **ÉTAT :** 🟠 Ancienne architecture (Génération V3)
* **RISQUE :** Moyen. Ces templates contiennent du code spécifique et du JSX figé, ce qui empêche l'adaptation fine par IA (Mistral ne peut pas modifier un template codé en dur sans casser du code React).
* **RECOMMANDATION :** Conserver pour l'instant comme filet de sécurité (fallback visuel pour éviter tout écran blanc sur les anciennes boutiques), puis convertir leurs structures en véritables **Designs VesTyle déclaratifs**.

---

### ÉLÉMENT : Master Blueprints & Moteur d'Injection V2 (`src/engine/*`)
* **EMPLACEMENT :** 
  - `src/engine/masterBlueprints.ts` (26 KB)
  - `src/engine/blueprintInjector.ts` (15 KB)
  - `src/engine/blueprintSelector.ts` (7 KB)
  - `src/engine/themeSeed.ts` (12 KB)
* **TYPE :** Moteur TypeScript de composition et d'injection de sections basé sur des archétypes (`BP01_RETAIL_ECOM`, `BP02_SERVICE_PRO`, `BP03_HYBRID_MARKET`, `BP04_LIVESTOCK_FARM`, `BP05_RESTAURANT_FOOD`).
* **UTILISÉ PAR :** `tests/`, `src/components/studio/StorefrontEditor.tsx`, `src/components/dashboard/PolymorphicDashboard.tsx`.
* **DÉPENDANCES :** `src/types/storefront.ts`.
* **ÉTAT :** 🟡 À Réutiliser / Adapter (Génération V4).
* **RISQUE :** Faible à Moyen. Fait doublon partiel avec `src/core/contracts/designDefinition.ts` et `VestinAdaptationEngine.ts` (Génération V5).
* **RECOMMANDATION :** Unifier la logique de `masterBlueprints.ts` avec le contrat `DesignDefinition` pour qu'il n'existe qu'un seul moteur de sélection et d'adaptation.

---

### ÉLÉMENT : Traces de `LiveCanvas`, `BuilderClient` et Routes Manquantes
* **EMPLACEMENT :** 
  - `src/app/dashboard/page.js` (lignes 345, 417, 476, 542 : liens `<Link href="/builder/${store.id}">`)
  - `src/app/dashboard/settings/page.js` (ligne 148 : lien `<Link href="/builder/${storeId}">`)
* **TYPE :** Liens orphelins vers une ancienne interface d'édition visuelle supprimée ou déplacée.
* **UTILISÉ PAR :** Dashboard Vendeur.
* **DÉPENDANCES :** Aucune (La cible n'existe pas dans `src/app/builder/`).
* **ÉTAT :** 🔴 Obsolète / Lien Mort.
* **RISQUE :** Moyen (Expérience utilisateur dégradée si un marchand clique sur "Studio" ou "Personnaliser" dans le dashboard et arrive sur une 404).
* **RECOMMANDATION :** Isoler et remplacer ces liens par l'activation du mode "Sections" interne déjà présent dans le Dashboard Vendeur, ou les relier au futur Moteur de Design VesTyle.

---

### ÉLÉMENT : Tables Métier Non Connectées de `modules_migration.sql`
* **EMPLACEMENT :** 
  - `reservations`
  - `services`
  - `events` & `tickets`
  - `portfolio_items` & `testimonials`
  - `restaurant_menu`
  - `store_clients`
  - `devis_requests`
  - `subscriptions`
* **TYPE :** Tables Supabase SQL créées pour un système expérimental non abouti.
* **UTILISÉ PAR :** Aucun composant actif dans le Dashboard Vendeur actuel (le Dashboard Vendeur gère uniquement `products` et `orders`).
* **DÉPENDANCES :** Liées à `stores(id)`.
* **ÉTAT :** 🔴 Obsolète sous cette forme / 🟡 Réutilisable pour les futurs domaines.
* **RISQUE :** Faible (Inertes en base, n'impactent pas les performances courantes).
* **RECOMMANDATION :** **NE RIEN SUPPRIMER MAINTENANT**. Conserver ces structures intactes pendant l'audit. Elles serviront d'inspiration lors de la création des modèles de données dédiés pour les 8 nouveaux domaines (ex: `reservations` -> Domaine Hébergement / Restauration, `menu` -> Domaine Restauration).

---

## 3. TABLEAU RÉCAPITULATIF DES SYSTÈMES ET DE LEUR STATUT

| Système Identifié | Génération | Fichiers Clés | Statut Forensic | Action Recommandée |
| :--- | :---: | :--- | :---: | :--- |
| **Commerce Vendeur Classique** | V1/V4 | `products`, `orders`, `stock_logs`, `dashboard/` | 🟢 À CONSERVER | Socle du Domaine Vendeur |
| **Document Déclaratif JSON** | V4 | `stores.draft_config`, `stores.published_config` | 🟢 À CONSERVER | Format pivot pour tous les domaines |
| **DesignDefinition V3.0 (Zod)** | V5 | `src/core/contracts/designDefinition.ts` | 🟢 À CONSERVER | Contrat pivot des futurs Designs |
| **6 Designs Canoniques V3.0** | V5 | `src/core/designs/vst_dsn_001..006.ts` | 🟢 À CONSERVER | Base du catalogue de Designs |
| **Master Blueprints Engine** | V4 | `src/engine/masterBlueprints.ts` | 🟡 À ADAPTER | Fusionner dans le Moteur de Design |
| **Adaptation Engine** | V5 | `src/core/adaptation/VestinAdaptationEngine.ts` | 🟢 À CONSERVER | Cœur de liaison Données <-> Design |
| **Système `store_modules`** | V2 | `store_modules`, `storeModuleUtils.mjs` | 🟠 À ISOLER | Déprécier au profit du document JSON |
| **Templates JSX Monolithiques**| V3 | `src/templates/Template*.jsx` | 🟠 À ISOLER | Remplacer à terme par des Designs déclaratifs |
| **Liens orphelins `/builder/*`**| V2/V3 | `src/app/dashboard/page.js` | 🔴 OBSOLÈTE | Corriger les liens sans casser la page |
| **Tables orphelines V2** | V2 | `reservations`, `events`, `restaurant_menu`... | 🔴 OBSOLÈTE | Ne pas toucher en base pendant l'audit |
