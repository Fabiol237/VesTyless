/**
 * TEST SUITE: master4Builder.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation complète du VESTIN SHOP BUILDER (Master 4).
 *
 * Catégories de tests :
 * 1. Initialisation de l'état du Builder
 * 2. Immutabilité et mutations déclaratives des sections
 * 3. Réorganisation, déplacement et duplication des sections
 * 4. Gestion des thèmes et design tokens
 * 5. Pile d'historique Undo / Redo (max 25)
 * 6. Protection stricte contre scripts malveillants et JSX arbitraire
 * 7. Conformité avec StoreModelContract & Zod
 * 8. Adaptation BusinessProfile avec option useDraft:true
 * 9. Résolution ComponentRegistry pour toutes les familles autorisées
 * 10. Indépendance absolue de layout_config et publication explicite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateStoreConfig, detectUnsafeContent, ALLOWED_COMPONENT_FAMILIES } from '../src/lib/store-model/StoreModelContract.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';
import { adaptStoreToBusinessProfile } from '../src/lib/business-profile/businessProfileAdapter.js';
import { compositionEngine } from '../src/lib/composition-engine/CompositionEngine.js';

// Enregistrement des composants canoniques pour l'environnement Node
const CANONICAL_COMPONENTS = [
  { id: 'header_001', type: 'HEADER', variant: 'header_001', renderer: (p) => p },
  { id: 'hero_001', type: 'HERO', variant: 'hero_001', renderer: (p) => p },
  { id: 'hero_fullscreen', type: 'HERO', variant: 'hero_fullscreen', renderer: (p) => p },
  { id: 'product_001', type: 'PRODUCT', variant: 'product_001', renderer: (p) => p },
  { id: 'service_001', type: 'SERVICE', variant: 'service_001', renderer: (p) => p },
  { id: 'category_001', type: 'CATEGORY', variant: 'category_001', renderer: (p) => p },
  { id: 'gallery_001', type: 'GALLERY', variant: 'gallery_001', renderer: (p) => p },
  { id: 'contact_001', type: 'CONTACT', variant: 'contact_001', renderer: (p) => p },
  { id: 'contact_card', type: 'CONTACT', variant: 'contact_card', renderer: (p) => p },
  { id: 'footer_001', type: 'FOOTER', variant: 'footer_001', renderer: (p) => p },
  { id: 'testimonial_001', type: 'TESTIMONIAL', variant: 'testimonial_001', renderer: (p) => p },
  { id: 'faq_001', type: 'FAQ', variant: 'faq_001', renderer: (p) => p },
  { id: 'promotion_001', type: 'PROMOTION', variant: 'promotion_001', renderer: (p) => p },
  { id: 'carousel_001', type: 'CAROUSEL', variant: 'carousel_001', renderer: (p) => p },
  { id: 'booking_001', type: 'BOOKING', variant: 'booking_001', renderer: (p) => p },
];

for (const c of CANONICAL_COMPONENTS) {
  ComponentRegistry.register(c);
}

// ── Helpers pour simuler les opérations pures de useBuilderState ──────────────

function createInitialDraft() {
  return {
    version: 1,
    businessType: 'fashion',
    creationMethod: 'TEMPLATE',
    templateId: 'tpl_mode_01',
    theme: {
      primaryColor: '#128C7E',
      secondaryColor: '#0F172A',
      accentColor: '#25D366',
      bgColor: '#FFFFFF',
      textColor: '#0F172A',
      font: 'Inter',
      headingFont: 'Inter',
      isDark: false,
      mode: 'light',
    },
    sections: [
      { id: 'sec_header_1', type: 'HEADER', variant: 'header_001', enabled: true, order: 0, config: { isSticky: true }, content: {} },
      { id: 'sec_hero_2', type: 'HERO', variant: 'hero_001', enabled: true, order: 1, config: { title: 'Nouvelle Collection', subtitle: 'Découvrez nos nouveautés' }, content: {} },
      { id: 'sec_prod_3', type: 'PRODUCT', variant: 'product_001', enabled: true, order: 2, config: { columns: 2, showPrice: true }, content: {} },
      { id: 'sec_contact_4', type: 'CONTACT', variant: 'contact_card', enabled: true, order: 3, config: { title: 'Contactez-nous' }, content: {} },
      { id: 'sec_footer_5', type: 'FOOTER', variant: 'footer_001', enabled: true, order: 4, config: { showCopyright: true }, content: {} },
    ],
  };
}

// ── Pure mutation helpers mirroring useBuilderState ──────────────────────────

function mutateUpdateConfig(draft, sectionId, partialConfig) {
  return {
    ...draft,
    sections: (draft.sections || []).map(s =>
      s.id === sectionId ? { ...s, config: { ...(s.config || {}), ...partialConfig } } : s
    ),
  };
}

function mutateUpdateContent(draft, sectionId, partialContent) {
  return {
    ...draft,
    sections: (draft.sections || []).map(s =>
      s.id === sectionId ? { ...s, content: { ...(s.content || {}), ...partialContent } } : s
    ),
  };
}

function mutateChangeVariant(draft, sectionId, newVariant) {
  return {
    ...draft,
    sections: (draft.sections || []).map(s =>
      s.id === sectionId ? { ...s, variant: newVariant } : s
    ),
  };
}

function mutateToggleVisibility(draft, sectionId) {
  return {
    ...draft,
    sections: (draft.sections || []).map(s =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ),
  };
}

function mutateMoveUp(draft, sectionId) {
  const sections = [...(draft.sections || [])];
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx <= 0) return draft;
  [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
  return {
    ...draft,
    sections: sections.map((s, i) => ({ ...s, order: i })),
  };
}

function mutateMoveDown(draft, sectionId) {
  const sections = [...(draft.sections || [])];
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx < 0 || idx >= sections.length - 1) return draft;
  [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
  return {
    ...draft,
    sections: sections.map((s, i) => ({ ...s, order: i })),
  };
}

function mutateReorder(draft, fromIndex, toIndex) {
  const sections = [...(draft.sections || [])];
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= sections.length || toIndex >= sections.length) return draft;
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);
  return {
    ...draft,
    sections: sections.map((s, i) => ({ ...s, order: i })),
  };
}

function mutateAddSection(draft, type, variant, config = {}) {
  const newSection = {
    id: `sec_${type.toLowerCase()}_test_${Date.now()}`,
    type: type.toUpperCase(),
    variant: variant || 'default',
    enabled: true,
    order: (draft.sections || []).length,
    config: { ...config },
    content: {},
  };
  const sections = [...(draft.sections || []), newSection];
  return {
    ...draft,
    sections: sections.map((s, i) => ({ ...s, order: i })),
  };
}

function mutateRemoveSection(draft, sectionId) {
  return {
    ...draft,
    sections: (draft.sections || [])
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i })),
  };
}

function mutateDuplicateSection(draft, sectionId) {
  const sections = [...(draft.sections || [])];
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx < 0) return draft;
  const original = sections[idx];
  const copy = {
    ...original,
    id: `sec_${original.type.toLowerCase()}_copy_${Date.now()}`,
    config: { ...(original.config || {}) },
    content: { ...(original.content || {}) },
  };
  sections.splice(idx + 1, 0, copy);
  return {
    ...draft,
    sections: sections.map((s, i) => ({ ...s, order: i })),
  };
}

function mutateTheme(draft, partialTheme) {
  return {
    ...draft,
    theme: { ...(draft.theme || {}), ...partialTheme },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('MASTER 4 — Vestin Shop Builder', () => {

  // ── 1. Initialisation & Validité du Draft ───────────────────────────────────
  it('1. Initial draft_config validation — structure de départ 100% conforme Zod', () => {
    const initial = createInitialDraft();
    const result = validateStoreConfig(initial);
    assert.ok(result.success, `Validation échouée: ${result.errors?.join(', ')}`);
    assert.strictEqual(result.data.sections.length, 5);
    assert.strictEqual(result.data.businessType, 'product'); // 'fashion' normalise vers 'product'
  });

  // ── 2. Immutabilité des modifications de configuration de section ─────────
  it('2. updateSectionConfig — modifie uniquement la section ciblée de manière immuable', () => {
    const initial = createInitialDraft();
    const modified = mutateUpdateConfig(initial, 'sec_hero_2', { title: 'Soldes d\'Été 50%' });

    // Référence originale intacte
    assert.notStrictEqual(initial, modified);
    assert.notStrictEqual(initial.sections, modified.sections);
    assert.strictEqual(initial.sections[1].config.title, 'Nouvelle Collection');
    
    // Valeur modifiée appliquée
    assert.strictEqual(modified.sections[1].config.title, 'Soldes d\'Été 50%');
    assert.strictEqual(modified.sections[1].config.subtitle, 'Découvrez nos nouveautés');
    
    // Autres sections intactes
    assert.strictEqual(modified.sections[0].config.isSticky, true);
    assert.strictEqual(modified.sections[2].config.columns, 2);

    // Toujours valide Zod
    const validation = validateStoreConfig(modified);
    assert.ok(validation.success);
  });

  // ── 3. Mise à jour de contenu de section ────────────────────────────────────
  it('3. updateSectionContent — met à jour le contenu déclaré sans altérer le reste', () => {
    const initial = createInitialDraft();
    const modified = mutateUpdateContent(initial, 'sec_contact_4', { customNote: 'Ouvert du lundi au samedi' });

    assert.strictEqual(modified.sections[3].content.customNote, 'Ouvert du lundi au samedi');
    assert.strictEqual(initial.sections[3].content.customNote, undefined);
  });

  // ── 4. Changement de variante ───────────────────────────────────────────────
  it('4. changeSectionVariant — change la variante canonique d\'une section', () => {
    const initial = createInitialDraft();
    const modified = mutateChangeVariant(initial, 'sec_hero_2', 'hero_fullscreen');

    assert.strictEqual(modified.sections[1].variant, 'hero_fullscreen');
    assert.strictEqual(modified.sections[1].type, 'HERO');
    assert.strictEqual(initial.sections[1].variant, 'hero_001');

    const validation = validateStoreConfig(modified);
    assert.ok(validation.success);
  });

  // ── 5. Bascule de visibilité (enabled) ──────────────────────────────────────
  it('5. toggleSectionVisibility — bascule true ↔ false correctement', () => {
    const initial = createInitialDraft();
    const hidden = mutateToggleVisibility(initial, 'sec_prod_3');
    assert.strictEqual(hidden.sections[2].enabled, false);

    const shownAgain = mutateToggleVisibility(hidden, 'sec_prod_3');
    assert.strictEqual(shownAgain.sections[2].enabled, true);
  });

  // ── 6. Déplacement vers le haut (moveUp) ───────────────────────────────────
  it('6. moveSectionUp — permute deux sections et recalcule les index 0..N-1', () => {
    const initial = createInitialDraft();
    // sec_prod_3 (index 2) monte en index 1
    const moved = mutateMoveUp(initial, 'sec_prod_3');

    assert.strictEqual(moved.sections[1].id, 'sec_prod_3');
    assert.strictEqual(moved.sections[1].order, 1);
    assert.strictEqual(moved.sections[2].id, 'sec_hero_2');
    assert.strictEqual(moved.sections[2].order, 2);

    // Cas limite : première section ne peut pas monter
    const cantMoveFirst = mutateMoveUp(initial, 'sec_header_1');
    assert.strictEqual(cantMoveFirst.sections[0].id, 'sec_header_1');
  });

  // ── 7. Déplacement vers le bas (moveDown) ─────────────────────────────────
  it('7. moveSectionDown — permute deux sections vers le bas et recalcule les index', () => {
    const initial = createInitialDraft();
    // sec_hero_2 (index 1) descend en index 2
    const moved = mutateMoveDown(initial, 'sec_hero_2');

    assert.strictEqual(moved.sections[1].id, 'sec_prod_3');
    assert.strictEqual(moved.sections[1].order, 1);
    assert.strictEqual(moved.sections[2].id, 'sec_hero_2');
    assert.strictEqual(moved.sections[2].order, 2);

    // Cas limite : dernière section ne peut pas descendre
    const cantMoveLast = mutateMoveDown(initial, 'sec_footer_5');
    assert.strictEqual(cantMoveLast.sections[4].id, 'sec_footer_5');
  });

  // ── 8. Réordonnancement arbitraire (reorder) ───────────────────────────────
  it('8. reorderSections — déplace arbitrairement une section et normalise l\'ordre', () => {
    const initial = createInitialDraft();
    // Déplacer sec_contact_4 (index 3) en première position (index 0)
    const reordered = mutateReorder(initial, 3, 0);

    assert.strictEqual(reordered.sections[0].id, 'sec_contact_4');
    assert.strictEqual(reordered.sections[0].order, 0);
    assert.strictEqual(reordered.sections[1].id, 'sec_header_1');
    assert.strictEqual(reordered.sections[1].order, 1);
    assert.strictEqual(reordered.sections.length, 5);

    // Vérifier ordre strictement séquentiel 0..4
    reordered.sections.forEach((sec, idx) => {
      assert.strictEqual(sec.order, idx);
    });
  });

  // ── 9. Ajout de section ─────────────────────────────────────────────────────
  it('9. addSection — insère une nouvelle section valide à la fin de la liste', () => {
    const initial = createInitialDraft();
    const added = mutateAddSection(initial, 'TESTIMONIAL', 'testimonial_001', { title: 'Avis Clients' });

    assert.strictEqual(added.sections.length, 6);
    const newSec = added.sections[5];
    assert.strictEqual(newSec.type, 'TESTIMONIAL');
    assert.strictEqual(newSec.variant, 'testimonial_001');
    assert.strictEqual(newSec.order, 5);
    assert.strictEqual(newSec.enabled, true);
    assert.strictEqual(newSec.config.title, 'Avis Clients');

    const validation = validateStoreConfig(added);
    assert.ok(validation.success);
  });

  // ── 10. Suppression de section ──────────────────────────────────────────────
  it('10. removeSection — supprime une section et réindexe proprement les restantes', () => {
    const initial = createInitialDraft();
    const removed = mutateRemoveSection(initial, 'sec_hero_2');

    assert.strictEqual(removed.sections.length, 4);
    assert.ok(!removed.sections.some(s => s.id === 'sec_hero_2'));

    // Vérifier réindexation 0..3
    removed.sections.forEach((sec, idx) => {
      assert.strictEqual(sec.order, idx);
    });

    const validation = validateStoreConfig(removed);
    assert.ok(validation.success);
  });

  // ── 11. Duplication de section ──────────────────────────────────────────────
  it('11. duplicateSection — crée une copie indépendante juste après l\'original', () => {
    const initial = createInitialDraft();
    const duplicated = mutateDuplicateSection(initial, 'sec_hero_2');

    assert.strictEqual(duplicated.sections.length, 6);
    assert.strictEqual(duplicated.sections[1].id, 'sec_hero_2');
    
    const copy = duplicated.sections[2];
    assert.notStrictEqual(copy.id, 'sec_hero_2');
    assert.strictEqual(copy.type, 'HERO');
    assert.strictEqual(copy.variant, 'hero_001');
    assert.strictEqual(copy.config.title, 'Nouvelle Collection');
    assert.strictEqual(copy.order, 2);

    // Modifier la copie n'affecte pas l'original
    copy.config.title = 'Titre Modifié de la Copie';
    assert.strictEqual(duplicated.sections[1].config.title, 'Nouvelle Collection');
  });

  // ── 12. Mise à jour de thème ────────────────────────────────────────────────
  it('12. updateTheme — applique les tokens de couleur et typographie déclaratifs', () => {
    const initial = createInitialDraft();
    const themed = mutateTheme(initial, {
      primaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      bgColor: '#09090f',
      font: 'Outfit',
      isDark: true,
      mode: 'dark',
    });

    assert.strictEqual(themed.theme.primaryColor, '#8b5cf6');
    assert.strictEqual(themed.theme.accentColor, '#ec4899');
    assert.strictEqual(themed.theme.bgColor, '#09090f');
    assert.strictEqual(themed.theme.font, 'Outfit');
    assert.strictEqual(themed.theme.isDark, true);
    assert.strictEqual(themed.theme.mode, 'dark');

    const validation = validateStoreConfig(themed);
    assert.ok(validation.success);
  });

  // ── 13. Historique Undo / Redo ──────────────────────────────────────────────
  it('13. Undo/Redo Stack — gère fidèlement l\'historique jusqu\'à 25 états', () => {
    let state = createInitialDraft();
    const history = [state];
    let cursor = 0;

    const pushState = (next) => {
      history.splice(cursor + 1);
      history.push(next);
      if (history.length > 25) history.shift();
      cursor = history.length - 1;
      state = next;
    };

    // 3 mutations
    pushState(mutateUpdateConfig(state, 'sec_hero_2', { title: 'V1' }));
    pushState(mutateUpdateConfig(state, 'sec_hero_2', { title: 'V2' }));
    pushState(mutateUpdateConfig(state, 'sec_hero_2', { title: 'V3' }));

    assert.strictEqual(state.sections[1].config.title, 'V3');
    assert.strictEqual(cursor, 3);

    // Undo 1
    cursor -= 1;
    state = history[cursor];
    assert.strictEqual(state.sections[1].config.title, 'V2');

    // Undo 2
    cursor -= 1;
    state = history[cursor];
    assert.strictEqual(state.sections[1].config.title, 'V1');

    // Redo 1
    cursor += 1;
    state = history[cursor];
    assert.strictEqual(state.sections[1].config.title, 'V2');

    // Nouvelle mutation efface le futur et ajoute la nouvelle branche
    pushState(mutateUpdateConfig(state, 'sec_hero_2', { title: 'V2-Branch' }));
    assert.strictEqual(history.length, 4); // [initial, V1, V2, V2-Branch]
    assert.strictEqual(state.sections[1].config.title, 'V2-Branch');
  });

  // ── 14. Sécurité : Rejet de scripts malveillants ─────────────────────────────
  it('14. detectUnsafeContent — détecte et bloque les scripts XSS et javascript:', () => {
    const unsafeConfigs = [
      { text: '<script>alert("hack")</script>' },
      { link: 'javascript:stealCookies()' },
      { code: 'eval("malicious()")' },
      { img: '<img src="x" onerror="alert(1)" />' },
    ];

    for (const unsafe of unsafeConfigs) {
      const err = detectUnsafeContent(unsafe);
      assert.ok(err, `Aurait dû détecter le contenu dangereux: ${JSON.stringify(unsafe)}`);
    }

    // Contenu sain → null
    const safe = { title: 'Bienvenue chez Vestin', description: 'Une super boutique' };
    assert.strictEqual(detectUnsafeContent(safe), null);
  });

  // ── 15. Sécurité : Rejet de JSX arbitraire stocké ──────────────────────────
  it('15. detectUnsafeContent — détecte et rejette le code JSX arbitraire', () => {
    const rawJsxConfig = {
      header: '<MyCustomComponent prop="val" />',
    };
    const err = detectUnsafeContent(rawJsxConfig);
    assert.ok(err, 'Le JSX arbitraire doit être rejeté');
    assert.ok(err.includes('JSX arbitraire'));
  });

  // ── 16. Rejet de types de sections inconnus ────────────────────────────────
  it('16. validateStoreConfig — rejette les types de section non autorisés', () => {
    const initial = createInitialDraft();
    const badTypeConfig = {
      ...initial,
      sections: [
        ...initial.sections,
        { id: 'sec_bad_99', type: 'COMPOSANT_INVENTE_XYZ', variant: 'default', enabled: true, order: 5 },
      ],
    };

    const result = validateStoreConfig(badTypeConfig);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors?.some(e => e.includes('Type de section non reconnu')));
  });

  // ── 17. Intégration BusinessProfile avec useDraft:true ──────────────────────
  it('17. adaptStoreToBusinessProfile — utilise draft_config avec l\'option useDraft:true', () => {
    const draft = createInitialDraft();
    draft.theme.primaryColor = '#8b5cf6';
    draft.sections[1].config.title = 'Titre Personnalisé Builder';

    const storeRecord = {
      id: 'store_test_001',
      name: 'Boutique Test',
      slug: 'boutique-test',
      business_type: 'fashion',
      draft_config: draft,
      published_config: null,
    };

    const profile = adaptStoreToBusinessProfile(storeRecord, [], [], { useDraft: true });
    assert.ok(profile, 'BusinessProfile doit être généré');
    assert.strictEqual(profile.storefront.theme.primaryColor, '#8b5cf6');
    assert.strictEqual(profile.storefront.sections.length, 5);
  });

  // ── 18. CompositionEngine génère la vitrine depuis le BusinessProfile ──────
  it('18. CompositionEngine.compose — produit une composition déclarative valide pour le renderer', () => {
    const draft = createInitialDraft();
    const storeRecord = {
      id: 'store_comp_001',
      name: 'Boutique Test',
      slug: 'boutique-test',
      business_type: 'fashion',
      draft_config: draft,
    };

    const profile = adaptStoreToBusinessProfile(storeRecord, [], [], { useDraft: true });
    const composition = compositionEngine.compose(profile);

    assert.ok(composition, 'La composition doit être générée');
    assert.strictEqual(composition.version, '2.0.0');
    assert.ok(Array.isArray(composition.sections));
    assert.ok(composition.sections.length > 0);
    assert.strictEqual(composition.theme.tokens.primaryColor, '#128C7E');

    // Validation composition
    const compValidation = compositionEngine.validateComposition(composition);
    assert.ok(compValidation.valid, `Composition invalide: ${compValidation.errors?.join(', ')}`);
  });

  // ── 19. ComponentRegistry fournit tous les composants nécessaires ──────────
  it('19. ComponentRegistry — contient des définitions valides pour les familles standards', () => {
    const criticalFamilies = ['HEADER', 'HERO', 'PRODUCT', 'CATEGORY', 'CONTACT', 'FOOTER', 'TESTIMONIAL', 'FAQ'];

    for (const family of criticalFamilies) {
      const components = ComponentRegistry.getByFamily(family);
      assert.ok(components.length > 0, `Au moins un composant requis pour la famille: ${family}`);
      
      const first = components[0];
      assert.ok(first.id, `ID manquant pour composant de ${family}`);
      assert.ok(first.renderer, `Renderer manquant pour composant ${first.id}`);
      assert.strictEqual(first.type, family);
    }
  });

  // ── 20. Isolation : Zéro dépendance à layout_config ────────────────────────
  it('20. Isolation — le draft_config est totalement autonome sans layout_config', () => {
    const draft = createInitialDraft();
    const storeRecord = {
      id: 'store_no_legacy',
      name: 'Boutique Sans Legacy',
      slug: 'sans-legacy',
      business_type: 'fashion',
      layout_config: null,      // AUCUNE config legacy
      store_config: null,
      draft_config: draft,
    };

    const profile = adaptStoreToBusinessProfile(storeRecord, [], [], { useDraft: true });
    assert.ok(profile);
    assert.strictEqual(profile.storefront.sections.length, 5);
    assert.strictEqual(profile.storefront.sections[0].type, 'HEADER');
    assert.strictEqual(profile.storefront.sections[1].type, 'HERO');
  });
});
