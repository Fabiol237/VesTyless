import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LocalDesignRegistry } from '@/core/registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '@/core/adaptation/VestinAdaptationEngine';
import { normalizeBusinessType, BUSINESS_TYPE_TO_DESIGN_ID } from '@/core/onboarding/OnboardingDesignMapper';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `site-${Date.now()}`;
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise pour créer une boutique.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      businessType: rawBusinessType,
      subSector,
      description = '',
      templateId,
      designId: explicitDesignId,
      storeData = {},
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la boutique est obligatoire.' },
        { status: 400 }
      );
    }

    const businessType = normalizeBusinessType(rawBusinessType);
    const registry = LocalDesignRegistry.getInstance();
    
    // Résolution du Design V1
    let targetDesignId = explicitDesignId || templateId || BUSINESS_TYPE_TO_DESIGN_ID[businessType] || 'vst_dsn_prestige_atelier_001';
    let design = registry.getDesign(targetDesignId);
    if (!design) {
      targetDesignId = 'vst_dsn_prestige_atelier_001';
      design = registry.getDesign(targetDesignId);
    }

    // Adaptation déterministe V1
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

    // Slug unique
    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Insertion en base Supabase
    const { data: store, error: insertError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        owner_id: user.id,
        business_type: businessType,
        sub_sector: subSector || 'général',
        description: description.trim(),
        city: storeData.city || 'Douala',
        phone: storeData.phone || '',
        whatsapp_number: storeData.whatsapp || storeData.phone || '',
        currency: 'FCFA',
        is_active: true,
        draft_config: draftConfig,
        published_config: draftConfig,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Store Creation API] Supabase Insert Error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Impossible de sauvegarder la boutique en base de données.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store,
      draftConfig,
      designId: targetDesignId,
    });
  } catch (err) {
    console.error('[Store Creation API] Fatal Error:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur interne lors de la création de la boutique.' },
      { status: 500 }
    );
  }
}
