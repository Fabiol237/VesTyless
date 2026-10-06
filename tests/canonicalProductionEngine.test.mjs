import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCanonicalContract,
  validateNoFakeClaims,
  EMPTY_STATE_BEHAVIORS,
  CANONICAL_CAPABILITY_WHITELIST,
} from '../src/lib/component-registry/canonicalContract.js';

import {
  createStructuralPattern,
  compareStructuralPatterns,
  extractPatternFromSiteObservation,
  MEDIA_POSITIONS,
  CONTENT_FLOWS,
} from '../src/lib/component-registry/structuralPatternModel.js';

import {
  evaluateCandidate,
  CANONICAL_DECISION_VERDICTS,
} from '../src/lib/component-registry/antiInflationValidator.js';

import {
  runProductionPipeline,
  PIPELINE_STAGES,
} from '../src/lib/component-registry/productionPipeline.js';

import { ComponentRegistry, COMPONENT_FAMILIES } from '../src/lib/component-registry/ComponentRegistry.js';

test('1. Canonical Component Contract Validator', () => {
  // Définition valide
  const validComp = {
    id: 'hero_magazine_split',
    type: 'HERO',
    variant: 'magazine_split_editorial',
    renderer: function DummyHero() { return null; },
    requiredCapabilities: ['CONTACT'],
    optionalCapabilities: ['GALLERY'],
    emptyStateBehavior: EMPTY_STATE_BEHAVIORS.FALLBACK_UI,
    themeContract: { usesPrimaryColor: true },
    defaultConfig: { ctaText: 'Voir plus' },
  };
  const result = validateCanonicalContract(validComp);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);

  // Définition avec fake commercial claim dans defaultConfig
  const invalidClaimComp = {
    ...validComp,
    id: 'hero_invalid_claim',
    defaultConfig: {
      bullet: 'Livraison express sécurisée',
    },
  };
  const claimResult = validateCanonicalContract(invalidClaimComp);
  assert.equal(claimResult.valid, false);
  assert.ok(claimResult.errors.some((e) => e.includes('forbidden commercial claim')));

  // Définition avec famille inconnue
  const invalidFamilyComp = {
    ...validComp,
    id: 'xyz_comp',
    type: 'UNKNOWN_FAMILY_XYZ',
  };
  const familyResult = validateCanonicalContract(invalidFamilyComp);
  assert.equal(familyResult.valid, false);
  assert.ok(familyResult.errors.some((e) => e.includes('Unknown family')));
});

test('2. Structural Pattern Model & Comparator', () => {
  const patternA = createStructuralPattern({
    patternId: 'hero_left_media',
    family: 'HERO',
    layout: 'split_media_left',
    mediaPosition: MEDIA_POSITIONS.LEFT,
    contentFlow: CONTENT_FLOWS.SPLIT_2COL,
    interactionModel: ['direct_cta'],
    dataRequirements: ['title', 'media'],
  });

  const patternB = createStructuralPattern({
    patternId: 'hero_left_media_duplicate',
    family: 'HERO',
    layout: 'split_media_left',
    mediaPosition: MEDIA_POSITIONS.LEFT,
    contentFlow: CONTENT_FLOWS.SPLIT_2COL,
    interactionModel: ['direct_cta'],
    dataRequirements: ['title', 'media'],
  });

  const comparison = compareStructuralPatterns(patternA, patternB);
  assert.equal(comparison.isDuplicate, true);
  assert.equal(comparison.similarityScore, 1.0);

  // Extraction d'observation de site
  const siteObservation = {
    sectionFamily: 'PRODUCT',
    layoutPattern: 'grid_cards',
    columns: 2,
    hierarchy: ['title', 'price', 'cta'],
  };
  const extractedPattern = extractPatternFromSiteObservation(siteObservation);
  assert.equal(extractedPattern.family, 'PRODUCT');
  assert.equal(extractedPattern.contentFlow, CONTENT_FLOWS.SPLIT_2COL);
});

test('3. Anti-Inflation Validator Engine (6 Classification Categories)', () => {
  const existingCatalog = [
    {
      id: 'hero_001',
      type: 'HERO',
      variant: 'gradient_banner',
      renderer: () => null,
    },
  ];

  // A. Doublon exact
  const duplicateCandidate = {
    id: 'hero_001',
    type: 'HERO',
    variant: 'gradient_banner',
    renderer: () => null,
  };
  const resDup = evaluateCandidate(duplicateCandidate, existingCatalog);
  assert.equal(resDup.verdict, CANONICAL_DECISION_VERDICTS.DUPLICATE);

  // B. Variation de thème
  const themeCandidate = {
    id: 'hero_dark_gradient',
    type: 'HERO',
    variant: 'gradient_banner_dark',
    renderer: () => null,
    isThemeVariation: true,
  };
  const resTheme = evaluateCandidate(themeCandidate, existingCatalog);
  assert.equal(resTheme.verdict, CANONICAL_DECISION_VERDICTS.THEME_ONLY);

  // C. Variation de configuration
  const configCandidate = {
    id: 'hero_with_extra_btn',
    type: 'HERO',
    variant: 'gradient_banner_2btn',
    renderer: () => null,
    isConfigVariation: true,
  };
  const resConfig = evaluateCandidate(configCandidate, existingCatalog);
  assert.equal(resConfig.verdict, CANONICAL_DECISION_VERDICTS.CONFIGURATION_ONLY);

  // D. Nouveau composant canonique valide
  const validCandidate = {
    id: 'hero_editorial_magazine',
    type: 'HERO',
    variant: 'editorial_cover_deck',
    renderer: () => null,
  };
  const resValid = evaluateCandidate(validCandidate, existingCatalog);
  assert.equal(resValid.verdict, CANONICAL_DECISION_VERDICTS.VALID_CANONICAL);
});

test('4. 13-Stage Production Pipeline Execution', () => {
  const candidate = {
    id: 'service_signature_spotlight',
    type: 'SERVICE',
    variant: 'spotlight_hero_service',
    renderer: function ValidServiceRenderer() { return null; },
    requiredCapabilities: ['SERVICE'],
    optionalCapabilities: ['CONTACT'],
    emptyStateBehavior: EMPTY_STATE_BEHAVIORS.HIDE_IN_PUBLIC,
    themeContract: { usesPrimaryColor: true },
    defaultConfig: { ctaText: 'Réserver' },
  };

  const pipelineResult = runProductionPipeline(candidate, ComponentRegistry);
  assert.equal(pipelineResult.isCertified, true);
  assert.equal(pipelineResult.currentStage, 13);
  assert.equal(pipelineResult.stageReports.length, 13);

  // Pipeline rejette un candidat avec branching businessType
  const dirtyCandidate = {
    ...candidate,
    id: 'service_dirty_branching',
    renderer: function DirtyRenderer() {
      // simulate branching
      const businessType = 'restaurant';
      if (businessType === 'restaurant') return null;
      return null;
    },
  };
  const dirtyResult = runProductionPipeline(dirtyCandidate, ComponentRegistry);
  assert.equal(dirtyResult.isCertified, false);
  assert.equal(dirtyResult.currentStage, 8);
  assert.ok(dirtyResult.rejectionReason.includes('businessType'));
});
