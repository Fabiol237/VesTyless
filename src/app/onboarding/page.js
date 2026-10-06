'use client';

/**
 * VesTyle — Onboarding Page Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'entrée du tunnel d'onboarding autonome et mobile-first de VesTyle.
 * Enveloppé dans le OnboardingProvider pour assurer la persistance et la réactivité.
 */

import React from 'react';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
