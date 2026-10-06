'use client';

/**
 * VesTyle — Onboarding Persistent Context Store (Phase 2C — Noyau Canonique)
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE 2C : generateStorefront() est entièrement rebranché sur le noyau
 * canonique Vestin v3.0 via :
 *
 *   OnboardingPayload
 *     → mapOnboardingToCanonicalDesign() [OnboardingDesignMapper]
 *     → LocalDesignRegistry.getDesign(designId)
 *     → VestinAdaptationEngine.adapt(design, input, storeId)
 *     → StorefrontConfig v3.0.0
 *
 * AUCUN appel à blueprintInjector / masterBlueprints pour une nouvelle boutique.
 * Les anciens imports sont conservés commentés pour traçabilité, mais ne sont
 * plus invoqués dans le chemin normal d'onboarding.
 *
 * Fonctionnalités conservées :
 *   - Persistance automatique dans sessionStorage/localStorage (`vst_onboarding_session`)
 *   - Synchronisation bidirectionnelle du formulaire multi-étapes
 *   - Support complet SSR / Next.js
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  OnboardingPayload,
  OnboardingStep,
  InitialItem,
} from '@/types/onboarding';

import type { StorefrontConfig } from '@/types/storefront';

// ── Nouveau noyau canonique (Phase 2C) ────────────────────────────────────────
import { designRegistry } from '@/core/registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '@/core/adaptation/VestinAdaptationEngine';
import { mapOnboardingToCanonicalDesign } from '@/core/onboarding/OnboardingDesignMapper';

// ── Imports legacy CONSERVÉS comme fallback pour les boutiques existantes ──────
// (Ne jamais les appeler pour une NOUVELLE boutique créée via l'onboarding)
// import { inject } from '@/engine/blueprintInjector';
// import { selectOptimalBlueprint } from '@/engine/blueprintSelector';
// import { MasterBlueprintRegistry } from '@/engine/masterBlueprints';

// ── 1. TYPES DU STORE ─────────────────────────────────────────────────────────

export interface OnboardingState {
  step: OnboardingStep;
  payload: Partial<OnboardingPayload>;
  generatedConfig: StorefrontConfig | null;
  isGenerating: boolean;
  error: string | null;
  /** DesignId canonique utilisé pour générer la boutique courante */
  activeDesignId: string | null;
}

export interface OnboardingContextType extends OnboardingState {
  setStep: (step: OnboardingStep) => void;
  updatePayload: (data: Partial<OnboardingPayload>) => void;
  addItem: (item: InitialItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: Partial<InitialItem>) => void;
  generateStorefront: () => Promise<StorefrontConfig>;
  setThemeSeed: (seedCode: string) => void;
  resetOnboarding: () => void;
}

// ── 2. VALEURS INITIALES ──────────────────────────────────────────────────────

const STORAGE_KEY = 'vst_onboarding_session';

const INITIAL_PAYLOAD: Partial<OnboardingPayload> = {
  storeName: '',
  businessType: 'PHYSICAL_PRODUCT',
  whatsapp: '',
  city: 'Douala',
  quarter: '',
  activityText: '',
  slogan: '',
  paymentMethods: ['MTN MoMo', 'Orange Money', 'Paiement à la livraison'],
  initialItems: [],
};

const INITIAL_STATE: OnboardingState = {
  step: 1,
  payload: INITIAL_PAYLOAD,
  generatedConfig: null,
  isGenerating: false,
  error: null,
  activeDesignId: null,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// ── 3. PROVIDER DU STORE D'ONBOARDING ─────────────────────────────────────────

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── A. Hydratation depuis le stockage local (Client-only) ────────────────────
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setState((prev) => ({
              ...prev,
              step: (parsed.step as OnboardingStep) || 1,
              payload: { ...INITIAL_PAYLOAD, ...parsed.payload },
              generatedConfig: parsed.generatedConfig || null,
              activeDesignId: parsed.activeDesignId || null,
            }));
          }
        }
      }
    } catch (err) {
      console.warn('[OnboardingContext] Échec de restauration de la session :', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ── B. Persistance automatique lors de chaque mise à jour ───────────────────
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== 'undefined') {
        const snapshot = {
          step: state.step,
          payload: state.payload,
          generatedConfig: state.generatedConfig,
          activeDesignId: state.activeDesignId,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      }
    } catch (err) {
      console.warn('[OnboardingContext] Échec d\'écriture de la session :', err);
    }
  }, [state.step, state.payload, state.generatedConfig, state.activeDesignId, isHydrated]);

  // ── C. Actions du store ──────────────────────────────────────────────────────

  const setStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, step, error: null }));
  }, []);

  const updatePayload = useCallback((data: Partial<OnboardingPayload>) => {
    setState((prev) => ({
      ...prev,
      payload: { ...prev.payload, ...data },
      error: null,
    }));
  }, []);

  const addItem = useCallback((item: InitialItem) => {
    setState((prev) => {
      const currentItems = prev.payload.initialItems || [];
      const updatedItems = [...currentItems, { ...item, id: item.id || `item_${Date.now()}` }];
      return {
        ...prev,
        payload: { ...prev.payload, initialItems: updatedItems },
      };
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setState((prev) => {
      const currentItems = prev.payload.initialItems || [];
      const updatedItems = currentItems.filter((_, idx) => idx !== index);
      return {
        ...prev,
        payload: { ...prev.payload, initialItems: updatedItems },
      };
    });
  }, []);

  const updateItem = useCallback((index: number, itemUpdate: Partial<InitialItem>) => {
    setState((prev) => {
      const currentItems = [...(prev.payload.initialItems || [])];
      if (currentItems[index]) {
        currentItems[index] = { ...currentItems[index], ...itemUpdate };
      }
      return {
        ...prev,
        payload: { ...prev.payload, initialItems: currentItems },
      };
    });
  }, []);

  /**
   * setThemeSeed — Phase 2C
   * Régénère le StorefrontConfig via le noyau canonique avec une couleur
   * d'accent personnalisée si le vendeur choisit une palette différente.
   *
   * N'appelle PLUS blueprintInjector. Reconstruit via VestinAdaptationEngine.
   */
  const setThemeSeed = useCallback((seedCode: string) => {
    setState((prev) => {
      const newPayload = { ...prev.payload, themeSeedCode: seedCode };

      // Si une config existe et un designId est actif, régénère avec le nouveau seed
      // La couleur d'accent est extraite du seed pour une future extension
      // Pour la Phase 2C, on met à jour uniquement le payload pour re-trigger generateStorefront
      return {
        ...prev,
        payload: newPayload,
        // Invalide la config pour forcer une re-génération à la prochaine occasion
        generatedConfig: null,
      };
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    setState(INITIAL_STATE);
  }, []);

  // ── D. GÉNÉRATION CANONIQUE VIA LE NOUVEAU NOYAU VESTIN (Phase 2C) ───────────

  /**
   * generateStorefront — Version Phase 2C
   *
   * Flux :
   *   payload → mapOnboardingToCanonicalDesign() → designRegistry.getDesign()
   *   → VestinAdaptationEngine.adapt() → StorefrontConfig v3.0.0
   *
   * Garanties :
   *   - Aucun appel à blueprintInjector ou masterBlueprints.
   *   - Fallback canonique déterministe si businessType inconnu.
   *   - Erreur explicite si le noyau échoue (jamais silencieuse).
   *   - StorefrontConfig v3.0.0 validé par le schéma Zod.
   */
  const generateStorefront = useCallback(async (): Promise<StorefrontConfig> => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const p = state.payload;

      // ── Étape 1 : Mapping Onboarding → DesignId + MerchantAdaptationInput ──
      const { designId, adaptationInput, usedFallback, fallbackReason } =
        mapOnboardingToCanonicalDesign(p);

      if (usedFallback && fallbackReason) {
        console.warn(`[OnboardingContext] ${fallbackReason}`);
      }

      console.info(`[OnboardingContext] Design sélectionné : '${designId}' pour businessType='${p.businessType}'`);

      // ── Étape 2 : Récupération du DesignDefinition canonique ──
      const design = await designRegistry.getDesign(designId);

      // ── Étape 3 : Génération d'un storeId déterministe (sera remplacé par l'ID Supabase à la sauvegarde) ──
      const tempStoreId = `onb_${Date.now()}_${(p.storeName || 'store').toLowerCase().replace(/\s+/g, '_').slice(0, 20)}`;

      // ── Étape 4 : Adaptation déterministe via VestinAdaptationEngine ──
      const finalConfig = VestinAdaptationEngine.adapt(design, adaptationInput, tempStoreId);

      console.info(`[OnboardingContext] StorefrontConfig v${finalConfig.version} généré — ${finalConfig.sections?.length ?? 0} sections racine.`);

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generatedConfig: finalConfig,
        activeDesignId: designId,
        payload: {
          ...prev.payload,
        },
      }));

      return finalConfig;
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur lors de la génération canonique de la boutique.';
      console.error('[OnboardingContext] Erreur generateStorefront (Phase 2C) :', err);
      setState((prev) => ({ ...prev, isGenerating: false, error: errorMsg }));
      throw err;
    }
  }, [state.payload]);

  // ── E. Valeur mémorisée du context ──────────────────────────────────────────

  const contextValue = useMemo<OnboardingContextType>(
    () => ({
      ...state,
      setStep,
      updatePayload,
      addItem,
      removeItem,
      updateItem,
      generateStorefront,
      setThemeSeed,
      resetOnboarding,
    }),
    [
      state,
      setStep,
      updatePayload,
      addItem,
      removeItem,
      updateItem,
      generateStorefront,
      setThemeSeed,
      resetOnboarding,
    ],
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ── 4. HOOK PERSONNALISÉ useOnboarding ─────────────────────────────────────────

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding doit être utilisé à l\'intérieur d\'un <OnboardingProvider>.');
  }
  return context;
}
