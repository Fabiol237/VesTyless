import { NextResponse } from 'next/server';
import { LocalDesignRegistry } from '@/core/registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '@/core/adaptation/VestinAdaptationEngine';
import { normalizeBusinessType, BUSINESS_TYPE_TO_DESIGN_ID } from '@/core/onboarding/OnboardingDesignMapper';

export const dynamic = 'force-dynamic';

/**
 * POST /api/store/preview
 * ─────────────────────────────────────────────────────────────────────────────
 * Génère une composition déclarative en mémoire pour prévisualisation immédiate
 * sans écriture en base de données selon l'architecture V1.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name = 'Ma Boutique',
      businessType: rawBusinessType,
      description = '',
      templateId,
      designId: explicitDesignId,
      storeData = {},
    } = body;

    const businessType = normalizeBusinessType(rawBusinessType);
    const registry = LocalDesignRegistry.getInstance();
    
    let targetDesignId = explicitDesignId || templateId || BUSINESS_TYPE_TO_DESIGN_ID[businessType] || 'vst_dsn_prestige_atelier_001';
    let design = registry.getDesign(targetDesignId);
    if (!design) {
      targetDesignId = 'vst_dsn_prestige_atelier_001';
      design = registry.getDesign(targetDesignId);
    }

    const adaptationInput = {
      businessProfile: {
        storeName: name.trim(),
        city: storeData.city || 'Douala',
        whatsapp: storeData.whatsapp || storeData.phone || '',
        phone: storeData.phone || '',
        businessType,
        description: description || storeData.description || '',
        address: storeData.address || '',
      },
      sellerContent: {
        products: storeData.products || [],
        logoUrl: storeData.logoUrl || '',
        bannerUrl: storeData.bannerUrl || '',
      },
      preferences: {
        customAccentColor: storeData.customAccentColor,
      },
    };

    const draftConfig = VestinAdaptationEngine.adapt(design, adaptationInput);

    return NextResponse.json({
      success: true,
      draftConfig,
      designId: targetDesignId,
    });
  } catch (err) {
    console.error('[Store Preview API] POST Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération de l\'aperçu.' },
      { status: 500 }
    );
  }
}
