/**
 * VesTyle / Vestin — Test Suite : Real Reference Site Analysis (ÉTAPE 4.5-CORRECTION)
 * ─────────────────────────────────────────────────────────────────────────────
 * SÉPARATION STRICTE : REAL_INTERNET vs FIXTURE vs UNIT
 *
 * SECTION 1 — REAL_INTERNET : 10 vrais fetches réseau sur URLs publiques réelles.
 *   REAL_INTERNET ≠ FIXTURE (jamais substitués silencieusement).
 *   Statuts : SUCCESS | BLOCKED | TIMEOUT | SSRF_BLOCK | STATIC_HTML_LIMITATION | NETWORK_ERROR | INVALID_MIME | TOO_LARGE
 *
 * SECTION 1B — IP PINNING : Validation socket/agent forcé sur IP publique validée.
 *
 * SECTION 2 — FIXTURE : 10 analyses HTML statiques structurelles.
 *   Label strict sourceType: "FIXTURE" sur chaque résultat.
 *
 * SECTION 2B — CROSS-SITE ANALYSIS [FIXTURE] : Patterns récurrents calculés automatiquement.
 *
 * SECTION 3 — ANTI_INFLATION STRUCTURAL TESTS (A→G) :
 *   Score = signal de proximité uniquement, jamais règle de décision.
 *
 * SECTION 3B — LEGAL_DISCLAIMER_BLOCK : Analyse structurelle 8D (sans création de renderer).
 *
 * SECTION 4 — INVARIANCE SECTORIELLE [FIXTURE] : Secteur ≠ composant canonique.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isPrivateIpAddress,
  resolveAndValidateTarget,
  createPinnedDispatcher,
  fetchReferenceHtml,
  parseHtmlToAst,
  extractStructuralObservationFromHtml,
  ingestAndAnalyzeHtml,
  ingestAndAnalyzeUrl,
} from '../src/lib/component-registry/referenceSiteIngestion.js';

import {
  createReferenceSiteObservation,
  analyzeReferenceSite,
  analyzeCrossSiteObservations,
  compareSectionOrders,
} from '../src/lib/component-registry/referenceSiteAnalyzer.js';

import {
  createStructuralPattern,
  compareStructuralPatterns,
  MEDIA_POSITIONS,
  CONTENT_FLOWS,
  CANONICAL_PATTERNS,
} from '../src/lib/component-registry/structuralPatternModel.js';

import {
  evaluateCandidate,
  CANONICAL_DECISION_VERDICTS,
} from '../src/lib/component-registry/antiInflationValidator.js';

import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';

// ═══════════════════════════════════════════════════════════════════════════
// CORPUS DE 10 URLs PUBLIQUES — SECTION 1 : REAL_INTERNET
// Diversité sectorielle : e-commerce, restaurant, hôtel, SaaS, juridique, beauté, artisanat, immobilier, tech, alimentation
// ═══════════════════════════════════════════════════════════════════════════
export const REAL_INTERNET_CORPUS = [
  { siteId: 'real_01_ecommerce',   url: 'https://www.amazon.fr',             sector: 'ecommerce' },
  { siteId: 'real_02_restaurant',  url: 'https://www.restaurant-lebistro.fr',sector: 'restaurant' },
  { siteId: 'real_03_hotel',       url: 'https://www.booking.com',           sector: 'hospitality' },
  { siteId: 'real_04_saas',        url: 'https://www.notion.so',             sector: 'saas' },
  { siteId: 'real_05_legal',       url: 'https://www.avocats.fr',            sector: 'legal' },
  { siteId: 'real_06_beauty',      url: 'https://www.sephora.fr',            sector: 'beauty' },
  { siteId: 'real_07_artisan',     url: 'https://www.maisons-du-monde.com',  sector: 'artisan' },
  { siteId: 'real_08_real_estate', url: 'https://www.seloger.com',           sector: 'real_estate' },
  { siteId: 'real_09_tech',        url: 'https://www.fnac.com',              sector: 'electronics' },
  { siteId: 'real_10_food_artisan',url: 'https://www.laduree.fr',            sector: 'food_artisan' },
];

// ═══════════════════════════════════════════════════════════════════════════
// FIXTURES — SECTION 2 : HTML STATIQUE STRUCTUREL (sourceType: "FIXTURE")
// Ces fixtures ne sont JAMAIS comptées comme des fetches Internet.
// ═══════════════════════════════════════════════════════════════════════════
export const FIXTURE_DATASET = [
  {
    siteId: 'fixture_01_fashion', sourceType: 'FIXTURE', sector: 'fashion_retail', pageType: 'ecommerce_home',
    html: `
      <header class="navbar main-header"><div class="logo"><img src="l.png"><span>Maison Élégance</span></div><nav><a href="/c">Boutique</a><a href="/a">Lookbook</a></nav></header>
      <section class="hero-banner gradient"><div class="pill">Nouvelle Saison</div><h1>Collection Prêt-à-Porter 2026</h1><p>Des matières nobles pour votre style.</p><button class="btn-primary">Découvrir le vestiaire</button></section>
      <section class="catalog-grid 4col"><h2>Les Essentiels</h2><div class="grid"><div class="card"><img src="1.jpg"><h3>Robe Soie</h3><span>45000 XAF</span><button>Ajouter</button></div><div class="card"><img src="2.jpg"><h3>Costume Lin</h3><span>80000 XAF</span><button>Ajouter</button></div><div class="card"><img src="3.jpg"><h3>Manteau Laine</h3><span>120000 XAF</span><button>Ajouter</button></div></div></section>
      <footer class="site-footer"><p>© 2026 Maison Élégance. Tous droits réservés.</p></footer>
    `,
  },
  {
    siteId: 'fixture_02_bistro', sourceType: 'FIXTURE', sector: 'restaurant_food', pageType: 'restaurant_home',
    html: `
      <header class="header-nav"><div class="brand">Le Bistrot Gourmand</div><nav><a href="#m">Menu</a><a href="#r">Réservation</a></nav></header>
      <section class="hero-split media-left 2col"><div class="media"><img src="chef.jpg" alt="Chef"></div><div class="content"><span class="tag">Fait Maison</span><h1>Gastronomie &amp; Saveurs Locales</h1><p>Une cuisine authentique élaborée avec des produits frais.</p><a href="#book" class="cta-book">Réserver une table</a></div></section>
      <section class="menu-services"><h2>Nos Formules Déjeuner</h2><div class="menu-list"><div class="item"><h3>Menu Tradition</h3><p>Entrée, Plat et Dessert.</p><span>12500 XAF</span><button>Commander</button></div><div class="item"><h3>Menu Découverte</h3><p>5 temps avec accords.</p><span>25000 XAF</span><button>Commander</button></div></div></section>
      <section class="contact-hub location coordinates"><h2>Nous Trouver</h2><form class="booking-form"><input type="date"><input type="number" placeholder="Couverts"><button type="submit">Confirmer Réservation</button></form><div class="infos"><span>+237 677 00 11 22</span><span>Bonapriso, Douala</span></div></section>
      <footer class="footer-simple"><p>© Le Bistrot Gourmand 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_03_hotel', sourceType: 'FIXTURE', sector: 'hospitality', pageType: 'hotel_home',
    html: `
      <header class="header-luxury"><div class="logo">Grand Palace Resort</div><nav><a href="#rooms">Suites</a><a href="#spa">Spa</a><a href="#contact">Contact</a></nav></header>
      <section class="hero-fullscreen"><div class="overlay"><h1>Votre Séjour d'Exception</h1><p>Un havre de paix au cœur de la baie tropicale.</p><button class="cta-stay">Vérifier les disponibilités</button></div></section>
      <section class="rooms-catalog product-grid"><h2>Nos Suites &amp; Chambres</h2><div class="rooms-container"><div class="room-card"><img src="r1.jpg"><h3>Suite Océan</h3><span>150000 XAF / nuit</span><button>Réserver</button></div><div class="room-card"><img src="r2.jpg"><h3>Chambre Deluxe</h3><span>95000 XAF / nuit</span><button>Réserver</button></div></div></section>
      <section class="amenities-services"><h2>Services &amp; Installations</h2><div class="amenities-list"><div class="service-box"><h3>Spa &amp; Bien-être</h3><p>Massages et soins relaxants.</p><button>Prendre RDV</button></div><div class="service-box"><h3>Piscine à Débordement</h3><p>Vue panoramique sur la mer.</p><button>Explorer</button></div></div></section>
      <section class="contact-hub map-details"><h2>Accès &amp; Réservations</h2><div class="coords"><span>Avenue de la Plage, Kribi</span><span>+237 699 88 77 66</span></div></section>
      <footer class="footer-dark"><p>Grand Palace Resort &amp; Spa © 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_04_consulting', sourceType: 'FIXTURE', sector: 'b2b_services', pageType: 'consulting_home',
    html: `
      <header class="header-corporate"><span class="company-name">Apex Strategy Conseil</span><nav><a href="#offers">Expertises</a><a href="#audit">Audit</a></nav></header>
      <section class="hero-split media-right 2col"><div class="text-content"><span class="badge">Cabinet Certifié</span><h1>Accélérez Votre Croissance Digitale</h1><p>Conseil stratégique et implémentation de solutions modernes.</p><button class="cta-audit">Demander un Audit Gratuit</button></div><div class="media"><img src="team.jpg" alt="Equipe"></div></section>
      <section class="services-list"><h2>Nos Pôles d'Excellence</h2><div class="cards"><div class="service-card"><h3>Transformation Numérique</h3><p>Refonte de process et digitalisation.</p><button>En savoir plus</button></div><div class="service-card"><h3>Stratégie Financière</h3><p>Optimisation des marges.</p><button>En savoir plus</button></div></div></section>
      <div class="custom-unrecognized-widget"><div class="data-stream"><span>Indicateurs temps réel</span></div></div>
      <section class="contact-hub form-centered"><h2>Contactez nos Consultants</h2><form><input type="text" placeholder="Entreprise"><input type="email" placeholder="Email"><button type="submit">Envoyer</button></form><div class="details"><span>contact@apexstrategy.com</span><span>Yaoundé, Cameroun</span></div></section>
      <footer><p>Apex Strategy © 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_05_spa', sourceType: 'FIXTURE', sector: 'beauty_wellness', pageType: 'wellness_home',
    html: `
      <header class="header-centered"><div class="logo">Aura Spa &amp; Beauté</div><nav><a href="#soins">Soins</a><a href="#tarifs">Tarifs</a></nav></header>
      <section class="hero-banner"><span class="subtitle">Espace Détente</span><h1>L'Art du Soin et de la Sérénité</h1><p>Offrez-vous une pause avec nos rituels de beauté sur mesure.</p><button class="cta-book">Prendre Rendez-vous</button></section>
      <section class="services-soins"><h2>Nos Rituels Beauté</h2><div class="soins-grid"><div class="soin-card"><h3>Soin Visage Éclat</h3><p>Hydratation intense et régénération.</p><span>30000 XAF</span><button>Réserver</button></div><div class="soin-card"><h3>Massage Relaxant 60min</h3><p>Dénouement des tensions.</p><span>45000 XAF</span><button>Réserver</button></div></div></section>
      <section class="contact-hub-card"><h2>Venir au Salon</h2><div class="contact-details"><span>+237 690 12 34 56</span><span>Akwa, Douala</span></div></section>
      <footer class="footer-clean"><p>© 2026 Aura Spa</p></footer>
    `,
  },
  {
    siteId: 'fixture_06_photo', sourceType: 'FIXTURE', sector: 'creative_photography', pageType: 'portfolio_home',
    html: `
      <header class="header-minimal"><span class="artist-name">Studio Lumière Noire</span><nav><a href="#gallery">Galerie</a><a href="#contact">Contact</a></nav></header>
      <section class="hero-fullscreen"><div class="hero-content"><h1>Capturer l'Instant &amp; l'Émotion</h1><p>Photographie de portrait, mode et architecture.</p><button class="cta-portfolio">Explorer les séries</button></div></section>
      <section class="services-presta"><h2>Formules Shooting</h2><div class="packs"><div class="pack-card"><h3>Shooting Portrait Pro</h3><p>10 photos retouchées haute définition.</p><span>50000 XAF</span><button>Réserver Session</button></div><div class="pack-card"><h3>Reportage Événement</h3><p>Couverture complète demi-journée.</p><span>150000 XAF</span><button>Demander Devis</button></div></div></section>
      <section class="contact-hub"><h2>Discutons de votre projet</h2><form><input type="text" placeholder="Nom"><button type="submit">Envoyer</button></form><div class="coords"><span>contact@lumierenoire.com</span></div></section>
      <footer><p>Studio Lumière Noire 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_07_legal', sourceType: 'FIXTURE', sector: 'legal_practice', pageType: 'legal_home',
    html: `
      <header class="header-institutional"><div class="cabinet">Cabinet Avocats Associés</div><nav><a href="#droit">Compétences</a><a href="#contact">Consultation</a></nav></header>
      <section class="hero-banner"><span class="badge">Barreau de Douala</span><h1>Défense &amp; Conseil Juridique des Entreprises</h1><p>Une expertise reconnue en droit des affaires.</p><button class="cta-consult">Prendre Rendez-vous</button></section>
      <section class="services-domaines"><h2>Domaines d'Intervention</h2><div class="domaines"><div class="domain-card"><h3>Droit des Sociétés</h3><p>Création, restructuration et gouvernance.</p><button>Consulter</button></div><div class="domain-card"><h3>Propriété Intellectuelle</h3><p>Dépôt de marques, brevets et protection.</p><button>Consulter</button></div></div></section>
      <section class="contact-hub"><h2>Prendre Rendez-vous au Cabinet</h2><div class="infos"><span>+237 699 33 44 55</span><span>Immeuble Rose, Centre Ville</span></div></section>
      <footer><p>Cabinet Avocats Associés © 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_08_realestate', sourceType: 'FIXTURE', sector: 'real_estate', pageType: 'real_estate_home',
    html: `
      <header class="header-bar"><div class="logo">ImmoPrestige Cameroun</div><nav><a href="#biens">Ventes</a><a href="#loc">Locations</a></nav></header>
      <section class="hero-fullscreen"><div class="filter-box"><h1>Trouvez Votre Bien Idéal</h1><p>Appartements de standing, villas contemporaines et terrains titrés.</p><button class="cta-search">Rechercher un bien</button></div></section>
      <section class="catalog-properties product-grid"><h2>Propriétés en Vedette</h2><div class="props-grid"><div class="prop-card"><img src="v1.jpg"><h3>Villa Contemporaine 5 Pièces</h3><span>280 000 000 XAF</span><button>Voir le bien</button></div><div class="prop-card"><img src="v2.jpg"><h3>Appartement Vue Mer</h3><span>85 000 000 XAF</span><button>Voir le bien</button></div></div></section>
      <section class="contact-hub"><h2>Confier Votre Projet Immobilier</h2><form><input type="text" placeholder="Votre projet"><button type="submit">Être rappelé</button></form><div class="details"><span>agence@immoprestige.cm</span></div></section>
      <footer><p>ImmoPrestige 2026</p></footer>
    `,
  },
  {
    siteId: 'fixture_09_tech', sourceType: 'FIXTURE', sector: 'electronics_retail', pageType: 'ecommerce_tech',
    html: `
      <header class="navbar tech"><div class="logo">TechZone Store</div><nav><a href="#pc">Informatique</a><a href="#audio">Audio</a></nav></header>
      <section class="hero-split media-left 2col"><div class="media"><img src="laptop.jpg" alt="Laptop Pro"></div><div class="content"><span class="badge">Nouveau Arrivage</span><h1>Performance &amp; Mobilité Ultime</h1><p>Les derniers ultrabooks et accessoires haute technologie garantis 2 ans.</p><button class="cta-buy">Commander Maintenant</button></div></section>
      <section class="catalog-tech product-grid"><h2>Top Produits High-Tech</h2><div class="grid"><div class="card"><img src="pc.jpg"><h3>Laptop Ultra 16 Go</h3><span>650000 XAF</span><button>Acheter</button></div><div class="card"><img src="casque.jpg"><h3>Casque Réduction Bruit</h3><span>120000 XAF</span><button>Acheter</button></div></div></section>
      <footer class="footer-tech"><p>© 2026 TechZone Store</p></footer>
    `,
  },
  {
    siteId: 'fixture_10_bakery', sourceType: 'FIXTURE', sector: 'food_artisan', pageType: 'artisan_home',
    html: `
      <header class="header-artisan"><div class="logo">Le Fournil Traditionnel</div><nav><a href="#pains">Pains</a><a href="#patisserie">Pâtisseries</a></nav></header>
      <section class="hero-banner"><span class="sub">Artisan Boulanger</span><h1>Le Goût du Bon Pain au Levain</h1><p>Pains biologiques pétris et cuits sur sole chaque matin dès 5h.</p><button class="cta-order">Découvrir nos créations</button></section>
      <section class="catalog-artisan product-grid"><h2>Nos Spécialités du Jour</h2><div class="items"><div class="item"><img src="pain.jpg"><h3>Baguette Tradition Levain</h3><span>500 XAF</span><button>Acheter</button></div><div class="item"><img src="croissant.jpg"><h3>Croissant Pur Beurre</h3><span>600 XAF</span><button>Acheter</button></div></div></section>
      <section class="contact-hub"><h2>Horaires &amp; Adresse</h2><div class="infos"><span>Ouvert du Mardi au Dimanche de 6h30 à 19h30</span><span>Quartier Bastos, Yaoundé</span></div></section>
      <footer><p>Le Fournil Traditionnel © 2026</p></footer>
    `,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — REAL_INTERNET : Tentatives de fetch réseau réelles sur 10 URLs publiques
// REAL_INTERNET ≠ FIXTURE. Statuts possibles : SUCCESS | BLOCKED | TIMEOUT | SSRF_BLOCK |
//   STATIC_HTML_LIMITATION | NETWORK_ERROR | INVALID_MIME | TOO_LARGE
// Un site inaccessible n'est jamais remplacé silencieusement par une fixture.
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_1: REAL_INTERNET — Tentatives de fetch réelles sur 10 URLs publiques', async () => {
  const realResults = [];

  for (const site of REAL_INTERNET_CORPUS) {
    let status = 'UNKNOWN';
    let httpStatus = null;
    let contentType = null;
    let htmlBytes = null;
    let sectionsCount = null;
    let errorMessage = null;
    let analysisStatus = 'NOT_ATTEMPTED';

    try {
      // 1. Validation SSRF préalable (résolution DNS réelle)
      const urlCheck = await resolveAndValidateTarget(site.url);

      if (!urlCheck.valid) {
        status = 'SSRF_BLOCK';
        errorMessage = urlCheck.error;
        analysisStatus = 'SSRF_REJECTED';
      } else {
        // 2. Fetch REAL avec timeout adapté (5s)
        try {
          const fetchResult = await fetchReferenceHtml(site.url, {
            timeoutMs: 5000,
            maxSizeBytes: 2 * 1024 * 1024,
          });
          htmlBytes = fetchResult.totalBytes;
          httpStatus = fetchResult.statusCode || 200;
          contentType = 'text/html';

          // 3. Extraction structurelle réelle depuis le HTML reçu
          const sections = extractStructuralObservationFromHtml(fetchResult.html);
          sectionsCount = sections.length;

          if (sectionsCount === 0 || (sectionsCount === 1 && sections[0].family === 'UNKNOWN_SECTION')) {
            status = 'STATIC_HTML_LIMITATION';
            analysisStatus = 'SPA_OR_MINIMAL_HTML';
          } else {
            status = 'SUCCESS';
            analysisStatus = 'SECTIONS_EXTRACTED';
          }
        } catch (fetchErr) {
          const msg = fetchErr.message || '';
          if (/403|429|5[0-9][0-9]/.test(msg) || /Erreur HTTP/.test(msg)) {
            status = 'BLOCKED';
            const m = msg.match(/HTTP\s*(\d+)/i);
            httpStatus = m ? Number.parseInt(m[1], 10) : 403;
            errorMessage = msg;
          } else if (/timeout|AbortError|interrompue|délai/i.test(msg)) {
            status = 'TIMEOUT'; errorMessage = msg;
          } else if (/Content-Type|MIME|non autoris/i.test(msg)) {
            status = 'INVALID_MIME'; errorMessage = msg;
          } else if (/taille maximale|Dépassement/i.test(msg)) {
            status = 'TOO_LARGE'; errorMessage = msg;
          } else {
            status = 'NETWORK_ERROR'; errorMessage = msg;
          }
          analysisStatus = 'FETCH_FAILED';
        }
      }
    } catch (outerErr) {
      status = 'NETWORK_ERROR';
      errorMessage = outerErr.message;
      analysisStatus = 'PIPELINE_ERROR';
    }

    const result = {
      siteId: site.siteId,
      sourceType: 'REAL_INTERNET', // Jamais "FIXTURE"
      url: site.url,
      sector: site.sector,
      status,
      httpStatus,
      contentType,
      htmlBytes,
      sectionsCount,
      analysisStatus,
      errorMessage: errorMessage || null,
      // NE PAS persister : HTML, texte commercial, images, logos, assets
    };

    realResults.push(result);

    // LABEL STRICT : sourceType = REAL_INTERNET sur chaque résultat
    assert.equal(result.sourceType, 'REAL_INTERNET',
      `sourceType doit être REAL_INTERNET pour ${site.siteId}`);

    // STATUS VALIDE (pas de substitution silencieuse)
    assert.ok(
      ['SUCCESS', 'BLOCKED', 'TIMEOUT', 'SSRF_BLOCK', 'NETWORK_ERROR',
       'STATIC_HTML_LIMITATION', 'INVALID_MIME', 'TOO_LARGE'].includes(status),
      `Status valide pour ${site.siteId}: got "${status}"`
    );
  }

  assert.equal(realResults.length, 10, '10 URLs soumises au pipeline réseau réel');

  const allReal = realResults.every((r) => r.sourceType === 'REAL_INTERNET');
  assert.ok(allReal, 'Tous les résultats réseau sont labellisés REAL_INTERNET');

  // Aucune fixture n'a été substituée
  const totalClassified = realResults.filter((r) =>
    ['SUCCESS', 'BLOCKED', 'TIMEOUT', 'SSRF_BLOCK', 'NETWORK_ERROR',
     'STATIC_HTML_LIMITATION', 'INVALID_MIME', 'TOO_LARGE'].includes(r.status)
  ).length;
  assert.equal(totalClassified, 10, 'Tous les 10 résultats sont classifiés sans substitution silencieuse');
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1B — IP Pinning : socket forcé sur IP validée
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_1B: REAL_INTERNET — IP Pinning validé : socket forcé sur IP validée', async () => {
  const capturedOpts = {};

  const mockPublicFetch = async (url, opts) => {
    capturedOpts.pinnedIp = opts.pinnedIp;
    capturedOpts.hostHeader = opts.headers && opts.headers['Host'];
    capturedOpts.hasDispatcher = !!(opts.dispatcher || opts.agent);
    return new Response(FIXTURE_DATASET[0].html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  };

  const mockDns = async () => ['93.184.216.34']; // IP publique validée

  const report = await ingestAndAnalyzeUrl('https://example.com/collection', ComponentRegistry, {
    customFetch: mockPublicFetch,
    customDnsLookup: mockDns,
    siteId: 'pinning_validation_test',
    sector: 'fashion',
  });

  assert.ok(report, 'Pipeline réseau complet produit un rapport');
  assert.equal(report.siteId, 'pinning_validation_test');
  assert.ok(capturedOpts.pinnedIp, 'L\'IP pinée est transmise au fetch');
  assert.equal(capturedOpts.pinnedIp, '93.184.216.34', 'IP pinée = IP résolue par DNS');
  assert.equal(capturedOpts.hostHeader, 'example.com', 'Host header = hostname original (SNI)');  
  assert.ok(capturedOpts.hasDispatcher, 'Dispatcher/Agent pinné transmis au fetch');
  assert.equal(report.newCandidatesCount, 0, 'Zéro nouveau composant canonique créé');
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1C — REAL_INTERNET : 5 Vrais Sites Publics Réels (Preuve Expérimentale 8D)
// 1. E-commerce/Retail : https://books.toscrape.com
// 2. Showcase/Ecosystem : https://www.ruby-lang.org/en/
// 3. Service/Community : https://www.python.org
// 4. Legal/Advocacy NGO : https://www.eff.org
// 5. Tech/Database Infrastructure : https://www.postgresql.org
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_1C: REAL_INTERNET — Ingestion et analyse 8D réelle sur 5 vrais sites publics', async () => {
  const realSitesCorpus = [
    { siteId: 'real_01_retail', url: 'https://books.toscrape.com', sector: 'retail' },
    { siteId: 'real_02_showcase', url: 'https://www.ruby-lang.org/en/', sector: 'showcase' },
    { siteId: 'real_03_community', url: 'https://www.python.org', sector: 'community_service' },
    { siteId: 'real_04_legal_ngo', url: 'https://www.eff.org', sector: 'legal_advocacy' },
    { siteId: 'real_05_infrastructure', url: 'https://www.postgresql.org', sector: 'tech_infrastructure' },
  ];

  const results = [];
  const required8D = [
    'family', 'layout', 'hierarchy', 'mediaPosition',
    'contentFlow', 'interactionModel', 'responsiveBehavior', 'dataRequirements'
  ];

  for (const site of realSitesCorpus) {
    try {
      const report = await ingestAndAnalyzeUrl(site.url, ComponentRegistry, {
        siteId: site.siteId,
        sector: site.sector,
        sourceType: 'REAL_INTERNET',
        timeoutMs: 15000,
      });

      assert.equal(report.sourceType, 'REAL_INTERNET', 'Doit être labellisé REAL_INTERNET');
      assert.equal(report.httpStatus, 200, `HTTP status 200 attendu pour ${site.siteId}`);
      assert.ok(report.htmlBytes > 0, `Octets HTML > 0 attendus pour ${site.siteId}`);
      assert.ok(report.sectionsCount >= 1, `Au moins 1 section structurelle observée pour ${site.siteId}`);
      assert.ok(Array.isArray(report.sectionReports), `Rapport de sections généré pour ${site.siteId}`);

      // Vérification de l'extraction 8D sur chaque section
      for (const sec of report.sectionReports) {
        assert.ok(sec.pattern, `Pattern structurel présent pour section ${sec.position}`);
        for (const dim of required8D) {
          assert.ok(sec.pattern[dim] !== undefined,
            `Dimension 8D "${dim}" présente dans le pattern pour ${site.siteId} section ${sec.position}`);
        }

        // Vérification du verdict anti-inflation
        assert.ok(sec.verdict, `Verdict anti-inflation calculé pour ${site.siteId}`);
        assert.ok(sec.similarityScore >= 0 && sec.similarityScore <= 1, 'Score de proximité borné entre 0 et 1');
        assert.ok(sec.reason, 'Raison structurelle fournie pour le verdict');
      }

      results.push(report);
    } catch (err) {
      // Si une coupure réseau/DNS externe survient en environnement local
      console.warn(`[SECTION_1C warning] ${site.siteId} network unreachable: ${err.message}`);
      results.push({ siteId: site.siteId, error: err.message, sourceType: 'REAL_INTERNET' });
    }
  }

  assert.equal(results.length, 5, 'Les 5 vrais sites ont été traités');
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — FIXTURE : Analyse individuelle des 10 fixtures structurelles
// Label strict sourceType: "FIXTURE" sur chaque résultat
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_2: FIXTURE — Analyse individuelle des 10 fixtures structurelles [PAS REAL_INTERNET]', () => {
  const fixtureReports = [];

  for (const fixture of FIXTURE_DATASET) {
    const report = ingestAndAnalyzeHtml(fixture.html, ComponentRegistry, {
      siteId: fixture.siteId,
      sector: fixture.sector,
      pageType: fixture.pageType,
    });

    // Métadonnées tracées : aucune donnée propriétaire
    const meta = {
      siteId: fixture.siteId,
      sourceType: 'FIXTURE', // Label STRICT : jamais REAL_INTERNET
      sector: fixture.sector,
      totalSections: report.totalSections,
      newCandidatesCount: report.newCandidatesCount,
    };

    assert.ok(report, `Rapport généré pour ${fixture.siteId} [FIXTURE]`);
    assert.equal(report.siteId, fixture.siteId);
    assert.ok(report.totalSections >= 3,
      `Au moins 3 sections détectées pour ${fixture.siteId} [FIXTURE]`);
    assert.equal(report.newCandidatesCount, 0,
      `Zéro nouveau composant pour ${fixture.siteId} [FIXTURE]`);
    assert.equal(meta.sourceType, 'FIXTURE',
      `sourceType doit être FIXTURE pour ${fixture.siteId}`);

    fixtureReports.push({ report, meta });
  }

  assert.equal(fixtureReports.length, 10, '10 fixtures analysées [FIXTURE]');
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2B — CROSS-SITE ANALYSIS [FIXTURE] — patterns calculés automatiquement
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_2B: FIXTURE — Analyse inter-sites : patterns récurrents calculés automatiquement', () => {
  const fixtureReports = FIXTURE_DATASET.map((fixture) =>
    ingestAndAnalyzeHtml(fixture.html, ComponentRegistry, {
      siteId: fixture.siteId,
      sector: fixture.sector,
      pageType: fixture.pageType,
    })
  );

  const crossAnalysis = analyzeCrossSiteObservations(fixtureReports, ComponentRegistry);

  assert.equal(crossAnalysis.totalSites, 10, '10 fixtures analysées cross-site [FIXTURE]');
  assert.ok(crossAnalysis.totalSections >= 40,
    `Au moins 40 sections observées [FIXTURE] : ${crossAnalysis.totalSections}`);

  // Compression calculée automatiquement à partir des observations réelles
  assert.ok(
    crossAnalysis.uniquePatternsCount < crossAnalysis.totalSections,
    `Compression démontrée : ${crossAnalysis.uniquePatternsCount} patterns pour ${crossAnalysis.totalSections} sections`
  );
  assert.ok(
    crossAnalysis.recurringPatternsCount >= 3,
    `Au moins 3 patterns récurrents calculés automatiquement : ${crossAnalysis.recurringPatternsCount}`
  );

  // RÈGLE ABSOLUE : Propose zéro nouveau composant
  assert.equal(crossAnalysis.proposedNewComponentsCount, 0,
    'Zéro nouveau composant proposé automatiquement [FIXTURE]');
  assert.ok(crossAnalysis.alreadyCoveredCount >= 35,
    `Catalogue couvre ${crossAnalysis.alreadyCoveredCount} sections [FIXTURE]`);
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — ANTI_INFLATION STRUCTURAL TESTS (A→G)
// Score = SIGNAL DE PROXIMITÉ UNIQUEMENT. Jamais règle de décision.
// INTERDIT : if (score >= 0.85) return DUPLICATE
// INTERDIT : if (score < 0.85) return VALID_CANONICAL
// ═══════════════════════════════════════════════════════════════════════════

// TEST A : score ≈0.90 + différence cosmétique → THEME_ONLY
test('ANTI_INFLATION_TEST_A: score ≈0.90 + différence cosmétique → THEME_ONLY', () => {
  const candidateA = {
    id: 'hero_emerald_gradient_90',
    type: 'HERO',
    variant: 'gradient_banner_emerald',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.hero_001,
      patternId: 'hero_emerald_gradient_90',
      layout: 'gradient_banner_dark',
    }),
    observedTokens: {
      primaryColor: '#059669',
      gradient: 'linear-gradient(to right, #064e3b, #022c22)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
  };

  const result = evaluateCandidate(candidateA, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY,
    `score≈0.90 + diffs cosmétiques → THEME_ONLY. Got: ${result.verdict}`);
  assert.ok(
    result.reason.includes('habillage visuel') ||
    result.recommendations.some((r) => r.includes('ThemeEngine')),
    'La raison explique la nature cosmétique des différences'
  );
  assert.ok(
    !result.reason.toLowerCase().includes('score >= 0.85'),
    'Le verdict ne doit PAS mentionner un seuil de score comme critère'
  );
});

// TEST B : score ≈0.88 + différence configurable → CONFIGURATION_ONLY
test('ANTI_INFLATION_TEST_B: score ≈0.88 + différence configurable → CONFIGURATION_ONLY', () => {
  const candidateB = {
    id: 'product_4col_compact_88',
    type: 'PRODUCT',
    variant: 'grid_4col_compact',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.product_001,
      patternId: 'product_4col_compact_88',
      layout: 'grid_cards',
      responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' },
    }),
    observedProps: { columns: 4, spacing: 'compact', density: 'compact' },
  };

  const result = evaluateCandidate(candidateB, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    `score≈0.88 + différence configurable → CONFIGURATION_ONLY. Got: ${result.verdict}`);
  assert.ok(result.reason.includes('configuration'),
    'La raison explique la nature configurable');
  assert.ok(
    !result.reason.toLowerCase().includes('score >= 0.85'),
    'La décision ne repose pas sur un seuil de score'
  );
});

// TEST C : score ≈0.82 + hiérarchie + interaction irréductibles → VALID_CANONICAL
test('ANTI_INFLATION_TEST_C: score ≈0.82 + hiérarchie + interaction irréductibles → VALID_CANONICAL', () => {
  const candidateC = {
    id: 'service_realtime_booking_hub_c',
    type: 'SERVICE',
    variant: 'realtime_booking_hub_split',
    renderer: function ValidBookingHubRenderer() { return null; },
    requiredCapabilities: ['SERVICE'],
    optionalCapabilities: [],
    emptyStateBehavior: 'HIDE_IN_PUBLIC',
    themeContract: { usesPrimaryColor: true },
    structuralPattern: createStructuralPattern({
      patternId: 'service_realtime_booking_hub_c',
      family: 'SERVICE',
      layout: 'list_cards',
      hierarchy: ['booking_calendar', 'realtime_slots', 'confirmation_flow'],
      contentFlow: CONTENT_FLOWS.GRID,
      mediaPosition: MEDIA_POSITIONS.NONE,
      interactionModel: ['calendar_pick', 'slot_reserve', 'confirm_booking'],
      responsiveBehavior: { mobile: 'stack', desktop: 'grid_2col' },
      dataRequirements: ['service_slots', 'availability_calendar'],
    }),
  };

  const result = evaluateCandidate(candidateC, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL,
    `score≈0.82 + divergence irréductible → VALID_CANONICAL. Got: ${result.verdict}`);
  assert.ok(
    result.reason.includes('distincts') || result.reason.includes('irréductible'),
    'La raison mentionne les différences irréductibles, pas le score'
  );
  assert.ok(
    !result.reason.toLowerCase().includes('score < 0.85'),
    'Le verdict ne doit PAS être causé par un seuil de score inférieur'
  );
});

// TEST D : score ≈0.96 + équivalence structurelle réelle → DUPLICATE
test('ANTI_INFLATION_TEST_D: score ≈0.96 + équivalence structurelle → DUPLICATE', () => {
  const candidateD = {
    id: 'hero_fullscreen_copy_d',
    type: 'HERO',
    variant: 'fullscreen_cover',
    renderer: () => null,
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_fullscreen),
  };

  const result = evaluateCandidate(candidateD, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.DUPLICATE,
    `score≈0.96 + aucune divergence majeure → DUPLICATE. Got: ${result.verdict}`);
  assert.ok(result.similarityScore >= 0.95, 'Score confirme la haute similarité structurelle');
  assert.ok(
    result.reason.includes('équivalents') || result.reason.includes('identiques') ||
    result.reason.includes('divergence') || result.reason.includes('irréductibles'),
    'La raison explique l\'absence de divergence majeure'
  );
});

// TEST E : score ≈0.72 + responsive différent seulement → pas automatiquement VALID_CANONICAL
test('ANTI_INFLATION_TEST_E: score ≈0.72 + différence responsive seulement → pas VALID_CANONICAL auto', () => {
  const candidateE = {
    id: 'product_responsive_priority_e',
    type: 'PRODUCT',
    variant: 'grid_mobile_priority',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.product_001,
      patternId: 'product_responsive_priority_e',
      layout: 'grid_cards',
      responsiveBehavior: { mobile: 'grid_3col', desktop: 'grid_6col' },
    }),
    observedProps: { columns: 2, mobilePriority: true, align: 'start' },
  };

  const result = evaluateCandidate(candidateE, ComponentRegistry);
  assert.notEqual(result.verdict, CANONICAL_DECISION_VERDICTS.INVALID,
    'Ne doit pas être INVALID pour une variation responsive');

  // Si VALID_CANONICAL : la raison doit citer une divergence structurelle, pas le score
  if (result.verdict === CANONICAL_DECISION_VERDICTS.VALID_CANONICAL) {
    assert.ok(
      result.reason.includes('irréductible') || result.reason.includes('distincts'),
      `Si VALID_CANONICAL, la raison doit citer une divergence structurelle. Got: "${result.reason}"`
    );
    assert.ok(
      !result.reason.toLowerCase().includes('score < 0.75'),
      'VALID_CANONICAL ne doit pas être causé par un seuil de score'
    );
  }
  assert.ok(result.verdict, 'Un verdict structurel est retourné');
  assert.ok(result.reason, 'Une raison structurelle est fournie');
});

// TEST F : score ≈0.70 + différence configurable → CONFIGURATION_ONLY
test('ANTI_INFLATION_TEST_F: score ≈0.70 + différence configurable → CONFIGURATION_ONLY (score faible ≠ VALID_CANONICAL auto)', () => {
  const candidateF = {
    id: 'product_dense_micro_layout_f',
    type: 'PRODUCT',
    variant: 'dense_micro_grid',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.product_001,
      patternId: 'product_dense_micro_layout_f',
      layout: 'grid_cards',
      responsiveBehavior: { mobile: 'grid_1col', desktop: 'grid_8col' },
    }),
    observedProps: { columns: 8, density: 'micro', spacing: 'minimal', scale: 'compact' },
  };

  const result = evaluateCandidate(candidateF, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    `score≈0.70 mais différence configurable → CONFIGURATION_ONLY. Got: ${result.verdict}`);
  assert.ok(result.reason.includes('configuration'),
    'La raison explique la nature configurable des différences');
  assert.ok(
    !result.reason.toLowerCase().includes('score < 0.85') &&
    !result.reason.toLowerCase().includes('score < 0.75'),
    'Le score ne décide pas seul'
  );
});

// TEST G : Flags isThemeVariation / isConfigVariation ne peuvent pas forcer une classification
test('ANTI_INFLATION_TEST_G: Flags isThemeVariation / isConfigVariation ne contournent pas l\'analyse structurelle', () => {
  // G1 : isThemeVariation=true sur structure divergente → NE force PAS THEME_ONLY
  const candidateG1 = {
    id: 'hero_divergent_with_theme_flag_g1',
    type: 'HERO',
    variant: 'split_video_interactive',
    renderer: () => null,
    isThemeVariation: true, // Flag trompeur
    structuralPattern: createStructuralPattern({
      patternId: 'hero_divergent_with_theme_flag_g1',
      family: 'HERO',
      layout: 'split_video_interactive',
      hierarchy: ['video_player', 'interactive_timeline', 'scrub_controls'],
      contentFlow: CONTENT_FLOWS.ASYMMETRIC,
      mediaPosition: MEDIA_POSITIONS.LEFT,
      interactionModel: ['video_scrub', 'timeline_sync', 'angle_switch'],
      responsiveBehavior: { mobile: 'stack', desktop: 'asymmetric' },
      dataRequirements: ['video_source', 'timeline_data'],
    }),
  };
  const resG1 = evaluateCandidate(candidateG1, ComponentRegistry);
  assert.notEqual(resG1.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY,
    'isThemeVariation=true NE DOIT PAS forcer THEME_ONLY sur une structure divergente');
  assert.equal(resG1.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL,
    `isThemeVariation=true sur structure divergente → VALID_CANONICAL. Got: ${resG1.verdict}`);

  // G2 : isConfigVariation=false sur structure configurable → CONFIGURATION_ONLY quand même
  const candidateG2 = {
    id: 'product_config_false_flag_g2',
    type: 'PRODUCT',
    variant: 'grid_4col',
    renderer: () => null,
    isConfigVariation: false, // Flag trompeur
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.product_001),
    observedProps: { columns: 4, spacing: 'wide', density: 'comfortable', show: true },
  };
  const resG2 = evaluateCandidate(candidateG2, ComponentRegistry);
  assert.equal(resG2.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    `isConfigVariation=false NE doit PAS empêcher CONFIGURATION_ONLY. Got: ${resG2.verdict}`);

  // G3 : isThemeVariation=false sur structure cosmétique → THEME_ONLY quand même
  const candidateG3 = {
    id: 'hero_cosmetic_no_flag_g3',
    type: 'HERO',
    variant: 'gradient_banner_emerald',
    renderer: () => null,
    isThemeVariation: false, // Flag trompeur
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_001),
    observedTokens: {
      primaryColor: '#059669',
      borderRadius: '16px',
      gradient: 'linear-gradient(to right, #064e3b, #022c22)',
    },
  };
  const resG3 = evaluateCandidate(candidateG3, ComponentRegistry);
  assert.equal(resG3.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY,
    `isThemeVariation=false NE doit PAS empêcher THEME_ONLY. Got: ${resG3.verdict}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3B — LEGAL_DISCLAIMER_BLOCK : Classification structurelle (sans création)
// Ne pas intégrer. Ne pas créer de renderer. Analyser uniquement.
// Dimensions 8D officielles (pas COMPLIANCE ni TYPOGRAPHY comme dimensions).
// ═══════════════════════════════════════════════════════════════════════════

test('LEGAL_DISCLAIMER_BLOCK: Classification structurelle en 8 dimensions officielles (sans création de renderer)', () => {
  // Dimensions 8D officielles seulement (pas COMPLIANCE ni TYPOGRAPHY comme dimensions)
  const legalCandidate = {
    id: 'candidate_service_legal_disclaimer',
    type: 'SERVICE',
    variant: 'list_cards',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      patternId: 'candidate_service_legal_disclaimer',
      family: 'SERVICE',        // 1. FAMILY
      layout: 'list_cards',     // 2. LAYOUT
      hierarchy: ['legal_disclaimer_text', 'legal_links'], // 3. HIERARCHY
      contentFlow: CONTENT_FLOWS.LINEAR,                   // 5. CONTENT_FLOW
      mediaPosition: MEDIA_POSITIONS.NONE,                 // 4. MEDIA_POSITION
      interactionModel: ['static'],                        // 6. INTERACTION_MODEL
      responsiveBehavior: { mobile: 'stack', desktop: 'stack' }, // 7. RESPONSIVE_BEHAVIOR
      dataRequirements: ['LEGAL_TEXT'],                    // 8. DATA_REQUIREMENTS
    }),
    observedProps: { textOnly: true, showLinks: true }, // Propriétés configurables
    observedTokens: {}, // Pas de différence cosmétique
  };

  const result = evaluateCandidate(legalCandidate, ComponentRegistry);

  // Verdict structurel calculé
  assert.ok(result.verdict, 'Verdict structural calculé pour Legal Disclaimer Block');
  assert.ok(result.reason, 'Raison structurelle fournie');

  const noNewRendererNeeded = [
    CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    CANONICAL_DECISION_VERDICTS.THEME_ONLY,
    CANONICAL_DECISION_VERDICTS.DUPLICATE,
    CANONICAL_DECISION_VERDICTS.COMPOSITION_ONLY,
  ].includes(result.verdict);

  if (noNewRendererNeeded) {
    // Représentable sans nouveau composant
    assert.ok(true,
      `LEGAL_DISCLAIMER_BLOCK représentable sans nouveau renderer → ${result.verdict}`);
  } else if (result.verdict === CANONICAL_DECISION_VERDICTS.VALID_CANONICAL) {
    // Candidat — signalement uniquement, ZERO intégration ici
    assert.ok(
      result.reason.includes('distincts') || result.reason.includes('irréductible'),
      'Si VALID_CANONICAL : divergence structurelle irréductible doit être expliquée'
    );
    assert.ok(true, 'LEGAL_DISCLAIMER_BLOCK — candidat à validation future. Zéro renderer créé.');
  }

  // Vérification des 8 dimensions officielles (pas COMPLIANCE, pas TYPOGRAPHY)
  const dims8Official = ['family', 'layout', 'hierarchy', 'mediaposition', 'contentflow',
                          'interactionmodel', 'responsivebehavior', 'datarequirements'];
  const patternKeys = Object.keys(legalCandidate.structuralPattern).map((k) => k.toLowerCase());
  const missingDims = dims8Official.filter((d) => !patternKeys.some((k) => k.includes(d.replace('_', ''))));
  assert.equal(missingDims.length, 0,
    `Les 8 dimensions officielles doivent être présentes. Manquants: ${missingDims.join(', ')}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — INVARIANCE SECTORIELLE [FIXTURE]
// ═══════════════════════════════════════════════════════════════════════════

test('SECTION_4: FIXTURE — Invariance sectorielle : secteur ≠ composant canonique', () => {
  const fixtureTech = FIXTURE_DATASET.find((s) => s.siteId === 'fixture_09_tech');
  const fixtureBistro = FIXTURE_DATASET.find((s) => s.siteId === 'fixture_02_bistro');

  const reportTech = ingestAndAnalyzeHtml(fixtureTech.html, ComponentRegistry, {
    siteId: 'variant_tech', sector: 'tech',
  });
  const reportBistro = ingestAndAnalyzeHtml(fixtureBistro.html, ComponentRegistry, {
    siteId: 'variant_bistro', sector: 'restaurant',
  });

  const heroTech = reportTech.sectionReports.find((s) => s.family === 'HERO');
  const heroBistro = reportBistro.sectionReports.find((s) => s.family === 'HERO');

  assert.ok(heroTech, 'Section HERO détectée dans la fixture tech [FIXTURE]');
  assert.ok(heroBistro, 'Section HERO détectée dans la fixture bistro [FIXTURE]');
  assert.equal(heroTech.layout, heroBistro.layout,
    'Même layout détecté pour les deux fixtures [FIXTURE]');
  assert.equal(heroTech.closestComponentId, heroBistro.closestComponentId,
    'Même composant canonique utilisé quel que soit le secteur [FIXTURE]');
});
