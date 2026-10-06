# 🏛️ Architecture & Journal de Bord — Nouveau Système de Boutiques Vestine

> **Document Fondateur & Registre de Suivi Permanent**
> Ce fichier consigne à la racine du projet toutes les décisions d'architecture, règles strictes et étapes franchies afin de garantir une continuité parfaite quel que soit le compte ou l'environnement de développement.

---

## 🎯 1. Vision Globale & Règles Absolues (Non-Négociables)

1. **Marketplace Vestine (VesTyle)** :
   - Plateforme de mise en relation directe Vendeur ↔ Client au Cameroun.
   - Les commerçants doivent pouvoir créer des boutiques uniques, ultra-personnalisées et autonomes adaptées à tous les secteurs d'activités.

2. **Préservation Totale des Données Clés** :
   - ❌ **INTERDICTION STRICTE** de toucher aux comptes utilisateurs, profils auth, vendeurs, produits, services, commandes, panier ou logique métier existante.
   - Le système de boutique se greffe sur les données existantes (`stores`, `products`, `orders`) sans altérer le schéma relationnel de base.

3. **Philosophie Locale-First (Offline-First Absolu)** :
   - L'éditeur et la visualisation fonctionnent **à 100% sans connexion Internet** en 0 milliseconde.
   - Le serveur n'est jamais nécessaire pour éditer ou afficher une boutique déjà en cache local.

4. **Zéro Code React dans les Données & Zéro Dashboard Fixe** :
   - Aucune boutique ne contient de code spécifique à un template.
   - Le dashboard de configuration est **100% dynamique** et inspecte les métadonnées (`editableProperties`, `constraints`) des composants réellement présents dans la boutique et les capacités du secteur d'activité.

5. **Sécurité Totale (Anti-Code Arbitraire)** :
   - L'IA et les packages de templates importés produisent **strictement du JSON déclaratif pur**.
   - Zéro génération de HTML, JSX, CSS ou JavaScript exécutable.

---

## 🏗️ 2. Architecture Modulaire des Moteurs (21 Piliers)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION VESTINE                             │
│                                       ↓                                      │
│                            LOCAL STORE (IndexedDB)                           │
│                     ┌─────────────────┴─────────────────┐                    │
│                     ↓                                   ↓                    │
│          DYNAMIC DASHBOARD ENGINE               UNIVERSAL RENDERER           │
│        (Généré selon businessType)                      ↓                    │
│                     ↓                           COMPONENT REGISTRY           │
│       ┌─────────────┴─────────────┐         (1 100 Composants Déclaratifs)   │
│       │ • CapabilityEngine        │                     ↑                    │
│       │ • BusinessTypeRegistry    │          ┌──────────┴──────────┐         │
│       │ • CompatibilityEngine     │          │ • ConstraintEngine  │         │
│       │ • InventoryEngine         │          │ • ResponsiveEngine  │         │
│       │ • BookingEngine           │          │ • ThemeEngine       │         │
│       │ • QuoteEngine             │          └─────────────────────┘         │
│       │ • StaffEngine             │                                          │
│       │ • DeliveryEngine          │                                          │
│       │ • HistoryEngine           │                                          │
│       │ • AISelectorEngine        │                                          │
│       └───────────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────────────────┘
                                        ↕
┌──────────────────────────────────────────────────────────────────────────────┐
│                         SYNC ENGINE (Tâche de fond)                          │
│                                       ↕                                      │
│                               SERVER / SUPABASE                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 3. Spécification des Moteurs Spécialisés

| Moteur | Localisation | Rôle & Responsabilité |
| :--- | :--- | :--- |
| **CapabilityEngine** | `src/lib/capability-engine/` | Gère les 22 capacités canoniques (`PRODUCT`, `SERVICE`, `BOOKING`, `CART`, `STAFF`, `AVAILABILITY`, etc.). |
| **BusinessTypeRegistry** | `src/lib/business-types/` | Gère les 19 types de secteurs d'activités avec leurs capacités et leurs exclusions. |
| **BookingEngine** | `src/lib/booking-engine/` | Moteur de réservation multi-modes (services, praticiens, créneaux, chambres, tables, ressources, événements). |
| **InventoryEngine** | `src/lib/inventory-engine/` | Gestion des stocks, SKU, matrices de variantes (tailles x couleurs) et prix dégressifs/promo offline. |
| **QuoteEngine** | `src/lib/quote-engine/` | Gestion du flux de devis sur mesure (`Demande -> Chiffrage -> Acceptation`). |
| **StaffEngine** | `src/lib/staff-engine/` | Gestion des équipes, coiffeurs, praticiennes, horaires individuels et attributions de services. |
| **DeliveryEngine** | `src/lib/delivery-engine/` | Zones de livraison, tarifs forfaitaires pour le Cameroun et suivi d'état (préparation, expédié, livré). |
| **ThemeEngine** | `src/lib/theme-engine/` | Traduction déterministe de prompts ("rose, élégant") en chartes graphiques HSL/Hex pures sans CSS arbitraire. |
| **CompatibilityEngine**| `src/lib/compatibility-engine/`| Vérifie la compatibilité stricte entre composants, secteurs et capacités. |
| **ConstraintEngine** | `src/components/visual-engine/` | Garde-fous esthétiques protégeant les boutons, les logos et la disposition tactile mobile. |
| **ResponsiveEngine** | `src/lib/responsive-engine/` | Adaptation mobile-first (small_mobile, mobile, tablet, desktop) des colonnes et densités d'assets. |
| **HistoryEngine** | `src/lib/history-engine/` | Pile d'historique Undo / Redo (40 états) pour l'éditeur visuel. |
| **AISelectorEngine** | `src/lib/ai-selector/` | Déduit le secteur, les capacités, le thème et sélectionne les composants existants sans générer de code. |
| **TemplateValidator** | `src/lib/template-packages/` | Contrôle d'intégrité et pare-feu anti-injection de code exécutable. |
| **VersionEngine** | `src/lib/versioning-engine/` | SemVer et migration douce des schémas de boutiques sans casser les configurations existantes. |

---

## 🏛️ 4. Les 11 Familles & 1 100 Composants Enregistrés

| Famille | Variantes Enregistrées | Moteur Métier Découplé |
| :--- | :--- | :--- |
| **HEADER** | `header_001` → `header_100` | 100 architectures visuelles distinctes (Minimaliste, E-Commerce Mega, Double Étage, Capsules Flottantes, Haute Couture, Services RDV, Hybride, Restaurant, Cyber Tech, Flash Deal). Compatible HeaderRenderer + ThemeEngine + ConstraintEngine + ResponsiveEngine. Galerie de prévisualisation : `/admin/headers-gallery`. |
| **HERO** | `hero_001` → `hero_100` | Bannières, double CTA, lookbook, badges de confiance |
| **CAROUSEL** | `carousel_001` → `carousel_100` | Défilements horizontaux, lookbooks, stories images |
| **CATEGORY** | `category_001` → `category_100` | Puces scrollables, grilles de filtres univers |
| **PRODUCT** | `product_001` → `product_100` | Grilles produits, prix dynamique, gestion des stocks |
| **SERVICE** | `service_001` → `service_100` | Cartes de prestations, durées, bouton de réservation WhatsApp |
| **BOOKING** | `booking_001` → `booking_100` | Interfaces de réservation branchées sur `useStoreBooking` |
| **STAFF** | `staff_001` → `staff_100` | Présentation des équipes, stylistes, praticiennes, coachs |
| **ROOM** | `room_001` → `room_100` | Hébergements, suites meublées, commodités, tarifs nuitée |
| **MENU** | `menu_001` → `menu_100` | Cartes des restaurants, plats du chef, badges épicés |
| **FOOTER** | `footer_001` → `footer_100` | Pieds de page, horaires, ville, mentions officielles |

---

## 📜 5. Scénario de Démonstration Validé (Point 21)

> **Prompt Commerçant** : *"Je suis coiffeuse. Je veux une boutique rose, élégante et moderne. Je propose tresses, coloration et soins. Les clientes doivent pouvoir prendre rendez-vous."*
>
> 1. **AI Selector** déduit : `businessType = hair_salon`.
> 2. **Capability Engine** active : `SERVICE`, `STAFF`, `AVAILABILITY`, `BOOKING`, `REVIEWS`, `CONTACT`.
> 3. **Theme Engine** génère la palette `pink_glow` (`#E91E8C`, `#2D0E1F`, `#FFD1E8`).
> 4. **Compatibility Engine** sélectionne : `header_059`, `hero_072`, `service_051`, `staff_014`, `booking_001`, `review_003`, `contact_001`, `footer_067`.
> 5. **Dynamic Dashboard** affiche uniquement les formulaires pertinents (aucun paramètre e-commerce ou hôtel).
> 6. **Offline-First** : La boutique fonctionne à 100% hors connexion dès le chargement local.

---

### ⏳ Prochaines Actions :
Prêt pour toute extension ou intégration additionnelle demandée par l'utilisateur.
