# AUDIT FORENSIC VESTYLE — 03_DASHBOARD_VENDEUR.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Analyse médico-légale approfondie du Dashboard Vendeur existant pour sa transition vers le domaine officiel `domain = vendeur`.

---

## 1. VUE D'ENSEMBLE DU DASHBOARD VENDEUR

Le Dashboard Vendeur actuel est le centre névralgique de l'application pour les marchands. Il intègre la gestion commerciale, les stocks, les commandes, les alertes, les statistiques de vente et des outils de prévisualisation de vitrine.

**Objectif d'architecture cible :**  
Ne rien détruire, ne rien casser, et faire du Dashboard Vendeur actuel la première implémentation de référence pour le domaine :
```
domain = vendeur
```

---

## 2. ANALYSE ÉLÉMENT PAR ÉLÉMENT DU DASHBOARD VENDEUR

---

### ÉLÉMENT : Page Principale Dashboard (Accueil & KPIs)
* **EMPLACEMENT :** `src/app/dashboard/page.js`
* **TYPE :** Page Client Next.js (App Router)
* **CE QU'IL FAIT :** 
  - Calcule et affiche les KPIs de vente réels (Chiffre d'affaires selon la période sélectionnée, Commandes en attente, Articles en stock faible, Vues de vitrine).
  - Affiche le graphique d'évolution du CA via `PremiumChart.jsx`.
  - Affiche la liste des 5 dernières commandes et des 5 derniers produits.
  - Intègre un commutateur de mode à 4 onglets : **Accueil** (KPIs/Ventes), **Demandes** (`StudioLeadsManager`), **Sections** (`StudioSectionEditor` + `StudioLivePreview`), **Aperçu** (`StudioLivePreview` plein écran).
  - Permet le changement de boutique active via `StoreSwitcher.jsx`.
  - Écoute les modifications en temps réel sur la table `orders` via Supabase Realtime.
* **UTILISÉ PAR :** Route `/dashboard` (Marchands connectés).
* **DÉPENDANCES :** `useAuth`, `supabase`, `PremiumChart`, `StoreSwitcher`, `StudioLivePreview`, `StudioSectionEditor`, `StudioLeadsManager`, `StudioNotificationCenter`, `adaptStoreToBusinessProfile`.
* **TABLES SUPABASE :** `stores`, `products`, `orders`, `notifications`, `vendor_analytics`, `livreurs`.
* **APIS UTILISÉES :** Requêtes directes Supabase client + RPC `get_store_weekly_analytics`.
* **STATUT DOMAINE :**
  - Partie KPIs, Produits, Commandes -> **Spécifique Domaine Vendeur**.
  - `StoreSwitcher`, `StudioNotificationCenter`, `StudioLeadsManager` -> **Éligible au VesTyle Core**.
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Contient des liens directs vers `/builder/${store.id}` (route qui n'existe plus dans `src/app`).
* **RISQUES IDENTIFIÉS :**
  - **Risque Moyen :** 4 liens vers `/builder/${store.id}` génèrent une erreur 404 au clic.
  - **Risque Faible :** Les variables `CAPABILITIES.PRODUCT` / `CAPABILITIES.SERVICE` sont référencées sans import explicite dans le fichier (risque de ReferenceError si l'adaptateur ne les expose pas).
* **ÉTAT :** 🟢 À CONSERVER / 🟡 À ADAPTER (Nettoyer les liens builder morts).
* **RECOMMANDATION :** Conserver la page telle quelle pour le domaine Vendeur, remplacer les liens morts vers le builder par l'ouverture du mode "Sections" interne ou vers le futur studio de design.

---

### ÉLÉMENT : Gestionnaire de Produits & Stocks
* **EMPLACEMENT :** `src/app/dashboard/products/page.js` & `AddProductModal.js`
* **TYPE :** Page Client + Modal React
* **CE QU'IL FAIT :**
  - Affiche le catalogue complet des articles du marchand avec filtres et recherche vocale.
  - Gère les niveaux de stock (Badges : Rupture, Critique, Faible, OK).
  - Permet l'ajustement direct du stock (Entrée/Réception `add`, Sortie/Vente `remove`, Définition exacte `set` avec note explicative).
  - Enregistre et affiche l'historique complet des mouvements dans `stock_logs`.
  - Génère et affiche le QR Code officiel de chaque produit (`getProductQrUrl`).
  - Permet l'import/export de catalogue via CSV (`CsvImportExportModal.jsx`).
* **UTILISÉ PAR :** Route `/dashboard/products`.
* **DÉPENDANCES :** `useAuth`, `supabase`, `AddProductModal`, `VoiceSearchButton`, `CsvImportExportModal`, `@/lib/qrcode`.
* **TABLES SUPABASE :** `products`, `stock_logs`, `categories`, `stores`.
* **APIS UTILISÉES :** Supabase Client direct + `/api/products`.
* **STATUT DOMAINE :** **Spécifique Domaine Vendeur** (La gestion d'inventaire et de variantes physiques est typique de l'e-commerce).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune (Système moderne très propre).
* **RISQUES IDENTIFIÉS :** Aucun. Code robuste et fiable.
* **ÉTAT :** 🟢 À CONSERVER
* **RECOMMANDATION :** Conserver intégralement comme module `catalog-inventory` du domaine Vendeur.

---

### ÉLÉMENT : Création & Ajout de Produit avec IA
* **EMPLACEMENT :** `src/app/dashboard/add-product/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Formulaire complet de création d'article : nom, description, catégorie, prix, stock, MOQ, type d'offre (`product`/`service`).
  - Téléchargement multi-images vers Cloudinary avec compression côté client et suppression automatique en cas d'abandon.
  - Génération automatique de descriptions vendeuses par IA (`ProductDescriptionAI.jsx` -> Mistral AI).
  - Déclenche la génération d'embeddings vectoriels 1024D pour la recherche visuelle.
* **UTILISÉ PAR :** Route `/dashboard/add-product`.
* **DÉPENDANCES :** `useAuth`, `supabase`, `uploadImage`, `deleteCloudinaryByUrl`, `CategorySearch`, `ProductDescriptionAI`.
* **TABLES SUPABASE :** `products`, `stores`.
* **APIS UTILISÉES :** `/api/cloudinary`, `/api/ai/product-description`, `/api/products/generate-embeddings`.
* **STATUT DOMAINE :** **Spécifique Domaine Vendeur**.
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune.
* **RISQUES IDENTIFIÉS :** Utilise `stores.select('id').eq('owner_id', session.id).single()`, ce qui suppose 1 seule boutique par propriétaire. En mode multi-boutiques (1 compte -> N sites), il faut cibler `store.id` issu du contexte actif.
* **ÉTAT :** 🟢 À CONSERVER
* **RECOMMANDATION :** Conserver et ajuster la sélection de boutique pour utiliser la boutique active du contexte `useAuth().store`.

---

### ÉLÉMENT : Gestion des Commandes & Facturation
* **EMPLACEMENT :** `src/app/dashboard/orders/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Affiche les commandes sous forme de "Tickets de Caisse / Certificats d'Authenticité" avec QR code de traçabilité.
  - Permet le changement de statut de commande (`pending` -> `processing` -> `shipped` -> `delivered` / `cancelled`).
  - Intègre un déclencheur WhatsApp direct pour avertir le client en 1 clic avec le lien de suivi.
  - Permet l'assignation d'un livreur de la boutique (`livreurs` table).
  - Permet l'impression de la facture / reçu officiel (`/suivi/[id]/invoice`).
  - Écoute les nouvelles commandes en temps réel.
* **UTILISÉ PAR :** Route `/dashboard/orders`.
* **DÉPENDANCES :** `useAuth`, `supabase`, `BackNavigation`, Lucide Icons.
* **TABLES SUPABASE :** `orders`, `livreurs`, `stores`, `profiles`.
* **APIS UTILISÉES :** Supabase Client direct + Realtime channel.
* **STATUT DOMAINE :** **Spécifique Domaine Vendeur** (Logistique et commandes de biens physiques).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune.
* **RISQUES IDENTIFIÉS :** Aucun. Composant d'excellente facture.
* **ÉTAT :** 🟢 À CONSERVER
* **RECOMMANDATION :** Conserver comme module officiel `orders-management` du domaine Vendeur.

---

### ÉLÉMENT : Paramètres de la Boutique & Ancrage Local
* **EMPLACEMENT :** `src/app/dashboard/settings/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Formulaire de gestion de l'identité de l'établissement : Nom, Description, Ville, Téléphone, Numéro WhatsApp, Type d'activité canonique.
  - Détection automatique et mise à jour des coordonnées GPS (Latitude / Longitude) via le hook `useDistance`.
  - Validation du type d'activité via `businessTypeRegistry`.
* **UTILISÉ PAR :** Route `/dashboard/settings`.
* **DÉPENDANCES :** `useAuth`, `supabase`, `useDistance`, `businessTypeRegistry`.
* **TABLES SUPABASE :** `stores`.
* **APIS UTILISÉES :** Supabase Client direct.
* **STATUT DOMAINE :** **Éligible au VesTyle Core** (Tous les 9 domaines ont besoin de configurer leur nom, ville, contact, WhatsApp et position GPS).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Lien vers `/builder/${storeId}` (route inexistante).
* **RISQUES IDENTIFIÉS :** Utilise `single()` sur `owner_id`.
* **ÉTAT :** 🟢 À CONSERVER / 🟡 À ADAPTER (Généraliser au Core pour tous les domaines).
* **RECOMMANDATION :** Ce module deviendra le composant Core partagé `SiteSettingsPanel` utilisé par les 9 dashboards.

---

### ÉLÉMENT : Planification des Promotions
* **EMPLACEMENT :** `src/app/dashboard/promotions/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Création et planification dans le temps de réductions en pourcentage, en montant fixe ou frais de port offerts.
  - Configuration du compte à rebours pour la vitrine.
  - Activation / désactivation dynamique.
* **UTILISÉ PAR :** Route `/dashboard/promotions`.
* **DÉPENDANCES :** `useAuth`, `/api/promotions`.
* **TABLES SUPABASE :** `promotions`, `stores`.
* **APIS UTILISÉES :** `/api/promotions` (GET, POST, PATCH, DELETE).
* **STATUT DOMAINE :** **Spécifique Domaine Vendeur** (Peut aussi servir au domaine Restauration et Hébergement plus tard).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune.
* **RISQUES IDENTIFIÉS :** Aucun.
* **ÉTAT :** 🟢 À CONSERVER
* **RECOMMANDATION :** Conserver pour le domaine Vendeur.

---

### ÉLÉMENT : Centre de Notifications
* **EMPLACEMENT :** `src/app/dashboard/notifications/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Liste chronologique des alertes (Nouvelle commande, Rupture de stock, Alerte de sécurité).
  - Marquer tout comme lu / suppression.
  - Écoute temps réel des nouvelles notifications.
* **UTILISÉ PAR :** Route `/dashboard/notifications`.
* **DÉPENDANCES :** `useAuth`, `supabase`.
* **TABLES SUPABASE :** `notifications`.
* **APIS UTILISÉES :** Supabase Client direct.
* **STATUT DOMAINE :** **Éligible au VesTyle Core** (Le centre de notifications doit être partagé par les 9 dashboards).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune.
* **RISQUES IDENTIFIÉS :** Aucun.
* **ÉTAT :** 🟢 À CONSERVER / 🟡 À ADAPTER (Composant Core transverse).
* **RECOMMANDATION :** Généraliser le module de notifications pour qu'il gère les événements de tous les domaines (réservation hôtel, table restaurant, devis service, etc.).

---

### ÉLÉMENT : Statistiques et Performances Financières
* **EMPLACEMENT :** `src/app/dashboard/statistiques/page.js`
* **TYPE :** Page Client
* **CE QU'IL FAIT :**
  - Calcule le chiffre d'affaires cumulé, les commandes livrées vs totales, les vues 7 jours et le taux de conversion.
  - Affiche la courbe des revenus sur les 7 derniers jours via `PremiumChart.jsx`.
* **UTILISÉ PAR :** Route `/dashboard/statistiques`.
* **DÉPENDANCES :** `useAuth`, `supabase`, `PremiumChart`.
* **TABLES SUPABASE :** `orders`, `products`, `vendor_analytics`.
* **APIS UTILISÉES :** RPC `get_store_weekly_analytics`.
* **STATUT DOMAINE :** **Spécifique Domaine Vendeur** (Les métriques d'autres domaines seront différentes : taux d'occupation pour hôtel, réservations de tables pour resto, etc.).
* **DÉPENDANCE ANCIENNE ARCHITECTURE :** Aucune.
* **RISQUES IDENTIFIÉS :** Aucun.
* **ÉTAT :** 🟢 À CONSERVER
* **RECOMMANDATION :** Conserver comme tableau de bord analytique spécifique Vendeur.

---

## 3. SYNTHÈSE DE VENTILATION : CORE VS DOMAINE VENDEUR

| Fonctionnalité Dashboard Vendeur | Destiné au VesTyle Core ? | Spécifique Domaine Vendeur ? | Action Future |
| :--- | :---: | :---: | :--- |
| **Authentification & Profil Vendeur** | ✅ OUI | ❌ NON | Partagé par les 9 domaines |
| **Sélecteur de Site / Établissement** (`StoreSwitcher`) | ✅ OUI | ❌ NON | Partagé par les 9 domaines |
| **Paramètres Généraux & GPS** (`settings`) | ✅ OUI | ❌ NON | Partagé par les 9 domaines |
| **Centre de Notifications** (`notifications`) | ✅ OUI | ❌ NON | Partagé par les 9 domaines |
| **Gestion des Prospects / Demandes** (`leads`) | ✅ OUI | ❌ NON | Partagé par les 9 domaines |
| **Catalogue & Variantes Produits** (`products`) | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
| **Gestion & Logs des Stocks** (`stock_logs`) | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
| **Commandes & Tickets de Caisse** (`orders`) | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
| **Promotions & Countdown** (`promotions`) | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
| **Assignation & Suivi Livreurs** (`livreurs`) | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
| **Analytics E-Commerce & Conversion** | ❌ NON | ✅ OUI | Reste exclusif au domaine Vendeur |
