# AUDIT FORENSIC VESTYLE — 02_DATABASE_MAP.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Cartographie complète et analyse médico-légale du schéma Supabase / PostgreSQL.

---

## 1. CARTOGRAPHIE DÉTAILLÉE DES TABLES

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             TABLES SUPABASE CARTOGRAPHIÉES                   │
├─────────────────────────┬──────────────────────────┬─────────────────────────┤
│ 🟢 CORE                 │ 🟢 VENDEUR               │ 🟡 RÉUTILISABLE         │
│ • profiles              │ • products               │ • templates             │
│ • stores                │ • orders                 │ • design_templates      │
│ • notifications         │ • categories             │ • design_patterns       │
│ • push_subscriptions    │ • stock_logs             │ • design_failures       │
│ • store_ai_actions      │ • promotions             │ • leads                 │
│                         │ • cart_items             │ • reviews               │
│                         │ • livreurs               │ • vendor_analytics      │
│                         │ • delivery_tracking      │ • product_views         │
├─────────────────────────┼──────────────────────────┴─────────────────────────┤
│ 🟠 ANCIENNE ARCHITECTURE│ 🔴 OBSOLÈTE / EXPÉRIMENTAL NON UTILISÉ            │
│ • store_modules         │ • reservations (MVP V2 - schéma isolé)             │
│ • store_versions        │ • services (MVP V2 - schéma isolé)                 │
│ • store_chat_logs       │ • events & tickets (MVP V2 - schéma isolé)         │
│                         │ • restaurant_menu (MVP V2 - schéma isolé)          │
│                         │ • portfolio_items & testimonials (MVP V2)          │
│                         │ • devis_requests & subscriptions (MVP V2)          │
│                         │ • store_clients & newsletter_subscribers (MVP V2)  │
└─────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. FICHE DÉTAILLÉE DE CHAQUE TABLE

### 2.1 Tables Core & Identité

#### Table : `profiles`
* **Rôle :** Profil étendu des utilisateurs authentifiés (marchands, clients, livreurs, admins).
* **Colonnes :**
  - `id` (uuid, PK, references `auth.users(id) on delete cascade`)
  - `email` (text, unique, not null)
  - `full_name` (text, nullable)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz, default `now()`)
  - `updated_at` (timestamptz, default `now()`)
* **RLS & Politiques :** RLS Activé.
  - SELECT : `auth.uid() = id`
  - UPDATE : `auth.uid() = id`
* **Triggers :** `on_auth_user_created` (exécute `handle_new_user()` sur insert dans `auth.users`).
* **Utilisation Réelle :** Partout (Authentification, Dashboard, Profil, Assignation livreurs, Commandes).
* **Classification :** 🟢 CORE

---

#### Table : `stores`
* **Rôle :** Entité racine représentant un établissement / vitrine commerciale / boutique.
* **Colonnes Clés :**
  - `id` (uuid, PK, default `uuid_generate_v4()`)
  - `owner_id` (uuid, references `profiles(id) on delete cascade`, not null)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `description` (text)
  - `logo_url`, `banner_url`, `cover_url` (text)
  - `city` (text, default 'Douala')
  - `phone`, `whatsapp_link`, `whatsapp_number` (text)
  - `latitude`, `longitude` (numeric, GPS)
  - `store_code` (varchar(5), unique) — Code à 5 chiffres généré automatiquement par trigger
  - `business_type` (text, default 'product')
  - `sub_sector`, `creation_method`, `template_id`, `template_version` (text)
  - `draft_config` (jsonb, default '{}') — Configuration Studio privée propriétaire
  - `published_config` (jsonb, default '{}') — Configuration publique consommée par `stores_public`
  - `layout_config`, `theme_config` (jsonb, configurations legacy)
  - `theme_color`, `secondary_color`, `accent_color`, `font_family`, `shop_theme`
  - `is_active` (boolean, default true), `is_boosted`, `verified` (boolean)
  - `rating` (numeric), `daily_views`, `total_views`, `followers_count` (integer)
  - `created_at`, `updated_at`, `published_at` (timestamptz)
* **RLS & Politiques :** RLS Activé.
  - SELECT / INSERT / UPDATE / DELETE : `owner_id = auth.uid()`
  - Public accès : exclusivement via la vue `stores_public` (qui exclut `owner_id` et `draft_config`).
* **Triggers :** `ensure_store_code` (exécute `generate_store_code()`).
* **Utilisation Réelle :** Utilisation critique dans 100% de l'application.
* **Classification :** 🟢 CORE (Pivot central pour tous les domaines)

---

### 2.2 Tables Domaine Vendeur & Commerce

#### Table : `products`
* **Rôle :** Catalogue des articles physiques et services vendus par les boutiques.
* **Colonnes Clés :**
  - `id` (uuid, PK), `store_id` (uuid, FK `stores(id) on delete cascade`, not null)
  - `name` (text, not null), `description` (text), `slug` (text)
  - `price` (numeric(12,2), not null default 0), `currency` (text default 'XOF')
  - `category` (text), `category_id` (uuid, FK `categories(id)`), `global_category_id` (uuid)
  - `image_url` (text), `images` (jsonb array), `tags` (text[])
  - `stock_quantity` (integer default 0), `moq` (integer default 1)
  - `is_active` (boolean default true), `is_featured`, `is_new` (boolean)
  - `offer_type` (text default 'product' check `offer_type in ('product','service')`)
  - `image_embedding_1024` (vector(1024)) — Vecteur DINOv2 + SigLIP pour recherche visuelle IA
  - `ai_caption` (text), `ai_tags` (text[]), `ai_indexed_at` (timestamptz)
  - `metadata` (jsonb default '{}') — Attributs métiers flexibles
  - `created_at`, `updated_at` (timestamptz)
* **Index Clés :**
  - `products_hnsw_image_1024_idx` (HNSW sur `image_embedding_1024 vector_cosine_ops`)
  - `products_ai_tags_idx` (GIN sur `ai_tags`)
  - `products_ai_caption_trgm_idx` (GIN Trigram sur `ai_caption`)
  - `idx_products_store_id`, `idx_products_is_active`
* **RLS & Politiques :**
  - SELECT : Public (`is_active = true` ou propriétaire)
  - ALL (Insert/Update/Delete) : Propriétaire du store (`auth.uid() = stores.owner_id`)
* **Utilisation Réelle :** Dashboard Vendeur (`/dashboard/products`, `/dashboard/add-product`), Storefront, Recherche Visuelle, Panier, Commandes.
* **Classification :** 🟢 VENDEUR (Modèle complet et mature)

---

#### Table : `orders`
* **Rôle :** Enregistrement des commandes e-commerce passées auprès des boutiques.
* **Colonnes Clés :**
  - `id` (uuid, PK), `store_id` (uuid, FK `stores(id) on delete cascade`, not null)
  - `user_id` (uuid, references `profiles(id)`, nullable pour commandes anonymes)
  - `customer_name` (text, not null), `customer_phone` (text, not null), `customer_email` (text)
  - `shipping_address` (text), `delivery_lat`, `delivery_lng` (decimal(9,6))
  - `total_amount` (decimal(12,2), not null)
  - `order_items` (jsonb, not null) — Tableau d'objets `[{id, name, price, quantity, image}]`
  - `status` (text, default 'pending' check `status in ('pending','processing','shipped','delivered','cancelled','awaiting_payment')`)
  - `payment_method` (text), `paid_at`, `shipped_at`, `delivered_at`, `confirmed_at` (timestamptz)
  - `livreur_id` (uuid, references `livreurs(id)`), `livreur_token` (text unique)
  - `idempotency_key` (text, index unique partiel) — Protection anti-double commande
  - `created_at` (timestamptz)
* **RLS & Politiques :**
  - SELECT : Propriétaire de la boutique + Acheteur authentifié (`user_id = auth.uid()`)
  - INSERT : Public (Anon + Auth)
  - UPDATE : Propriétaire de la boutique + Livreur assigné (ou via RPC sécurisée)
* **Realtime :** Inscrit dans `supabase_realtime` pour mise à jour instantanée du Dashboard Vendeur.
* **RPC Dédiée :** `process_order_checkout` (transaction atomique avec verrou `FOR UPDATE` sur les stocks).
* **Classification :** 🟢 VENDEUR

---

#### Table : `stock_logs`
* **Rôle :** Traçabilité et historique de tous les mouvements de stock des produits.
* **Colonnes :** `id`, `product_id`, `store_id`, `type` ('add','remove','set'), `quantity`, `before_qty`, `after_qty`, `note`, `created_at`.
* **Utilisation Réelle :** Dashboard Vendeur (`/dashboard/products` -> Modal d'historique de stock), mis à jour automatiquement par `process_order_checkout`.
* **Classification :** 🟢 VENDEUR

---

#### Table : `promotions`
* **Rôle :** Promotions planifiées avec types de remise (pourcentage, montant fixe, livraison offerte).
* **Colonnes :** `id`, `store_id`, `title`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `applicable_to`, `products`, `show_countdown`, `countdown_text`, `is_active`, `created_at`.
* **Utilisation Réelle :** Dashboard Vendeur (`/dashboard/promotions`), API `/api/promotions`, Storefront.
* **Classification :** 🟢 VENDEUR

---

#### Table : `livreurs` & `delivery_tracking`
* **Rôle :** Gestion de l'équipe de livreurs du marchand et suivi GPS en temps réel.
* **Colonnes `livreurs` :** `id`, `store_id`, `name`, `phone`, `is_available`, `created_at`.
* **Colonnes `delivery_tracking` :** `id`, `order_id`, `livreur_id`, `lat`, `lng`, `accuracy`, `updated_at`.
* **Realtime :** Inscrit dans `supabase_realtime`.
* **Utilisation Réelle :** `/delivery`, `/suivi/[id]`, Dashboard Commandes (`/dashboard/orders`).
* **Classification :** 🟢 VENDEUR / LOGISTIQUE

---

### 2.3 Tables Potentiellement Réutilisables & Multi-Domaines

#### Table : `leads`
* **Rôle :** Collecte des demandes de contact, devis, prises de rendez-vous et prospects pour tous les types d'activités.
* **Colonnes :** `id`, `store_id`, `customer_name`, `customer_phone`, `customer_email`, `request_type`, `item_id`, `item_name`, `item_type`, `message`, `status` ('new','contacted','converted','cancelled'), `metadata`, `created_at`, `updated_at`.
* **Utilisation Réelle :** `/api/leads`, `StudioLeadsManager.jsx`, Dashboard Vendeur (Mode "Demandes").
* **Potentiel Cible :** Parfait pour devenir le réceptacle commun de leads pour les domaines **Services**, **Immobilier**, **Éducation**, **Restauration** et **Santé**.
* **Classification :** 🟡 POTENTIELLEMENT RÉUTILISABLE (Transverse Core)

---

#### Table : `reviews`
* **Rôle :** Avis et notations clients (étoiles 1 à 5, commentaires).
* **Colonnes :** `id`, `product_id`, `order_id`, `reviewer_id`, `rating`, `comment`, `created_at`, `updated_at`.
* **Classification :** 🟡 POTENTIELLEMENT RÉUTILISABLE (À étendre pour accepter `store_id` direct pour les avis d'établissements).

---

#### Tables Intelligence & Templates (`templates`, `design_templates`, `design_patterns`, `design_failures`)
* **`templates` :** Bibliothèque canonique déclarative JSON (Master 2).
* **`design_templates` :** Écosystème des templates VST-CODE indexés.
* **`design_patterns` :** Patterns de design vectorisés (pgvector 1024D).
* **`design_failures` :** Mémoire des corrections de design.
* **Classification :** 🟡 POTENTIELLEMENT RÉUTILISABLE (Base de connaissance pour le futur Moteur de Création de Designs).

---

### 2.4 Tables d'Anciennes Architectures & Obsolètes

#### Table : `store_modules` (Génération V2 Modulaire)
* **Rôle Ancien :** Découpage d'une boutique en modules indépendants (`vitrine`, `catalogue`, `reservation`, `portfolio`, `restaurant`, etc.).
* **Problème :** En conflit direct avec le modèle de document JSON déclaratif unifié (`published_config` / `draft_config`).
* **Utilisation Réelle :** Encore interrogée en fallback par `StorefrontClient.js` et alimentée par `/api/ai/generate-store`.
* **Classification :** 🟠 ANCIENNE ARCHITECTURE (À isoler puis déprécier sans casser les boutiques existantes).

---

#### Tables Spécialisées non connectées (MVP V2)
* **Tables :** `reservations`, `services`, `events`, `tickets`, `portfolio_items`, `testimonials`, `restaurant_menu`, `store_clients`, `newsletter_subscribers`, `devis_requests`, `subscriptions`.
* **Constat :** Ces tables ont été créées lors de la migration `modules_migration.sql` mais **aucun dashboard ne les gère actuellement** (le dashboard actuel gère uniquement `products`, `orders`, `promotions`, `stock_logs`, `leads`).
* **Classification :** 🔴 OBSOLÈTE / EXPÉRIMENTAL (Ces tables ne doivent PAS être supprimées maintenant, mais elles seront remplacées proprement par les modèles de données des 8 nouveaux domaines cibles).

---

## 3. VUES BASE DE DONNÉES

| Vue | Définition / Rôle | Sécurité |
| :--- | :--- | :--- |
| `stores_public` | Expose les boutiques actives pour les visiteurs sans exposer `owner_id` ni `draft_config`. | `security_definer`, SELECT accordé à `anon` et `authenticated`. |
| `templates_public` | Expose uniquement les templates dont `status = 'published'`, masquant les rapports internes de qualité. | `security_invoker = true`, SELECT accordé au public. |
| `products_not_indexed` | Liste les produits n'ayant pas encore d'embedding vectoriel 1024D pour le batch processing. | Accessible à `authenticated` et `service_role`. |

---

## 4. FONCTIONS ET RPC SUPABASE

1. `handle_new_user()` : Trigger créant automatiquement la ligne `profiles` lors du signup.
2. `generate_store_code()` : Trigger générant un code unique à 5 chiffres à la création de boutique.
3. `process_order_checkout(p_store_id, p_items, p_customer, p_delivery_fee, p_idempotency_key)` :
   - Transaction atomique sécurisée `SECURITY DEFINER`.
   - Verrouille les lignes produits avec `FOR UPDATE`.
   - Vérifie le stock, le statut actif, le montant minimum et le MOQ.
   - Crée la commande, décrémente les stocks et insère les `stock_logs`.
   - Gère le replay idempotent en cas de double-soumission.
4. `match_products_v2(query_embedding, match_threshold, match_count)` : Recherche vectorielle cosinus sur `products.image_embedding_1024`.
5. `search_vestyle_hybrid(query_embedding, query_text, match_threshold, match_count)` : Fusion hybride DINOv2 (70%) + Florence-2 Trigram Text (30%).
6. `upsert_product_embedding(p_product_id, p_embedding, p_ai_caption, p_ai_tags)` : Indexation IA depuis le backend.
7. `match_design_patterns(...)` : Recherche de patterns de design similaires.
8. `increment_vst_code_usage(code)` : Compteur d'utilisation des templates partagés.

---

## 5. REALTIME & STORAGE BUCKETS

### Realtime (Publications Supabase)
Tables publiées sur `supabase_realtime` :
* `orders` (Alertes sonores et mise à jour dynamique du Dashboard Vendeur)
* `delivery_tracking` (Mise à jour de la position livreur sur la carte client)
* `livreurs` (Disponibilité des livreurs)
* `notifications` (Badge de notifications temps réel)
* `reservations`, `tickets`, `store_modules` (Abonnements résiduels V2)

### Buckets de Stockage
* `product-images` (Photos de produits hébergées sur Supabase Storage, bien que Cloudinary soit majoritairement utilisé pour les nouveaux ajouts)
* `store-logos` & `store-banners` (Médias identitaires)

---

## 6. RÈGLE ABSOLUE POUR LA FUTURE MIGRATION
AUCUNE modification de table, AUCUN `DROP TABLE`, AUCUN `ALTER TABLE` n'est réalisé pendant cette phase. Les données actuelles de tous les marchands restent 100% intègres et opérationnelles.
