# AUDIT FORENSIC VESTYLE — 07_REUSABLE_CODE.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Inventaire exhaustif des composants, briques logiques, moteurs et utilitaires à haute valeur réutilisables pour le Core et les 9 Domaines.

---

## 1. VESTYLE CORE — COMPOSANTS & SERVICES TRANSVERSES RÉUTILISABLES

---

### ÉLÉMENT : `AuthContext.js` & `useAuth.js`
* **EMPLACEMENT :** `src/context/AuthContext.js`, `src/hooks/useAuth.js`
* **TYPE :** Contexte d'authentification et gestion de session Supabase
* **UTILISÉ PAR :** 100% des dashboards et pages authentifiées.
* **DÉPENDANCES :** `supabase.auth`, table `stores`, table `profiles`.
* **ÉTAT :** 🟢 À CONSERVER / 🟡 À ADAPTER (Ajouter le support multi-domaines explicite).
* **RISQUE :** Faible.
* **RECOMMANDATION :** Constitue la brique fondamentale d'authentification du VesTyle Core.

---

### ÉLÉMENT : `StoreSwitcher.jsx`
* **EMPLACEMENT :** `src/components/studio/StoreSwitcher.jsx`
* **TYPE :** Sélecteur déroulant d'établissement / boutique active
* **UTILISÉ PAR :** Header du Dashboard.
* **DÉPENDANCES :** `useAuth()`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Brique Core indispensable pour permettre à un utilisateur de basculer instantanément entre ses différents sites (ex: switcher entre sa boutique et son restaurant).

---

### ÉLÉMENT : `StudioLeadsManager.jsx` & `/api/leads`
* **EMPLACEMENT :** `src/components/studio/StudioLeadsManager.jsx`, `src/app/api/leads/route.js`
* **TYPE :** Gestionnaire de prospects, demandes de devis et rendez-vous clients
* **UTILISÉ PAR :** Dashboard (Onglet Demandes), Storefront.
* **DÉPENDANCES :** Table `leads`, Lucide React, WhatsApp deep-link.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Devient le module Core universel de gestion de leads pour tous les domaines nécessitant des demandes entrantes (Services, Immobilier, Éducation, Santé, Restauration).

---

### ÉLÉMENT : `StudioNotificationCenter.jsx` & Système de Push
* **EMPLACEMENT :** `src/components/studio/StudioNotificationCenter.jsx`, `src/lib/firebase.js`, `src/lib/firebaseAdmin.js`, `/api/notifications/send`
* **TYPE :** Système unifié de notifications temps réel et Push Web / FCM
* **UTILISÉ PAR :** Header Dashboard, PWA Service Worker.
* **DÉPENDANCES :** Table `notifications`, Firebase SDK.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Module Core de communication pour avertir les propriétaires de tout nouvel événement quel que soit le domaine.

---

### ÉLÉMENT : `useDistance.js` & `InteractiveMap.js`
* **EMPLACEMENT :** `src/hooks/useDistance.js`, `src/components/InteractiveMap.js`
* **TYPE :** Hook de géolocalisation navigateur et composant cartographique Leaflet
* **UTILISÉ PAR :** Paramètres boutique, recherche de proximité sur la marketplace, suivi livreur.
* **DÉPENDANCES :** Leaflet, API Geolocation standard W3C.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Brique Core pour l'ancrage local et la recherche géographique de tous les établissements.

---

## 2. DOMAINE VENDEUR — MODULES MÉTIER COMPLETS RÉUTILISABLES

---

### ÉLÉMENT : RPC Transactionnelle `process_order_checkout` & `/api/orders/checkout`
* **EMPLACEMENT :** `supabase/migrations/20260911_atomic_checkout.sql`, `src/app/api/orders/checkout/route.js`
* **TYPE :** Moteur de transaction e-commerce atomique et idempotent
* **UTILISÉ PAR :** Tunnel de validation du panier (`/cart`).
* **DÉPENDANCES :** PostgreSQL `FOR UPDATE`, tables `orders`, `products`, `stock_logs`, `stores`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Zéro régression. Algorithme de très haute qualité anti-concurrence.
* **RECOMMANDATION :** Conserver comme le moteur d'exécution transactionnel officiel du domaine Vendeur.

---

### ÉLÉMENT : Gestionnaire de Stock & Logs (`StockRow`, `StockBadge`, `stock_logs`)
* **EMPLACEMENT :** `src/app/dashboard/products/page.js`, table `stock_logs`
* **TYPE :** Système de gestion d'inventaire avec traçabilité complète des mouvements
* **UTILISÉ PAR :** `/dashboard/products`.
* **DÉPENDANCES :** `supabase`, table `stock_logs`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Module officiel de gestion d'inventaire pour le domaine Vendeur.

---

### ÉLÉMENT : Facturation & QR Codes de Commande (`OrderTicket`, `pdfReceipt.js`, `pdfCatalog.js`)
* **EMPLACEMENT :** `src/app/dashboard/orders/page.js`, `src/lib/pdfReceipt.js`, `src/lib/pdfCatalog.js`, `src/lib/qrcode.js`
* **TYPE :** Générateurs de reçus, catalogues PDF et certificats d'authenticité avec QR Code
* **UTILISÉ PAR :** Dashboard Commandes, `/suivi/[id]/invoice`.
* **DÉPENDANCES :** jsPDF, qrcode.react, api.qrserver.com.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Module officiel d'édition de factures et catalogues pour le domaine Vendeur.

---

## 3. MOTEUR DE DESIGN & ARCHITECTURE DÉCLARATIVE RÉUTILISABLES

---

### ÉLÉMENT : Contrat Canonique `DesignDefinition` (v3.0)
* **EMPLACEMENT :** `src/core/contracts/designDefinition.ts`
* **TYPE :** Schémas Zod stricts pour la définition universelle d'un Design
* **UTILISÉ PAR :** `LocalDesignRegistry.ts`, `VestinAdaptationEngine.ts`, tests unitaires.
* **DÉPENDANCES :** `zod`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** **Socle fondamental** sur lequel tous les futurs Designs VesTyle des 9 domaines devront être construits.

---

### ÉLÉMENT : Catalogue des 6 Designs Canoniques
* **EMPLACEMENT :** `src/core/designs/` (`vst_dsn_prestige_atelier_001.ts` à `vst_dsn_commerce_librairie_006.ts`)
* **TYPE :** Déclarations typées complètes de designs avec VisualNodeTree
* **UTILISÉ PAR :** `LocalDesignRegistry.ts`, `OnboardingWizard.tsx`.
* **DÉPENDANCES :** `DesignDefinition`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Première collection officielle de Designs de la nouvelle architecture.

---

### ÉLÉMENT : `VestinAdaptationEngine.ts`
* **EMPLACEMENT :** `src/core/adaptation/VestinAdaptationEngine.ts`
* **TYPE :** Moteur d'adaptation déterministe Données Marchand <-> Design
* **UTILISÉ PAR :** `OnboardingWizard.tsx`, tests unitaires.
* **DÉPENDANCES :** `designDefinition.ts`, `types/storefront.ts`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Moteur central de compilation utilisé lors de la génération de site (Parcours A et Parcours B).

---

### ÉLÉMENT : `BusinessTypeRegistry.js` & `businessTypeDefinitions.js`
* **EMPLACEMENT :** `src/lib/business-types/BusinessTypeRegistry.js`, `src/lib/business-types/businessTypeDefinitions.js`
* **TYPE :** Registre canonique et moteur d'analyse sémantique des types d'activité
* **UTILISÉ PAR :** `adaptStoreToBusinessProfile.js`, `settings/page.js`, APIs IA.
* **DÉPENDANCES :** Zod, dictionnaires de synonymes métier.
* **ÉTAT :** 🟢 À CONSERVER / 🟡 À ADAPTER (Structurer selon les 9 domaines cibles).
* **RECOMMANDATION :** Servira de table de correspondance entre les 9 domaines cibles et leurs catégories respectives.

---

## 4. INTELLIGENCE ARTIFICIELLE & RECHERCHE VISUELLE

---

### ÉLÉMENT : Pipeline de Recherche Visuelle IA (Florence-2 + DINOv2 + SigLIP + pgvector 1024D)
* **EMPLACEMENT :** `supabase/setup_ai_visual_search.sql`, `src/app/api/search/visual/route.js`, `src/components/VisualSearchModal.js`, `huggingface_space/app.py`
* **TYPE :** Système de recherche par photo à base d'embeddings vectoriels 1024D et index HNSW
* **UTILISÉ PAR :** Marketplace (`src/app/page.js`), modal de recherche visuelle.
* **DÉPENDANCES :** pgvector, HuggingFace Space, Supabase RPC `search_vestyle_hybrid`.
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Actif majeur et différenciateur de VesTyle pour la recherche de produits.

---

### ÉLÉMENT : Assistant Rédactionnel Produit (`ProductDescriptionAI.jsx` & `/api/ai/product-description`)
* **EMPLACEMENT :** `src/components/ProductDescriptionAI.jsx`, `src/app/api/ai/product-description/route.js`
* **TYPE :** Générateur de copywriting assisté par Mistral AI
* **UTILISÉ PAR :** Formulaire d'ajout de produit (`/dashboard/add-product`).
* **DÉPENDANCES :** Mistral AI API (`@mistralai/mistralai`).
* **ÉTAT :** 🟢 À CONSERVER
* **RISQUE :** Faible.
* **RECOMMANDATION :** Brique réutilisable pour tous les domaines nécessitant la rédaction assistée de fiches d'offres ou de services.
