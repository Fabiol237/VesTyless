# AUDIT FORENSIC VESTYLE — 06_CONFLICTS.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Identification médico-légale de tous les conflits d'architecture, des doubles sources de vérité et des incohérences du code existant.

---

## 1. SYNTHÈSE DES CONFLITS MAJEURS DÉTECTÉS

L'audit approfondi a identifié **6 conflits structurels majeurs** au sein du projet :
1. **Conflit des Sources de Vérité de Configuration** (`store_modules` vs `layout_config` vs `draft_config` / `published_config`)
2. **Conflit des Moteurs de Rendu** (Templates JSX Monolithiques vs `UniversalStorefrontRenderer` vs `StorefrontRenderer`)
3. **Conflit des Systèmes de Design** (Thèmes 20 Palettes V1 vs Master Blueprints V4 vs Designs Canoniques V3.0 Zod)
4. **Liens Orphelins vers une Route Supprimée** (`/builder/[id]` référencé dans le Dashboard Vendeur)
5. **Hypothèse Mono-Boutique dans certaines requêtes** (`.single()` sur `owner_id` vs modèle multi-boutiques 1:N)
6. **Dispersion des Requêtes Supabase Directes dans les Composants UI**

---

## 2. FICHE DÉTAILLÉE DE CHAQUE CONFLIT

---

### CONFLIT 1 : TRIPLE SOURCE DE VÉRITÉ POUR LA CONFIGURATION DES VITRINES

#### PROBLÈME
Une boutique possède 3 endroits distincts et concurrents où sa structure de page et son thème peuvent être enregistrés en base.

#### LOCALISATION
* Table `store_modules` (lignes relationnelles par page/module)
* Table `stores.layout_config` / `stores.theme_config` (colonnes JSONB)
* Table `stores.draft_config` / `stores.published_config` (colonnes JSONB déclaratives Master 1/2)
* Fichiers : `src/app/api/ai/generate-store/route.js`, `src/app/dashboard/page.js`, `src/app/boutique/[slug]/StorefrontClient.js`.

#### CAUSE
Sédimentation historique : la Génération 2 utilisait `store_modules`, la Génération 3 a introduit `layout_config`, et la Génération 4 a introduit `draft_config` et `published_config`. Chaque mise à jour a ajouté un champ sans nettoyer ni synchroniser les précédents.

#### IMPACT
* Si un marchand modifie sa boutique depuis le Dashboard (`StudioSectionEditor`), cela met à jour `stores.layout_config`.
* Mais si l'IA génère une boutique (`/api/ai/generate-store`), elle écrit dans `store_modules`.
* Et si le moteur déclaratif lit `stores.published_config`, il peut ignorer les modifications récentes faites dans les autres champs.
* L'adaptateur `adaptStoreToBusinessProfile` doit faire des acrobaties complexes de repli en cascade pour deviner quelle source utiliser.

#### SOLUTION RECOMMANDÉE
1. Établir le document déclaratif unique **`published_config`** (et son pendant de travail **`draft_config`**) comme **SEULE ET UNIQUE source de vérité** pour toute la plateforme.
2. Isoler `store_modules` et `layout_config` en lecture seule de repli pour les anciennes boutiques, sans écriture nouvelle.

---

### CONFLIT 2 : DUALITÉ DES MOTEURS DE RENDU DE VITRINE

#### PROBLÈME
Deux moteurs de rendu complètement différents coexistent dans la page boutique publique : les templates JSX codés en dur et le moteur déclaratif par composants.

#### LOCALISATION
* `src/templates/TemplateBoutique.jsx`, `TemplateTechPro.jsx`, `TemplateResto.jsx`, `TemplatePresta.jsx`
* `src/components/storefront/UniversalStorefrontRenderer.jsx`
* `src/components/renderer/StorefrontRenderer.tsx`
* `src/app/boutique/[slug]/StorefrontClient.js` (lignes 303-326)

#### CAUSE
La transition vers le rendu universel par composants déclaratifs n'a pas été achevée, conservant les anciens composants JSX comme filet de sécurité sous `legacyTemplateFallback`.

#### IMPACT
* Duplication massive du code UI (le panier flottant, le widget WhatsApp, le carrousel d'images et les cartes produits sont codés à la fois dans chaque fichier `Template*.jsx` et dans les composants de `src/components/`).
* Incohérence visuelle possible selon que la boutique bascule en mode universel ou en mode template de repli.
* Impossibilité pour Mistral de modifier dynamiquement les blocs d'un template JSX monolithique.

#### SOLUTION RECOMMANDÉE
1. Encapsuler les gabarits visuels des templates JSX dans le standard universel `DesignDefinition` (v3.0).
2. Conserver `UniversalStorefrontRenderer` comme l'unique point d'entrée de rendu pour tous les domaines et tous les designs.

---

### CONFLIT 3 : CHEVAUCHEMENT ENTRE 3 SYSTÈMES DE DESIGN

#### PROBLÈME
Trois catalogues de styles et de templates coexistent :
1. Le catalogue des 22 thèmes de couleurs statiques (`theme_00` à `theme_21` dans `themes/index.js`).
2. Le registre des 5 Master Blueprints (`src/engine/masterBlueprints.ts`).
3. Le catalogue des 6 Designs Canoniques v3.0 (`src/core/designs/vst_dsn_001..006.ts`).

#### LOCALISATION
* `src/app/boutique/[slug]/themes/index.js`
* `src/engine/masterBlueprints.ts`
* `src/core/designs/` & `src/core/registry/LocalDesignRegistry.ts`
* `src/lib/business-profile/businessProfileAdapter.js`

#### CAUSE
Chaque étape d'évolution du projet (V1 -> V4 -> V5) a défini son propre vocabulaire de design.

#### IMPACT
* Confusion entre la notion de "Thème" (palette de couleurs), de "Blueprint" (structure de blocs) et de "Design" (gabarit complet avec VisualNodeTree).
* Complexité accrue dans l'onboarding et le switch de thème.

#### SOLUTION RECOMMANDÉE
* Aligner la plateforme sur la règle fondamentale de la nouvelle architecture :
  ```
  VESTYLE CORE  ≠  DOMAIN  ≠  CATEGORY  ≠  DESIGN  ≠  CONTENT  ≠  PUBLICATION
  ```
* Les palettes de couleurs deviennent de simples tokens de style au sein du `StyleSystem` d'un Design.

---

### CONFLIT 4 : LIENS ORPHELINS VERS UNE ROUTE SUPPRIMÉE DANS LE DASHBOARD

#### PROBLÈME
Le Dashboard Vendeur comporte 4 boutons/liens menant vers `/builder/${store.id}` qui déclenchent une erreur 404 (route inexistante).

#### LOCALISATION
* `src/app/dashboard/page.js` :
  - Ligne 345 : Bouton mobile `<Link href={'/builder/${store.id}'}>` ("Studio")
  - Ligne 417 : Bouton desktop `<Link href={'/builder/${store.id}'}>` ("Vestin Studio")
  - Ligne 476 : Bannière `<Link href={'/builder/${store.id}'}>` ("Ouvrir l'Éditeur Complet")
  - Ligne 542 : Header `<Link href={'/builder/${store.id}'}>` ("Personnaliser la Boutique")
* `src/app/dashboard/settings/page.js` :
  - Ligne 148 : Bouton header `<Link href={'/builder/${storeId}'}>`

#### CAUSE
Une ancienne page dédiée au builder a été supprimée ou refactorisée lors du passage au mode Studio intégré dans le dashboard, mais les liens de navigation n'ont pas été redirigés.

#### IMPACT
Frustration utilisateur et sentiment de fonctionnalité cassée si un marchand clique sur ces boutons.

#### SOLUTION RECOMMANDÉE
* Rediriger ces boutons vers l'onglet interne "Sections" (`setStudioMode('studio')`) déjà présent et fonctionnel dans `src/app/dashboard/page.js`, ou vers le futur studio de création de design.

---

### CONFLIT 5 : HYPOTHÈSE MONO-BOUTIQUE DANS CERTAINES REQUÊTES SQL CLIENT

#### PROBLÈME
Certaines pages effectuent un `.select().eq('owner_id', session.id).single()` alors que la base de données supporte désormais la relation 1 Utilisateur -> N Boutiques.

#### LOCALISATION
* `src/app/dashboard/settings/page.js` (Ligne 45)
* `src/app/dashboard/add-product/page.js` (Ligne 38)

#### CAUSE
La migration `20260911_store_model_foundation.sql` a levé la contrainte d'unicité `stores_owner_id_key` pour autoriser plusieurs boutiques par compte, mais certains formulaires hérités de la V1 utilisent encore `.single()` sur `owner_id`.

#### IMPACT
Si un utilisateur possède plus d'une boutique (ex: une boutique Vendeur et un Restaurant), ces pages lèvent une erreur Supabase `PGRST116: JSON object requested, multiple (or no) rows returned`.

#### SOLUTION RECOMMANDÉE
* Remplacer systématiquement le filtrage par `owner_id` par le `storeId` de la boutique active actuellement sélectionnée dans le contexte (`useAuth().store.id`).

---

### CONFLIT 6 : DISPERSION DE LA LOGIQUE MÉTIER ET SUPABASE DANS LES COMPOSANTS UI

#### PROBLÈME
De nombreux composants UI effectuent directement des requêtes SQL `supabase.from(...)` brutes avec transformation ad-hoc au lieu de passer par une couche de service unifiée.

#### LOCALISATION
* `src/app/dashboard/page.js` (requêtes directes imbriquées)
* `src/app/dashboard/products/page.js` (requêtes directes imbriquées)
* `src/app/dashboard/orders/page.js` (requêtes directes imbriquées)
* `src/app/page.js` (requêtes directes)

#### CAUSE
Développement rapide de type MVP sans couche intermédiaire d'abstraction des données.

#### IMPACT
* Difficulté à réutiliser la logique pour les 8 autres futurs dashboards.
* Risque de duplication de code et de requêtes non optimisées.

#### SOLUTION RECOMMANDÉE
* Introduire progressivement une couche de services Core (ex: `StoreService`, `OrderService`, `ProductService`, `LeadService`) que les 9 dashboards pourront consommer uniformément.
