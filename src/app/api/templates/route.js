import { NextResponse } from 'next/server';
import { LocalDesignRegistry } from '@/core/registry/LocalDesignRegistry';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'entrée public de découverte des Designs canoniques VesTyle V1.
 * Connecté directement au LocalDesignRegistry.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const businessType = searchParams.get('businessType') || searchParams.get('sector');
    const query = (searchParams.get('query') || searchParams.get('q') || '').toLowerCase();

    const registry = LocalDesignRegistry.getInstance();
    let designs = registry.getAllDesigns();

    if (businessType) {
      designs = designs.filter(d => 
        d.applicability?.targetArchetypes?.includes(businessType) ||
        d.applicability?.targetArchetypes?.includes('PHYSICAL_PRODUCT')
      );
    }

    if (query) {
      designs = designs.filter(d =>
        d.meta?.name?.toLowerCase().includes(query) ||
        d.meta?.description?.toLowerCase().includes(query) ||
        d.meta?.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    const formatted = designs.map(d => ({
      id: d.id,
      name: d.meta.name,
      description: d.meta.description,
      business_type: d.applicability?.targetArchetypes?.[0] || 'PHYSICAL_PRODUCT',
      tags: d.meta.tags || [],
      thumbnail: d.meta.preview?.desktopThumbnailUrl || '',
      palette: d.styleSystem.palette,
      positioning: d.applicability?.positioning || 'PREMIUM',
      version: d.meta.version,
    }));

    return NextResponse.json({
      success: true,
      total: formatted.length,
      templates: formatted,
      data: formatted,
    });
  } catch (err) {
    console.error('[/api/templates] Error:', err);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
