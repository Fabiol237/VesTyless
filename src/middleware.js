import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // 1. RATE LIMITING POUR LES APIS (Protection Supabase)
  if (pathname.startsWith('/api/')) {
    // Exclure certaines routes de test ou de webhook si besoin
    // Récupérer l'IP du client de manière sécurisée (Vercel ou Headers standard)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'global_ip';
    
    // Limite : Max 80 requêtes par minute pour les API ordinaires
    // Max 10 requêtes par minute pour l'analyse photo IA de recherche visuelle (très lourde)
    const isVisualSearch = pathname.includes('/search/visual');
    const limit = isVisualSearch ? 10 : 80; 
    const windowMs = 60000; // 1 minute

    const limitCheck = await rateLimit(ip, limit, windowMs);
    
    if (!limitCheck.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Vestyle est actuellement très sollicité. Pour protéger la plateforme, veuillez patienter une minute avant de réessayer." 
        }), 
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // 2. SÉCURISATION ZONE ADMIN
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      const adminPassword = process.env.ADMIN_PASSWORD || 'vestyle2026';
      
      if (user === 'superadmin' && pwd === adminPassword) {
        return NextResponse.next();
      }
    }

    return new NextResponse('Accès non autorisé. Identifiants requis.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Zone Sécurisée Vestyle Admin"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Exécuter le middleware sur la zone admin et toutes les routes d'API
  matcher: ['/admin/:path*', '/api/:path*'],
};
