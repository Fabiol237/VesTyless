import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

// ─── User-Agents de robots voleurs de code / scrapers / bots malveillants ───
const BLOCKED_USER_AGENTS = [
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httrack/i,
  /wget/i,
  /curl/i,
  /libwww-perl/i,
  /go-http-client/i,
  /postmanruntime/i,
  /apache-httpclient/i,
  /phantomjs/i,
  /puppeteer/i,
  /selenium/i,
  /headlesschrome/i,
  /playwright/i,
  /gptbot/i,
  /chatgpt-user/i,
  /ccbot/i,
  /claudebot/i,
  /anthropicai/i,
  /perplexitybot/i,
  /bytespider/i,
  /diffbot/i,
  /imagesiftbot/i,
  /omgilibot/i,
  /zgrab/i,
  /nmap/i,
  /nikto/i,
  /sqlmap/i,
  /dirbuster/i,
];

// ─── Tentatives de scan de vulnérabilités / vol de fichiers ──────────────────
const BLOCKED_PATH_PATTERNS = [
  /\.env/i,
  /\.git/i,
  /\.config/i,
  /wp-admin/i,
  /wp-login/i,
  /phpmyadmin/i,
  /admin\.php/i,
  /shell\.php/i,
  /dump\.sql/i,
  /database\.sql/i,
  /eval\(/i,
  /<script>/i,
  /javascript:/i,
  /\.\.\//i, // Path traversal attempt
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'global_ip';

  // ── 1. BLOQUER LES SCANS ET ATTAQUES PAR DÉTECTION D'URL ────────────────────
  const isMaliciousPath = BLOCKED_PATH_PATTERNS.some(pattern => pattern.test(pathname));
  if (isMaliciousPath) {
    console.warn(`[SECURITY SHIELD] Tentative d'accès suspecte bloquée: ${pathname} depuis IP: ${ip}`);
    return new NextResponse('Accès refusé. Requête malveillante détectée.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ── 2. BLOQUER LES ROBOTS VOLEURS DE CODE & SCRAPERS VIA USER-AGENT ─────────
  const isBadBot = BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent));
  if (isBadBot) {
    console.warn(`[SECURITY SHIELD] Robot/Scraper bloqué: ${userAgent.slice(0, 50)} depuis IP: ${ip}`);
    return new NextResponse('Accès refusé. Les robots et scrapers automatiques sont interdits sur VeStyle.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ── 3. RATE LIMITING POUR LES APIS (Protection Anti-BruteForce & DDoSBots) ───
  if (pathname.startsWith('/api/')) {
    const isVisualSearch = pathname.includes('/search/visual');
    const limit = isVisualSearch ? 10 : 80;
    const windowMs = 60000; // 1 minute

    const limitCheck = await rateLimit(ip, limit, windowMs);

    if (!limitCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: "VeStyle est actuellement très sollicité. Pour protéger la plateforme, veuillez patienter une minute avant de réessayer."
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // ── 4. SÉCURISATION ZONE ADMIN ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      const adminPassword = process.env.ADMIN_PASSWORD || 'vestyle2026';

      if (user === 'superadmin' && pwd === adminPassword) {
        return applySecurityHeaders(NextResponse.next());
      }
    }

    return new NextResponse('Accès non autorisé. Identifiants requis.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Zone Sécurisée Vestyle Admin"',
      },
    });
  }

  // ── 5. RÉPONSE NORMALE AVEC EN-TÊTES DE SÉCURITÉ RENFORCÉS ──────────────────
  return applySecurityHeaders(NextResponse.next());
}

/** Injecte les en-têtes HTTP de sécurité stricts */
function applySecurityHeaders(response) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Empêche l'intégration dans des iframes pirates (Anti-Clickjacking)
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Empêche le MIME-sniffing
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Protection XSS navigateur
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  return response;
}

export const config = {
  // Exécuter le middleware sur TOUTES les requêtes sauf les assets statiques et images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
