import { NextResponse } from 'next/server';
import { LocalDesignRegistry } from '@/core/registry/LocalDesignRegistry';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates/[id]
 * ─────────────────────────────────────────────────────────────────────────────
 * Récupère le détail déclaratif complet d'un Design VesTyle V1.
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant requis' }, { status: 400 });
    }

    const registry = LocalDesignRegistry.getInstance();
    const design = registry.getDesign(id);

    if (!design) {
      return NextResponse.json({ success: false, error: 'Design introuvable' }, { status: 404 });
    }

    const publicDesign = {
      id: design.id,
      name: design.meta.name,
      description: design.meta.description,
      business_type: design.applicability?.targetArchetypes?.[0] || 'PHYSICAL_PRODUCT',
      style_tags: design.meta.tags || [],
      version: design.meta.version,
      preview_image: design.meta.preview?.desktopThumbnailUrl || '',
      theme: {
        palette: design.styleSystem.palette,
        typography: design.styleSystem.typography,
        spatial: design.styleSystem.spatial,
      },
      pages: design.pages,
    };

    return NextResponse.json({
      success: true,
      template: publicDesign,
      design: publicDesign,
    });
  } catch (err) {
    console.error('[Template Detail API] GET Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du design' },
      { status: 500 }
    );
  }
}
