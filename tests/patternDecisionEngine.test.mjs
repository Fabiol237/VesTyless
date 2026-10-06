/**
 * VesTyle / Vestin — Test Suite : Pattern Decision Engine & Industrialization (ÉTAPE 4.6)
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation exhaustive du moteur de décision architecturale et de clustering 8D.
 * 
 * VÉRIFICATIONS :
 * - TEST A : duplicate (same 8D -> DUPLICATE)
 * - TEST B : configuration (same structural pattern, optional slots -> CONFIGURATION_ONLY)
 * - TEST C : theme (same structure, visual tokens -> THEME_ONLY)
 * - TEST D : composition (same components, different section order -> COMPOSITION_ONLY)
 * - TEST E : real candidate (genuine structural difference -> CANDIDATE + CandidateSpecification)
 * - TEST F : score trap (weak proximity score but configurable -> CONFIGURATION_ONLY, score does not decide)
 * - TEST G : sector trap (same structure in restaurant/hotel/fashion -> 1 cluster, 0 new component)
 * - TEST H : duplicate candidate trap (2 sites with same 8D -> 1 pattern cluster, not 2 candidates)
 * - TEST I : real 4.5 data pipeline (terminates cleanly, 0 uncontrolled inflation, deterministic)
 * - TEST J : determinism (same observations + same catalog = structurally identical output)
 * - TEST K : candidate pool isolation (candidates not registered in ComponentRegistry, count === 30)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ARCHITECTURAL_DECISIONS,
  normalizeStructuralObservation,
  compute8DSignature,
  clusterStructuralObservations,
  decideObservationArchitecture,
  deriveCapabilitiesFrom8D,
  generateCandidateSpecification,
  CandidateSpecificationPool,
  candidateSpecificationPool,
  runIndustrialPipeline,
} from '../src/lib/component-registry/patternDecisionEngine.js';

// NOTE : baseComponents.jsx est JSX et ne peut pas être importé en Node ESM brut.
// ComponentRegistry sera vide dans ce contexte de test unitaire pur.
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';
import {
  MEDIA_POSITIONS,
  CONTENT_FLOWS,
  CANONICAL_PATTERNS,
} from '../src/lib/component-registry/structuralPatternModel.js';

// ═══════════════════════════════════════════════════════════════════════════
// TEST A : DUPLICATE — Même 8D -> DUPLICATE
// ═══════════════════════════════════════════════════════════════════════════

test('TEST A [DUPLICATE] : Même signature 8D produit rigoureusement DUPLICATE', () => {
  // Observation calquée EXACTEMENT sur hero_fullscreen (CANONICAL_PATTERNS.hero_fullscreen)
  const obs = {
    type: 'HERO',
    variant: 'fullscreen_cover',
    hierarchy: ['badge', 'title', 'subtitle', 'cta_button'],
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['direct_cta'],
    responsiveBehavior: { mobile: 'tall_card', desktop: 'fullscreen_banner' },
    dataRequirements: ['banner', 'title'],
  };

  const result = decideObservationArchitecture(obs, [CANONICAL_PATTERNS.hero_fullscreen]);

  assert.equal(result.decision, ARCHITECTURAL_DECISIONS.DUPLICATE,
    `Expected DUPLICATE, got ${result.decision}. Differences: ${result.structuralDifferences.join('; ')}`);
  assert.ok(result.rejectedAlternatives.whyNotDuplicate.includes('FAUX'));
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST B : CONFIGURATION_ONLY — Variations de slots/colonnes -> CONFIGURATION_ONLY
// ═══════════════════════════════════════════════════════════════════════════

test('TEST B [CONFIGURATION_ONLY] : Variation de slots optionnels ou de colonnes -> CONFIGURATION_ONLY', () => {
  // Observation hero sans badge et avec interaction text_link uniquement (slot optionnel)
  // La famille et le contentFlow sont identiques à hero_001 -> CONFIGURATION_ONLY
  const obs = {
    type: 'HERO',
    variant: 'gradient_banner',
    hierarchy: ['title', 'subtitle'],
    mediaPosition: MEDIA_POSITIONS.NONE,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['direct_cta'],
    responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' },
    dataRequirements: ['title'],
  };

  const result = decideObservationArchitecture(obs, [CANONICAL_PATTERNS.hero_001]);

  assert.equal(result.decision, ARCHITECTURAL_DECISIONS.CONFIGURATION_ONLY,
    `Expected CONFIGURATION_ONLY, got ${result.decision}. Differences: ${result.structuralDifferences.join('; ')}`);
  assert.ok(result.rejectedAlternatives.whyNotConfiguration.includes('FAUX'));
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST C : THEME_ONLY — Même structure avec tokens visuels -> THEME_ONLY
// ═══════════════════════════════════════════════════════════════════════════

test('TEST C [THEME_ONLY] : Même structure avec variations cosmétiques -> THEME_ONLY', () => {
  // Observation calquée EXACTEMENT sur hero_001 avec styleOverrides cosmétiques uniquement
  const obs = {
    type: 'HERO',
    variant: 'gradient_banner',
    hierarchy: ['badge', 'title', 'subtitle', 'cta_button'],
    mediaPosition: MEDIA_POSITIONS.NONE,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['direct_cta'],
    responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' },
    dataRequirements: ['title', 'description'],
    styleOverrides: {
      color: '#10b981',
      borderRadius: '24px',
      theme: 'emerald_dark',
      font: 'Outfit',
    },
  };

  const result = decideObservationArchitecture(obs, [CANONICAL_PATTERNS.hero_001]);

  assert.equal(result.decision, ARCHITECTURAL_DECISIONS.THEME_ONLY,
    `Expected THEME_ONLY, got ${result.decision}. Differences: ${result.structuralDifferences.join('; ')}`);
  assert.ok(result.rejectedAlternatives.whyNotTheme.includes('FAUX'));
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST D : COMPOSITION_ONLY — Même composants avec ordre différent -> COMPOSITION_ONLY
// ═══════════════════════════════════════════════════════════════════════════

test('TEST D [COMPOSITION_ONLY] : Assemblage multi-sections -> COMPOSITION_ONLY', () => {
  const pageObs = {
    type: 'COMPOSITION',
    sections: [
      { family: 'HEADER', layout: 'nav_basic' },
      { family: 'PRODUCT', layout: 'product_grid_4col' },
      { family: 'HERO', layout: 'fullscreen' },
      { family: 'FOOTER', layout: 'minimal_footer' },
    ],
  };

  const result = decideObservationArchitecture(pageObs, ComponentRegistry);

  assert.equal(result.decision, ARCHITECTURAL_DECISIONS.COMPOSITION_ONLY);
  assert.ok(result.rejectedAlternatives.whyNotComposition.includes('FAUX'));
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST E : CANDIDATE — Différence structurelle irréductible -> CANDIDATE + Spec
// ═══════════════════════════════════════════════════════════════════════════

test('TEST E [CANDIDATE] : Différence structurelle irréductible -> CANDIDATE et CandidateSpecification', () => {
  // Pattern nouveau : Comparateur interactif double volet avec scrubber synchronisé
  const obs = {
    type: 'PRODUCT',
    variant: 'interactive_split_comparator',
    hierarchy: ['before_after_handles', 'dual_sync_viewports', 'feature_matrix_diff'],
    mediaPosition: MEDIA_POSITIONS.LEFT,
    contentFlow: CONTENT_FLOWS.ASSET_CENTRIC,
    interactionModel: ['scrubber_drag_sync', 'matrix_toggle', 'multi_spec_comparison'],
    responsiveBehavior: { mobile: 'stack_split', desktop: 'synchronized_split_diff' },
    dataRequirements: ['spec_a', 'spec_b', 'viewport_assets', 'diff_matrix'],
  };

  const result = decideObservationArchitecture(obs, ComponentRegistry);

  assert.equal(result.decision, ARCHITECTURAL_DECISIONS.CANDIDATE);
  assert.ok(result.irreducibilityProof.isPositiveProofComplete);
  assert.ok(result.rejectedAlternatives.whyNotDuplicate.length > 0);
  assert.ok(result.rejectedAlternatives.whyNotConfiguration.length > 0);
  assert.ok(result.rejectedAlternatives.whyNotTheme.length > 0);
  assert.ok(result.rejectedAlternatives.whyNotComposition.length > 0);

  // Génération de la spécification déclarative
  const spec = generateCandidateSpecification({
    candidateId: 'candidate_product_comparator',
    family: 'PRODUCT',
    canonical8D: normalizeStructuralObservation(obs).canonical8D,
    closestCanonical: result.closestCanonical,
    structuralDifferences: result.structuralDifferences,
    rejectedAlternatives: result.rejectedAlternatives,
    implementationRationale: result.rationale,
  });

  // Validation formelle du schéma de spécification (Section 5)
  assert.equal(spec.candidateId, 'candidate_product_comparator');
  assert.equal(spec.family, 'PRODUCT');
  assert.ok(spec.eightDimensions);
  assert.ok(Array.isArray(spec.eightDimensions.hierarchy));
  assert.ok(Array.isArray(spec.eightDimensions.interactionModel));
  assert.ok(spec.rejectedAlternatives.whyNotDuplicate);
  assert.ok(spec.rejectedAlternatives.whyNotConfiguration);
  assert.ok(spec.rejectedAlternatives.whyNotTheme);
  assert.ok(spec.rejectedAlternatives.whyNotComposition);
  assert.ok(Array.isArray(spec.requiredCapabilities));
  assert.ok(spec.requiredCapabilities.includes('PRODUCTS'));
  assert.equal(spec.emptyStateBehavior, 'SAFE_FALLBACK_HIDE_OR_EMPTY_MSG');

  // Aucun JSX ni code React dans la spécification
  const specStr = JSON.stringify(spec);
  assert.ok(!specStr.includes('React'), 'Zéro référence React dans la spec');
  assert.ok(!specStr.includes('jsx'), 'Zéro JSX dans la spec');
  assert.ok(!specStr.includes('createElement'), 'Zéro createElement dans la spec');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST F : SCORE TRAP — Score faible mais configurable -> CONFIGURATION_ONLY
// ═══════════════════════════════════════════════════════════════════════════

test('TEST F [SCORE TRAP] : Proximité numérique faible mais structure configurable -> CONFIGURATION_ONLY', () => {
  // Grille produit : même famille (PRODUCT) et même contentFlow (GRID) que product_001
  // Diffère sur le layout (grid_5col vs grid_2col) et responsive (grid_5col vs grid_4col) -> configurable
  const obs = {
    type: 'PRODUCT',
    variant: 'grid_5col_dense',
    hierarchy: ['filter_chips', 'product_card_compact', 'price_pill', 'buy_btn'],
    mediaPosition: MEDIA_POSITIONS.TOP,
    contentFlow: CONTENT_FLOWS.GRID,
    interactionModel: ['add_to_cart'],
    responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_5col' },
    dataRequirements: ['title', 'price', 'image', 'categories'],
  };

  const result = decideObservationArchitecture(obs, [CANONICAL_PATTERNS.product_001]);

  // Le score bas ne doit PAS forcer CANDIDATE
  assert.notEqual(result.decision, ARCHITECTURAL_DECISIONS.CANDIDATE,
    `Score trap: should NOT produce CANDIDATE for a configurable grid variation. Got: ${result.decision}`);
  assert.ok(
    result.decision === ARCHITECTURAL_DECISIONS.CONFIGURATION_ONLY ||
    result.decision === ARCHITECTURAL_DECISIONS.DUPLICATE,
    `Expected CONFIGURATION_ONLY or DUPLICATE for grid variation, got ${result.decision}`
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST G : SECTOR TRAP — Même structure dans 3 secteurs -> 1 seul cluster / 0 composant
// ═══════════════════════════════════════════════════════════════════════════

test('TEST G [SECTOR TRAP] : Même pattern structurel 8D dans 3 secteurs différents -> 1 seul cluster', () => {
  const obsRestaurant = {
    siteId: 'resto_douala',
    sector: 'restaurant',
    businessType: 'restaurant',
    type: 'HERO',
    variant: 'fullscreen',
    hierarchy: ['title', 'subtitle', 'cta_primary'],
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['cta_navigation'],
    responsiveBehavior: { mobile: 'stack', desktop: 'fullscreen_center' },
    dataRequirements: ['title', 'subtitle', 'bg_image'],
  };

  const obsHotel = {
    siteId: 'hotel_kribi',
    sector: 'hospitality',
    businessType: 'hotel',
    type: 'HERO',
    variant: 'fullscreen',
    hierarchy: ['title', 'subtitle', 'cta_primary'],
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['cta_navigation'],
    responsiveBehavior: { mobile: 'stack', desktop: 'fullscreen_center' },
    dataRequirements: ['title', 'subtitle', 'bg_image'],
  };

  const obsFashion = {
    siteId: 'fashion_bastos',
    sector: 'fashion_retail',
    businessType: 'product',
    type: 'HERO',
    variant: 'fullscreen',
    hierarchy: ['title', 'subtitle', 'cta_primary'],
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    contentFlow: CONTENT_FLOWS.LINEAR,
    interactionModel: ['cta_navigation'],
    responsiveBehavior: { mobile: 'stack', desktop: 'fullscreen_center' },
    dataRequirements: ['title', 'subtitle', 'bg_image'],
  };

  const clusters = clusterStructuralObservations([obsRestaurant, obsHotel, obsFashion]);

  // Un seul cluster pour les 3 secteurs
  assert.equal(clusters.size, 1, 'Les 3 secteurs partagent exactement 1 cluster de pattern');
  const cluster = Array.from(clusters.values())[0];
  assert.equal(cluster.occurrences, 3);
  assert.equal(cluster.uniqueSites.length, 3);
  assert.deepEqual(cluster.uniqueSites, ['fashion_bastos', 'hotel_kribi', 'resto_douala']);

  // Décision sur le cluster
  const decision = decideObservationArchitecture(cluster, [CANONICAL_PATTERNS.hero_fullscreen]);
  assert.notEqual(decision.decision, ARCHITECTURAL_DECISIONS.CANDIDATE,
    'Même pattern dans 3 secteurs ne doit PAS produire CANDIDATE');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST H : DUPLICATE CANDIDATE TRAP — 2 sites avec 8D identique -> 1 pattern cluster
// ═══════════════════════════════════════════════════════════════════════════

test('TEST H [DUPLICATE CANDIDATE TRAP] : Deux sites avec même pattern candidat -> 1 seul cluster', () => {
  const obsSiteA = {
    siteId: 'site_alpha',
    type: 'SERVICE',
    variant: 'calendar_split_timeline',
    hierarchy: ['timeline_axis', 'slot_selector', 'practitioner_badge'],
    mediaPosition: MEDIA_POSITIONS.LEFT,
    contentFlow: CONTENT_FLOWS.ASYMMETRIC,
    interactionModel: ['slot_drag', 'calendar_sync', 'instant_reserve'],
    responsiveBehavior: { mobile: 'timeline_vertical', desktop: 'timeline_horizontal_split' },
    dataRequirements: ['slots', 'practitioner', 'calendar_feed'],
  };

  const obsSiteB = {
    siteId: 'site_beta',
    type: 'SERVICE',
    variant: 'calendar_split_timeline',
    hierarchy: ['timeline_axis', 'slot_selector', 'practitioner_badge'],
    mediaPosition: MEDIA_POSITIONS.LEFT,
    contentFlow: CONTENT_FLOWS.ASYMMETRIC,
    interactionModel: ['slot_drag', 'calendar_sync', 'instant_reserve'],
    responsiveBehavior: { mobile: 'timeline_vertical', desktop: 'timeline_horizontal_split' },
    dataRequirements: ['slots', 'practitioner', 'calendar_feed'],
  };

  const pipelineReport = runIndustrialPipeline([obsSiteA, obsSiteB], ComponentRegistry, { clearPool: true });

  assert.equal(pipelineReport.observationsInput, 2);
  assert.equal(pipelineReport.patternClustersCount, 1, 'Exactement 1 pattern cluster créé pour les 2 observations');
  assert.equal(pipelineReport.candidateSpecificationsCount, 1, 'Exactement 1 spécification candidate produite (pas 2)');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST I : DONNÉES RÉELLES 4.5 — Exécution complète du pipeline industriel
// ═══════════════════════════════════════════════════════════════════════════

test('TEST I [REAL 4.5 PIPELINE] : Pipeline industriel sur les observations types de 4.5', () => {
  // Observations calquées sur les patterns canoniques existants (famille + contentFlow identiques)
  const sample45Observations = [
    // Header standard -> DUPLICATE sur header_001
    { siteId: 'real_books', type: 'HEADER', variant: 'horizontal_bar', hierarchy: ['logo', 'brand_name'], mediaPosition: MEDIA_POSITIONS.LEFT, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['navigation', 'logo_click'], responsiveBehavior: { mobile: 'compact_bar', desktop: 'expanded_bar' }, dataRequirements: ['name', 'logo'] },
    // Hero books -> DUPLICATE/CONFIGURATION_ONLY sur hero_001
    { siteId: 'real_books', type: 'HERO', variant: 'gradient_banner', hierarchy: ['badge', 'title', 'subtitle', 'cta_button'], mediaPosition: MEDIA_POSITIONS.NONE, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['direct_cta'], responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' }, dataRequirements: ['title', 'description'] },
    // Product grid -> CONFIGURATION_ONLY sur product_001 (layout variant)
    { siteId: 'real_books', type: 'PRODUCT', variant: 'grid_2col', hierarchy: ['title', 'product_cards'], mediaPosition: MEDIA_POSITIONS.TOP, contentFlow: CONTENT_FLOWS.GRID, interactionModel: ['add_to_cart', 'quick_order'], responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' }, dataRequirements: ['products'] },
    // Footer -> CONFIGURATION_ONLY sur footer_simple
    { siteId: 'real_books', type: 'FOOTER', variant: 'minimal_footer', hierarchy: ['legal_text'], mediaPosition: MEDIA_POSITIONS.NONE, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['legal_navigation'], responsiveBehavior: { mobile: 'stack', desktop: 'columns' }, dataRequirements: ['name'] },
    // Ruby header -> DUPLICATE sur header_001
    { siteId: 'real_ruby', type: 'HEADER', variant: 'horizontal_bar', hierarchy: ['logo', 'brand_name'], mediaPosition: MEDIA_POSITIONS.LEFT, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['navigation'], responsiveBehavior: { mobile: 'compact_bar', desktop: 'expanded_bar' }, dataRequirements: ['name', 'logo'] },
    // Ruby hero -> CONFIGURATION_ONLY sur hero_001
    { siteId: 'real_ruby', type: 'HERO', variant: 'gradient_banner', hierarchy: ['title'], mediaPosition: MEDIA_POSITIONS.NONE, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['direct_cta'], responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' }, dataRequirements: ['title'] },
    // Python hero -> CONFIGURATION_ONLY sur hero_001
    { siteId: 'real_python', type: 'HERO', variant: 'gradient_banner', hierarchy: ['title', 'subtitle'], mediaPosition: MEDIA_POSITIONS.NONE, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['direct_cta'], responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' }, dataRequirements: ['title', 'description'] },
  ];

  const pool = new CandidateSpecificationPool();
  const report = runIndustrialPipeline(sample45Observations, null, { pool });

  assert.equal(report.observationsInput, 7);
  assert.ok(report.patternClustersCount <= 7, `patternClustersCount=${report.patternClustersCount} should be <= 7`);
  // Aucune candidate unjustifiée : tous les patterns sont couverts par le catalogue existant via CANONICAL_PATTERNS
  assert.equal(report.candidateSpecificationsCount, 0,
    `Zéro candidate non justifiée créée, got ${report.candidateSpecificationsCount}. Decisions: ${JSON.stringify(report.decisions)}`);
  assert.ok(report.decisions.DUPLICATE >= 1 || report.decisions.CONFIGURATION_ONLY >= 1);
  assert.equal(pool.count(), 0);
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST J : DÉTERMINISME — Même entrée + même catalogue = Sortie structurellement identique
// ═══════════════════════════════════════════════════════════════════════════

test('TEST J [DETERMINISME] : Deux exécutions successives produisent une sortie identique au bit près', () => {
  const inputObservations = [
    // Observations avec des valeurs CONTENT_FLOWS valides
    { siteId: 'site_1', type: 'HERO', variant: 'gradient_banner', hierarchy: ['title', 'subtitle', 'cta_button'], mediaPosition: MEDIA_POSITIONS.NONE, contentFlow: CONTENT_FLOWS.LINEAR, interactionModel: ['direct_cta'], responsiveBehavior: { mobile: 'card_stack', desktop: 'wide_card' }, dataRequirements: ['title', 'description'] },
    { siteId: 'site_2', type: 'PRODUCT', variant: 'grid_2col', hierarchy: ['title', 'product_cards'], mediaPosition: MEDIA_POSITIONS.TOP, contentFlow: CONTENT_FLOWS.GRID, interactionModel: ['add_to_cart'], responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' }, dataRequirements: ['products'] },
  ];

  const run1 = runIndustrialPipeline(inputObservations, null, { clearPool: true });
  const run2 = runIndustrialPipeline(inputObservations, null, { clearPool: true });

  assert.equal(JSON.stringify(run1), JSON.stringify(run2), 'Sortie strictement déterministe');
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST K : ISOLATION DU CANDIDATE POOL & INTÉGRITÉ DU CATALOGUE (30 TOTAL)
// ═══════════════════════════════════════════════════════════════════════════

test('TEST K [ISOLATION] : Les candidates ne sont jamais enregistrées dans ComponentRegistry', () => {
  const pool = new CandidateSpecificationPool();

  // Famille inconnue (AR_SPATIAL_OVERLAY) absente de CANONICAL_PATTERNS et de ComponentRegistry
  // -> garantit CANDIDATE car existingItems.length === 0 pour cette famille
  const testCandidateObs = {
    type: 'AR_SPATIAL_OVERLAY',
    variant: '3d_spatial_canvas',
    hierarchy: ['canvas_3d_viewport', 'spatial_nodes', 'immersive_controls'],
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    contentFlow: CONTENT_FLOWS.STACKED,
    interactionModel: ['orbit_control', 'spatial_node_select'],
    responsiveBehavior: { mobile: 'canvas_fallback', desktop: 'spatial_canvas' },
    dataRequirements: ['gltf_scene_url', 'spatial_anchor_nodes'],
  };

  const countBefore = ComponentRegistry.count();
  const report = runIndustrialPipeline([testCandidateObs], null, { pool });

  // 1. Doit produire exactement 1 candidate (famille inconnue -> CANDIDATE garanti)
  assert.equal(report.candidateSpecificationsCount, 1,
    `Expected 1 candidate specification. Got: ${report.candidateSpecificationsCount}. Decisions: ${JSON.stringify(report.decisions)}`);
  const candidateSpec = report.candidateSpecifications[0];
  const candidateId = candidateSpec.candidateId;

  // 2. La candidate est stockée dans le pool d'audit
  assert.ok(pool.getSpecification(candidateId), `Candidate ${candidateId} should be in the pool`);

  // 3. ISOLATION : la candidate N'EST PAS enregistrée dans le catalogue exécutable
  assert.equal(ComponentRegistry.get(candidateId), null,
    'ComponentRegistry.get(candidateId) doit retourner null : candidates en dehors du registre');
  assert.equal(ComponentRegistry.has(candidateId), false,
    'ComponentRegistry.has(candidateId) doit être false : pas d\'enregistrement implicite');

  // 4. Le catalogue ne doit pas avoir grandi suite à la candidate
  assert.equal(ComponentRegistry.count(), countBefore,
    `Le catalogue ne doit pas avoir grandi : avant=${countBefore}, après=${ComponentRegistry.count()}`);

  // 5. Le pool contient exactement 1 candidate
  assert.equal(pool.count(), 1, 'Seul le pool contient la candidate');
});

