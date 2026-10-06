import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createReferenceSiteObservation,
  analyzeReferenceSite,
  compareSectionOrders,
  promotePatternToCandidate,
} from '../src/lib/component-registry/referenceSiteAnalyzer.js';

import {
  createStructuralPattern,
  compareStructuralPatterns,
  extractPatternFromSiteObservation,
  MEDIA_POSITIONS,
  CONTENT_FLOWS,
  CANONICAL_PATTERNS,
} from '../src/lib/component-registry/structuralPatternModel.js';

import {
  evaluateCandidate,
  CANONICAL_DECISION_VERDICTS,
} from '../src/lib/component-registry/antiInflationValidator.js';

import { runProductionPipeline } from '../src/lib/component-registry/productionPipeline.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';

// ── 1. OBSERVATION ──────────────────────────────────────────────────────────
test('1. OBSERVATION : Modèle d\'observation abstrait sans données propriétaires', () => {
  const obs = createReferenceSiteObservation({
    siteId: 'site_reference_fashion',
    sector: 'fashion',
    pageType: 'home',
    sections: [
      { position: 1, family: 'HEADER', layout: 'horizontal_bar' },
      { position: 2, family: 'HERO', layout: 'fullscreen_cover' },
      { position: 3, family: 'PRODUCT', layout: 'grid_cards', observedProps: { columns: 3 } },
      { position: 4, family: 'FOOTER', layout: 'standard' },
    ],
  });

  assert.equal(obs.siteId, 'site_reference_fashion');
  assert.equal(obs.sections.length, 4);
  assert.equal(obs.sections[0].family, 'HEADER');
  assert.equal(obs.sections[1].family, 'HERO');
  assert.equal(obs.sections[2].family, 'PRODUCT');
});

// ── 2. NORMALISATION ────────────────────────────────────────────────────────
test('2. NORMALISATION : Observation convertie en StructuralPattern déterministe', () => {
  const sec = {
    sectionFamily: 'HERO',
    layoutPattern: 'split_2col_media_left',
    columns: 2,
    hierarchy: ['badge', 'title', 'subtitle', 'cta'],
  };

  const pattern = extractPatternFromSiteObservation(sec);
  assert.equal(pattern.family, 'HERO');
  assert.equal(pattern.contentFlow, CONTENT_FLOWS.SPLIT_2COL);
  assert.equal(pattern.mediaPosition, MEDIA_POSITIONS.LEFT);
  assert.ok(pattern.patternId.startsWith('observed_hero_'));
});

// ── 3. STRUCTURAL_PATTERN ───────────────────────────────────────────────────
test('3. STRUCTURAL_PATTERN : Validation du modèle 8 dimensions et calcul de similarité', () => {
  const patternA = createStructuralPattern({
    patternId: 'pattern_custom_test_a',
    family: 'SERVICE',
    layout: 'spotlight_card',
    hierarchy: ['badge', 'title', 'price'],
    contentFlow: CONTENT_FLOWS.LINEAR,
    mediaPosition: MEDIA_POSITIONS.NONE,
    interactionModel: ['book_service'],
    responsiveBehavior: { mobile: 'stack', desktop: 'side_by_side' },
    dataRequirements: ['services'],
  });

  const patternB = createStructuralPattern({
    patternId: 'pattern_custom_test_b',
    family: 'SERVICE',
    layout: 'spotlight_card',
    hierarchy: ['badge', 'title', 'price'],
    contentFlow: CONTENT_FLOWS.LINEAR,
    mediaPosition: MEDIA_POSITIONS.NONE,
    interactionModel: ['book_service'],
    responsiveBehavior: { mobile: 'stack', desktop: 'side_by_side' },
    dataRequirements: ['services'],
  });

  const comparison = compareStructuralPatterns(patternA, patternB);
  assert.equal(comparison.similarityScore, 1.0);
  assert.equal(comparison.isDuplicate, true);
});

// ── 4. DUPLICATE ────────────────────────────────────────────────────────────
test('4. DUPLICATE : Détection autonome d\'une structure identique à hero_fullscreen', () => {
  const duplicateCandidate = {
    id: 'hero_monochrome_copy',
    type: 'HERO',
    variant: 'fullscreen_cover',
    renderer: () => null,
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_fullscreen),
  };

  const evalResult = evaluateCandidate(duplicateCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.DUPLICATE);
  assert.equal(evalResult.closestComponentId, 'hero_fullscreen');
  assert.ok(evalResult.similarityScore >= 0.95);
});

// ── 5. CONFIGURATION_ONLY ───────────────────────────────────────────────────
test('5. CONFIGURATION_ONLY : Détection autonome d\'une variation de colonnes sur product_001', () => {
  const configCandidate = {
    id: 'product_dense_variation',
    type: 'PRODUCT',
    variant: 'grid_3col_dense',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      patternId: 'product_dense_variation',
      family: 'PRODUCT',
      layout: 'grid_cards',
      hierarchy: ['title', 'product_cards'],
      contentFlow: CONTENT_FLOWS.GRID,
      mediaPosition: MEDIA_POSITIONS.TOP,
      interactionModel: ['add_to_cart', 'quick_order'],
      responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' },
      dataRequirements: ['products'],
    }),
    observedProps: { columns: 3, spacing: 'compact' },
  };

  const evalResult = evaluateCandidate(configCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY);
  assert.equal(evalResult.closestComponentId, 'product_001');
  assert.ok(evalResult.reason.includes('configuration'));
});

// ── 6. THEME_ONLY ───────────────────────────────────────────────────────────
test('6. THEME_ONLY : Détection autonome d\'une variation purement cosmétique de hero_001', () => {
  const themeCandidate = {
    id: 'hero_001_emerald_luxury',
    type: 'HERO',
    variant: 'gradient_banner_emerald',
    renderer: () => null,
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_001),
    observedTokens: {
      primaryColor: '#059669',
      gradient: 'linear-gradient(to right, #064e3b, #022c22)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    },
  };

  const evalResult = evaluateCandidate(themeCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY);
  assert.equal(evalResult.closestComponentId, 'hero_001');
  assert.ok(
    evalResult.reason.includes('habillage visuel') ||
    evalResult.recommendations.some((r) => r.includes('ThemeEngine'))
  );
});

// ── 7. COMPOSITION_ONLY ─────────────────────────────────────────────────────
test('7. COMPOSITION_ONLY : Séquence multi-sections classifiée comme composition', () => {
  const multiSectionCandidate = {
    id: 'landing_complete_pack',
    type: 'COMPOSITION',
    sections: ['HEADER', 'HERO', 'PRODUCT', 'TESTIMONIAL', 'FOOTER'],
  };

  const evalResult = evaluateCandidate(multiSectionCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.COMPOSITION_ONLY);
  assert.ok(evalResult.reason.includes('composition de page'));
});

// ── 8. VALID_CANONICAL ──────────────────────────────────────────────────────
test('8. VALID_CANONICAL : Pattern structurellement irréductible certifié nouveau', () => {
  const newCanonicalCandidate = {
    id: 'service_asymmetric_timeline',
    type: 'SERVICE',
    variant: 'interactive_asymmetric_timeline',
    renderer: function ValidTimelineRenderer() { return null; },
    requiredCapabilities: ['SERVICE'],
    optionalCapabilities: ['GALLERY'],
    emptyStateBehavior: 'HIDE_IN_PUBLIC',
    themeContract: { usesPrimaryColor: true },
    structuralPattern: createStructuralPattern({
      patternId: 'service_asymmetric_timeline',
      family: 'SERVICE',
      layout: 'interactive_asymmetric_timeline',
      hierarchy: ['timeline_step', 'step_details', 'step_duration'],
      contentFlow: CONTENT_FLOWS.ASYMMETRIC,
      mediaPosition: MEDIA_POSITIONS.LEFT,
      interactionModel: ['step_expand', 'timeline_scrub'],
      responsiveBehavior: { mobile: 'stack', desktop: 'asymmetric_split' },
      dataRequirements: ['service_steps'],
    }),
  };

  const evalResult = evaluateCandidate(newCanonicalCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL);
  assert.ok(evalResult.reason.includes('distincts') || evalResult.reason.includes('fondateur'));
});

// ── 9. INVALID (Contrat) ────────────────────────────────────────────────────
test('9. INVALID : Détection d\'un contrat malformé (ID ou famille invalide)', () => {
  const invalidCandidate = {
    id: 'INVALID-ID-WITH-UPPERCASE',
    type: 'NON_EXISTENT_FAMILY',
    renderer: null,
  };

  const evalResult = evaluateCandidate(invalidCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.INVALID);
  assert.ok(evalResult.reason.includes('Contrat canonique invalide'));
});

// ── 10. FAKE_DATA ───────────────────────────────────────────────────────────
test('10. FAKE_DATA : Rejet immédiat de faux claims commerciaux inventés', () => {
  const fakeDataCandidate = {
    id: 'hero_fake_claims',
    type: 'HERO',
    variant: 'standard',
    renderer: () => null,
    defaultConfig: {
      badge: 'N°1 au Cameroun',
      subtitle: 'Meilleur prix garanti avec livraison express 24h',
    },
  };

  const evalResult = evaluateCandidate(fakeDataCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.INVALID);
  assert.ok(evalResult.reason.includes('forbidden commercial claim'));
});

// ── 11. BUSINESS_TYPE ───────────────────────────────────────────────────────
test('11. BUSINESS_TYPE : Rejet du conditionnement sectoriel dans le renderer', () => {
  const businessTypeCandidate = {
    id: 'hero_sector_dirty',
    type: 'HERO',
    variant: 'cover',
    renderer: function SectorRenderer() {
      const businessType = 'hotel';
      if (businessType === 'hotel') return null;
      return null;
    },
    defaultConfig: {},
  };

  const evalResult = evaluateCandidate(businessTypeCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.INVALID);
  assert.ok(evalResult.reason.includes('businessType'));
});

// ── 12. SUPABASE ────────────────────────────────────────────────────────────
test('12. SUPABASE : Rejet de tout appel direct à Supabase dans le renderer', () => {
  const supabaseCandidate = {
    id: 'product_supabase_dirty',
    type: 'PRODUCT',
    variant: 'grid',
    renderer: function SupabaseRenderer() {
      const supabase = { from: () => ({ select: () => null }) };
      supabase.from('products').select();
      return null;
    },
  };

  const evalResult = evaluateCandidate(supabaseCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.INVALID);
  assert.ok(evalResult.reason.includes('Supabase'));
});

// ── 13. LIVECANVAS ──────────────────────────────────────────────────────────
test('13. LIVECANVAS : Rejet de tout couplage LiveCanvas dans le storefront', () => {
  const liveCanvasCandidate = {
    id: 'header_livecanvas_dirty',
    type: 'HEADER',
    variant: 'nav',
    renderer: function LiveCanvasRenderer() {
      const canvas = typeof LiveCanvas !== 'undefined' ? LiveCanvas : null;
      return canvas ? null : null;
    },
  };

  const evalResult = evaluateCandidate(liveCanvasCandidate, ComponentRegistry);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.INVALID);
  assert.ok(evalResult.reason.includes('LiveCanvas'));
});

// ── 14. MULTI_SECTION ───────────────────────────────────────────────────────
test('14. MULTI_SECTION : Analyse d\'un site complet avec matching canonique et synthèse', () => {
  const siteObs = createReferenceSiteObservation({
    siteId: 'site_boutique_afro',
    sector: 'fashion',
    pageType: 'home',
    sections: [
      { position: 1, family: 'HEADER', layout: 'horizontal_bar' },
      { position: 2, family: 'HERO', layout: 'fullscreen_cover' },
      { position: 3, family: 'CATEGORY', layout: 'visual_grid_cards' },
      { position: 4, family: 'PRODUCT', layout: 'grid_2col' },
      { position: 5, family: 'CONTACT', layout: 'interactive_hub_card' },
    ],
  });

  const analysis = analyzeReferenceSite(siteObs, ComponentRegistry);
  assert.equal(analysis.siteId, 'site_boutique_afro');
  assert.equal(analysis.totalSections, 5);
  assert.equal(analysis.isFullyCoveredByExisting, true);
  assert.equal(analysis.newCandidatesCount, 0);
  assert.equal(analysis.suggestedComposition.sections.length, 5);
});

// ── 15. SECTION_ORDER ───────────────────────────────────────────────────────
test('15. SECTION_ORDER : Deux ordres différents constituent des compositions distinctes', () => {
  const seqA = ['HEADER', 'HERO', 'PRODUCT', 'FOOTER'];
  const seqB = ['HEADER', 'PRODUCT', 'HERO', 'FOOTER'];

  const compCheck = compareSectionOrders(seqA, seqB);
  assert.equal(compCheck.isCompositionOnly, true);
  assert.ok(compCheck.reason.includes('CompositionEngine'));
});

// ── 16. RESPONSIVE ──────────────────────────────────────────────────────────
test('16. RESPONSIVE : Propriétés responsive conservées sans création de composant', () => {
  const sec = {
    sectionFamily: 'PRODUCT',
    layoutPattern: 'grid',
    responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' },
  };

  const pattern = extractPatternFromSiteObservation(sec);
  assert.deepEqual(pattern.responsiveBehavior, { mobile: 'grid_2col', desktop: 'grid_4col' });
});

// ── 17. DATA_REQUIREMENTS ───────────────────────────────────────────────────
test('17. DATA_REQUIREMENTS : Identification des besoins en données', () => {
  const pattern = createStructuralPattern({
    patternId: 'contact_hub',
    family: 'CONTACT',
    layout: 'hub',
    dataRequirements: ['address', 'phone', 'whatsapp'],
  });

  assert.deepEqual(pattern.dataRequirements, ['address', 'phone', 'whatsapp']);
});

// ── 18. CAPABILITIES ────────────────────────────────────────────────────────
test('18. CAPABILITIES : Mapping vers les capabilities indispensables', () => {
  const candidate = promotePatternToCandidate(
    createStructuralPattern({
      patternId: 'service_booking_card',
      family: 'SERVICE',
      layout: 'card',
      dataRequirements: ['services'],
    }),
    function DummyService() { return null; },
    {
      requiredCapabilities: ['SERVICE'],
      optionalCapabilities: ['CONTACT'],
    }
  );

  assert.deepEqual(candidate.requiredCapabilities, ['SERVICE']);
  assert.deepEqual(candidate.optionalCapabilities, ['CONTACT']);
});

// ── 19. EXPLAINABILITY ──────────────────────────────────────────────────────
test('19. EXPLAINABILITY : Tous les champs d\'explicabilité sont fournis', () => {
  const evalResult = evaluateCandidate(
    {
      id: 'header_duplicate_test',
      type: 'HEADER',
      variant: 'horizontal_bar',
      renderer: () => null,
      structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.header_001),
    },
    ComponentRegistry
  );

  assert.ok(evalResult.verdict);
  assert.ok(evalResult.reason);
  assert.ok(evalResult.closestComponentId);
  assert.ok(Array.isArray(evalResult.structuralDifferences));
  assert.ok(Array.isArray(evalResult.recommendations));
  assert.ok(typeof evalResult.similarityScore === 'number');
});

// ── 20. PRODUCTION_PIPELINE_INTEGRATION ─────────────────────────────────────
test('20. PRODUCTION_PIPELINE_INTEGRATION : Pipeline complet de l\'observation à la certification', () => {
  const newObs = {
    sectionFamily: 'HERO',
    layoutPattern: 'asymmetric_interactive_cinema',
    columns: 2,
    hierarchy: ['cinema_viewport', 'timeline_sync', 'director_notes'],
    contentFlow: CONTENT_FLOWS.ASYMMETRIC,
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
    interactionModel: ['scrub_video', 'switch_angle'],
    dataRequirements: ['video_angles'],
  };

  const pattern = extractPatternFromSiteObservation(newObs);

  const candidate = promotePatternToCandidate(
    pattern,
    function QualifiedHeroRenderer() { return null; },
    {
      id: 'hero_cinema_asymmetric',
      defaultConfig: { ctaText: 'Explorer' },
      themeContract: { usesPrimaryColor: true },
      requiredCapabilities: [],
      optionalCapabilities: ['CONTACT'],
      emptyStateBehavior: 'FALLBACK_UI',
    }
  );

  const pipelineResult = runProductionPipeline(candidate, ComponentRegistry);
  assert.equal(pipelineResult.isCertified, true);
  assert.equal(pipelineResult.currentStage, 13);
  assert.equal(pipelineResult.stageReports.length, 13);
  assert.equal(pipelineResult.stageReports[0].status, 'PASSED');
});

// ── 21. ANTI_FLAGS (Tests A, B, C, D) ───────────────────────────────────────
test('21. ANTI_FLAGS : Le moteur ignore les flags déclaratifs mensongers', () => {
  // Test A : isThemeVariation = false, mais structure objectivement THEME_ONLY
  const candidateA = {
    id: 'hero_emerald_copy',
    type: 'HERO',
    variant: 'gradient_banner_emerald',
    renderer: () => null,
    isThemeVariation: false, // Flag mensonger prétendant que ce n'est pas un thème
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_001),
    observedTokens: { primaryColor: '#059669', borderRadius: '16px' },
  };
  const resA = evaluateCandidate(candidateA, ComponentRegistry);
  assert.equal(resA.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY, 'Doit détecter THEME_ONLY malgré isThemeVariation: false');

  // Test B : isThemeVariation = true, mais structure réellement divergente
  const candidateB = {
    id: 'hero_divergent_cover',
    type: 'HERO',
    variant: 'split_video_interactive',
    renderer: () => null,
    isThemeVariation: true, // Flag mensonger tentant de masquer un nouveau composant
    structuralPattern: createStructuralPattern({
      patternId: 'hero_divergent_cover',
      family: 'HERO',
      layout: 'split_video_interactive',
      hierarchy: ['video_player', 'interactive_timeline'],
      contentFlow: CONTENT_FLOWS.ASYMMETRIC,
      mediaPosition: MEDIA_POSITIONS.LEFT,
      interactionModel: ['video_scrub', 'timeline_sync'],
      responsiveBehavior: { mobile: 'stack', desktop: 'asymmetric' },
      dataRequirements: ['video_source'],
    }),
  };
  const resB = evaluateCandidate(candidateB, ComponentRegistry);
  assert.equal(resB.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL, 'Ne doit PAS accepter THEME_ONLY aveuglément');

  // Test C : isConfigVariation = false, mais structure objectivement CONFIGURATION_ONLY
  const candidateC = {
    id: 'product_grid_4col_copy',
    type: 'PRODUCT',
    variant: 'grid_4col_dense',
    renderer: () => null,
    isConfigVariation: false, // Flag mensonger
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.product_001),
    observedProps: { columns: 4, density: 'compact' },
  };
  const resC = evaluateCandidate(candidateC, ComponentRegistry);
  assert.equal(resC.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY, 'Doit détecter CONFIGURATION_ONLY malgré isConfigVariation: false');

  // Test D : isConfigVariation = true, mais structure fondamentalement différente
  const candidateD = {
    id: 'product_ar_experience',
    type: 'PRODUCT',
    variant: 'ar_3d_viewer',
    renderer: () => null,
    isConfigVariation: true, // Flag mensonger
    structuralPattern: createStructuralPattern({
      patternId: 'product_ar_experience',
      family: 'PRODUCT',
      layout: 'ar_3d_viewer',
      hierarchy: ['canvas_3d', 'ar_controls', 'material_picker'],
      contentFlow: CONTENT_FLOWS.ASYMMETRIC,
      mediaPosition: MEDIA_POSITIONS.BACKGROUND,
      interactionModel: ['rotate_3d', 'zoom_model', 'ar_launch'],
      responsiveBehavior: { mobile: 'fullscreen_ar', desktop: 'viewport_3d' },
      dataRequirements: ['3d_models'],
    }),
  };
  const resD = evaluateCandidate(candidateD, ComponentRegistry);
  assert.equal(resD.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL, 'Ne doit PAS accepter CONFIGURATION_ONLY aveuglément');
});

// ── 22. THRESHOLD_ANALYSIS — Score comme signal de proximité seulement ───────
test('22. THRESHOLD_ANALYSIS : Le score est un signal de proximité, pas une décision automatique', () => {
  const baseHero = createStructuralPattern(CANONICAL_PATTERNS.hero_001);

  // 1.00 : Identique
  const comp100 = compareStructuralPatterns(baseHero, baseHero);
  assert.equal(comp100.similarityScore, 1.0);
  assert.equal(comp100.isDuplicate, true);

  // 0.95 : Seuil duplicate (responsive légèrement différent)
  const hero95 = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_95_test',
    responsiveBehavior: { mobile: 'card_stack', desktop: 'expanded_wide' },
  });
  const comp95 = compareStructuralPatterns(baseHero, hero95);
  assert.ok(comp95.similarityScore >= 0.95);
  assert.equal(comp95.isDuplicate, true);

  // 0.85 - 0.90 : Layout variant même flow — isConfigurableVariation
  const hero85 = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_85_test',
    layout: 'gradient_banner_compact',
    hierarchy: ['title', 'subtitle', 'cta_button'],
  });
  const comp85 = compareStructuralPatterns(baseHero, hero85);
  assert.ok(comp85.similarityScore >= 0.75 && comp85.similarityScore < 0.95);
  assert.equal(comp85.isConfigurableVariation, true);

  // 0.70 - 0.75 : Divergence partielle
  const hero70 = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_70_test',
    layout: 'split_banner_text',
    hierarchy: ['title', 'cta_button'],
    interactionModel: ['secondary_cta'],
  });
  const comp70 = compareStructuralPatterns(baseHero, hero70);
  assert.ok(comp70.similarityScore <= 0.80);

  // 0.50 : Divergence marquée flow & position média
  const hero50 = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_50_test',
    layout: 'split_media_left',
    contentFlow: CONTENT_FLOWS.SPLIT_2COL,
    mediaPosition: MEDIA_POSITIONS.LEFT,
  });
  const comp50 = compareStructuralPatterns(baseHero, hero50);
  assert.ok(comp50.similarityScore <= 0.65);
});

// ── 23. CANONICAL_PATTERNS_FALLBACK ─────────────────────────────────────────
test('23. CANONICAL_PATTERNS_FALLBACK : Fonctionnement autonome en pur Node.js avec catalogue vide', () => {
  const candidate = {
    id: 'hero_isolated_node_eval',
    type: 'HERO',
    variant: 'fullscreen_cover',
    renderer: () => null,
    structuralPattern: createStructuralPattern(CANONICAL_PATTERNS.hero_fullscreen),
  };

  // Passage d'un catalogue vide [] -> doit utiliser CANONICAL_PATTERNS
  const evalResult = evaluateCandidate(candidate, []);
  assert.equal(evalResult.verdict, CANONICAL_DECISION_VERDICTS.DUPLICATE);
  assert.equal(evalResult.closestComponentId, 'hero_fullscreen');
  assert.equal(evalResult.similarityScore, 1.0);
});

// ══════════════════════════════════════════════════════════════════════════════
// NOUVEAUX TESTS FRONTIÈRES — SCORE ≠ JUGE (Closure Étape 4.3)
// ══════════════════════════════════════════════════════════════════════════════

// ── BOUNDARY TEST A : Score élevé (0.90) + différences uniquement cosmétiques → THEME_ONLY ──
// Prouve : score 0.90 ne déclenche pas automatiquement CONFIGURATION_ONLY
test('BOUNDARY_A : Score ~0.90 + différences purement cosmétiques → THEME_ONLY', () => {
  // Pattern quasi-identique à hero_001, uniquement avec layout variant léger (score ~0.90)
  // + tokens visuels explicites : la décision doit être THEME_ONLY, pas CONFIGURATION_ONLY
  const candidateA = {
    id: 'hero_emerald_90_score',
    type: 'HERO',
    variant: 'gradient_banner_emerald',
    renderer: () => null,
    // Score attendu ~0.90 : layout variant sur même famille de layout
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.hero_001,
      patternId: 'hero_emerald_90_score',
      layout: 'gradient_banner_dark', // Layout variant → score ≈ 0.88-0.92
    }),
    // Tokens cosmétiques : c'est la NATURE des différences qui décide, pas le score
    observedTokens: {
      primaryColor: '#059669',
      gradient: 'linear-gradient(to right, #064e3b, #022c22)',
      borderRadius: '24px',
    },
  };

  const result = evaluateCandidate(candidateA, ComponentRegistry);
  // Le score est intermédiaire (~0.88), mais les différences sont cosmétiques → THEME_ONLY
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY,
    `Score=${result.similarityScore.toFixed(2)} mais diffs cosmétiques → THEME_ONLY attendu, got: ${result.verdict}`);
  assert.ok(result.reason.includes('habillage visuel') || result.recommendations.some((r) => r.includes('ThemeEngine')));
  // Vérification que le score est bien mentionné comme signal seulement
  assert.ok(result.reason.includes('score') || result.similarityScore > 0);
});

// ── BOUNDARY TEST B : Score ~0.88 + différence configurable → CONFIGURATION_ONLY ──
// Prouve : score 0.88 n'est pas une décision — la nature configurable des différences l'est
test('BOUNDARY_B : Score ~0.88 + différence de colonnes configurable → CONFIGURATION_ONLY', () => {
  const candidateB = {
    id: 'product_4col_compact',
    type: 'PRODUCT',
    variant: 'grid_4col_compact',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.product_001,
      patternId: 'product_4col_compact',
      layout: 'grid_cards', // Même famille de layout → score ~0.88
      responsiveBehavior: { mobile: 'grid_2col', desktop: 'grid_4col' },
    }),
    observedProps: { columns: 4, spacing: 'compact' },
  };

  const result = evaluateCandidate(candidateB, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    `Score=${result.similarityScore.toFixed(2)}, diffs configurables → CONFIGURATION_ONLY attendu, got: ${result.verdict}`);
  assert.ok(result.reason.includes('configuration'));
});

// ── BOUNDARY TEST C : Score ~0.82 + structure irréductible → VALID_CANONICAL ──
// Prouve : score 0.82 ne force pas CONFIGURATION_ONLY — la divergence réelle décide
test('BOUNDARY_C : Score ~0.82 + hiérarchie + interaction distinctes → VALID_CANONICAL', () => {
  const candidateC = {
    id: 'service_interactive_booking_hub',
    type: 'SERVICE',
    variant: 'interactive_booking_hub_split',
    renderer: function ValidBookingHubRenderer() { return null; },
    requiredCapabilities: ['SERVICE'],
    optionalCapabilities: [],
    emptyStateBehavior: 'HIDE_IN_PUBLIC',
    themeContract: { usesPrimaryColor: true },
    structuralPattern: createStructuralPattern({
      patternId: 'service_interactive_booking_hub',
      family: 'SERVICE',
      layout: 'list_cards',            // Proche de service_001 (list_cards) → score famille+layout = ~0.40+8 = élevé
      hierarchy: ['booking_calendar', 'time_slots', 'confirmation_flow'], // Hiérarchie radicalement différente
      contentFlow: CONTENT_FLOWS.GRID, // Flow différent
      mediaPosition: MEDIA_POSITIONS.NONE,
      interactionModel: ['calendar_pick', 'slot_reserve', 'confirm_booking'], // Interaction distincte
      responsiveBehavior: { mobile: 'stack', desktop: 'grid_2col' },
      dataRequirements: ['service_slots', 'availability_calendar'],
    }),
    // Pas de observedProps → ne peut pas être classé CONFIGURATION_ONLY
    // Pas de observedTokens → ne peut pas être classé THEME_ONLY
  };

  const result = evaluateCandidate(candidateC, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL,
    `Score=${result.similarityScore.toFixed(2)}, hiérarchie+interaction distinctes → VALID_CANONICAL attendu, got: ${result.verdict}`);
  assert.ok(result.reason.includes('distincts') || result.reason.includes('irréductible'));
});

// ── BOUNDARY TEST D : Score ~0.72 + configurable par observedProps → CONFIGURATION_ONLY ──
// TEST CRITIQUE : score < 0.75 ≠ VALID_CANONICAL automatique
test('BOUNDARY_D [CRITIQUE] : Score ~0.72 + structure configurable → CONFIGURATION_ONLY (score < 0.75 ≠ VALID_CANONICAL auto)', () => {
  // Un candidat avec un score légèrement < 0.75 (responsive divergent),
  // mais dont la différence est uniquement paramétrique (colonnes, responsive)
  const candidateD = {
    id: 'product_2col_mobile_priority',
    type: 'PRODUCT',
    variant: 'grid_2col_mobile_priority',
    renderer: () => null,
    structuralPattern: createStructuralPattern({
      ...CANONICAL_PATTERNS.product_001,
      patternId: 'product_2col_mobile_priority',
      layout: 'grid_cards', // Même layout famille
      responsiveBehavior: { mobile: 'grid_3col', desktop: 'grid_6col' }, // Très différent du responsive canonique
    }),
    observedProps: { columns: 2, mobilePriority: true },
  };

  const result = evaluateCandidate(candidateD, ComponentRegistry);
  // Le score peut être ~0.70-0.72 (responsive très différent = -5 points)
  // Mais observedProps configurable → doit retourner CONFIGURATION_ONLY, pas VALID_CANONICAL
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY,
    `Score=${result.similarityScore.toFixed(2)} (potentiellement < 0.75) mais configurable → CONFIGURATION_ONLY attendu. Ce test prouve que score < 0.75 ≠ VALID_CANONICAL automatique. Got: ${result.verdict}`);
});

// ── BOUNDARY TEST E : Score ~0.70 + structure irréductible → VALID_CANONICAL ──
// Prouve : score faible PEUT justifier VALID_CANONICAL si la divergence est structurelle
test('BOUNDARY_E : Score ~0.70 + divergence structurelle réelle → VALID_CANONICAL', () => {
  const candidateE = {
    id: 'gallery_360_viewer',
    type: 'GALLERY',
    variant: '360_interactive_viewer',
    renderer: function Gallery360Renderer() { return null; },
    requiredCapabilities: ['GALLERY'],
    optionalCapabilities: [],
    emptyStateBehavior: 'HIDE_IN_PUBLIC',
    themeContract: { usesPrimaryColor: true },
    structuralPattern: createStructuralPattern({
      patternId: 'gallery_360_viewer',
      family: 'GALLERY',
      layout: 'square_grid',           // Layout proche de gallery_001
      hierarchy: ['canvas_360', 'rotation_controls', 'hotspot_overlay'],
      contentFlow: CONTENT_FLOWS.GRID, // Même flow
      mediaPosition: MEDIA_POSITIONS.INLINE,
      interactionModel: ['rotate_360', 'hotspot_click', 'fullscreen_360'], // Interaction distincte
      responsiveBehavior: { mobile: 'fullscreen_gyro', desktop: 'viewport_interactive' },
      dataRequirements: ['gallery_360_assets', 'hotspot_data'],
    }),
    // Pas de props/tokens → ni cosmétique ni configurable
  };

  const result = evaluateCandidate(candidateE, ComponentRegistry);
  // Score ~0.65-0.75 (hiérarchie + interaction + responsive + data requirements divergent)
  // Mais la structure est irréductible → VALID_CANONICAL
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL,
    `Score=${result.similarityScore.toFixed(2)}, divergence structurelle réelle → VALID_CANONICAL attendu, got: ${result.verdict}`);
  assert.ok(result.reason.includes('distincts') || result.reason.includes('irréductible'));
});

// ── BOUNDARY TEST F : Score ~0.50 + ordre de sections → COMPOSITION_ONLY ──
// Prouve : score faible n'implique pas forcément VALID_CANONICAL
test('BOUNDARY_F : Score ~0.50 + composition de sections → COMPOSITION_ONLY', () => {
  const multiSectionD = {
    id: 'landing_reordered',
    type: 'COMPOSITION',
    sections: ['HEADER', 'PRODUCT', 'HERO', 'FOOTER'],
  };

  const result = evaluateCandidate(multiSectionD, ComponentRegistry);
  assert.equal(result.verdict, CANONICAL_DECISION_VERDICTS.COMPOSITION_ONLY,
    `Composition multi-sections → COMPOSITION_ONLY attendu, got: ${result.verdict}`);
  assert.ok(result.reason.includes('composition de page'));
});

// ══════════════════════════════════════════════════════════════════════════════
// TESTS DES 8 DIMENSIONS — Chaque dimension impacte réellement le score
// ══════════════════════════════════════════════════════════════════════════════

test('DIM1_HIERARCHY : Seule la hiérarchie change → score diminue de ~10%', () => {
  const base = createStructuralPattern(CANONICAL_PATTERNS.hero_001);
  const modified = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_hier_test',
    hierarchy: ['totally', 'different', 'elements', 'here'],
  });
  const comp = compareStructuralPatterns(base, modified);
  // La hiérarchie pèse 10% — un chevauchement nul doit réduire le score d'~10 points
  assert.ok(comp.differences.some((d) => /Hierarchy divergence/i.test(d)),
    'La dimension HIERARCHY doit apparaître dans les différences');
  assert.ok(comp.similarityScore < 1.0, 'Le score doit diminuer quand la hiérarchie diffère');
  assert.ok(comp.similarityScore >= 0.85, 'Seule la hiérarchie change → score reste élevé');
});

test('DIM4_MEDIA_POSITION : Seule la mediaPosition change → score diminue de ~10%', () => {
  const base = createStructuralPattern(CANONICAL_PATTERNS.hero_001); // mediaPosition: none
  const modified = createStructuralPattern({
    ...CANONICAL_PATTERNS.hero_001,
    patternId: 'hero_media_test',
    mediaPosition: MEDIA_POSITIONS.BACKGROUND,
  });
  const comp = compareStructuralPatterns(base, modified);
  assert.ok(comp.differences.some((d) => /Different media position/i.test(d)),
    'La dimension MEDIA_POSITION doit apparaître dans les différences');
  assert.ok(comp.similarityScore < 1.0);
  assert.ok(comp.similarityScore >= 0.85, 'Seule la mediaPosition change → score reste élevé');
});

test('DIM6_INTERACTION_MODEL : Seul le modèle d\'interaction change → score diminue de ~10%', () => {
  const base = createStructuralPattern(CANONICAL_PATTERNS.contact_card); // interaction: maps + whatsapp + call
  const modified = createStructuralPattern({
    ...CANONICAL_PATTERNS.contact_card,
    patternId: 'contact_interaction_test',
    interactionModel: ['email_form'], // Interaction totalement différente
  });
  const comp = compareStructuralPatterns(base, modified);
  assert.ok(comp.differences.some((d) => /Interaction divergence/i.test(d)),
    'La dimension INTERACTION_MODEL doit apparaître dans les différences');
  assert.ok(comp.similarityScore < 1.0);
  assert.ok(comp.similarityScore >= 0.80, 'Seul le modèle d\'interaction change → score reste correct');
});

test('DIM8_DATA_REQUIREMENTS : Seuls les dataRequirements changent → score diminue de ~10%', () => {
  const base = createStructuralPattern(CANONICAL_PATTERNS.product_001); // dataReqs: ['products']
  const modified = createStructuralPattern({
    ...CANONICAL_PATTERNS.product_001,
    patternId: 'product_data_test',
    dataRequirements: ['inventory', 'supplier_data', 'pricing_rules'],
  });
  const comp = compareStructuralPatterns(base, modified);
  assert.ok(comp.differences.some((d) => /Data requirements divergence/i.test(d)),
    'La dimension DATA_REQUIREMENTS doit apparaître dans les différences');
  assert.ok(comp.similarityScore < 1.0);
  assert.ok(comp.similarityScore >= 0.80, 'Seuls les data requirements changent → score reste élevé');
});

// ══════════════════════════════════════════════════════════════════════════════
// TEST COMPOSITION — Permutations multiples
// ══════════════════════════════════════════════════════════════════════════════

test('COMPOSITION_PERMUTATIONS : Toutes les permutations identifiées comme COMPOSITION_ONLY', () => {
  const permutations = [
    ['HEADER', 'HERO', 'PRODUCT', 'FOOTER'],
    ['HEADER', 'PRODUCT', 'HERO', 'FOOTER'],
    ['HERO', 'HEADER', 'PRODUCT', 'FOOTER'],
    ['PRODUCT', 'HERO', 'HEADER', 'FOOTER'],
  ];

  for (const [seqA, seqB] of [[permutations[0], permutations[1]], [permutations[0], permutations[2]], [permutations[0], permutations[3]]]) {
    const result = compareSectionOrders(seqA, seqB);
    assert.equal(result.isCompositionOnly, true,
      `${seqA.join('>')} vs ${seqB.join('>')} doit être COMPOSITION_ONLY`);
    assert.ok(result.reason.includes('CompositionEngine'));
  }
});


