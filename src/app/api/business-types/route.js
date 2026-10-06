import { NextResponse } from 'next/server';
import { businessTypeRegistry } from '@/lib/business-types/BusinessTypeRegistry';

export const dynamic = 'force-dynamic';

/**
 * GET /api/business-types
 * ─────────────────────────────────────────────────────────────────────────────
 * Retourne la liste officielle des types métiers canoniques et de leurs sous-secteurs.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const businessType = searchParams.get('type') || searchParams.get('businessType');

    if (businessType) {
      const canonicalType = businessTypeRegistry.get(businessType);
      if (!canonicalType) {
        return NextResponse.json(
          { success: false, error: `Type métier "${businessType}" inconnu.` },
          { status: 404 }
        );
      }

      const subSectors = businessTypeRegistry.getSubSectors(businessType);

      return NextResponse.json({
        success: true,
        businessType: canonicalType,
        subSectors,
      });
    }

    const choices = businessTypeRegistry.getOnboardingChoices();
    const allWithSubSectors = choices.map((c) => ({
      ...c,
      subSectors: businessTypeRegistry.getSubSectors(c.id),
    }));

    return NextResponse.json({
      success: true,
      businessTypes: allWithSubSectors,
    });
  } catch (err) {
    console.error('[BusinessTypes API] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des secteurs d\'activité.' },
      { status: 500 }
    );
  }
}
