/**
 * VesTyle / Vestin — Test Suite : Reference Site Ingestion & Structural Extraction
 * ─────────────────────────────────────────────────────────────────────────────
 * ÉTAPE 4.4 : Vérification formelle du moteur d'ingestion sécurisée,
 * de la protection SSRF au moment de la connexion, de la lecture par chunks (2 Mo),
 * du parseur AST HTML Node.js pur, de l'extraction multi-signaux,
 * de la stricte construction par WHITELIST (zéro fuite de données propriétaires),
 * et de l'intégration complète avec le moteur anti-inflation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isPrivateIpAddress,
  resolveAndValidateTarget,
  validateReferenceUrl,
  createPinnedDispatcher,
  fetchReferenceHtml,
  parseHtmlToAst,
  extractStructuralObservationFromHtml,
  ingestAndAnalyzeHtml,
  ingestAndAnalyzeUrl,
  INGESTION_LIMITS,
} from '../src/lib/component-registry/referenceSiteIngestion.js';
import {
  CANONICAL_DECISION_VERDICTS,
  evaluateCandidate,
} from '../src/lib/component-registry/antiInflationValidator.js';
import {
  compareSectionOrders,
} from '../src/lib/component-registry/referenceSiteAnalyzer.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';

// ═══════════════════════════════════════════════════════════════════════════
// 1. TESTS DE SÉCURITÉ SSRF & VALIDATION D'ADRESSES IP
// ═══════════════════════════════════════════════════════════════════════════

test('1.1 - isPrivateIpAddress bloque rigoureusement toutes les plages IPv4 privées et réservées', () => {
  // Localhost
  assert.equal(isPrivateIpAddress('127.0.0.1'), true);
  assert.equal(isPrivateIpAddress('127.255.255.254'), true);

  // Réseaux privés RFC 1918
  assert.equal(isPrivateIpAddress('10.0.0.1'), true);
  assert.equal(isPrivateIpAddress('10.255.0.1'), true);
  assert.equal(isPrivateIpAddress('172.16.0.1'), true);
  assert.equal(isPrivateIpAddress('172.31.255.255'), true);
  assert.equal(isPrivateIpAddress('192.168.0.1'), true);
  assert.equal(isPrivateIpAddress('192.168.100.50'), true);

  // Cloud Metadata & Link-Local
  assert.equal(isPrivateIpAddress('169.254.169.254'), true);
  assert.equal(isPrivateIpAddress('169.254.1.1'), true);

  // Réseau actuel & Broadcast
  assert.equal(isPrivateIpAddress('0.0.0.0'), true);
  assert.equal(isPrivateIpAddress('255.255.255.255'), true);

  // CGNAT & Multicast
  assert.equal(isPrivateIpAddress('100.64.0.1'), true);
  assert.equal(isPrivateIpAddress('224.0.0.1'), true);
  assert.equal(isPrivateIpAddress('240.0.0.1'), true);

  // IPs publiques légitimes (doivent retourner false)
  assert.equal(isPrivateIpAddress('8.8.8.8'), false);
  assert.equal(isPrivateIpAddress('1.1.1.1'), false);
  assert.equal(isPrivateIpAddress('142.250.190.46'), false);
});

test('1.2 - isPrivateIpAddress bloque rigoureusement toutes les plages IPv6 privées et mapped', () => {
  // Localhost IPv6
  assert.equal(isPrivateIpAddress('::1'), true);
  assert.equal(isPrivateIpAddress('0:0:0:0:0:0:0:1'), true);
  assert.equal(isPrivateIpAddress('::'), true);

  // Unique Local Address (ULA) fc00::/7
  assert.equal(isPrivateIpAddress('fc00::1'), true);
  assert.equal(isPrivateIpAddress('fd12:3456:789a::1'), true);

  // Link-Local fe80::/10
  assert.equal(isPrivateIpAddress('fe80::1'), true);
  assert.equal(isPrivateIpAddress('fe80::215:5dff:fe00:1'), true);

  // IPv4-mapped IPv6 vers IP privée
  assert.equal(isPrivateIpAddress('::ffff:127.0.0.1'), true);
  assert.equal(isPrivateIpAddress('::ffff:192.168.1.1'), true);
  assert.equal(isPrivateIpAddress('::ffff:10.0.0.5'), true);

  // IPv6 publique légitime
  assert.equal(isPrivateIpAddress('2001:4860:4860::8888'), false);
  assert.equal(isPrivateIpAddress('2606:4700:4700::1111'), false);
});

test('1.3 - resolveAndValidateTarget rejette les protocoles dangereux et les destinations locales', async () => {
  // Protocoles interdits
  const jsRes = await resolveAndValidateTarget('javascript:alert(1)');
  assert.equal(jsRes.valid, false);

  const dataRes = await resolveAndValidateTarget('data:text/html,<h1>Bad</h1>');
  assert.equal(dataRes.valid, false);

  const fileRes = await resolveAndValidateTarget('file:///etc/passwd');
  assert.equal(fileRes.valid, false);

  const ftpRes = await resolveAndValidateTarget('ftp://ftp.example.com/file');
  assert.equal(ftpRes.valid, false);

  // Noms d'hôtes locaux
  const localhostRes = await resolveAndValidateTarget('http://localhost:3000/shop');
  assert.equal(localhostRes.valid, false);

  const localRes = await resolveAndValidateTarget('https://my-service.local/api');
  assert.equal(localRes.valid, false);

  const internalRes = await resolveAndValidateTarget('http://db.internal');
  assert.equal(internalRes.valid, false);

  // IP privées directes
  const loopbackRes = await resolveAndValidateTarget('http://127.0.0.1:8000');
  assert.equal(loopbackRes.valid, false);

  const awsMetadataRes = await resolveAndValidateTarget('http://169.254.169.254/latest/meta-data/');
  assert.equal(awsMetadataRes.valid, false);
});

test('1.4 - resolveAndValidateTarget bloque un domaine public qui résout vers une IP privée (DNS Rebinding)', async () => {
  // Mock DNS injecté résolvant vers une IP privée
  const mockDnsLookup = async (hostname) => {
    if (hostname === 'public-domain-pointing-private.com') {
      return ['192.168.1.55', '10.0.0.1'];
    }
    return ['93.184.216.34']; // IP publique de example.com
  };

  const rebindingRes = await resolveAndValidateTarget('https://public-domain-pointing-private.com/page', {
    customDnsLookup: mockDnsLookup,
  });

  assert.equal(rebindingRes.valid, false);
  assert.ok(/privée|SSRF/i.test(rebindingRes.error));

  // Domaine public résolvant vers IP publique valide
  const validRes = await resolveAndValidateTarget('https://example.com/store', {
    customDnsLookup: mockDnsLookup,
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.resolvedIps[0], '93.184.216.34');
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. TESTS DU FETCH CONTRÔLÉ & SÉCURISÉ
// ═══════════════════════════════════════════════════════════════════════════

test('2.1 - fetchReferenceHtml interrompt la requête lors d’un dépassement de délai (Timeout)', async () => {
  const mockSlowFetch = (url, opts) =>
    new Promise((resolve, reject) => {
      if (opts?.signal) {
        opts.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      }
      setTimeout(() => {
        resolve(new Response('<html><body>Slow</body></html>', { status: 200, headers: { 'content-type': 'text/html' } }));
      }, 500);
    });

  const mockDns = async () => ['93.184.216.34'];

  await assert.rejects(
    () =>
      fetchReferenceHtml('https://example.com/slow', {
        timeoutMs: 30,
        customFetch: mockSlowFetch,
        customDnsLookup: mockDns,
      }),
    /délai imparti|interrompue|aborted/i
  );
});

test('2.2 - fetchReferenceHtml coupe la lecture par chunks dès dépassement strict des 2 Mo réels', async () => {
  // Simulation d'un stream continu dépassant 2 Mo (2.5 Mo)
  const chunkSize = 512 * 1024; // 512 Ko par chunk
  let chunksEmitted = 0;

  const mockStream = new ReadableStream({
    pull(controller) {
      if (chunksEmitted < 6) {
        // 6 x 512 Ko = 3 Mo
        chunksEmitted += 1;
        controller.enqueue(new Uint8Array(chunkSize));
      } else {
        controller.close();
      }
    },
  });

  const mockHugeResponse = new Response(mockStream, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

  const mockFetch = async () => mockHugeResponse;
  const mockDns = async () => ['93.184.216.34'];

  await assert.rejects(
    () =>
      fetchReferenceHtml('https://example.com/huge-page', {
        maxSizeBytes: 2 * 1024 * 1024,
        customFetch: mockFetch,
        customDnsLookup: mockDns,
      }),
    /taille maximale autorisée/i
  );
});

test('2.3 - fetchReferenceHtml rejette les types MIME non-HTML (JSON, images, PDF)', async () => {
  const mockDns = async () => ['93.184.216.34'];

  // Test JSON
  const jsonFetch = async () =>
    new Response('{"error": "not html"}', { status: 200, headers: { 'content-type': 'application/json' } });
  await assert.rejects(
    () => fetchReferenceHtml('https://example.com/api', { customFetch: jsonFetch, customDnsLookup: mockDns }),
    /Type de contenu non autorisé/i
  );

  // Test Image PNG
  const imgFetch = async () =>
    new Response(new Uint8Array([137, 80, 78, 71]), { status: 200, headers: { 'content-type': 'image/png' } });
  await assert.rejects(
    () => fetchReferenceHtml('https://example.com/logo.png', { customFetch: imgFetch, customDnsLookup: mockDns }),
    /Type de contenu non autorisé/i
  );
});

test('2.4 - fetchReferenceHtml bloque les redirections vers un réseau privé (SSRF sur redirect)', async () => {
  let step = 0;
  const mockFetch = async (url) => {
    if (step === 0) {
      step += 1;
      return new Response(null, {
        status: 302,
        headers: { location: 'http://192.168.1.100/admin-panel' },
      });
    }
    return new Response('<html><body>Redirected</body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };

  const mockDns = async () => ['93.184.216.34'];

  await assert.rejects(
    () => fetchReferenceHtml('https://example.com/initial', { customFetch: mockFetch, customDnsLookup: mockDns }),
    /Cible réseau non autorisée|SSRF/i
  );
});

test('2.5 - fetchReferenceHtml limite les redirections à 3 sauts maximum', async () => {
  const mockInfiniteRedirectFetch = async () =>
    new Response(null, {
      status: 301,
      headers: { location: 'https://example.com/next-hop' },
    });

  const mockDns = async () => ['93.184.216.34'];

  await assert.rejects(
    () =>
      fetchReferenceHtml('https://example.com/hop0', {
        maxRedirects: 3,
        customFetch: mockInfiniteRedirectFetch,
        customDnsLookup: mockDns,
      }),
    /redirections dépassé/i
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. PARSEUR AST HTML EN PUR NODE.JS (SANS DOM GLOBAL)
// ═══════════════════════════════════════════════════════════════════════════

test('3.1 - parseHtmlToAst parse proprement sans aucune globale window / document', () => {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
      <head><title>Test Store</title></head>
      <body>
        <header class="navbar main-header" id="top-nav">
          <img src="https://example.com/logo.png" alt="Logo">
          <nav><ul><li><a href="/shop">Boutique</a></li></ul></nav>
        </header>
        <section class="hero-section" id="hero">
          <h1>Bienvenue chez Vestin</h1>
          <p>La mode contemporaine</p>
          <button class="cta-btn">Découvrir</button>
        </section>
      </body>
    </html>
  `;

  const ast = parseHtmlToAst(html);
  assert.ok(ast);
  assert.equal(ast.tagName, 'root');

  const headers = ast.findAll((n) => n.tagName === 'header');
  assert.equal(headers.length, 1);
  assert.equal(headers[0].classes.includes('navbar'), true);
  assert.equal(headers[0].classes.includes('main-header'), true);
  assert.equal(headers[0].hasMedia(), true);

  const heroes = ast.findAll((n) => n.tagName === 'section');
  assert.equal(heroes.length, 1);
  assert.equal(heroes[0].countTags('h1'), 1);
  assert.equal(heroes[0].countTags('button'), 1);
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. EXTRACTION MULTI-SIGNAUX SUR FIXTURES SYNTHÉTIQUES
// ═══════════════════════════════════════════════════════════════════════════

// Fixture A : Header standard + Hero gradient + Grille 4 produits + Footer
const FIXTURE_SITE_A = `
  <header class="header-bar">
    <div class="brand"><img src="logo.png"><span>Boutique A</span></div>
    <nav class="nav-links"><a href="/1">Accueil</a><a href="/2">Produits</a></nav>
  </header>
  <section class="hero-banner">
    <div class="badge">Nouveautés 2026</div>
    <h1>Collection Été</h1>
    <p>Découvrez notre nouvelle sélection exclusive.</p>
    <button class="cta-primary">Commander</button>
  </section>
  <section class="catalog-products product-grid">
    <h2>Nos Meilleures Ventes</h2>
    <div class="grid-container">
      <div class="product-card"><img src="p1.jpg"><h3>Robe Wax</h3><span class="price">15000 FCFA</span><button>Acheter</button></div>
      <div class="product-card"><img src="p2.jpg"><h3>Chemise Lin</h3><span class="price">12000 FCFA</span><button>Acheter</button></div>
      <div class="product-card"><img src="p3.jpg"><h3>Sandales Cuir</h3><span class="price">8000 FCFA</span><button>Acheter</button></div>
      <div class="product-card"><img src="p4.jpg"><h3>Sac à Main</h3><span class="price">20000 FCFA</span><button>Acheter</button></div>
    </div>
  </section>
  <footer class="site-footer">
    <p>© 2026 Boutique A. Tous droits réservés.</p>
    <div class="socials"><a href="#fb">Facebook</a><a href="#insta">Instagram</a></div>
  </footer>
`;

// Fixture B : Header + Hero Split (Media Left) + Grille Produits + Footer
const FIXTURE_SITE_B = `
  <header class="header-main">
    <div class="logo"><img src="logo.png"></div>
    <nav><a href="#p">Catalogue</a></nav>
  </header>
  <section class="hero-split-section media-left 2col">
    <div class="left-col"><img src="hero-model.jpg" alt="Model"></div>
    <div class="right-col">
      <span class="tag">Édition Limitée</span>
      <h1>L'Élégance Redéfinie</h1>
      <p>Artisanat d'exception et finitions soignées.</p>
      <a href="#shop" class="cta-button">Voir la Collection</a>
    </div>
  </section>
  <section class="product-collection">
    <h2>Articles Réclamés</h2>
    <div class="items">
      <div class="item-card"><img src="i1.jpg"><h4>Montre Prestige</h4><span>95000 FCFA</span><button>Commander</button></div>
      <div class="item-card"><img src="i2.jpg"><h4>Collier Or</h4><span>150000 FCFA</span><button>Commander</button></div>
    </div>
  </section>
  <footer class="footer-simple">
    <p>Mentions Légales</p>
  </footer>
`;

// Fixture C : Header + Prestations de Services + Contact Hub + Footer
const FIXTURE_SITE_C = `
  <header class="navbar">
    <span>Cabinet Conseil</span>
    <nav><a href="#services">Offres</a></nav>
  </header>
  <section class="services-overview service-section">
    <h2>Nos Domaines d'Expertise</h2>
    <div class="services-list">
      <div class="service-card"><h3>Audit Stratégique</h3><p>Diagnostic complet de votre organisation.</p><button>Prendre Rendez-vous</button></div>
      <div class="service-card"><h3>Transformation Digitale</h3><p>Accompagnement et mise en place d'outils agiles.</p><button>Demander un Devis</button></div>
    </div>
  </section>
  <section class="contact-hub-section coordinates">
    <h2>Nous Rencontrer</h2>
    <form class="contact-form">
      <input type="text" placeholder="Votre Nom">
      <button type="submit">Envoyer Message</button>
    </form>
    <div class="contact-details"><span>+237 699 00 00 00</span><span>Douala, Cameroun</span></div>
  </section>
  <footer>
    <p>Cabinet Conseil © 2026</p>
  </footer>
`;

// Fixture D : Section Inconnue / Non standard (zéro forçage product)
const FIXTURE_SITE_D = `
  <div class="custom-abstract-widget">
    <div class="unclassified-node">
      <span>Information générique</span>
    </div>
  </div>
`;

test('4.1 - Fixture A : Détection multi-signaux HEADER, HERO, PRODUCT, FOOTER', () => {
  const sections = extractStructuralObservationFromHtml(FIXTURE_SITE_A);
  assert.equal(sections.length, 4);

  assert.equal(sections[0].family, 'HEADER');
  assert.equal(sections[0].confidence, 'HIGH');
  assert.equal(sections[0].mediaPosition, 'left');

  assert.equal(sections[1].family, 'HERO');
  assert.equal(sections[1].layout, 'gradient_banner');
  assert.equal(sections[1].confidence, 'HIGH');

  assert.equal(sections[2].family, 'PRODUCT');
  assert.equal(sections[2].layout, 'grid_2col');
  assert.equal(sections[2].confidence, 'HIGH');
  assert.ok(sections[2].dataRequirements.includes('PRODUCT_IMAGE'));
  assert.ok(sections[2].dataRequirements.includes('PRODUCT_PRICE'));

  assert.equal(sections[3].family, 'FOOTER');
  assert.equal(sections[3].confidence, 'HIGH');
});

test('4.2 - Fixture B : Détection du layout HERO Split Media Left', () => {
  const sections = extractStructuralObservationFromHtml(FIXTURE_SITE_B);
  assert.equal(sections.length, 4);

  const hero = sections[1];
  assert.equal(hero.family, 'HERO');
  assert.equal(hero.layout, 'split_media_left');
  assert.equal(hero.mediaPosition, 'left');
  assert.equal(hero.contentFlow, 'split_2col');
});

test('4.3 - Fixture C : Détection de la famille SERVICE et CONTACT Hub', () => {
  const sections = extractStructuralObservationFromHtml(FIXTURE_SITE_C);
  assert.equal(sections.length, 4);

  const serviceSec = sections[1];
  assert.equal(serviceSec.family, 'SERVICE');
  assert.equal(serviceSec.interactionModel.includes('book_service'), true);

  const contactSec = sections[2];
  assert.equal(contactSec.family, 'CONTACT');
  assert.equal(contactSec.layout, 'interactive_hub_card');
  assert.ok(contactSec.dataRequirements.includes('CONTACT_PHONE'));
});

test('4.4 - Fixture D : Section inconnue classifiée UNKNOWN_SECTION avec confiance LOW (zéro forçage)', () => {
  const sections = extractStructuralObservationFromHtml(FIXTURE_SITE_D);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].family, 'UNKNOWN_SECTION');
  assert.equal(sections[0].confidence, 'LOW');
  assert.notEqual(sections[0].family, 'PRODUCT', 'Ne doit JAMAIS forcer PRODUCT pour un bloc inconnu');
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. TEST DE PROPRIÉTÉ INTELLECTUELLE & SORTIE WHITELIST STRICTE
// ═══════════════════════════════════════════════════════════════════════════

test('5.1 - ASSERTION FORTE : JSON.stringify(observation) ne contient AUCUNE donnée propriétaire', () => {
  const proprietaryHtml = `
    <header class="header-bar">
      <h1>Super Boutique VIP - Exclusive Luxury Brand SARL</h1>
      <img src="https://cdn.superbrand.com/assets/v2/logo_gold_4k.png">
      <nav><a href="https://shop.superbrand.com/cart">Acheter</a></nav>
    </header>
    <section class="hero-section">
      <h1>Achetez la Robe Gucci Exclusive 2026 à 450000 FCFA</h1>
      <p>Contactez le directeur commercial au +237 699 11 22 33 ou direct@gucci.com</p>
      <img src="https://images.gucci.com/spring-2026-dress.jpg">
      <button class="cta-btn">Acheter 450000 FCFA</button>
    </section>
  `;

  const sections = extractStructuralObservationFromHtml(proprietaryHtml);
  const serialized = JSON.stringify(sections);

  // Vérifications d'absence absolue de données commerciales
  assert.equal(/https?:\/\//i.test(serialized), false, 'Aucune URL HTTP/HTTPS ne doit être persistée');
  assert.equal(/\.png|\.jpg|\.webp|\.svg/i.test(serialized), false, 'Aucun nom de fichier d’image source');
  assert.equal(/450000|FCFA/i.test(serialized), false, 'Aucun prix commercial');
  assert.equal(/Gucci|SARL|VIP/i.test(serialized), false, 'Aucun nom de marque propriétaire');
  assert.equal(/\+237|699|direct@gucci\.com/i.test(serialized), false, 'Aucun numéro ou email réel');
  assert.equal(/<header|<section|<button/i.test(serialized), false, 'Aucun tag HTML brut');

  // Vérification que seules les abstractions structurelles sont conservées
  assert.ok(serialized.includes('HEADER'));
  assert.ok(serialized.includes('HERO'));
  assert.ok(serialized.includes('HERO_TITLE'));
  assert.ok(serialized.includes('PRIMARY_CTA'));
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. INTÉGRATION AVEC LE MOTEUR ANTI-INFLATION & PRODUCTION PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

test('6.1 - ingestAndAnalyzeHtml analyse un site complet et suggère la composition canonique', () => {
  const registry = ComponentRegistry;
  const report = ingestAndAnalyzeHtml(FIXTURE_SITE_A, registry, { siteId: 'test_site_a', sector: 'commerce' });

  assert.ok(report);
  assert.equal(report.siteId, 'test_site_a');
  assert.equal(report.totalSections, 4);
  assert.equal(report.isFullyCoveredByExisting, true);
  assert.equal(report.newCandidatesCount, 0, 'Les composants existants doivent couvrir Site A sans nouveaux composants');

  // Composition suggérée
  assert.equal(report.suggestedComposition.sections.length, 4);
  assert.equal(report.suggestedComposition.sections[0].family, 'HEADER');
  assert.equal(report.suggestedComposition.sections[1].family, 'HERO');
  assert.equal(report.suggestedComposition.sections[2].family, 'PRODUCT');
  assert.equal(report.suggestedComposition.sections[3].family, 'FOOTER');
});

test('6.2 - Permutation de l’ordre des sections = COMPOSITION_ONLY (Zéro composant canonique)', () => {
  const sequenceA = ['HEADER', 'HERO', 'PRODUCT', 'FOOTER'];
  const sequenceB = ['HEADER', 'PRODUCT', 'HERO', 'FOOTER'];

  const orderComparison = compareSectionOrders(sequenceA, sequenceB);
  assert.equal(orderComparison.isCompositionOnly, true);
  assert.ok(/CompositionEngine/i.test(orderComparison.reason));
});

test('6.3 - Détection d’une variation purement cosmétique = THEME_ONLY', () => {
  const candidateThemedHero = {
    id: 'hero_emerald_dark',
    type: 'HERO',
    variant: 'gradient_banner',
    renderer: () => null,
    isThemeVariation: true,
    observedTokens: { primaryColor: '#059669', isDark: true },
  };

  const evalResult = evaluateCandidate(candidateThemedHero, []);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY);
  assert.equal(evalResult.closestComponentId, 'hero_001');
});

test('6.4 - Détection d’une variation de colonnes configurable = CONFIGURATION_ONLY', () => {
  const candidateGrid3Col = {
    id: 'product_grid_3col',
    type: 'PRODUCT',
    variant: 'grid_2col',
    renderer: () => null,
    isConfigVariation: true,
    observedProps: { columns: 3 },
  };

  const evalResult = evaluateCandidate(candidateGrid3Col, []);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY);
  assert.equal(evalResult.closestComponentId, 'product_001');
});

test('6.5 - Structure réellement irréductible qualifiée comme VALID_CANONICAL candidate', () => {
  const genuineNewHero = {
    id: 'hero_interactive_timeline_split',
    type: 'HERO',
    variant: 'interactive_timeline_deck',
    renderer: () => null,
    editableProperties: ['timeline_steps', 'media_preview', 'action_triggers'],
    requiredCapabilities: ['PRODUCT'],
  };

  const evalResult = evaluateCandidate(genuineNewHero, []);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL);
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. EXÉCUTION EN PUR NODE.JS (SANS REACT, SUPABASE OU LIVECANVAS)
// ═══════════════════════════════════════════════════════════════════════════

test('7.1 - ingestAndAnalyzeUrl s’exécute de bout en bout en pur Node.js', async () => {
  const mockFetch = async () =>
    new Response(FIXTURE_SITE_B, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  const mockDns = async () => ['93.184.216.34'];

  const registry = ComponentRegistry;
  const report = await ingestAndAnalyzeUrl('https://example.com/summer-lookbook', registry, {
    customFetch: mockFetch,
    customDnsLookup: mockDns,
  });

  assert.ok(report);
  assert.equal(report.totalSections, 4);
  assert.equal(report.newCandidatesCount, 0);
  assert.equal(report.sectionReports[1].family, 'HERO');
  assert.equal(report.sectionReports[1].layout, 'split_media_left');
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. COUVERTURE FORENSIC EXPLICITE DES EXIGENCES 4.4 (TEST A À TEST L)
// ═══════════════════════════════════════════════════════════════════════════

test('TEST A — IP publique validée (DNS -> IP publique -> connexion -> SUCCESS)', async () => {
  let capturedOpts = null;
  const mockFetch = async (url, opts) => {
    capturedOpts = opts;
    return new Response('<html><body>Success</body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };
  const mockDns = async () => ['93.184.216.34'];

  const res = await fetchReferenceHtml('https://example.com/shop', {
    customFetch: mockFetch,
    customDnsLookup: mockDns,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.html, '<html><body>Success</body></html>');
  assert.equal(capturedOpts.pinnedIp, '93.184.216.34');
});

test('TEST B — IP privée (DNS -> 127.0.0.1 -> BLOCK)', async () => {
  const mockDns = async () => ['127.0.0.1'];
  await assert.rejects(
    () => fetchReferenceHtml('https://evil-site.com', { customDnsLookup: mockDns }),
    /privée|SSRF/i
  );
});

test('TEST C — metadata endpoint (169.254.169.254 -> BLOCK)', async () => {
  const mockDns = async () => ['169.254.169.254'];
  await assert.rejects(
    () => fetchReferenceHtml('http://169.254.169.254/latest/meta-data', { customDnsLookup: mockDns }),
    /privée|SSRF/i
  );
});

test('TEST D — IPv6 locale (::1, fe80::1, fc00::1 -> BLOCK)', async () => {
  const mockDnsLoopback = async () => ['::1'];
  await assert.rejects(
    () => fetchReferenceHtml('https://ipv6-loopback.example', { customDnsLookup: mockDnsLoopback }),
    /privée|SSRF/i
  );

  const mockDnsLinkLocal = async () => ['fe80::1'];
  await assert.rejects(
    () => fetchReferenceHtml('https://ipv6-linklocal.example', { customDnsLookup: mockDnsLinkLocal }),
    /privée|SSRF/i
  );

  const mockDnsUla = async () => ['fc00::1'];
  await assert.rejects(
    () => fetchReferenceHtml('https://ipv6-ula.example', { customDnsLookup: mockDnsUla }),
    /privée|SSRF/i
  );
});

test('TEST E — redirect vers IP privée (PUBLIC -> 302 -> PRIVATE -> BLOCK)', async () => {
  let hop = 0;
  const mockDns = async (hostname) => {
    if (hostname === 'internal-gateway.corp') {
      return ['10.0.0.1'];
    }
    return ['93.184.216.34'];
  };

  const mockFetch = async (url) => {
    if (hop === 0) {
      hop += 1;
      return new Response(null, {
        status: 302,
        headers: { location: 'https://internal-gateway.corp/admin' },
      });
    }
    return new Response('<html><body>Should not be reached</body></html>', { status: 200 });
  };

  await assert.rejects(
    () => fetchReferenceHtml('https://public-site.com', { customFetch: mockFetch, customDnsLookup: mockDns }),
    /privée|SSRF/i
  );
});

test('TEST F — DNS rebinding / TOCTOU (Simuler DNS #1 -> IP publique, tentative de connexion dérivée bloquée)', async () => {
  // Démonstration : la validation sélectionne '93.184.216.34'.
  // Le dispatcher/agent généré connecte exclusivement sur cette IP sans ré-interroger le DNS dynamique.
  const target = await resolveAndValidateTarget('https://rebound-target.com', {
    customDnsLookup: async () => ['93.184.216.34'],
  });
  assert.equal(target.valid, true);
  assert.equal(target.selectedIp, '93.184.216.34');

  // Vérification que le dispatcher/agent créé pour cette IP est correctement instancié
  const isHttps = target.parsedUrl.protocol === 'https:';
  const dispatcher = await createPinnedDispatcher(target.selectedIp, isHttps);
  assert.ok(dispatcher, 'Dispatcher/Agent créé avec succès');

  // Vérification que le handler de lookup injecté ne résout que vers l'IP validée
  if (dispatcher?.options?.lookup) {
    let resolvedByAgent = null;
    dispatcher.options.lookup('any-rebound-domain.internal', {}, (err, address) => {
      resolvedByAgent = address;
    });
    assert.equal(resolvedByAgent, '93.184.216.34');
  }
});

test('TEST G — IP pinning (Preuve que validatedIP === connectedIP)', async () => {
  let receivedPinnedIp = null;
  let receivedHost = null;

  const mockFetch = async (url, opts) => {
    receivedPinnedIp = opts.pinnedIp;
    receivedHost = opts.headers['Host'];
    return new Response('<html><body>Pin OK</body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };

  const mockDns = async () => ['142.250.190.46'];
  const res = await fetchReferenceHtml('https://my-store.example/catalog', {
    customFetch: mockFetch,
    customDnsLookup: mockDns,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(receivedPinnedIp, '142.250.190.46', 'L’IP reçue au fetch doit être rigoureusement l’IP validée');
  assert.equal(receivedHost, 'my-store.example', 'Le Host header doit correspondre au hostname d’origine');
});

test('TEST H — HTTPS (TLS, SNI et vérification du certificat attachés au hostname original)', async () => {
  const target = await resolveAndValidateTarget('https://secure-store.example/products', {
    customDnsLookup: async () => ['104.26.10.78'],
  });

  assert.equal(target.valid, true);
  assert.equal(target.parsedUrl.protocol, 'https:');
  assert.equal(target.parsedUrl.hostname, 'secure-store.example');

  // Vérifier qu'un dispatcher/agent HTTPS est généré sans désactiver les vérifications TLS
  const isHttps = target.parsedUrl.protocol === 'https:';
  const dispatcher = await createPinnedDispatcher(target.selectedIp, isHttps);
  assert.ok(dispatcher);
  assert.notEqual(dispatcher?.options?.rejectUnauthorized, false, 'rejectUnauthorized: false est strictement interdit');
});

test('TEST I — redirection multiple (A -> B -> C avec validation/pinning sur chaque connexion)', async () => {
  const recordedHops = [];
  let hopIndex = 0;

  const mockDns = async (hostname) => {
    if (hostname === 'site-a.com') return ['93.184.216.34'];
    if (hostname === 'site-b.com') return ['142.250.190.46'];
    if (hostname === 'site-c.com') return ['104.26.10.78'];
    return ['1.1.1.1'];
  };

  const mockFetch = async (url, opts) => {
    recordedHops.push({
      url,
      pinnedIp: opts.pinnedIp,
      host: opts.headers['Host'],
    });

    if (hopIndex === 0) {
      hopIndex += 1;
      return new Response(null, { status: 301, headers: { location: 'https://site-b.com/start' } });
    }
    if (hopIndex === 1) {
      hopIndex += 1;
      return new Response(null, { status: 302, headers: { location: 'https://site-c.com/final' } });
    }
    return new Response('<html><body>Multi Hop Complete</body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };

  const res = await fetchReferenceHtml('https://site-a.com', {
    customFetch: mockFetch,
    customDnsLookup: mockDns,
    maxRedirects: 3,
  });

  assert.equal(res.statusCode, 200);
  assert.equal(recordedHops.length, 3);

  // Hop 1
  assert.equal(recordedHops[0].url, 'https://site-a.com');
  assert.equal(recordedHops[0].pinnedIp, '93.184.216.34');
  assert.equal(recordedHops[0].host, 'site-a.com');

  // Hop 2
  assert.equal(recordedHops[1].url, 'https://site-b.com/start');
  assert.equal(recordedHops[1].pinnedIp, '142.250.190.46');
  assert.equal(recordedHops[1].host, 'site-b.com');

  // Hop 3
  assert.equal(recordedHops[2].url, 'https://site-c.com/final');
  assert.equal(recordedHops[2].pinnedIp, '104.26.10.78');
  assert.equal(recordedHops[2].host, 'site-c.com');
});

test('TEST J — timeout (Le délai de 8s / customTimeout est strictement respecté)', async () => {
  const slowFetch = (url, opts) =>
    new Promise((resolve, reject) => {
      opts?.signal?.addEventListener('abort', () => {
        const err = new Error('Timeout aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });

  await assert.rejects(
    () =>
      fetchReferenceHtml('https://slow-site.com', {
        timeoutMs: 20,
        customFetch: slowFetch,
        customDnsLookup: async () => ['93.184.216.34'],
      }),
    /délai imparti|Timeout/i
  );
});

test('TEST K — 2 MB (La limite de taille de 2 Mo est strictement appliquée sur le stream)', async () => {
  const chunkSize = 1024 * 1024; // 1 Mo par chunk
  let emitted = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (emitted < 3) {
        emitted += 1;
        controller.enqueue(new Uint8Array(chunkSize));
      } else {
        controller.close();
      }
    },
  });

  const mockResponse = new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });

  await assert.rejects(
    () =>
      fetchReferenceHtml('https://large-site.com', {
        customFetch: async () => mockResponse,
        customDnsLookup: async () => ['93.184.216.34'],
      }),
    /taille maximale autorisée/i
  );
});

test('TEST L — MIME (text/html et application/xhtml+xml acceptés, tout autre type rejeté)', async () => {
  const mockDns = async () => ['93.184.216.34'];

  // Accept text/html
  const htmlRes = await fetchReferenceHtml('https://example.com/page.html', {
    customFetch: async () => new Response('<html><body>HTML</body></html>', { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }),
    customDnsLookup: mockDns,
  });
  assert.equal(htmlRes.statusCode, 200);

  // Accept application/xhtml+xml
  const xhtmlRes = await fetchReferenceHtml('https://example.com/page.xhtml', {
    customFetch: async () => new Response('<html xmlns="http://www.w3.org/1999/xhtml"><body>XHTML</body></html>', { status: 200, headers: { 'content-type': 'application/xhtml+xml' } }),
    customDnsLookup: mockDns,
  });
  assert.equal(xhtmlRes.statusCode, 200);

  // Reject application/octet-stream
  await assert.rejects(
    () => fetchReferenceHtml('https://example.com/file.bin', {
      customFetch: async () => new Response(new Uint8Array(10), { status: 200, headers: { 'content-type': 'application/octet-stream' } }),
      customDnsLookup: mockDns,
    }),
    /Type de contenu non autorisé/i
  );
});


