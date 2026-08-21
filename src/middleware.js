import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

// ─── User-Agents de robots voleurs de code / scrapers / bots malveillants ───
const BLOCKED_USER_AGENTS = [
  // Outils de scraping classiques
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
  /java\/\d/i,
  /ruby/i,
  // Navigateurs headless
  /phantomjs/i,
  /puppeteer/i,
  /selenium/i,
  /headlesschrome/i,
  /playwright/i,
  /webdriver/i,
  /headless/i,
  // Bots IA voleurs de contenu — BLOQUÉS
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
  /amazonbot/i,
  /applebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slurp/i,
  /ia_archiver/i,
  /archive\.org/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /exabot/i,
  /sogou/i,
  /yandexbot/i,
  // ⛔ ANTIGRAVITY PRO — outil détecté comme scraper de VeStyle
  /antigravity/i,
  /antigravity-pro/i,
  /notrack/i,
  // Outils de sécurité offensifs
  /zgrab/i,
  /nmap/i,
  /nikto/i,
  /sqlmap/i,
  /dirbuster/i,
  /masscan/i,
  /shodan/i,
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

// ─── IPs définitivement bannies (scrapers connus) ───────────────────────────
const BANNED_IPS = new Set([
  // ⛔ Scrapers détectés et bannis définitivement
  '13.57.148.235', // AWS us-west-1 — Scraper bloqué le 2026-08-21 à 23:35 (2 tentatives GET /)
]);

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';

  // ── 0. HONEYPOT — Piège invisible pour les scrapers automatiques ─────────────
  // Ces routes n'existent pas dans l'interface, seuls les bots les visitent
  const HONEYPOT_PATHS = ['/sitemap-products.xml', '/api/v1/export', '/api/data/dump', '/api/internal'];
  if (HONEYPOT_PATHS.some(p => pathname.startsWith(p))) {
    console.warn(`[HONEYPOT] Bot piégé sur ${pathname} — IP: ${ip} — UA: ${userAgent.slice(0, 80)}`);
    // Réponse fausse qui piège les scrapers (200 mais données vides)
    return new NextResponse(JSON.stringify({ data: [], status: 'ok', trap: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' },
    });
  }

  // ── 1. BANNISSEMENT IP ───────────────────────────────────────────────────────
  if (BANNED_IPS.has(ip)) {
    console.warn(`[SECURITY SHIELD] IP bannie bloquée: ${ip}`);
    return new NextResponse('', { status: 444 }); // 444 = pas de réponse (comme nginx)
  }

  // ── 2. BLOQUER LES SCANS ET ATTAQUES PAR DÉTECTION D'URL ────────────────────
  const isMaliciousPath = BLOCKED_PATH_PATTERNS.some(pattern => pattern.test(pathname));
  if (isMaliciousPath) {
    console.warn(`[SECURITY SHIELD] Tentative d'accès suspecte bloquée: ${pathname} depuis IP: ${ip}`);
    return new NextResponse('Accès refusé. Requête malveillante détectée.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ── 3. BLOQUER LES ROBOTS VOLEURS DE CODE & SCRAPERS VIA USER-AGENT ─────────
  const isBadBot = BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent));
  if (isBadBot) {
    console.warn(`[SECURITY SHIELD] Robot/Scraper bloqué: ${userAgent.slice(0, 80)} depuis IP: ${ip}`);
    return new NextResponse('Accès refusé. Les robots et scrapers automatiques sont interdits sur VeStyle.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // ── 4. DÉTECTER LES NAVIGATEURS SANS USER-AGENT (bots furtifs) ──────────────
  if (!userAgent || userAgent.length < 10) {
    console.warn(`[SECURITY SHIELD] Requête sans User-Agent depuis IP: ${ip}`);
    return new NextResponse('Accès refusé.', { status: 403 });
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
  // Anti-Clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Anti MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Protection XSS navigateur
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Politique de référent stricte
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions API restreintes
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self), payment=()');
  // ⛔ Content Security Policy — bloque les scripts/ressources externes non autorisés
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://api.mistral.ai https://api.telegram.org wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  // Anti-fingerprinting — cache la techno utilisée
  response.headers.delete('X-Powered-By');
  response.headers.set('Server', 'VeStyle');
  return response;
}

export const config = {
  // Exécuter le middleware sur TOUTES les requêtes sauf les assets statiques et images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
