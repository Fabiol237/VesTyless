import { NextResponse } from 'next/server';
import { analyzeSellerActivity } from '@/lib/onboarding/smartActivityDeducer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      businessName = '',
      phone = '',
      city = '',
      activityText = '',
      visualPreference = null,
      clarificationAnswers = {},
    } = body;

    const analysis = analyzeSellerActivity({
      businessName,
      phone,
      city,
      activityText,
      visualPreference,
      clarificationAnswers,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error('[analyze-activity] Erreur analyse:', err);
    return NextResponse.json(
      { success: false, error: 'Impossible d’analyser l’activité' },
      { status: 500 }
    );
  }
}
