import { NextResponse } from 'next/server';
import { triggerMorningPulseAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  
  // Vérification de la clé secrète (à configurer dans tes variables d'environnement)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('[CRON] Déclenchement du Matin Pulse...');
    const result = await triggerMorningPulseAction();
    
    return NextResponse.json({ 
      success: true, 
      processed: result.log?.length || 0,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
