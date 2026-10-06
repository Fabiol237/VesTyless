# Walkthrough — Storefront Engine, Master Blueprints & Onboarding (Master 3, 4 & Onboarding)

## 1. Modules Implémentés & Architecturés

### A. ThemeSeed Engine (`src/engine/themeSeed.ts`)
- **Signature Visuelle Numérique** : Format canonique `VST-{BP}-{CLR}-{F}-{V}[-DARK]` (ex: `VST-BP01-CLR04-F02-VA`).
- **Encodage & Décodage Round-Trip Sans Perte** : `generateSeed()`, `decodeSeed()`, `seedToTheme()`.
- **Catalogues Intégrés** :
  - 8 palettes de couleurs complètes (`CLR01` à `CLR08`) avec variantes claires et sombres (`bgColorDark`, `textColorDark`, `borderColorDark`).
  - 8 familles de polices (`F01` à `F08` : Inter, Playfair Display, Poppins, Montserrat, Raleway, Lato, DM Sans, Outfit).
  - 6 styles de layout (`VA` à `VF` : Sharp, Smooth, Round, Pill, Flat, Bordered) avec tokens `borderRadius` et `shadowStyle`.
- **Résilience Totale** : Fallback déterministe sécurisé (`FALLBACK_SEED_CONFIG`) sans crash en cas de graine tronquée ou corrompue.

### B. Master Blueprint Registry (`src/engine/masterBlueprints.ts`)
- **Catalogue Central `MasterBlueprintRegistry`** : Registre avec indexation par ID court (`BP01`, `BP02`, `BP03`, `BP04`, `BP05`) et code complet.
- **5 Master Blueprints de Référence** :
  1. `BP01_RETAIL_ECOM` : E-commerce & produits physiques (Header sticky, Hero immersif, Catégories pilules, Grille produits 2 colonnes, Avis clients, Contact & WhatsApp, Footer sécurisé MoMo/OM).
  2. `BP02_SERVICE_PRO` : Services & formations professionnelles (Hero proposition de valeur, Grille de prestations/forfaits, Tarification transparente, Témoignages & références, Réservation directe).
  3. `BP03_HYBRID_MARKET` : Commerces multi-activités (Hero polyvalent, Prestations & formations, Catalogue produits, Packs mixtes, Contact multi-canal).
  4. `BP04_LIVESTOCK_FARM` : Élevage, cheptel & agropastoral (Badges vétérinaires & vaccination, Catalogue cheptel pesé avec acompte, Services agropastoraux d'abattage et transport frigorifique, Localisation ferme).
  5. `BP05_RESTAURANT_FOOD` : Restauration, snack & traiteur (Menu numérique, Plats du jour & grillades, Galerie d'ambiance, Réservation & livraison express).
- **Instanciation Contextuelle (`instantiateSections`)** : Clonage et injection déterministe des métadonnées du marchand dans chaque section.

### C. Intelligent Blueprint Selector (`src/engine/blueprintSelector.ts`)
- **Moteur de Sélection `selectOptimalBlueprint(businessType, intentData)`** :
  - Règle 1 : Résolution déterministe prioritaire si `businessType` explicite (`HYBRID` ➔ `BP03`, `LIVESTOCK_PRODUCT` ➔ `BP04`, `SERVICE` ➔ `BP02`, `RESTAURANT` ➔ `BP05`, `PHYSICAL_PRODUCT` ➔ `BP01`).
  - Règle 2 : Analyse sémantique d'intention textuelle (mots-clés d'élevage, de service, de restaurant, de retail, et détection multi-verticale automatique).
  - Règle 3 : Fallback intelligent universel vers `BP03_HYBRID_MARKET`.

### D. Blueprint Injector (`src/engine/blueprintInjector.ts`)
- **Injection Déterministe** : Transforme un payload IA/Studio brut (`InjectionPayload`) en `StorefrontConfig` conforme et validé par Zod (`StorefrontConfigSchema`).
- **Pipeline d'Assemblage Connecté** :
  1. Résolution de l'ID unique (`vst_{name}_{timestamp}`).
  2. Normalisation des métadonnées métier (`StorefrontMetadataSchema`).
  3. Résolution du Master Blueprint optimal via `blueprintSelector`.
  4. Résolution du thème visuel (seed fourni OU `recommendedThemeSeed` du blueprint).
  5. Instanciation des sections canoniques adaptées au marchand.
  6. Validation Zod stricte (`StorefrontConfigSchema.safeParse`).
  7. Filet de secours `FALLBACK_STOREFRONT_CONFIG` : zéro écran blanc garanti.

### E. Contrats d'Onboarding & Context Persistant (`src/types/onboarding.ts` & `src/context/OnboardingContext.tsx`)
- **`OnboardingPayloadSchema`** : Validation stricte des saisies avec nettoyage du format WhatsApp camerounais (+237) et validation de la première offre (`InitialItemSchema`).
- **`OnboardingProvider` & `useOnboarding`** : Store réactif synchronisé automatiquement avec `sessionStorage` (`vst_onboarding_session`) pour garantir la persistance lors des rafraîchissements.
- **`OnboardingWizard` (`src/components/onboarding/OnboardingWizard.tsx`)** : Tunnel en 4 étapes fluide et responsive avec preview WYSIWYG en temps réel, sélecteur de palettes de styles et appel d'enregistrement serveur `/api/store/create`.

---

## 2. Validation & Résultats des Tests

### A. Contrôle TypeScript Strict (`npx tsc --noEmit`)
- Validation complète de la base de code : **0 erreur**.

### B. Suites de Tests Unitaires & d'Intégration (Vitest)
- **84 tests unitaires** exécutés et validés avec succès :

| Suite de Test | Fichier | Tests | Statut |
|---|---|---|---|
| Onboarding Schemas & Contract | `src/engine/__tests__/onboarding.test.ts` | **14 tests** | **PASS** |
| Master Blueprints & Selector | `src/engine/__tests__/masterBlueprints.test.ts` | **30 tests** | **PASS** |
| Blueprint Injector & ThemeSeed | `src/engine/__tests__/blueprintInjector.test.ts` | **40 tests** | **PASS** |
| **Total Global** | | **84 tests** | **100% PASS** |

```text
 ✓ src/engine/__tests__/onboarding.test.ts        (14 tests) 17ms
 ✓ src/engine/__tests__/masterBlueprints.test.ts  (30 tests) 51ms
 ✓ src/engine/__tests__/blueprintInjector.test.ts  (40 tests) 78ms

 Test Files  3 passed (3)
      Tests  84 passed (84)
```
