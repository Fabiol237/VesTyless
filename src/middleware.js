import { NextResponse } from 'next/server';

export function middleware(req) {
  // On protège uniquement les routes qui commencent par /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    // Si l'utilisateur fournit des identifiants
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Le mot de passe peut être défini dans .env.local via ADMIN_PASSWORD, ou 'vestyle2026' par défaut
      const adminPassword = process.env.ADMIN_PASSWORD || 'vestyle2026';
      
      if (user === 'superadmin' && pwd === adminPassword) {
        return NextResponse.next();
      }
    }

    // Si pas d'identifiant ou mauvais mot de passe, on affiche le popup de sécurité du navigateur
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
  matcher: ['/admin/:path*'],
};
