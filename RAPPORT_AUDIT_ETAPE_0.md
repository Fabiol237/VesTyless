# VESTIN — RAPPORT D'AUDIT ARCHITECTURAL
## ÉTAPE 0

---

## 1. Résumé exécutif

L'audit architectural approfondi du projet **Vestin** (actuellement nommé `vestyle` dans le code source) révèle une application hybride d'une grande richesse fonctionnelle mais fragmentée en plusieurs couches géologiques successives de développement. 

Le projet a été conçu à l'origine comme une **marketplace locale au Cameroun (Douala / Yaoundé)** combinant e-commerce physique, géolocalisation, négociation WhatsApp, et recherche visuelle par intelligence artificielle. Par-dessus ce socle marketplace s'est greffée une tentative de transformation vers un **moteur de boutiques personnalisées offline-first (nommé "Vestine")** doté d'une bibliothèque déclarative théorique de 1 100 composants, de 21 moteurs spécialisés (`src/lib/*-engine/`), d'un éditeur WYSIWYG (`LiveCanvas`) et d'un noyau IA (`ai-kernel`).

### Constats majeurs :
1. **Coexistence de trois systèmes de rendu concurrents non unifiés** :
   - Les **Templates monolithiques JSX** ([`src/templates/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/templates)), codés en dur avec du CSS injecté par template (`TemplateBoutique`, `TemplateResto`, `TemplateTechPro`, etc.).
   - Le **Block Engine v1** ([`src/lib/blockEngine/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/blockEngine)) opérant sur 17 composants réels ([`src/blocks/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks)).
   - Le **Moteur Visuel Vestine v2/v3** ([`LiveCanvas.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/visual-engine/LiveCanvas.jsx)), s'appuyant sur un registre déclaratif ([`ComponentRegistry.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/component-registry/ComponentRegistry.js)) et un éditeur WYSIWYG ([`src/app/builder/[storeId]/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/builder/%5BstoreId%5D/page.js)).
   - **Biais critique dans le frontend public** : Dans [`StorefrontClient.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/StorefrontClient.js#L236), la condition `const isVestineLiveStore = Boolean(... || true);` force systématiquement l'utilisation de `LiveCanvas`, court-circuitant totalement les deux autres moteurs.
2. **Réalité des "1 100 composants déclaratifs"** :
   - Les "1 100 composants" documentés dans [`ARCHITECTURE_VESTINE.md`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/ARCHITECTURE_VESTINE.md) ne sont pas 1 100 fichiers React distincts, mais **des boucles JavaScript générant des descripteurs de métadonnées** (`hero_001` à `hero_100`, `header_001` à `header_100`), qui s'aiguillent en réalité sur **quelques MasterRenderers centralisés** possédant chacun entre 3 et 6 variantes graphiques réelles.
3. **Architecture de données et Supabase** :
   - Le schéma PostgreSQL de production est composé d'une dizaine de scripts de migrations empilés. Plusieurs tables créées lors de migrations intermédiaires (ex: `reservations`, `restaurant_menu`, `devis_requests`, `events`, `tickets`, `services`, `subscriptions`) ne sont **strictement jamais requêtées par le frontend**. La majorité des flux métier non-produits (ex: réservations de tables ou prise de RDV) se résument en réalité à un lien direct vers l'API WhatsApp (`wa.me`).
4. **Piliers d'excellence à préserver** :
   - Le moteur de **recherche visuelle et multimodale** (Jina CLIP v2 1024D + Supabase `pgvector` HNSW) est fonctionnel, performant et mature.
   - La pile **Offline-First** (Dexie.js / IndexedDB, synchronisation asynchrone, Service Worker v6.1 complet) est solide et bien pensée.
   - Le système de traçabilité des données ([`ContentSource.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/content-source/ContentSource.js)) qui empêche les données de démo de fuiter en production constitue une base saine pour le futur moteur Vestin.

---

## 2. Stack technique détectée

### Framework & Runtime
- **Next.js** : `15.5.7` (App Router avec React Server Components et Client Components `'use client'`).
- **React / React DOM** : `19.0.0` (`react: "latest"` dans `package.json`).
- **Langage** : JavaScript pur (ESM / JSX). Absence de code TypeScript actif malgré la présence de `jsconfig.json` et de l'option `typescript: { ignoreBuildErrors: true }` dans [`next.config.mjs`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/next.config.mjs).

### Styles & Design System
- **Tailwind CSS** : `v4.2.2` via `@tailwindcss/postcss`.
- **PostCSS** : `8.5.10` avec `autoprefixer: 10.5.0`.
- **CSS Modules & Inline Styles** : Coexistence de `globals.css` (Tailwind), de CSS Modules (`Navbar.module.css`, `Footer.module.css`, `Dashboard.module.css`, `Storefront.module.css`, `editor.css`), et d'injections massives de balises `<style>` dynamiques injectant du CSS brut en chaîne de caractères dans les templates.
- **Animations & Graphismes** : `framer-motion: ^12.38.0`, `canvas-confetti: ^1.9.4`, `three: ^0.184.0` (fond 3D WebGL), `recharts: ^3.8.1` (graphiques dashboard).
- **Icônes** : `lucide-react: ^0.477.0` doublé de dizaines d'icônes SVG codées manuellement en dur ("bulletproof SVGs").

### Base de données & Stockage
- **Backend principal** : **Supabase** (PostgreSQL 15+, Supabase Auth avec PKCE, Supabase Storage, Supabase Realtime).
  - SDK client : `@supabase/supabase-js: ^2.103.2`, `@supabase/ssr: ^0.10.2`.
  - Extension : `pgvector` (vecteurs 1024D HNSW pour la recherche visuelle), `pg_trgm`, `uuid-ossp`, `pgcrypto`.
- **Base locale (Offline-First)** : **Dexie.js** `^4.4.5` (base locale IndexedDB `VeStyleDB` v2).
- **Stockage d'images** : **Cloudinary** (upload direct, transformations, compression via `browser-image-compression`).
- **Cache navigateur & PWA** : Service Worker personnalisé ([`public/sw.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/public/sw.js) v6.1) avec stratégies `Cache-First`, `Stale-While-Revalidate` et synchronisation d'arrière-plan.

### Intelligence Artificielle & Recherche
- **Jina AI** : Modèle `jina-clip-v2` (embeddings multimodaux image et texte en 1024 dimensions via API REST).
- **Mistral AI** : SDK officiel `@mistralai/mistralai: ^2.4.0` (modèles `mistral-small-latest` pour le chatbot e-commerce et `mistral-large-latest` pour le générateur de boutiques).
- **Hugging Face** : Token configuré, scripts de déploiement et Space FastAPI externe (`huggingface_space/app.py` combinant Florence-2, DINOv2 et SigLIP).
- **Dépendances IA résiduelles ou expérimentales** : `@huggingface/inference`, `@xenova/transformers`, `@mlc-ai/web-llm`, `@gradio/client`, `replicate`.

### Services Externes & Outils Métier
- **Notifications Push** : Firebase Cloud Messaging (FCM via `firebase: ^12.18.0` et `firebase-admin: ^14.3.0`) doublé de Web Push standard VAPID (`web-push: ^3.6.7`).
- **Emails transactionnels** : `resend: ^6.12.3` et `nodemailer: ^8.0.7`.
- **Cartographie & Géolocalisation** : `leaflet: ^1.9.4`, `react-leaflet: ^5.0.0`, `leaflet-routing-machine`, `react-leaflet-cluster`.
- **Génération de documents** : `jspdf: ^4.2.1`, `html2canvas: ^1.4.1` (génération de reçus et de catalogues PDF côté client), `qrcode.react: ^4.2.0`.
- **Drag & Drop** : `@dnd-kit/core: ^6.3.1`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- **Emballage Mobile** : Capacitor ([`capacitor.config.json`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/capacitor.config.json), ID `com.vestyle.app`).

---

## 3. Structure du projet

L'arborescence générale du dépôt à la racine se décompose ainsi :

```text
2VESTYLE/
├── public/                       # Assets statiques, icônes PWA, manifest.json, sw.js (Service Worker)
├── huggingface_space/            # Code Python Space HF (Florence-2, DINOv2, SigLIP, app.py)
├── supabase/                     # Scripts SQL, migrations historiques et diagnostics
│   └── migrations/               # 20 fichiers de migrations SQL ordonnées chronologiquement
├── scripts/                      # 20 scripts Node.js/ESM d'administration, seeding et migration
├── tests/                        # Tests unitaires isolés (storeModuleUtils, vectorSearchProvider)
└── src/                          # Code source applicatif Next.js
    ├── app/                      # Next.js App Router (pages, layouts, endpoints API)
    │   ├── api/                  # 15 sous-dossiers et 42 endpoints REST
    │   ├── boutique/[slug]/      # Vitrine publique dynamique multi-thèmes
    │   ├── builder/[storeId]/    # Éditeur visuel WYSIWYG offline-first
    │   ├── dashboard/            # Espace marchand (produits, commandes, promos, stats)
    │   ├── admin/                # Espace SuperAdmin (finances, boutiques, modération)
    │   ├── cart/                 # Panier et validation de commande
    │   ├── produit/[id]/         # Fiche produit détaillée SSR/client
    │   ├── suivi/[id]/           # Suivi en temps réel de commande & facture PDF
    │   └── search/               # Moteur de recherche sémantique et visuelle
    ├── blocks/                   # 17 composants de blocs unitaires pour le Block Engine
    ├── components/               # 57 composants UI généraux + sous-systèmes UI
    │   ├── blocks/               # 15 composants de blocs concurrents (doublon)
    │   ├── developer-mode/       # Inspecteur et éditeur de contraintes techniques
    │   ├── dynamic-dashboard/    # Panneaux de réglages contextuels par composant
    │   ├── editor-shell/         # Cadre de l'éditeur (canvas, barres d'outils, réactivité mobile)
    │   ├── page-manager/         # Modale de gestion multi-pages
    │   ├── store-composer/       # Assistant de composition de boutique
    │   ├── template-library/     # Sélecteur de templates de référence
    │   ├── template-packages/    # Importateur / Exportateur de packs déclaratifs
    │   ├── vendor-flow/          # Modales d'aide vendeur et assistant de sélection
    │   └── visual-engine/        # Moteur visuel (LiveCanvas, sélecteurs, contraintes)
    ├── context/                  # AuthContext.js et CartContext.js
    ├── hooks/                    # 11 hooks personnalisés (offline, sync, distance, voix, push)
    ├── lib/                      # Utilitaires globaux + 21 moteurs spécialisés
    │   ├── ai-kernel/            # Orchestration des requêtes IA, validation, intent router
    │   ├── blockEngine/          # Moteur de blocs déclaratifs (registry, renderer, patcher)
    │   ├── booking-engine/       # Moteur de réservation (créneaux, modes, WhatsApp)
    │   ├── business-components/  # Définitions des 10 familles métiers déclaratives
    │   ├── business-types/       # Registre des 19 secteurs d'activité
    │   ├── capability-engine/    # Registre des 22 capacités canoniques
    │   ├── component-registry/   # Registre central des composants déclaratifs
    │   ├── delivery-engine/      # Moteur de calcul de livraison et zones
    │   ├── history-engine/       # Moteur Undo / Redo (40 snapshots)
    │   ├── inventory-engine/     # Gestion des stocks, variantes, SKU
    │   ├── offline-builder/      # Synchronisation bidirectionnelle Dexie ↔ Supabase
    │   ├── page-engine/          # Moteur d'assemblage multi-pages
    │   ├── theme-engine/         # Moteur de thèmes et tokens de design
    │   └── ...                   # Fichiers utilitaires monolithiques (db.js, supabase.js, etc.)
    ├── templates/                # 5 templates React monolithiques historiques
    ├── middleware.js             # Bouclier de sécurité, Rate limiting, Honeypot, Basic Auth Admin
    └── proxy.js                  # Proxy utilitaire de développement
```

---

## 4. Routes

### Tableau des routes d'interface (Frontend Pages)

| Route | Responsabilité | Composants clés | Données consommées | Source données | État | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Page d'accueil marketplace | `Navbar`, `ClientDiscovery`, `VisualSearchModal`, `SearchAutocomplete`, `InteractiveMap` | Produits vedettes, boutiques géolocalisées, catégories | `/api/products/feed`, Dexie `discovery_feed_v5`, Supabase RPC | Local + Dexie | **OPÉRATIONNELLE** (monolithique) |
| `/boutique/[slug]` | Vitrine d'un commerçant | `StorefrontClient`, `LiveCanvas`, `HeaderRenderer`, `StoreChatWidget`, `DownloadCatalogButton` | Données boutique, modules, produits, thèmes | Supabase (`stores`, `store_modules`, `products`) + Cache mémoire | Local + Cache | **OPÉRATIONNELLE** (LiveCanvas forcé) |
| `/builder/[storeId]` | Éditeur de boutique pour vendeur | `EditorShell`, `LiveCanvas`, `InspectorPanel`, `PageManagerModal`, `AddSectionModal` | Structure `StoreConfig` (pages, sections, thème) | Dexie local first (`builderLocalStore`) ↔ Supabase | Local + History (Undo/Redo) | **OPÉRATIONNELLE** |
| `/produit/[id]` | Fiche technique d'un article | `ProductClient`, `SizeGuide`, `ReviewsSection`, `SmartRecommendations` | Fiche produit, variantes, avis, boutique associée | Supabase SSR (`products`, `product_variants`, `stores`) | Local + CartContext | **OPÉRATIONNELLE** |
| `/cart` | Panier d'achat & checkout | `Navbar`, `Footer`, `DeliveryEstimator` | Lignes du panier, coordonnées client, GPS | `CartContext` (localStorage + Dexie `cart`) | Local | **OPÉRATIONNELLE** |
| `/dashboard` | Accueil du tableau de bord vendeur | `DashboardShell`, `PremiumChart`, `SellerAssistantPanel`, `LiveSalesPopup` | Ventes, commandes récentes, état du stock | Supabase (`orders`, `products`, `stores`) | Local + Cache | **OPÉRATIONNELLE** |
| `/dashboard/products` | Gestion du catalogue marchand | `DashboardShell`, `CsvImportExportModal` | Liste des produits du vendeur | Supabase (`products`, `global_categories`) | Local | **OPÉRATIONNELLE** |
| `/dashboard/add-product`| Formulaire d'ajout de produit | `ProductDescriptionAI`, `ImageCompressor` | Données article, tags IA, images Cloudinary | Supabase + Cloudinary + Mistral | Local | **OPÉRATIONNELLE** |
| `/dashboard/orders` | Gestion des commandes et livreurs | `DashboardShell` | Commandes par statut, assignation livreur | Supabase (`orders`, `livreurs`) | Local + Realtime | **OPÉRATIONNELLE** |
| `/dashboard/promotions`| Gestion des promotions | Formulaires de promotions | Règles de promotions | `/api/promotions`, Supabase | Local | **OPÉRATIONNELLE** |
| `/dashboard/settings` | Paramètres généraux de la boutique | Formulaires de boutique, thème, WhatsApp | Profil boutique, coordonnées, horaires | Supabase (`stores`) | Local | **OPÉRATIONNELLE** |
| `/dashboard/statistiques`| Statistiques avancées de vente | `PremiumChart`, sélecteurs de périodes | Historique commandes livrées | Supabase (`orders`) | Local | **OPÉRATIONNELLE** |
| `/dashboard/notifications`| Notifications marchandes | Liste des notifications | Événements de vente, alertes stock | Supabase (`notifications`) | Local | **OPÉRATIONNELLE** |
| `/admin` | Tableau de bord super-administrateur | `AdminDashboard`, cartes KPI | Total boutiques, utilisateurs, revenus | Server Actions (`admin/actions.js`) | Local | **OPÉRATIONNELLE** |
| `/admin/cleanup` | Nettoyage de la base de données | Boutons d'actions de purge | État d'intégrité de la base | `/api/admin/cleanup-database` | Local | **OPÉRATIONNELLE** |
| `/admin/headers-gallery`| Galerie de test des 100 headers | `HeaderRenderer`, simulateur responsive | Définitions statiques `HEADERS_100_DEFINITIONS` | Mémoire locale | Local | **OPÉRATIONNELLE** |
| `/headers-gallery` | Vue publique de la galerie de headers | Re-export de `admin/headers-gallery` | Définitions statiques | Mémoire locale | Local | **OPÉRATIONNELLE** |
| `/suivi/[id]` | Suivi en temps réel de livraison | `OrderTrackingPage`, `RoutingMachine` | État commande, coordonnées GPS livreur | Supabase Realtime (`orders`, `delivery_tracking`) | Local + Realtime | **OPÉRATIONNELLE** |
| `/suivi/[id]/invoice` | Facture imprimable / PDF | Vue facture grand format | Données commande, boutique, taxes | Supabase (`orders`, `stores`) | Local | **OPÉRATIONNELLE** |
| `/search` | Recherche dédiée | `ClientDiscovery`, `VestyleLens` | Produits filtrés, recherche sémantique | `/api/search/semantic`, `/api/search/visual` | Local | **OPÉRATIONNELLE** |
| `/onboarding` | Tunnel de création assistée par IA | Wizard par étapes (Activité, Style) | Réponses formulaire | `/api/ai/generate-store` | Local | **OPÉRATIONNELLE** |
| `/delivery` | Interface mobile des livreurs | Liste des courses, bascule de statut | Commandes assignées au livreur connecté | Supabase (`orders`, `livreurs`, `delivery_tracking`) | Local | **OPÉRATIONNELLE** |
| `/wishlist` | Liste d'envies client | `ProductCard` | Produits favoris | Dexie `wishlist` | Local (Dexie) | **OPÉRATIONNELLE** |
| `/boutiques` | Annuaire des boutiques | Grille de cartes boutiques | Boutiques actives | Supabase (`stores`) | Local | **OPÉRATIONNELLE** |
| `/mes-commandes` | Historique des commandes client | Liste des commandes | Commandes filtrées par téléphone/compte | Supabase (`orders`) | Local | **OPÉRATIONNELLE** |
| `/login` / `/signup` | Authentification utilisateur | Formulaires Supabase Auth | Identifiants, sessions | Supabase Auth (PKCE) | AuthContext | **OPÉRATIONNELLE** |
| `/profile` | Profil utilisateur | Formulaire profil | Métadonnées utilisateur | Supabase (`profiles`) | AuthContext | **OPÉRATIONNELLE** |
| `/offline` | Page de secours hors-ligne PWA | Message explicatif & liens en cache | Données en cache local | Service Worker App Shell | Local | **OPÉRATIONNELLE** |
| `/a-propos`, `/contact`, `/faq`, `/mentions-legales`, `/cv` | Pages institutionnelles | Textes statiques | Contenu figé | JSX pur | Aucun | **UI SEULEMENT** |

### Tableau des routes API (`src/app/api/`)

| Route API | Méthode | Responsabilité | Entrée | Sortie | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/products/feed` | GET | Flux agrégé de la marketplace (ISR 60s) | Aucun | `{ products, stores, categories }` | Supabase (`products`, `stores`, `global_categories`) |
| `/api/search/visual` | POST | Recherche visuelle par similarité | Image Buffer (multipart ou base64) | `{ products, count, model }` | Jina CLIP v2 API + Supabase RPC `match_products_v2` |
| `/api/search/semantic` | POST | Recherche vectorielle par texte | `{ query, threshold, limit }` | `{ products, count, model }` | Jina CLIP v2 API + Supabase RPC `match_products_v2` |
| `/api/chat` | POST | Chatbot IA vendeur temps réel | `{ messages, storeId }` | `{ content, actions }` | Mistral AI (`mistral-small-latest`) + Supabase `products` |
| `/api/ai/gateway` | POST | Passerelle sécurisée d'actions pour le Builder | `{ prompt, storeConfig, storeId }` | Action validée & patch config | `aiGateway` ([`AIGateway.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/ai-kernel/AIGateway.js)), Mistral AI |
| `/api/ai/generate-store`| POST | Génération complète d'une boutique onboarding | `{ formData, userId, storeId }` | `{ success, store, redirectUrl }`| Mistral (`mistral-large-latest`), Supabase (`stores`, `store_modules`) |
| `/api/ai/builder-orchestrator` | POST | Recommandation de thèmes et blocs par mots-clés | `{ prompt, currentTheme }` | Thème suggéré, blocs conseillés | Logique déterministe interne + Mistral |
| `/api/ai/classify-product` | POST | Auto-catégorisation de produit | `{ name, description }` | Catégorie globale déduite | Mistral AI |
| `/api/ai/product-description` | POST | Rédaction assistée de descriptif produit | `{ name, category, tone }` | Texte descriptif optimisé | Mistral AI |
| `/api/ai/store-advisor` | POST | Conseils business pour le commerçant | `{ storeId }` | Suggestions d'optimisation | Mistral AI + Supabase |
| `/api/ai/seller-assistant` | POST | Assistant conversationnel du dashboard vendeur | `{ messages, storeData }` | Réponse conseils opérationnels | Mistral AI |
| `/api/ai/delivery-assistant` | POST | Optimisation des tournées de livraison | `{ orders, courierLocation }` | Ordre de livraison suggéré | Mistral AI |
| `/api/ai/negotiation` | POST | Assistant de négociation de prix | `{ product, requestedDiscount }` | Accord ou contre-proposition | Mistral AI |
| `/api/ai/review-analysis` | POST | Synthèse des sentiments des avis clients | `{ reviews }` | Score de satisfaction & résumé | Mistral AI |
| `/api/ai/translate` | POST | Traduction multilingue des fiches | `{ text, targetLang }` | Texte traduit | Mistral AI |
| `/api/ai/weekly-report` | POST | Rapport d'activité hebdomadaire | `{ stats }` | Synthèse textuelle | Mistral AI |
| `/api/ai/moderation` | POST | Détection de contenu illicite ou frauduleux | `{ text, imageUrl }` | `{ approved, flags }` | Mistral AI |
| `/api/ai/match-template` | POST | Matching d'un template selon description | `{ description }` | ID de template recommandé | Règles de scoring internes |
| `/api/ai/improve-text` | POST | Reformulation et correction de textes | `{ text, mode }` | Texte corrigé | Mistral AI |
| `/api/promotions` | GET / POST | Création et liste des promotions de boutique | `{ storeId, ...promoData }` | Liste ou promotion créée | Supabase (`promotions`) |
| `/api/store/apply-template` | POST | Application adaptative d'un template sur boutique | `{ storeId, templateId }` | Résultat de synchronisation | Supabase (`store_modules`, `stores`, `store_versions`) |
| `/api/store/save-theme` | POST | Sauvegarde des couleurs & polices boutique | `{ storeId, theme_color, ... }` | Statut succès | Supabase (`stores`) |
| `/api/store/versions` | GET / POST | Sauvegarde et restauration de versions de boutique | `{ storeId, action }` | Historique de versions | Supabase (`store_versions`) |
| `/api/cloudinary` | POST | Signature et upload d'images sécurisé | Fichier image binaire | `{ url, public_id }` | Cloudinary API SDK |
| `/api/cron/warmup` | GET | Ping anti-sommeil du Space Hugging Face | Aucun | `{ ok, status, elapsed_ms }` | Space Hugging Face externe |
| `/api/cron/morning-pulse` | GET | Synthèse matinale automatique envoyée aux vendeurs | Bearer Token Cron | Log de diffusion | Supabase Admin + Resend |
| `/api/cron/flash-sales` | GET | Activation/désactivation automatique des ventes flash | Bearer Token Cron | Nombre d'offres mises à jour | Supabase Admin (`promotions`) |
| `/api/cron/pulse` | GET | Déclenchement périodique de bilans vendeurs | Bearer Token Cron | Statut | Supabase Admin |
| `/api/notifications/register` | POST | Enregistrement de token Web Push VAPID | `{ subscription, userId }` | Statut | Supabase (`push_subscriptions`) |
| `/api/notifications/send` | POST | Envoi de notification push | `{ userId, title, body }` | Statut d'expédition | `web-push` / Firebase FCM |
| `/api/emails/notify` | POST | Envoi d'emails transactionnels | `{ to, subject, type, data }` | ID Resend | Resend API |
| `/api/emails/preview` | GET | Prévisualisation HTML des gabarits d'emails | Query params (`type`) | HTML brut formaté | [`src/lib/emailTemplates.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/emailTemplates.js) |
| `/api/admin/cleanup-database`| POST | Purge des boutiques fantômes & vérification base | `{ adminToken, action }` | Rapport d'intégrité | Supabase Admin |
| `/api/admin/security-log` | POST | Journalisation d'attaques et bots suspects | `{ ip, userAgent, path }` | Statut d'écriture | Supabase Admin |
| `/api/honeypot` | ALL | Piège pour scrapers et robots automatisés | Requête bot | Fausses données vides 200 OK | Aucun |
| `/api/migrate` | POST | Déclenchement de migrations SQL applicatives | Secret d'administration | Résultat migration | Supabase Admin |
| `/api/migrate/business-type` | POST | Migration de typologie d'activité des boutiques | Secret d'administration | Résultat | Supabase Admin |
| `/api/dashboard/stats` | GET | Statistiques du tableau de bord vendeur | Query param `storeId` | Données agrégées | Supabase (`orders`, `products`) |
| `/api/products/generate-embeddings` | POST | Calcul d'embeddings par lot | `{ productIds }` | Nombre de vecteurs générés | Jina AI + Supabase |
| `/api/products/generate-embeddings-v2` | POST | Version 2 du calcul d'embeddings par lot | `{ storeId }` | Statut | Jina AI + Supabase |
| `/api/auth/callback` | GET | Callback OAuth / PKCE Supabase Auth | Code de redirection | Redirection URL session | Supabase Auth SSR |

---

## 5. Composants

### Analyse des familles de composants principales

#### 1. Header & Navigation
- **Composants** : [`HeaderRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/headers/HeaderRenderer.jsx), [`HeaderBlock.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks/header/HeaderBlock.jsx), [`Navbar.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/Navbar.js), [`VestyleSidebar.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/Navigation/VestyleSidebar.jsx).
- **Responsabilité** : Affichage de l'identité de marque (logo, nom), barre de recherche, lien WhatsApp direct, déclencheur du panier, liens de navigation multi-pages.
- **Réutilisabilité** : Moyenne. `HeaderRenderer` est hautement dynamique et s'adapte au `deviceMode`, mais reste fortement couplé aux objets `store`, `elements` et `PageEngine`.
- **Couplage & Risques** : `Navbar.js` contient sa propre logique de géolocalisation et de calcul de distance au lieu de déléguer à un hook pur.

#### 2. Hero & Bannières
- **Composants** : [`HeroMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/component-libraries/renderers/HeroMasterRenderer.jsx), [`HeroBlock.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks/hero/HeroBlock.jsx), doublon [`HeroBlock.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/blocks/HeroBlock.jsx).
- **Responsabilité** : Affichage de la proposition de valeur principale, CTA vers catalogue ou WhatsApp, mise en avant visuelle (gradient, image, verre).
- **Réutilisabilité** : Élevée dans le cadre de `HeroMasterRenderer` (implémente 5 variantes réelles : `HERO_EDITORIAL`, `HERO_SPLIT`, `HERO_CINEMATIC`, `HERO_COMMERCE`, `HERO_LUXURY`).

#### 3. Fiches et Grilles de Produits
- **Composants** : [`ProductCard.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/ProductCard.js), [`Products.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/Products.js), [`ProductMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/component-libraries/renderers/ProductMasterRenderer.jsx), [`CollectionBlock.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks/collection/CollectionBlock.jsx).
- **Responsabilité** : Présentation du produit, gestion des prix remisés, calcul MOQ (remises par volume d'achat), bouton d'ajout au panier, bouton de commande instantanée WhatsApp.
- **Réutilisabilité** : `ProductCard.js` est très bien conçu, gère l'état hors-ligne, la wishlist locale et le MOQ, mais se trouve dupliqué conceptuellement dans `ProductMasterRenderer.jsx`.

#### 4. Recherche, Filtres & Découverte
- **Composants** : [`ClientDiscovery.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/ClientDiscovery.js), [`SearchAutocomplete.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/SearchAutocomplete.js), [`VisualSearchModal.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/VisualSearchModal.js), [`VestyleLens.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/VestyleLens.js), [`VoiceSearchButton.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/VoiceSearchButton.js).
- **Responsabilité** : Moteur multimodal complet (saisie textuelle prédictive, recherche vocale via Web Speech API, recherche par photo Jina CLIP, filtrage par rayon kilométrique).
- **Couplage & Risques** : `ClientDiscovery.js` est un composant géant (878 lignes, 47 Ko) concentrant état local, requêtes RPC, filtres, affichage des grilles et intégration Leaflet.

#### 5. Éditeur Visuel (Builder WYSIWYG)
- **Composants** : [`LiveCanvas.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/visual-engine/LiveCanvas.jsx), [`EditorShell.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/editor-shell/EditorShell.jsx), [`InspectorPanel.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/dynamic-dashboard/InspectorPanel.jsx), [`ComponentSettingsCard.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/dynamic-dashboard/ComponentSettingsCard.jsx), [`VisualSelectionWrapper.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/visual-engine/VisualSelectionWrapper.jsx).
- **Responsabilité** : Rendu en temps réel de la boutique en mode édition ou public, sélection d'éléments au clic, ajustement responsive par largeur d'appareil, modification des propriétés déclaratives.
- **Réutilisabilité** : Très forte modularité interne, mais couplage rigide avec le schéma `StoreConfig` de `src/lib/offline-builder`.

#### 6. Modules Métiers Spécialisés
- **Composants** : [`BookingMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-components/renderers/BookingMasterRenderer.jsx), [`MenuMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-components/renderers/MenuMasterRenderer.jsx), [`RoomMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-components/renderers/RoomMasterRenderer.jsx), [`StaffMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-components/renderers/StaffMasterRenderer.jsx), [`BusinessInfoMasterRenderers.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-components/renderers/BusinessInfoMasterRenderers.jsx).
- **Responsabilité** : Affichage d'interfaces spécifiques aux secteurs (réservation de table, hébergement hôtelier, cartes de restaurant, présentation d'équipes).
- **Problème identifié** : Ces composants n'ont pas de tables dédiées persistées en production : ils réinterprètent les produits standards de la table `products` ou ouvrent un lien WhatsApp.

---

## 6. Architecture frontend

### Flux de données frontend global

```text
               UTILISATEUR (Interaction / Recherche / Achat)
                                  │
                                  ▼
                     Next.js App Router (Client / SSR)
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
  (Mode Hors-Ligne / 0ms)                         (Mode Connecté / API)
         │                                                 │
         ▼                                                 ▼
Dexie.js (IndexedDB 'VeStyleDB')                 Endpoints Next.js (/api/*)
  ├── products (cache local)                               │
  ├── stores (cache local)                        Supabase Client SDK
  ├── cart (persistance locale)                            │
  ├── wishlist (persistance locale)               PostgreSQL (Supabase)
  └── pendingOrders (file d'attente)                       │
         ▲                                                 │
         └───────────── useOfflineSync ────────────────────┘
                  (Synchronisation en tâche de fond)
```

### Gestion de l'état
1. **État Global applicatif** :
   - **Authentification** : [`AuthContext.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/context/AuthContext.js) (gère `user`, `profile`, `store`, synchronisé dans `localStorage`).
   - **Panier** : [`CartContext.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/context/CartContext.js) (gestion du panier multi-boutiques, calcul de remises par paliers MOQ, synchronisé en temps réel dans Dexie et `localStorage`).
   - **Cache serveur** : `ReactQueryProvider.jsx` (`@tanstack/react-query`) configuré mais sous-exploité (la majorité des composants utilisent des `useEffect` natifs avec `fetch` manuel).
2. **État Local d'Édition** :
   - [`useOfflineBuilder.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/offline-builder/useOfflineBuilder.js) : gère l'état complet de la boutique en cours de modification dans IndexedDB.
   - [`useStoreHistory.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/history-engine/useStoreHistory.js) : pile d'historique locale gérant jusqu'à 40 étapes d'annulation (Undo / Redo).

### Stratégie de mise en cache
- **Service Worker v6.1** ([`public/sw.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/public/sw.js)) :
  - `Cache-First` pour les assets statiques et images (TTL de 7 jours).
  - `Stale-While-Revalidate` pour les scripts bundles Next.js.
  - `Network-First` avec bascule automatique vers Dexie.js pour les requêtes de données produits et boutiques.
- **Cache HTTP** ([`next.config.mjs`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/next.config.mjs)) :
  - Cache immutable de 1 an sur `/_next/static/*`.
  - Cache de 7 jours sur les images Cloudinary et Unsplash.
  - `no-store` strict sur `/api/auth/*` et `/api/admin/*`.

---

## 7. Architecture backend

L'architecture backend repose entièrement sur les capacités serverless de Next.js (Node.js runtime) hébergées sur Vercel, associées aux services managés de Supabase.

### Organisation du backend applicatif
1. **API Route Handlers (`src/app/api/`)** :
   - 42 routes HTTP REST répondant au format JSON standard.
   - Séparation stricte entre les clés d'accès publiques (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) et les accès privilégiés utilisant `SUPABASE_SERVICE_ROLE_KEY` via [`supabaseAdmin.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/supabaseAdmin.js).
2. **Server Actions (`src/app/admin/actions.js`)** :
   - Actions serveur Next.js avec directive `'use server'` utilisées exclusivement pour les opérations super-administrateur (changement de statut boutique, suppression, diffusion du Morning Pulse).
3. **Bouclier de Sécurité Middleware ([`src/middleware.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/middleware.js))** :
   - Analyse chaque requête entrante avant d'atteindre le code de l'application.
   - **Protection Anti-Scraping** : Liste noire de plus de 40 expressions régulières de User-Agents (scrapers Python, Puppeteer, Selenium, bots IA). *Note d'attention : l'expression `/antigravity/i` figure à la ligne 55 de la liste noire*.
   - **Honeypot** : Interception de faux chemins d'exploration (`/sitemap-products.xml`, `/api/data/dump`) retournant des données vides piégées.
   - **Rate Limiting** : Limite glissante en mémoire par IP (80 req/min pour les APIs standard, 10 req/min pour la recherche visuelle).
   - **Authentification HTTP Basic** : Protection de la zone `/admin`.

---

## 8. Architecture Supabase

### Schéma relationnel et structure des tables

```text
                     profiles (auth.users cascade)
                         │
                         │ 1:N (owner_id)
                         ▼
                       stores
                         │
         ┌───────────────┼──────────────────────────────┐
         │ 1:N           │ 1:N                          │ 1:N
         ▼               ▼                              ▼
     categories       products ◄────── product_variants   orders
         │               │              (id, product_id, (id, store_id, total,
         │ 1:N           │ 1:N           attributes,     customer_phone,
         └───────────────┼─────────┐     price_extra)    order_items JSONB)
                         │         │                        │
                         ▼         ▼                        ▼
                 cart_items   product_reviews      delivery_tracking
                 (user_id,    (product_id, rating, (order_id, lat, lng,
                  product_id)  comment)             livreur_id)
```

### Détail des tables principales

#### 1. `profiles`
- **Rôle** : Profil public de l'utilisateur rattaché au compte `auth.users`.
- **Colonnes clés** : `id (UUID PK)`, `email`, `full_name`, `avatar_url`, `created_at`.
- **RLS** : Lecture et mise à jour réservées au propriétaire (`auth.uid() = id`).
- **Triggers** : `on_auth_user_created` créant automatiquement la ligne lors d'un signup.

#### 2. `stores`
- **Rôle** : Entité commerçant / boutique.
- **Colonnes clés** : `id (UUID PK)`, `owner_id (FK profiles)`, `name`, `slug (unique)`, `store_code (VARCHAR 5 unique)`, `description`, `logo_url`, `banner_url`, `theme_color`, `secondary_color`, `font_family`, `city`, `phone`, `latitude`, `longitude`, `is_active`, `is_boosted`, `daily_views`, `status`, `activity_type`, `theme_config (JSONB)`, `layout_config (JSONB)`, `social_links (JSONB)`.
- **RLS** : Lecture publique (`true`), écriture réservée au propriétaire (`owner_id = auth.uid()`).
- **Triggers** : `ensure_store_code` générant un code permanent à 5 chiffres (ex: `04812`).

#### 3. `categories` et `global_categories`
- **Rôle** : Système double de classification. `categories` est local à chaque boutique (`store_id, slug`), tandis que `global_categories` (`id, name, slug, icon, parent_id`) normalise l'univers au niveau de la marketplace.
- **Problème** : Les produits possèdent à la fois une colonne texte `category`, une clé étrangère locale `category_id` et une clé globale `global_category_id`.

#### 4. `products`
- **Rôle** : Catalogue des articles physiques et services vendus.
- **Colonnes clés** : `id (UUID PK)`, `store_id (FK)`, `category_id (FK)`, `global_category_id (FK)`, `name`, `description`, `price`, `old_price`, `image_url`, `images (TEXT[])`, `stock_quantity`, `is_active`, `is_boosted`, `is_promo`, `daily_views`, `offer_type ('product'|'service')`, `image_embedding_1024 (vector(1024))`, `ai_caption`, `ai_tags (TEXT[])`.
- **RLS** : Lecture publique, modification réservée au propriétaire du magasin associé.
- **Index** : Index vectoriel HNSW `products_hnsw_image_1024_idx` utilisant `vector_cosine_ops`, index GIN sur `ai_tags`, index Trigram sur `ai_caption`.

#### 5. `orders`
- **Rôle** : Commandes passées par les clients.
- **Colonnes clés** : `id (UUID PK)`, `store_id (FK)`, `customer_name`, `customer_phone`, `customer_email`, `total_amount`, `status ('pending'|'processing'|'shipped'|'delivered'|'cancelled')`, `order_items (JSONB)`, `shipping_address`, `delivery_lat`, `delivery_lng`, `delivery_agent_id (FK profiles)`, `livreur_id (FK livreurs)`, `livreur_token`.
- **RLS** : Insertion publique (permet l'achat invité sans login), lecture restreinte au propriétaire du magasin.

#### 6. `delivery_tracking`
- **Rôle** : Télémétrie GPS en temps réel pour le coursier.
- **Colonnes clés** : `id (UUID PK)`, `order_id (FK)`, `livreur_id (FK)`, `lat`, `lng`, `accuracy`, `updated_at`.
- **Realtime** : Publication active sur `supabase_realtime`.

#### 7. Tables secondaires actives
- `store_modules` : Modules activés par boutique (`type`, `label`, `position`, `config JSONB`).
- `livreurs` : Équipe de coursiers déclarée par une boutique.
- `promotions` : Offres promotionnelles planifiées avec compte à rebours.
- `store_versions` : Snapshots d'historique de configuration de boutique.
- `fcm_tokens` : Jetons d'appareils mobiles pour notifications Firebase.
- `notifications` : Alertes internes du dashboard vendeur.

#### 8. Tables fantômes (créées dans les scripts mais non exploitées)
- `reservations`, `restaurant_menu`, `devis_requests`, `events`, `tickets`, `portfolio_items`, `testimonials`, `subscriptions`, `store_clients`. Ces tables sont présentes dans le script SQL de migration mais aucune page du frontend ne lit ou n'écrit dedans.

---

## 9. Modèles de données métier

### 1. Boutique (`Store`)
- **Frontend** : Objet consommé par `StorefrontClient`, `LiveCanvas`, `DashboardLayout`.
- **Base de données** : Table `stores`.
- **Champs clés** : `name`, `slug`, `store_code`, `theme_color`, `layout_config`, `theme_config`.
- **Problème** : Deux colonnes stockent la disposition de la boutique : `layout_config` (format v1/v2) et `theme_config` (format palette), complétées par les lignes de la table `store_modules`. Il n'y a pas de schéma canonique unique respecté par tous les formulaires.

### 2. Produit / Prestation (`Product`)
- **Frontend** : Composants `ProductCard`, `ProductClient`, `ProductMasterRenderer`.
- **Base de données** : Table `products`.
- **Champs clés** : `name`, `price`, `stock_quantity`, `image_url`, `images[]`, `offer_type`.
- **Problème** : Les prestations de services sont stockées dans la même table `products` avec `offer_type = 'service'`, alors qu'une migration distincte avait créé une table `services` inutilisée.

### 3. Panier & Article Panier (`CartItem`)
- **Frontend** : [`CartContext.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/context/CartContext.js).
- **Base de données** : Table `cart_items` en base (pour utilisateurs connectés) + Dexie `cart` (hors-ligne).
- **Format** : `{ id, storeId, name, price, quantity, image, selectedVariants, moq_tier1, moq_discount1 }`.

### 4. Commande (`Order`)
- **Frontend** : [`src/app/cart/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/cart/page.js), [`src/app/dashboard/orders/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/dashboard/orders/page.js), [`src/app/suivi/[id]/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/suivi/%5Bid%5D/page.js).
- **Base de données** : Table `orders`.
- **Format** : L'ensemble des articles commandés est encapsulé dans le champ JSONB `order_items`.

### 5. Livraison & Coursier (`Livreur`)
- **Frontend** : [`src/app/delivery/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/delivery/page.js), [`DeliveryEstimator.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/DeliveryEstimator.jsx).
- **Base de données** : Table `livreurs` et table `delivery_tracking`.
- **Format** : Coordonnées GPS brutes transmises via l'API Geolocation du navigateur.

---

## 10. Fonctionnalités existantes

| Fonctionnalité | Existe ? | Frontend | Backend / API | Base de données | Statut opérationnel | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentification Client & Vendeur** | Oui | `/login`, `/signup`, `AuthContext` | Supabase Auth SSR | `auth.users`, `profiles` | **FONCTIONNELLE** | Supabase Auth |
| **Recherche Visuelle par Photo** | Oui | `VisualSearchModal`, `VestyleLens` | `/api/search/visual` | `products.image_embedding_1024` | **FONCTIONNELLE** | Jina CLIP v2, Supabase RPC |
| **Recherche Sémantique Multimodale**| Oui | `SearchAutocomplete`, `/search` | `/api/search/semantic` | `match_products_v2` | **FONCTIONNELLE** | Jina CLIP v2, pgvector |
| **Recherche Vocale** | Oui | `VoiceSearchButton` | Aucun (Web API) | Aucun | **FONCTIONNELLE** | Navigateur Web Speech API |
| **Géolocalisation & Filtre Distance**| Oui | `InteractiveMap`, `useDistance` | Aucun (calcul client)| `stores.latitude, longitude` | **FONCTIONNELLE** | Leaflet, Haversine client |
| **Catalogue & Gestion Produits** | Oui | `/dashboard/products`, `add-product`| Supabase SDK direct | `products`, `product_variants`| **FONCTIONNELLE** | Cloudinary |
| **Panier d'achat avec remises MOQ** | Oui | `CartContext`, `/cart` | Dexie.js + Client | Table `orders` | **FONCTIONNELLE** | Dexie.js, localStorage |
| **Validation Commande (Checkout)** | Oui | `/cart` | Insertion directe | Table `orders` | **FONCTIONNELLE** | Supabase RLS |
| **Suivi GPS Livreur en Direct** | Oui | `/delivery`, `/suivi/[id]` | Supabase Realtime | `orders`, `delivery_tracking` | **FONCTIONNELLE** | Realtime WebSockets |
| **Génération Facture / Reçu PDF** | Oui | `/suivi/[id]/invoice` | Client (`jspdf`) | Table `orders` | **FONCTIONNELLE** | jsPDF, html2canvas |
| **Export Catalogue PDF Vendeur** | Oui | `DownloadCatalogButton.jsx` | Client (`jspdf`) | `products`, `stores` | **FONCTIONNELLE** | jsPDF, html2canvas |
| **Éditeur de Boutique (Builder)** | Oui | `/builder/[storeId]`, `LiveCanvas` | Offline sync | Dexie `builderLocalStore` | **FONCTIONNELLE** | Dexie.js, LiveCanvas |
| **Générateur IA de Boutique** | Oui | `/onboarding` | `/api/ai/generate-store`| `stores`, `store_modules` | **FONCTIONNELLE** | Mistral AI (`mistral-large`) |
| **Chatbot IA Boutique & Vente** | Oui | `StoreChatWidget.jsx`, `StoreAIChat` | `/api/chat` | `products` | **FONCTIONNELLE** | Mistral AI (`mistral-small`) |
| **Passerelle IA Builder (Actions)** | Oui | `InspectorPanel` | `/api/ai/gateway` | `store_versions` | **FONCTIONNELLE** | Mistral AI, AIGateway |
| **Gestion des Promotions & Ventes Flash**| Oui | `/dashboard/promotions` | `/api/promotions`, `/cron/flash-sales`| `promotions` | **FONCTIONNELLE** | Supabase Cron |
| **Notifications Push (FCM + WebPush)**| Oui | `useFirebaseNotifications` | `/api/notifications/send`| `fcm_tokens`, `notification_logs`| **FONCTIONNELLE** | Firebase FCM, Web-Push |
| **Envoi d'Emails Transactionnels** | Oui | Non | `/api/emails/notify` | Resend API | **FONCTIONNELLE** | Resend |
| **Mode Hors-Ligne (PWA)** | Oui | `/offline`, `public/sw.js` | Service Worker | Dexie.js (`VeStyleDB`) | **FONCTIONNELLE** | Service Worker Cache API |
| **Réservation de Tables / Chambres**| Partielle | `BookingMasterRenderer` | Aucun | Aucune (table `reservations` vide)| **MOCK / WHATSAPP** | Lien WhatsApp (`wa.me`) |
| **Devis sur mesure** | Partielle | `QuoteEngine.js` | Aucun | Aucune (table `devis_requests` vide)| **MOCK / WHATSAPP** | Lien WhatsApp (`wa.me`) |
| **Billetterie / Événements** | Partielle | Aucun affichage public | Aucun | Tables `events`, `tickets` vides | **INCOMPLÈTE / MORTE** | Aucune |
| **Paiement Mobile Money direct** | Non | Mention visuelle seulement | Aucun endpoint | Aucun | **UI SEULEMENT** | Simulé en Cash / WhatsApp |

---

## 11. Templates existants

Le projet contient **quatre systèmes de templates distincts** qui ne communiquent pas entre eux :

### Système 1 : Les 5 Templates Monolithiques JSX ([`src/templates/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/templates))
- **Fichiers** : `TemplateBoutique.jsx`, `TemplateBoutiquePro.jsx`, `TemplatePresta.jsx`, `TemplateResto.jsx`, `TemplateTechPro.jsx`.
- **Structure** : Composants React massifs (>300 lignes chacun) avec du code HTML, de la navigation interne (onglets `accueil`, `produits`, `panier`, `contact`) et des styles CSS injectés via `<style>{`...`}</style>`.
- **Couplage** : Couplage fort entre le balisage visuel et les données attendues.
- **Statut actuel** : Actuellement ignorés par `StorefrontClient.js` en raison du flag `isVestineLiveStore = true`.

### Système 2 : Les 8 Packs Déclaratifs Officiels ([`src/lib/template-packages/officialTemplates.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/template-packages/officialTemplates.js))
- **IDs** : `electronics_modern_commerce`, `electronics_editorial_tech`, `fashion_editorial`, `fashion_minimal_luxury`, `salon_premium`, `restaurant_contemporary`, `hotel_luxury_hospitality`, `photographer_portfolio`.
- **Structure** : JSON pur conforme au schéma package 2.0 (méta, tokens de thème, liste ordonnée de sections et pages).
- **Validation** : Validés par un Quality Gate technique ([`TemplateQualityGate.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/template-packages/TemplateQualityGate.js)) interdisant toute injection de code JavaScript ou HTML exécutable.
- **Réutilisabilité** : Excellente base d'inspiration pour le futur moteur Vestin.

### Système 3 : La Bibliothèque Métier de 18 Templates ([`src/lib/template-library/templateLibrary.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/template-library/templateLibrary.js))
- **IDs** : `hotel_001`, `hotel_002`, `salon_001`, `resto_001`, `retail_001`, etc.
- **Structure** : Configurations JSON de sections déclaratives avec politique stricte anti-données fictives (`fakeDataPolicy: 'NONE'`).

### Système 4 : Les Presets d'Onboarding ([`src/lib/storeTemplates.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/storeTemplates.js))
- **IDs** : `restaurant`, `tech_pro`, `fashion_luxe`, `beauty_salon`, `artisan_atelier`, `boutique_pro`.
- **Structure** : Presets utilisés lors du questionnaire initial d'onboarding pour attribuer une palette et un vocabulaire adapté (`cartTitle`, `orderButton`).

---

## 12. Thèmes existants

Il existe actuellement **trois sous-systèmes de thèmes concurrents** :

### 1. Le catalogue des 22 Thèmes de Boutiques ([`src/app/boutique/[slug]/themes/index.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/themes/index.js))
- Définis de `theme_00` (VesTyle Classique) à `theme_21` (Papier & Écriture).
- **Problème identifié** : Le fichier exporte un tableau `THEME_COMPONENTS` contenant 22 composants d'habillage React (`Theme00_Classic.js` à `Theme21_Paper.js`). Cependant, ces 22 composants sont **du code mort** : [`StorefrontClient.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/StorefrontClient.js#L217) n'importe que la fonction `getThemeById()` pour en extraire les variables de couleurs CSS (`--prim`, `--acc`, `--bg`, `--fg`, `--font`). Les composants visuels ne sont jamais rendus.

### 2. Le ThemeEngine déclaratif ([`src/lib/theme-engine/ThemeEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/theme-engine/ThemeEngine.js))
- Modèle déclaratif pur générant un arbre de tokens :
  - `colors` : `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `muted`, `border`.
  - `typography` : `fontFamily`, `headingFont`, `fontScale`.
  - `spatial` : `cardRadius` (`sharp`, `rounded`, `pill`, `smooth`), `density` (`compact`, `comfortable`, `spacious`), `shadowStyle`, `blurEnabled`.
- Fournit 6 palettes prédéfinies : `emerald_luxury`, `gold_dark`, `pink_glow`, `tech_violet`, `terracotta_warm`, `clean_blue`.

### 3. Les styles d'onboarding ([`src/app/api/ai/generate-store/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/ai/generate-store/route.js#L43))
- Dictionnaire `STYLE_TO_THEME` attribuant 6 profils (`elegant`, `vibrant`, `dark`, `natural`, `luxury`, `tech`) stockés dans la colonne `stores.theme_config`.

---

## 13. Fonctionnalités IA

### Modèles et Intégrations Détectés

#### 1. Recherche Visuelle Multimodale (Image-to-Vector)
- **Modèle** : `jina-clip-v2` hébergé par l'API Jina AI.
- **Pipeline** : Image (Buffer ou base64) ➔ Requête REST vers Jina ➔ Embedding normalisé 1024D ➔ RPC Supabase `match_products_v2` (calcul de similarité cosinus via index HNSW pgvector).
- **Temps de réponse constaté dans le code** : ~300ms à 500ms.
- **Fallback Space Hugging Face** : Présence du code source complet d'un Space FastAPI ([`huggingface_space/app.py`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/huggingface_space/app.py)) combinant Florence-2 (OCR et captioning textuel), DINOv2 et SigLIP (fusion pondérée 60/40 en vecteur 1024D).

#### 2. Chatbot Vendeur Conversationnel & Transactionnel
- **Endpoint** : [`/api/chat/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/chat/route.js).
- **Modèle** : Mistral AI (`mistral-small-latest`).
- **Fonctionnement** : Le serveur charge en temps réel les 60 premiers produits actifs de la boutique depuis Supabase, injecte le catalogue dans le System Prompt, force la sortie en `json_object` et interprète des actions concrètes exécutables côté client :
  - `add_to_cart` (avec quantité et ID produit vérifié).
  - `show_cart`.
  - `place_order` (déclenché après recueil vérifié du nom et du téléphone client).

#### 3. Générateur de Boutique par Langage Naturel
- **Endpoint** : [`/api/ai/generate-store/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/ai/generate-store/route.js).
- **Modèle** : Mistral AI (`mistral-large-latest`).
- **Rôle** : Reçoit les réponses du questionnaire d'onboarding, rédige un slogan et une description commerciale percutante, sélectionne une palette et configure les entrées dans `store_modules`.

#### 4. Passerelle d'Actions du Builder (Vestin AI Kernel)
- **Module** : [`src/lib/ai-kernel/AIGateway.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/ai-kernel/AIGateway.js) et [`VestinKernelExecutor.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/ai-kernel/VestinKernelExecutor.js).
- **Rôle** : Traduit des consignes vendeur (ex: *"mets la boutique en mode sombre avec des touches dorées"*) en actions déterministes validées (`UPDATE_THEME`, `UPDATE_SECTION_VARIANT`, `ADD_SECTION`) sans jamais générer de code source arbitraire.

---

## 14. Intégrations externes

```text
SECRET DETECTED — Toutes les clés API, tokens et secrets ont été masqués conformément aux consignes de sécurité.
```

| Service | Rôle & Utilité | Emplacement dans le code | Mode d'appel | Risques identifiés |
| :--- | :--- | :--- | :--- | :--- |
| **Supabase** | Base de données relationnelle, Authentification, Realtime WebSockets | [`src/lib/supabase.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/supabase.js), [`supabaseAdmin.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/supabaseAdmin.js) | SDK JS `@supabase/supabase-js` | Clés de service utilisées dans plusieurs Server Actions et API routes sans contrôle strict de rôle admin |
| **Jina AI** | Calcul d'embeddings vectoriels 1024D pour images et textes | [`src/lib/vectorSearchProvider.mjs`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/vectorSearchProvider.mjs) | API REST HTTPS (`api.jina.ai`) | Dépendance externe directe ; interruption de service si quota dépassé |
| **Mistral AI** | Chatbot vendeur, génération de contenu, orchestration IA | [`src/app/api/chat/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/chat/route.js), `ai-kernel` | SDK `@mistralai/mistralai` + Fetch REST | Consommation de tokens par requête ; temps de réponse variable |
| **Cloudinary** | Stockage, optimisation et transformation d'images produits | [`src/lib/cloudinary.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/cloudinary.js), `/api/cloudinary` | SDK Cloudinary Node.js | Quotas de stockage et de bande passante sur plan gratuit |
| **Firebase Cloud Messaging** | Notifications push mobiles et web | [`src/lib/firebaseAdmin.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/firebaseAdmin.js), `useFirebaseNotifications.js` | SDK Firebase Admin | Clé privée de service account présente dans `.env.local` |
| **Web Push (VAPID)** | Notifications web natives alternatives | `/api/notifications/send` | Bibliothèque `web-push` | Redondance architecturale avec Firebase FCM |
| **Resend** | Envoi d'emails transactionnels (Matin Pulse, alertes) | `/api/emails/notify` | SDK `resend` | Configuration d'expéditeur et nom de domaine requis pour la délivrabilité |
| **Hugging Face Space** | Backend Python alternatif pour vision IA lourde | [`huggingface_space/app.py`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/huggingface_space/app.py), `/api/cron/warmup` | API HTTP REST externe | Cold start important (30-90s) atténué par le cron de warmup |
| **OpenStreetMap / Leaflet**| Cartographie et calcul d'itinéraires | [`src/components/InteractiveMap.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/InteractiveMap.js) | Tuiles OSM gratuites | Pas de coût, mais latence possible sur réseau mobile camerounais |
| **WhatsApp Business Web Link**| Négociation et finalisation de commandes | Partout dans le frontend (`wa.me`) | Liens profonds d'URL | Très adapté au marché camerounais, mais perte de traçabilité après redirection |

---

## 15. Données réelles / mock / hardcodées

### Données réelles (Production Supabase & Dexie)
- Comptes utilisateurs et profils dans `profiles`.
- Boutiques enregistrées dans `stores`.
- Produits et variantes de stock dans `products` et `product_variants`.
- Commandes réelles enregistrées dans `orders`.
- Coordonnées GPS réelles des coursiers dans `delivery_tracking`.
- Catégories marketplace dans `global_categories`.
- Promotions actives dans `promotions`.

### Données mock (Démonstration & Fallbacks)
- **Galerie de headers** ([`src/app/admin/headers-gallery/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/admin/headers-gallery/page.js#L25)) : Objet `MOCK_STORE` ("Maison Vestine Douala", fausses coordonnées).
- **Analytiques SQL** ([`supabase/setup_premium_features.sql`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/supabase/setup_premium_features.sql#L23)) : Fonction `get_store_weekly_analytics` qui simule artificiellement les ventes par division du nombre de vues : `COALESCE(SUM(v.views_count) / 10, 0)::INT as total_sales`.
- **Images de secours unifiées** : Dans [`HeroMasterRenderer.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/component-libraries/renderers/HeroMasterRenderer.jsx#L47), dictionnaire d'images Unsplash pour l'électronique, la mode, la beauté, l'hôtellerie et la restauration.

### Données hardcodées dans le code source
- **Mot de passe Admin** : Dans [`src/middleware.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/middleware.js#L169), repli en dur sur `'vestyle2026'`.
- **Token de nettoyage de base** : Dans [`src/app/api/admin/cleanup-database/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/admin/cleanup-database/route.js#L16), repli en dur sur `'ADMIN_SECRET_KEY_12345'`.
- **Tarifs de livraison moto** :
  - 16 quartiers de Douala et Yaoundé avec tarifs fixes (1 000 à 2 000 FCFA) dans [`src/lib/deliveryCalculator.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/deliveryCalculator.js).
  - 5 zones de livraison avec tarifs différents (1 500 à 3 500 FCFA) dans [`src/lib/delivery-engine/DeliveryEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/delivery-engine/DeliveryEngine.js).
- **Génération automatique de boutique** : Dans [`AuthContext.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/context/AuthContext.js#L165), si aucun magasin n'existe à la connexion, insertion directe d'un nom codé en dur `Boutique de [Prénom]` avec slug aléatoire.

---

## 16. Duplications détectées

### 1. Composants de blocs : `src/blocks/` vs `src/components/blocks/`
- **Élément A** : [`src/blocks/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks) (17 composants : `HeaderBlock`, `HeroBlock`, `CategoryBlock`, etc. utilisés par `blockEngine/renderer.js`).
- **Élément B** : [`src/components/blocks/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/blocks) (15 composants : `HeroBlock`, `CarouselBlock`, `ContactFormBlock`, etc.).
- **Pourquoi ils sont similaires** : Ils implémentent exactement les mêmes briques d'interface avec des props et du markup presque identiques.
- **Risque** : Des corrections de bugs ou améliorations apportées à un composant ne sont pas répercutées sur l'autre.
- **Recommandation future** : Fusionner dans un catalogue de blocs unique.

### 2. Registres de composants : 3 registres distincts
- **Élément A** : [`src/lib/componentRegistry.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/componentRegistry.js) (60 blocs, utilisé par `store-advisor`).
- **Élément B** : [`src/lib/blockEngine/registry.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/blockEngine/registry.js) (60 blocs unifiés avec types de props).
- **Élément C** : [`src/lib/component-registry/ComponentRegistry.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/component-registry/ComponentRegistry.js) (Registre Vestine gérant les 10 familles `hero_001`, `header_001`).
- **Différences** : Structures de données incompatibles (l'un utilise `props: { ... }`, l'autre `settings: { ... }` et `content: { ... }`, le troisième `defaultConfig` et `editableProperties`).
- **Risque** : Impossible d'avoir un éditeur universel stable si trois registres cohabitent.

### 3. Calcul de livraison : `deliveryCalculator.js` vs `DeliveryEngine.js`
- **Élément A** : [`src/lib/deliveryCalculator.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/deliveryCalculator.js) (matrice précise par quartier : Akwa, Bastos, Bonapriso).
- **Élément B** : [`src/lib/delivery-engine/DeliveryEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/delivery-engine/DeliveryEngine.js) (matrice simplifiée par zone : Centre, Périphérie, Interurbain).
- **Risque** : Deux prix de livraison différents peuvent être présentés au client selon le composant affiché.

### 4. Notifications Push : Web Push VAPID vs Firebase FCM
- Deux systèmes complets avec leurs tables respectives (`push_subscriptions` vs `fcm_tokens`), deux SDK serveurs (`web-push` vs `firebase-admin`).

---

## 17. Couplages détectés

### 1. `StorefrontClient.js` → Forçage brutal de LiveCanvas
- **Fichier** : [`src/app/boutique/[slug]/StorefrontClient.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/StorefrontClient.js#L236)
- **Dépendance** : `const isVestineLiveStore = Boolean(... || true);`
- **Problème** : La présence du `|| true` empêche tout rendu via les templates classiques ou le Block Engine. Même si le vendeur n'a jamais configuré de LiveCanvas, la page tente de générer un `vestineStoreConfig` par défaut.
- **Impact futur** : Impossibilité de tester d'autres moteurs tant que cette ligne n'est pas assainie.

### 2. `CartPage` → Insertion directe en base Supabase côté client
- **Fichier** : [`src/app/cart/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/cart/page.js#L116)
- **Dépendance** : `supabase.from('orders').insert(...)` exécuté directement dans le navigateur du client.
- **Problème** : L'interface utilisateur calcule les totaux et insère la commande sans passer par un endpoint serveur de validation de prix.
- **Impact futur** : Faille de sécurité majeure (le client peut manipuler le total financier) et impossibilité de centraliser la logique métier de commande.

### 3. `AuthContext.js` → Création automatique de boutique non sollicitée
- **Fichier** : [`src/context/AuthContext.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/context/AuthContext.js#L156)
- **Dépendance** : Requête d'insertion `stores.insert(...)` déclenchée automatiquement dès qu'un utilisateur se connecte et n'a pas de magasin.
- **Problème** : Tout utilisateur (même simple acheteur ou coursier) se voit attribuer une boutique fantôme en base de données.
- **Impact futur** : Pollution massive de la table `stores` avec des boutiques vides.

### 4. Templates monolithiques → Balises `<style>` injectées
- **Fichiers** : [`TemplateBoutique.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/templates/TemplateBoutique.jsx), [`TemplateResto.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/templates/TemplateResto.jsx), etc.
- **Dépendance** : Injection de blocs CSS sous forme de strings brutes dans le DOM.
- **Problème** : Les styles de police, de fond et de disposition sont indissociables des composants.
- **Impact futur** : Empêche l'indépendance stricte entre le thème graphique et la structure des blocs.

---

## 18. Problèmes architecturaux

1. **Absence de contrat de données unifié pour une vitrine de boutique** :
   Une boutique est configurée à la fois dans les colonnes simples de `stores` (`theme_color`, `font_family`), dans la colonne `theme_config` (JSONB), dans `layout_config` (JSONB), dans la table relationnelle `store_modules` (lignes de modules), et dans le modèle IndexedDB `storeConfigModel` (pages + sections). Aucun standard unique ne fédère ces formats.
2. **Fragmentation du catalogue de composants** :
   Le projet navigue entre une promesse de 1 100 composants virtuels et une réalité de quelques composants maîtres paramétrés. Le modèle mental du système est brouillé entre "100 variantes par famille" et "des master renderers avec des flags conditionnels".
3. **Schéma de base de données non synchronisé avec le code** :
   Plusieurs tables créées dans les scripts SQL (`reservations`, `restaurant_menu`, etc.) ne sont pas connectées à l'interface, tandis que des colonnes essentielles comme `order_items` ont été réduites à du JSONB non typé au lieu d'un schéma relationnel exploitable pour des statistiques fines.
4. **Mélange des responsabilités Client/Serveur** :
   Des calculs critiques (prix du panier, génération des commandes, création automatique de magasins) sont dévolus au navigateur client au lieu d'être sécurisés sur le serveur.

---

## 19. Problèmes de sécurité

1. **Exposition de secrets critiques en environnement local** :
   Le fichier `.env.local` et le script [`inspect_schema.mjs`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/inspect_schema.mjs#L7) contiennent des identifiants directs vers la base de données de production PostgreSQL (port 6543 pooler Supabase avec mot de passe en clair).
2. **Identifiants d'administration par défaut dans le code source** :
   - [`src/middleware.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/middleware.js#L169) : Repli sur le mot de passe d'administration `'vestyle2026'` si `process.env.ADMIN_PASSWORD` est manquant.
   - [`src/app/api/admin/cleanup-database/route.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/admin/cleanup-database/route.js#L16) : Repli sur le token d'administration `'ADMIN_SECRET_KEY_12345'`.
3. **Absence de validation serveur sur les créations de commandes** :
   La table `orders` autorise l'insertion publique via la policy RLS `Anyone can create an order for insert with check (true)`. N'importe quel client peut envoyer une requête POST avec un `total_amount` nul ou falsifié.
4. **Politiques RLS sur `cart_items` et `stores`** :
   La table `stores` permet l'insertion directe par tout utilisateur authentifié. En conjonction avec le trigger client dans `AuthContext`, un attaquant peut générer des milliers de boutiques par script.
5. **Blocage accidentel d'outils de développement** :
   Dans [`src/middleware.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/middleware.js#L55), l'expression régulière `/antigravity/i` figure dans la liste des scrapers malveillants à bloquer en 403, risquant de rejeter des outils légitimes portant ce nom.

---

## 20. Problèmes de performance pertinents

1. **Poids excessif de la page d'accueil et des bundles initiaux** :
   [`src/app/page.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/page.js) (50 Ko) et [`ClientDiscovery.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/ClientDiscovery.js) (47 Ko) chargent simultanément de multiples bibliothèques lourdes : Leaflet, Three.js, Lucide-react, Framer-motion, canvas-confetti. Bien qu'`InteractiveMap` soit chargé avec `next/dynamic({ ssr: false })`, l'empreinte JavaScript initiale reste très importante pour un réseau mobile 3G/4G au Cameroun.
2. **Boucles de re-rendering dans l'éditeur** :
   Dans [`useVisualInteraction.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/visual-engine/useVisualInteraction.js) et [`LiveCanvas.jsx`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/visual-engine/LiveCanvas.jsx), chaque modification minime de position ou d'échelle de logo déclenche un clonage profond (`JSON.parse(JSON.stringify(storeConfig))`) et une mise à jour d'IndexedDB sans debounce suffisant, provoquant des saccades sur appareils mobiles.
3. **Requêtes N+1 potentielles lors du chargement des boutiques** :
   Dans [`StorefrontClient.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/StorefrontClient.js#L127), trois requêtes consécutives non groupées interrogent `stores`, puis `store_modules`, puis `products`.
4. **Index HNSW et mémoire pgvector** :
   L'index `products_hnsw_image_1024_idx` sur des vecteurs à 1024 dimensions consomme une quantité significative de RAM dans l'instance Supabase. Lorsque le catalogue atteindra des milliers d'articles, la mémoire vive du tier gratuit de Supabase risque d'être saturée si des opérations d'indexation massives sont lancées sans pagination.

---

## 21. Éléments à conserver

Les briques suivantes sont solides, testées, stables et doivent servir de fondations techniques :

1. **Le pipeline de recherche visuelle et multimodale** :
   - [`src/lib/vectorSearchProvider.mjs`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/vectorSearchProvider.mjs) (Jina CLIP v2, embeddings 1024D).
   - Les endpoints [`/api/search/visual`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/search/visual/route.js) et [`/api/search/semantic`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/api/search/semantic/route.js).
   - La fonction RPC PostgreSQL `match_products_v2` avec l'index HNSW.
2. **Le système Offline-First & Cache Local** :
   - La base Dexie.js dans [`src/lib/db.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/db.js).
   - Le Service Worker [`public/sw.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/public/sw.js) v6.1 et ses stratégies de mise en cache granulaire.
   - Le hook de synchronisation locale [`useOfflineData.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/hooks/useOfflineData.js).
3. **Le système de traçabilité des données** :
   - [`src/lib/content-source/ContentSource.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/content-source/ContentSource.js) et ses marqueurs stricts (`REAL_STORE_DATA`, `DEMO_DATA`, `AI_GENERATED_DRAFT`).
4. **Le registre de capacités et types d'activités** :
   - [`src/lib/capability-engine/CapabilityEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/capability-engine/CapabilityEngine.js) (les 22 capacités canoniques).
   - [`src/lib/business-types/businessTypeDefinitions.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/business-types/businessTypeDefinitions.js) (définitions métiers exhaustives).
5. **Le système de validation des packages** :
   - [`src/lib/template-packages/TemplateQualityGate.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/template-packages/TemplateQualityGate.js) (pare-feu anti-injection de code exécutable).
6. **Le catalogue déclaratif de référence** :
   - [`src/lib/template-packages/officialTemplates.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/template-packages/officialTemplates.js) (les 8 templates JSON purs).
7. **La pile de télé-suivi des livreurs en temps réel** :
   - Le couplage WebSocket Supabase Realtime entre [`/delivery`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/delivery/page.js) et [`/suivi/[id]`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/suivi/%5Bid%5D/page.js).

---

## 22. Éléments à refactoriser

1. **`StorefrontClient.js`** :
   Supprimer le court-circuit `|| true` à la ligne 236 et implémenter un aiguillage propre et déterministe entre le moteur adaptatif et les configurations stockées.
2. **`ClientDiscovery.js` & `src/app/page.js`** :
   Décomposer ce monolithe de 878 lignes en composants spécialisés : barre de recherche autonome, grille de catégories découplée, carte géographique isolée, grille de résultats avec pagination propre.
3. **`AuthContext.js`** :
   Retirer la création automatique de boutique lors du login. La création d'une boutique doit être un acte volontaire du vendeur (via `/onboarding`), et non un effet de bord du hook d'authentification.
4. **Flux de Commande (`/cart` et `/api/orders`)** :
   Créer un endpoint d'API sécurisé `/api/orders/checkout` qui vérifie l'existence des produits, recalcule les prix côté serveur, applique les remises MOQ validées, et insère la commande avec le rôle de service.
5. **Les MasterRenderers (`HeroMasterRenderer`, `ProductMasterRenderer`, etc.)** :
   Remplacer les cascades de conditions basées sur des numéros d'IDs par un système modulaire et explicite où chaque variante graphique réelle correspond à un composant bien défini.
6. **Harmonisation des Thèmes** :
   Unifier [`ThemeEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/theme-engine/ThemeEngine.js) et la liste des 22 palettes de `themes/index.js` dans un seul moteur de design tokens HSL/Hex partagé.

---

## 23. Éléments à remplacer

1. **Les 5 Templates React Monolithiques (`src/templates/Template*.jsx`)** :
   Ces composants avec balises `<style>` injectées sont rigides et incompatibles avec la vision d'une marketplace adaptative modulaire. Ils devront être remplacés par des assemblages déclaratifs de blocs gérés par le futur moteur Vestin.
2. **Le double calcul de livraison** :
   Remplacer le doublon [`deliveryCalculator.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/deliveryCalculator.js) / [`DeliveryEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/delivery-engine/DeliveryEngine.js) par une source unique de vérité basée sur les quartiers et villes du Cameroun.
3. **Le système Web Push VAPID résiduel** :
   Le remplacer complètement au profit de Firebase FCM, plus stable sur Android (navigateurs Chrome et webview Capacitor).
4. **Les icônes SVG copiées-collées en ligne** :
   Remplacer les dizaines de fonctions SVG redéfinies manuellement dans chaque fichier par l'import standardisé depuis `lucide-react`.

---

## 24. Éléments potentiellement supprimables

*(Rappel strict : aucun élément ne doit être supprimé pendant cette étape. Ce paragraphe liste uniquement les candidats identifiés pour une phase ultérieure).*

1. **Les 22 composants d'habillage de thèmes** ([`src/app/boutique/[slug]/themes/Theme*.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/app/boutique/%5Bslug%5D/themes)) :
   Ces 22 fichiers ne sont jamais affichés par l'application et constituent du code mort consommant de l'espace bundle.
2. **Le dossier de composants concurrent [`src/components/blocks/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/components/blocks)** :
   Doublon parfait de [`src/blocks/`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/blocks).
3. **Le schéma SQL concurrent [`supabase/orders_schema.sql`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/supabase/orders_schema.sql)** :
   Ce fichier propose un schéma avec table `order_items` et colonne `user_id` en contradiction directe avec le schéma réel de production `schema.sql` (qui utilise `owner_id` et `orders.order_items` en JSONB).
4. **L'ancien registre [`src/lib/componentRegistry.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/componentRegistry.js)** :
   Rendu obsolète par `blockEngine/registry.js` et `component-registry/ComponentRegistry.js`.
5. **Scripts d'administration avec identifiants en clair à la racine** :
   Fichiers tels que `inspect_schema.mjs`, `cleanup_database.js`, `add-product-4jpg.mjs`, `fix_rpc.js`, etc., qui contiennent des mots de passe en clair ou des opérations de debug ponctuelles terminées.
6. **Tables SQL orphelines dans Supabase** :
   Si le modèle métier définitif ne les intègre pas : `events`, `tickets`, `portfolio_items`, `subscriptions`.

---

## 25. Compatibilité avec l'architecture future

Rappel de la cible architecturale demandée :

```text
DISCOVERY ENGINE  ──┬──  VESTIN ENGINE  ──┬──  AI ENGINE
                    │                     │
                    ▼                     ▼
             BUSINESS PROFILE ────► CAPABILITIES & IDENTITY
                                          │
                                          ▼
                                   ADAPTIVE ENGINE
                                          │
                                          ▼
                                   FINAL STOREFRONT
```

### Évaluation de la compatibilité de l'existant :

| Bloc cible | État de l'existant | Compatibilité | Analyse |
| :--- | :--- | :--- | :--- |
| **DISCOVERY ENGINE** | Recherche visuelle Jina 1024D + Recherche sémantique + Cartographie Leaflet | **90% Compatible** | Le moteur de recherche est déjà prêt. Il nécessite simplement un découplage de `ClientDiscovery.js` pour devenir un module de recherche pur. |
| **BUSINESS PROFILE** | Modèles `stores` et `profiles` dans Supabase + `businessTypeDefinitions.js` | **75% Compatible** | Les données de base existent (`name`, `city`, `phone`, `businessType`). Il faudra unifier `theme_config`, `layout_config` et `store_modules` dans un schéma `BusinessProfile` formel. |
| **CAPABILITIES ENGINE**| [`CapabilityEngine.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/capability-engine/CapabilityEngine.js) (22 capacités) | **85% Compatible** | Le registre de capacités existe déjà et est propre. Il doit maintenant piloter dynamiquement l'activation des blocs plutôt que de rester consultatif. |
| **VESTIN ENGINE (Blocks / Templates)** | `LiveCanvas.jsx`, `ComponentRegistry`, `OFFICIAL_TEMPLATE_CATALOGUE` | **70% Compatible** | Les fondations déclaratives sont présentes. Le point critique sera de remplacer les générateurs virtuels d'IDs (`hero_001` à `100`) par de vrais blocs modulaires composables. |
| **AI ENGINE** | [`AIGateway.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/ai-kernel/AIGateway.js), [`VestinKernelExecutor.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/ai-kernel/VestinKernelExecutor.js), Mistral AI | **80% Compatible** | L'architecture de passerelle IA par actions sécurisées sans génération de code est déjà posée et respecte les principes directeurs. |
| **ADAPTIVE ENGINE** | [`storeComposer.js`](file:///c:/Users/WINDOWS%2010/Desktop/2VESTYLE/src/lib/store-composer/storeComposer.js) | **60% Compatible** | Le compositeur actuel assemble 3 propositions selon des règles d'affinité. Il devra être branché directement sur le `BusinessProfile` pour générer automatiquement la `STOREFRONT CONFIG`. |

---

## 26. Risques majeurs

1. **Risque d'intégrité financière et de sécurité sur les commandes** :
   L'insertion directe des commandes depuis le navigateur dans la table `orders` sans vérification serveur des montants expose la marketplace à des commandes falsifiées (totaux modifiés, prix frauduleux).
2. **Risque de saturation de la base de données par des boutiques fantômes** :
   Le comportement actuel de l'authentification créant une boutique automatique à chaque connexion utilisateur pollue la table `stores` et fausse tous les indicateurs statistiques de la marketplace.
3. **Risque de régression lors du déverrouillage de `StorefrontClient.js`** :
   La suppression de la condition `isVestineLiveStore = ... || true` risque de casser l'affichage des boutiques qui dépendent de la configuration synthétique générée par `createDefaultStoreConfig()`. Une stratégie de transition douce sera impérative.
4. **Risque de latence sur les réseaux mobiles à faible débit (Cameroun)** :
   Le volume d'assets et de scripts actuels (Three.js, Framer Motion, Leaflet, bibliothèques IA résiduelles) est excessif pour des connexions 3G/EDGE instables.
5. **Risque de fuite de clés secrètes** :
   Des scripts présents à la racine contiennent des identifiants d'accès direct au pooler de base de données PostgreSQL qui ne doivent en aucun cas persister dans un dépôt partagé.

---

## 27. Questions nécessitant une décision de l'architecte

1. **Modèle de Boutique Unique vs Multi-Format** :
   Souhaitons-nous conserver la possibilité pour un vendeur de choisir un template fixe (style Shopify classique), ou actons-nous que **100% des vitrines doivent être rendues par le moteur adaptatif dynamique (LiveCanvas / Vestin Engine)** ?
2. **Gestion des Capacités Non-Produits (Réservations, Services, Devis)** :
   Faut-il persister ces entités dans des tables relationnelles Supabase dédiées (`reservations`, `devis_requests`), ou valide-t-on que dans le contexte local camerounais, la finalisation par message préformaté WhatsApp (`wa.me`) reste le canal officiel et prioritaire ?
3. **Nettoyage des Faux Composants (1 100 vs Réels)** :
   Validez-vous la suppression de la simulation mathématique des 1 100 variantes au profit d'un ensemble de 30 à 50 blocs atomiques réellement distincts, ultra-qualitatifs et entièrement configurables ?
4. **Schéma Canonique `BusinessProfile`** :
   Le schéma `BusinessProfile` doit-il être stocké dans une nouvelle colonne JSONB `business_profile` sur la table `stores`, ou doit-il remplacer progressivement `layout_config` et `theme_config` ?
5. **Stratégie d'accès SuperAdmin** :
   Confirmez-vous le remplacement du Basic Auth en dur dans le middleware par une gestion des rôles basée sur Supabase Auth (`profiles.role = 'admin'`) ?

---

## 28. Recommandation pour l'ÉTAPE 1

Pour la prochaine étape (ÉTAPE 1), l'intervention technique devra se concentrer sur **la pose des fondations architecturales sans rien détruire**, selon l'ordre logique suivant :

1. **Sécurisation immédiate du backend** :
   - Neutraliser les secrets codés en dur et les fallbacks de mots de passe d'administration.
   - Créer un endpoint serveur sécurisé `/api/orders/checkout` validant les prix avant insertion en base.
   - Désactiver la création automatique sauvage de boutiques dans `AuthContext.js`.
2. **Définition du contrat d'interface `BusinessProfile`** :
   - Écrire le schéma de validation formel (avec Zod, déjà présent dans `src/lib/zodSchemas.js`) représentant un `BusinessProfile` unifié (identité, capacités actives, données marchandes, thème).
3. **Création du pont de compatibilité (Adapter Layer)** :
   - Concevoir une fonction pure transformant une boutique Supabase existante (`stores` + `products`) en un `BusinessProfile` canonique, assurant qu'aucune donnée marchand existante ne soit altérée.
4. **Découplage de `LiveCanvas` et du rendu vitrine** :
   - Isoler le moteur de rendu en lecture seule (`UniversalStorefrontRenderer`) pour afficher n'importe quelle boutique à partir de son `BusinessProfile`, sans dépendre de l'état d'édition du Builder.
