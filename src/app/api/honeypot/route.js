import { NextResponse } from 'next/server';

/**
 * HONEYPOT TRAP ROUTE
 * URL cachée dans le code HTML (invisible pour un humain, mais suivie automatiquement par les robots scrapers).
 * Tout accès à cette URL déclenche le bannissement immédiat de l'IP du robot.
 */

// Mémoire des IP bannies temporairement (12 heures)
const BANNED_IPS = new Map();

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  console.warn(`🚨 [HONEYPOT TRAP] Robot Piégé ! IP: ${ip} | User-Agent: ${userAgent}`);

  // Bannir l'IP pendant 12h
  BANNED_IPS.set(ip, Date.now() + 12 * 60 * 60 * 1000);

  return new NextResponse('Access Denied. Your automated bot has been trapped and banned.', {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export function isIpBanned(ip) {
  if (!BANNED_IPS.has(ip)) return false;
  const expiresAt = BANNED_IPS.get(ip);
  if (Date.now() > expiresAt) {
    BANNED_IPS.delete(ip);
    return false;
  }
  return true;
}
