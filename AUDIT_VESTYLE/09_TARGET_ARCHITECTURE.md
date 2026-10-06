# AUDIT FORENSIC VESTYLE — 09_TARGET_ARCHITECTURE.md
**Date de l'audit :** 2026-10-01  
**Auteur :** Développeur Principal VesTyle  
**Objet :** Spécification de l'architecture cible unifiée VesTyle Core, des 9 Domaines Métier, du Contrat de Design et du Moteur de Création.

---

## 1. VISION ARCHITECTURALE CIBLE

VesTyle sera architecturé autour d'un **VesTyle Core** central partagé et de **9 domaines métier spécialisés**.

```
                           ╔═════════════════════════════════════╗
                           ║            VESTYLE CORE             ║
                           ║  (Auth, Sites, Médias, SEO, IA...) ║
                           ╚═════════════════════════════════════╝
                                              │
         ┌────────────┬────────────┬──────────┴───┬────────────┬────────────┐
         ▼            ▼            ▼              ▼            ▼            ▼
   ┌───────────┐┌───────────┐┌───────────┐  ┌───────────┐┌───────────┐┌───────────┐
   │  DOMAINE  ││  DOMAINE  ││  DOMAINE  │  │  DOMAINE  ││  DOMAINE  ││  DOMAINE  │
   │  VENDEUR  ││HÉBERGEMENT││RESTAURATION│  │ SERVICES  ││ ÉDUCATION ││  SANTÉ    │
   └───────────┘└───────────┘└───────────┘  └───────────┘└───────────┘└───────────┘
         ▲            ▲            ▲              ▲            ▲            ▲
         │            │            │              │            │            │
         └────────────┴────────────┴──────────────┴────────────┴────────────┘
                                              │
                           ╔═════════════════════════════════════╗
                           ║      VESTYLE DESIGN SYSTEM          ║
                           ║  (Designs, VisualNodeTree, Rendu)   ║
                           ╚═════════════════════════════════════╝
```

---

## 2. HIÉRARCHIE CONCEPTUELLE UNIFIÉE

La plateforme sépare formellement 8 niveaux de responsabilité :

```
ACCOUNT (Compte Utilisateur Supabase Auth / Profile)
   ↓
SITE (Établissement / Présence web / Store)
   ↓
DOMAIN (L'un des 9 Domaines métier : Vendeur, Hébergement, etc.)
   ↓
CATEGORY (Sous-secteur précis : ex. Streetwear, Hôtel de charme, Pâtisserie)
   ↓
DESIGN (Gabarit graphique déclaré : Layout, Typo, Palette, VisualNodeTree)
   ↓
PAGES (Ensemble des pages du site : Accueil, Catalogue/Menu/Chambres, Contact...)
   ↓
SECTIONS (Blocs visuels d'une page : Hero, Grid, Features, Témoignages...)
   ↓
CONTENT (Données réelles du marchand injectées dans les DataSlots)
```

---

## 3. RESPONSABILITÉS DU VESTYLE CORE

Le VesTyle Core est le squelette partagé par les 9 dashboards. Il prend en charge :

1. **Authentification & Profils :** Comptes, sessions, rôles, permissions (`profiles`, `AuthContext`).
2. **Gestion des Sites & Multi-Établissements :** Création, statut, domaine personnalisé, sélecteur de site actif (`StoreSwitcher`).
3. **Paramètres Communs & Ancrage Local :** Nom, ville, téléphone, WhatsApp, coordonnées GPS (`stores.latitude/longitude`).
4. **Médias & Documents :** Uploads d'images Cloudinary, compression, génération de PDF et QR Codes.
5. **Gestionnaire de Prospects & Demandes :** Table unifiée `leads` pour collecter les demandes de devis, réservations, rendez-vous et contacts.
6. **Communications & Notifications :** Centre de notifications temps réel, push Web & FCM, emails transactionnels.
7. **Moteur d'Orchestration IA :** Passerelle commune vers Mistral AI pour la rédaction, l'analyse et la structuration des actions.
8. **Moteur de Rendu Universel & Publication :** Gestion du cycle `draft_config` -> Validation -> `published_config` -> `UniversalStorefrontRenderer`.

---

## 4. LES 9 DOMAINES MÉTIER & LEURS DASHBOARDS DÉDIÉS

Chaque domaine possède **SON PROPRE DASHBOARD**, mais tous partagent le même Core :

| Domaine | Identifiant | Tableau de Bord Cible | Capacités Métier Clés (`capabilities`) |
| :--- | :--- | :--- | :--- |
| **1. Vendeur** | `domain = vendeur` | **Dashboard Vendeur (Existant conservé)** | `products`, `variants`, `inventory`, `orders`, `stock_logs`, `promotions`, `livreurs` |
| **2. Hébergement** | `domain = hebergement` | **Dashboard Hôtel / Hébergement** | `accommodations`, `room_types`, `availability_calendar`, `reservations`, `pricing_seasons`, `guests` |
| **3. Restauration** | `domain = restauration` | **Dashboard Restaurant & Traiteur** | `menu_categories`, `dishes`, `tables`, `table_reservations`, `takeaway_orders`, `allergens` |
| **4. Services** | `domain = services` | **Dashboard Prestataire & Services** | `service_catalog`, `appointment_slots`, `quotes_devis`, `staff_members`, `client_files` |
| **5. Éducation** | `domain = education` | **Dashboard Éducation & Formation** | `courses`, `programs`, `sessions`, `student_registrations`, `tutors`, `certifications` |
| **6. Santé & Pharmacie**| `domain = sante` | **Dashboard Santé & Pharmacie** | `practitioners`, `consultation_slots`, `pharmacy_catalog`, `prescriptions_intake`, `duty_hours` |
| **7. Immobilier & Transport**| `domain = immobilier_transport`| **Dashboard Immobilier & Transport**| `properties_vehicles`, `listings`, `rental_calendar`, `viewing_appointments`, `inspections` |
| **8. Création & Médias** | `domain = creation_medias` | **Dashboard Créatifs & Médias** | `portfolio_projects`, `media_gallery`, `booking_sessions`, `rate_card`, `client_reviews` |
| **9. Organisations** | `domain = organisations` | **Dashboard Entreprises & Asso** | `organization_profile`, `departments`, `announcements`, `contact_routing`, `memberships` |

---

## 5. LE DESIGN CONTRACT VESTYLE

### Règle Fondamentale
> **LE DASHBOARD DÉFINIT CE QUE LE SITE PEUT FAIRE (DONNÉES & CAPABILITÉS).**  
> **LE DESIGN DÉFINIT COMMENT CES CAPACITÉS SONT PRÉSENTÉES (VISUEL & EXPÉRIENCE).**

Un Design ne stocke **JAMAIS** les données métier en dur. Il déclare un contrat de réception :

```typescript
export interface DesignContract {
  id: string;                      // ex: 'vst_dsn_prestige_atelier_001'
  meta: {
    name: string;
    version: string;
    targetDomain: string;          // 'vendeur' | 'hebergement' | 'restauration'...
    targetCategories: string[];    // ['luxe', 'mode', 'couture']
    previewThumbnails: { desktop: string; mobile: string };
  };
  requiredCapabilities: string[];  // ex: ['PRODUCT_CATALOG', 'WHATSAPP_ORDERING']
  optionalCapabilities: string[];  // ex: ['STOCK_BADGES', 'PROMOTION_COUNTDOWN']
  dataSlots: {
    hero: { title: string; subtitle: string; coverImage: string; ctaText: string };
    collection: { itemSource: 'products' | 'services' | 'rooms' | 'dishes'; layout: 'grid' | 'carousel' | 'masonry' };
    contact: { phoneSlot: string; whatsappSlot: string; addressSlot: string };
  };
  styleSystem: {
    palette: { primary: string; accent: string; background: string; surface: string; isDark: boolean };
    typography: { fontFamilyHeading: string; fontFamilyBody: string };
    spatial: { borderRadius: string; spacingDensity: string };
  };
  pages: Record<string, PageDefinition>;
}
```

---

## 6. MOTEUR DE CRÉATION DE SITE (PARCOURS CIBLES)

### Parcours A — "Choisir un Design"
1. Utilisateur clique sur **"Créer mon site"**
2. Sélectionne son **Domaine** (ex: Restauration)
3. Sélectionne sa **Catégorie** (ex: Pâtisserie / Salon de thé)
4. Affiche uniquement les **Designs compatibles** de cette catégorie avec prévisualisation interactive
5. Utilisateur navigue dans le Design, teste les vues Mobile/Desktop, et valide son choix
6. Renseigne ses informations clés (Nom, Ville, WhatsApp, 1ère offre/menu)
7. Le `VestinAdaptationEngine` compile les données dans le `draft_config`
8. L'utilisateur affine dans le Studio, puis clique sur **Publier** (`published_config`).

### Parcours B — "VesTyle / Mistral s'occupe de tout"
1. Utilisateur clique sur **"Créer mon site"**
2. Décrit librement son activité en langage naturel (ex: *"Je tiens un salon de coiffure VIP à Bonapriso Douala avec prise de RDV"*).
3. **Mistral AI** analyse le texte et extrait :
   - `domain = services`
   - `category = coiffure_beaute`
   - `designId = vst_dsn_services_vip_003`
   - Données extraites : Nom, Ville, Quartier, Services suggérés.
4. Génération instantanée de l'aperçu complet.
5. L'utilisateur valide et publie.

---

## 7. PROTOCOLE DE MODIFICATION STRUCTURÉE PAR MISTRAL

Après création, lorsque l'utilisateur demande une modification par chat ("Change le bouton de réservation en 'Réserver ma table'"), Mistral **ne modifie jamais de code source brut**.

Il émet un payload d'action structuré et typé :

```json
{
  "action": "update_slot",
  "target": {
    "page": "home",
    "section": "sec_hero",
    "slot": "primary_cta"
  },
  "payload": {
    "label": "Réserver ma table",
    "actionType": "OPEN_BOOKING_MODAL"
  }
}
```

Ce payload est validé par le validateur Zod de VesTyle, puis appliqué de manière déterministe sur le `draft_config`.
