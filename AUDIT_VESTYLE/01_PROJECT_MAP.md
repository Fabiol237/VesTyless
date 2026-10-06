# AUDIT FORENSIC VESTYLE — 01_PROJECT_MAP.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Projet :** VesTyle (Plateforme Unifiée & Multi-Domaines)  
**Objectif :** Cartographie exhaustive de la structure du projet, des routes, des frameworks, des dépendances et de l'état des modules.

---

## 1. VUE D'ENSEMBLE TECHNIQUE

### 1.1 Stack Technologique Actuelle
* **Framework Web :** Next.js 15.5.7 (App Router) + React 19 / React DOM 19
* **Langages :** JavaScript (ESM/JSX) + TypeScript 5.4.5 (coexistence hybride .js / .jsx / .ts / .tsx)
* **Styling :** Tailwind CSS v4.2.2 + CSS Modules + Vanilla CSS + Framer Motion 12.38.0
* **Backend & Données :** Supabase (PostgreSQL 15+, pgvector 1024D, RLS, RPC, Realtime, Auth, Storage)
* **ORM / Validation :** Zod 3.24.2 (schémas déclaratifs stricts) + Supabase JS Client 2.103.2 + @supabase/ssr 0.10.2
* **Stockage Local / Offline :** Dexie.js 4.4.5 (IndexedDB) + PWA Service Worker + localStorage
* **IA & LLM :** 
  - Mistral AI API (`@mistralai/mistralai` 2.4.0, modèle `mistral-large-latest`)
  - Hugging Face Inference (`@huggingface/inference` 4.13.15, Florence-2 + DINOv2 + SigLIP pour la recherche visuelle 1024D)
  - Jina AI Embeddings (Jina CLIP v2 / v3 1024D pour templates & design patterns)
  - Transformers.js (`@xenova/transformers` 2.17.2) / MLC-AI Web-LLM (expérimentations in-browser)
* **Cartographie & Géolocalisation :** Leaflet 1.9.4 + React-Leaflet 5.0.0 + Leaflet Routing Machine + Nominatim OpenStreetMap
* **Notifications & Communication :** Firebase Admin 14.3.0 + Firebase Client 12.18.0 (FCM Push) + Web-Push 3.6.7 + Resend 6.12.3 + Nodemailer 8.0.7 + WhatsApp Deep Linking
* **Médias & Documents :** Cloudinary + jsPDF 4.2.1 + html2canvas 1.4.1 + browser-image-compression 2.0.2 + PapaParse 5.6.0 + qrcode.react 4.2.0

---

## 2. ARBORESCENCE ET CARTOGRAPHIE DES DOSSIERS

```
2VESTYLE/
├── src/
│   ├── app/                    # Next.js App Router (Routes publiques, Vendeur, Admin, API)
│   │   ├── (public)/           # Marketplace & Pages d'information
│   │   │   ├── page.js         # Accueil Marketplace (Recherche visuelle, vocale, code, géoloc)
│   │   │   ├── search/         # Page de résultats de recherche multi-critères
│   │   │   ├── produit/[id]/   # Fiche produit détaillée & recommandations
│   │   │   ├── cart/           # Panier unifié multi-boutiques / mono-boutique
│   │   │   ├── suivi/[id]/     # Suivi de commande en temps réel + Facture imprimable
│   │   │   ├── mes-commandes/  # Historique des commandes acheteur
│   │   │   ├── wishlist/       # Liste d'envies locale/connectée
│   │   │   ├── login/          # Authentification marchands & clients
│   │   │   ├── signup/         # Inscription nouveaux comptes
│   │   │   ├── profile/        # Profil utilisateur et adresses
│   │   │   ├── delivery/       # Interface livreur (sans authentification lourde, via token)
│   │   │   ├── offline/        # Page de repli PWA hors-ligne
│   │   │   └── onboarding/     # Tunnel de création de boutique (Wizard 4 étapes)
│   │   ├── boutique/           # Rendu des boutiques storefronts publiques
│   │   │   └── [slug]/         # Page dynamique de boutique (StorefrontClient + Renderers)
│   │   ├── dashboard/          # Dashboard Vendeur Existant (Actuel)
│   │   │   ├── page.js         # Accueil Dashboard (Stats, Commutateur Studio/Demandes/Accueil)
│   │   │   ├── add-product/    # Formulaire d'ajout de produit avec IA et Cloudinary
│   │   │   ├── products/       # Gestion du catalogue & des stocks (Logs de stock, QR, alertes)
│   │   │   ├── orders/         # Gestion des commandes, tickets de caisse, affectation livreur
│   │   │   ├── settings/       # Paramètres fondamentaux boutique, géolocalisation, contact
│   │   │   ├── promotions/     # Planification des promotions avec compte à rebours
│   │   │   ├── notifications/  # Centre des alertes commandes et stocks
│   │   │   └── statistiques/   # Graphiques de performance financière et de conversion
│   │   ├── admin/              # Dashboard Super-Admin plateforme
│   │   │   ├── page.js         # Vue d'ensemble plateforme
│   │   │   ├── utilisateurs/   # Gestion des comptes et boutiques
│   │   │   ├── produits/       # Modération globale du catalogue
│   │   │   ├── finances/       # Métriques financières globales
│   │   │   ├── statistiques/   # Statistiques d'audience et de conversion globales
│   │   │   ├── emails/         # Outil de blast emailing & campagnes
│   │   │   ├── cleanup/        # Outil de nettoyage base et diagnostics
│   │   │   └── settings/       # Paramètres système
│   │   ├── api/                # Endpoints API Route Handlers (Next.js Serverless)
│   │   │   ├── auth/           # Callback Supabase Auth
│   │   │   ├── admin/          # Nettoyage DB, logs sécurité
│   │   │   ├── ai/             # 16 routes d'orchestration IA (Mistral, vision, assistant)
│   │   │   ├── business-types/ # Résolution des catégories et types d'activités
│   │   │   ├── chat/           # Chatbot boutique pour visiteurs
│   │   │   ├── cloudinary/     # Signature & upload de médias
│   │   │   ├── cron/           # Tâches planifiées (warmup, pulse, flash-sales)
│   │   │   ├── dashboard/      # Statistiques agrégées
│   │   │   ├── emails/         # Notification & prévisualisation d'emails
│   │   │   ├── honeypot/       # Sécurité anti-spam
│   │   │   ├── leads/          # Réception des prospects & demandes
│   │   │   ├── migrate/        # Migration programmatique des business-types
│   │   │   ├── notifications/  # Gestion des push Web / FCM
│   │   │   ├── orders/         # Checkout atomique & transactions
│   │   │   ├── products/       # Feed produits, embeddings vectoriels Jina/Florence
│   │   │   ├── promotions/     # CRUD promotions boutique
│   │   │   ├── search/         # Recherche sémantique vectorielle & visuelle
│   │   │   ├── store/          # Création, config, versions, preview boutique
│   │   │   └── templates/      # Bibliothèque canonique de templates
│   ├── components/             # Composants React modulaires
│   │   ├── dashboard/          # PolymorphicDashboard.tsx (Composant riche multi-verticaux)
│   │   ├── onboarding/         # OnboardingWizard.tsx (Tunnel de création guidé)
│   │   ├── renderer/           # StorefrontRenderer.tsx, ThemeProvider.tsx
│   │   ├── sections/           # Sections déclaratives (Hero001, ServicesGrid, Fallback)
│   │   ├── storefront/         # UniversalStorefrontRenderer.jsx (Moteur hybride rendu)
│   │   ├── studio/             # StorefrontEditor, StudioLivePreview, StudioSectionEditor, StudioLeadsManager
│   │   ├── vendor-flow/        # AITemplateMatcherModal, TemplateSwitchBar, VendorQuickInfoSheet
│   │   ├── registry/           # SectionRegistry.ts (Registre de composants de section)
│   │   ├── Navigation/         # VestyleSidebar.jsx
│   │   ├── connection/         # StoreActionButtons.jsx (WhatsApp, Appel, Maps)
│   │   └── [UI génériques]     # Navbar, Footer, InteractiveMap, ProductCard, VisualSearchModal...
│   ├── core/                   # Cœur Déclaratif & Registres V3.0 (Vestin Core)
│   │   ├── contracts/          # designDefinition.ts (Contrat Zod universel Design v3.0)
│   │   ├── designs/            # 6 Designs Canoniques (vst_dsn_001 à 006)
│   │   ├── adaptation/         # VestinAdaptationEngine.ts (Moteur de fusion Données <-> Design)
│   │   ├── registry/           # LocalDesignRegistry.ts, IDesignRegistry.ts
│   │   └── onboarding/         # OnboardingDesignMapper.ts
│   ├── engine/                 # Moteurs de Génération & Blueprints (Génération précédente V2)
│   │   ├── masterBlueprints.ts # Définition des 5 Master Blueprints (Retail, Service, Hybrid, Livestock, Food)
│   │   ├── blueprintSelector.ts# Sélecteur d'architecture par analyse d'intention
│   │   ├── blueprintInjector.ts# Injecteur de blueprints dans StorefrontConfig
│   │   └── themeSeed.ts        # Encodage/Décodage de graines de thèmes visuels
│   ├── lib/                    # Utilitaires, Services, Adaptateurs & Clients
│   │   ├── business-profile/   # adaptStoreToBusinessProfile, BusinessProfileSchema
│   │   ├── business-types/     # BusinessTypeRegistry.js, businessTypeDefinitions.js
│   │   ├── content-source/     # DataBindingEngine.js, ContentSource.js
│   │   ├── theme-engine/       # ThemeEngine.js
│   │   ├── onboarding/         # smartActivityDeducer.js
│   │   ├── supabase.js         # Client Supabase Public / Anon
│   │   ├── supabaseAdmin.js    # Client Supabase Service Role (Admin)
│   │   ├── cloudinary.js       # Gestion des uploads & suppressions Cloudinary
│   │   ├── firebase.js         # Client Firebase FCM
│   │   ├── firebaseAdmin.js    # SDK Admin Firebase FCM
│   │   ├── pdfCatalog.js       # Génération catalogue PDF
│   │   ├── pdfReceipt.js       # Génération reçu PDF
│   │   ├── qrcode.js           # Générateur de QR codes
│   │   ├── whatsappOrdering.js # Formatage de commandes WhatsApp
│   │   └── zodSchemas.js       # Schémas de validation formulaires
│   ├── templates/              # Anciens Templates JSX Monolithiques (Génération V1/V2)
│   │   ├── TemplateBoutique.jsx
│   │   ├── TemplateBoutiquePro.jsx
│   │   ├── TemplateTechPro.jsx
│   │   ├── TemplateResto.jsx
│   │   ├── TemplatePresta.jsx
│   │   └── index.js
│   ├── context/                # Contextes React Globaux
│   │   ├── AuthContext.js      # Gestion de session, profil, boutiques actives
│   │   ├── CartContext.js      # Gestion du panier et persistance locale
│   │   └── OnboardingContext.tsx # État d'avancement du tunnel d'onboarding
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.js, useDistance.js, useFirebaseNotifications.js, useOfflineDb.js...
│   └── types/                  # Définitions TypeScript
│       ├── storefront.ts       # Schémas StorefrontConfig, Theme, Section, BusinessType
│       └── onboarding.ts       # Types du tunnel d'onboarding
├── supabase/                   # Schémas SQL, Migrations & Scripts DB
│   ├── schema.sql              # Schéma de base Supabase (MVP V1)
│   ├── modules_migration.sql   # Schéma du système modulaire (store_modules)
│   ├── schema_livreurs.sql     # Schéma système de livraison & tracking GPS
│   ├── setup_ai_visual_search.sql # pgvector 1024D, index HNSW & RPC Florence-2
│   └── migrations/             # 29 fichiers de migration ordonnés
├── huggingface_space/          # Microservice Python pour extraction de features d'images
│   ├── app.py                  # API Gradio/FastAPI (DINOv2 + SigLIP + Florence-2)
│   └── requirements.txt
├── scripts/                    # Scripts d'ingestion, de tests et d'outillage DB
└── tests/                      # 41 suites de tests Vitest (Couverture moteur, création, checkout)
```

---

## 3. INVENTAIRE COMPLET DES ROUTES APPLICATION

### 3.1 Routes Marchand (Dashboard Vendeur)
| Route | Fichier Page | Rôle | État |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `src/app/dashboard/page.js` | Accueil Dashboard Vendeur, KPIs, Commutateur de mode (Studio, Leads, Accueil) | 🟢 À CONSERVER |
| `/dashboard/products` | `src/app/dashboard/products/page.js` | Gestion du catalogue, mouvements de stock, alertes rupture, logs | 🟢 À CONSERVER |
| `/dashboard/add-product` | `src/app/dashboard/add-product/page.js` | Création produit avec IA copywriter, Cloudinary multi-images, catégories | 🟢 À CONSERVER |
| `/dashboard/orders` | `src/app/dashboard/orders/page.js` | Suivi commandes, tickets de caisse authentifiés, WhatsApp direct, livreurs | 🟢 À CONSERVER |
| `/dashboard/settings` | `src/app/dashboard/settings/page.js` | Paramètres boutique, identité, géolocalisation GPS, WhatsApp | 🟢 À CONSERVER |
| `/dashboard/promotions` | `src/app/dashboard/promotions/page.js` | CRUD promotions planifiées avec compte à rebours | 🟢 À CONSERVER |
| `/dashboard/notifications`| `src/app/dashboard/notifications/page.js`| Centre de notifications temps réel (commandes, stock, alertes) | 🟢 À CONSERVER |
| `/dashboard/statistiques` | `src/app/dashboard/statistiques/page.js` | Graphiques d'évolution du CA, taux de conversion, vues 7 jours | 🟢 À CONSERVER |

### 3.2 Routes Vitrines & Création
| Route | Fichier Page | Rôle | État |
| :--- | :--- | :--- | :--- |
| `/boutique/[slug]` | `src/app/boutique/[slug]/page.js` | Vitrine publique personnalisée (SSR Meta + StorefrontClient CSR) | 🟡 À ADAPTER |
| `/boutiques` | `src/app/boutiques/page.js` | Annuaire public des boutiques vérifiées | 🟢 À CONSERVER |
| `/onboarding` | `src/app/onboarding/page.js` | Tunnel 4 étapes de création de vitrine pour nouveau marchand | 🟡 À ADAPTER |
| `/demo` | `src/app/demo/page.tsx` | Bac à sable interactif de démonstration des composants studio | 🟡 À ADAPTER |

### 3.3 Routes Acheteurs & Marketplace
| Route | Fichier Page | Rôle | État |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.js` | Marketplace globale (Recherche visuelle IA, vocale, code boutique) | 🟢 À CONSERVER |
| `/search` | `src/app/search/page.js` | Moteur de recherche produits par texte, catégorie, filtre | 🟢 À CONSERVER |
| `/produit/[id]` | `src/app/produit/[id]/page.js` | Page produit individuelle avec commande WhatsApp | 🟢 À CONSERVER |
| `/cart` | `src/app/cart/page.js` | Panier avec calcul de livraison et validation commande atomique | 🟢 À CONSERVER |
| `/suivi/[id]` | `src/app/suivi/[id]/page.js` | Suivi GPS et statut de livraison en temps réel pour le client | 🟢 À CONSERVER |
| `/suivi/[id]/invoice` | `src/app/suivi/[id]/invoice/page.js` | Facture imprimable / Certificat d'authenticité de la commande | 🟢 À CONSERVER |
| `/mes-commandes` | `src/app/mes-commandes/page.js` | Liste des commandes passées par l'acheteur connecté | 🟢 À CONSERVER |
| `/delivery` | `src/app/delivery/page.js` | Console de livraison dédiée aux livreurs (mise à jour GPS) | 🟢 À CONSERVER |

### 3.4 Routes Administration Plateforme
| Route | Fichier Page | Rôle | État |
| :--- | :--- | :--- | :--- |
| `/admin` | `src/app/admin/page.js` | Tableau de bord super-admin | 🟢 À CONSERVER |
| `/admin/utilisateurs` | `src/app/admin/utilisateurs/page.js` | Gestion des marchands et statuts boutiques | 🟢 À CONSERVER |
| `/admin/produits` | `src/app/admin/produits/page.js` | Modération du catalogue global | 🟢 À CONSERVER |
| `/admin/finances` | `src/app/admin/finances/page.js` | Suivi des volumes de transaction | 🟢 À CONSERVER |
| `/admin/statistiques` | `src/app/admin/statistiques/page.js` | Métriques globales de trafic et conversion | 🟢 À CONSERVER |
| `/admin/emails` | `src/app/admin/emails/page.js` | Gestionnaire de campagnes d'emailing | 🟢 À CONSERVER |
| `/admin/cleanup` | `src/app/admin/cleanup/page.js` | Diagnostics DB et nettoyage de données résiduelles | 🟡 À ADAPTER |

---

## 4. INVENTAIRE DES API ROUTE HANDLERS

| Catégorie | Route API | Méthodes | Description |
| :--- | :--- | :--- | :--- |
| **Commerce** | `/api/orders/checkout` | `POST` | Exécute la RPC atomique `process_order_checkout` avec clé d'idempotence |
| **Commerce** | `/api/products` | `GET`, `POST` | Feed produits & création de produit avec détection d'offre |
| **Commerce** | `/api/promotions` | `GET`, `POST`, `PATCH`, `DELETE` | Gestion des promotions et calcul des remises |
| **Commerce** | `/api/leads` | `GET`, `POST`, `PATCH` | Réception et traitement des prospects clients multi-verticaux |
| **Intelligence**| `/api/ai/builder-orchestrator` | `POST` | Recommande un thème et un agencement de modules selon le profil |
| **Intelligence**| `/api/ai/generate-store` | `POST` | Génère une boutique avec Mistral (insère dans `stores` et `store_modules`) |
| **Intelligence**| `/api/ai/product-description` | `POST` | Génère une fiche descriptive vendeuse via Mistral AI |
| **Intelligence**| `/api/ai/seller-assistant` | `POST` | Assistant conversationnel IA pour le marchand dans son dashboard |
| **Intelligence**| `/api/ai/store-advisor` | `POST` | Audit et conseils d'optimisation de boutique par IA |
| **Intelligence**| `/api/ai/match-template` | `POST` | Match un template selon la description d'activité |
| **Intelligence**| `/api/products/generate-embeddings` | `POST` | Calcule les embeddings Jina/HuggingFace pour un produit |
| **Recherche** | `/api/search/visual` | `POST` | Recherche visuelle par photo via HuggingFace Space & pgvector |
| **Recherche** | `/api/search/semantic` | `POST` | Recherche textuelle sémantique par similarité cosinus |
| **Boutique** | `/api/store/config` | `GET`, `POST` | Récupère ou met à jour `draft_config` / `published_config` |
| **Boutique** | `/api/store/versions` | `GET`, `POST` | Historique et rollback de versions de boutique |
| **Boutique** | `/api/templates` | `GET` | Liste des templates déclaratifs validés par le QualityGate |
| **Médias** | `/api/cloudinary` | `POST`, `DELETE` | Upload sécurisé et suppression d'images |
| **Notifs** | `/api/notifications/send` | `POST` | Envoi de notifications Push Web / FCM |

---

## 5. BILAN GLOBAL DU PROJET

1. **Volume de code analysé :** 98 fichiers racines, 57 composants UI, 28 modules utilitaires, 19 groupes d'APIs, 29 migrations SQL.
2. **État de santé global :**
   - Le système de commerce (Commandes, Produits, Stock, Dashboard Vendeur, Livraisons, Marketplace) est **très fonctionnel, robuste et bien conçu**.
   - Le système de vitrines et de rendu souffre de **3 générations successives non nettoyées** (Templates JSX V1 -> Modules dynamiques V2 -> StorefrontConfig déclaratif V3).
   - Les liens vers un ancien `/builder/[id]` dans le dashboard mènent actuellement à une 404 (route inexistante).
3. **Préparation à la cible VesTyle :** Le socle métier existant pour le domaine Vendeur est mature et prêt à être encapsulé sans aucune perte fonctionnelle.
