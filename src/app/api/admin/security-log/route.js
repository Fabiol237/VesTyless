import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/security-log
 * Retourne les dernières tentatives de scraping/accès suspects loggées.
 * Protégé par clé admin.
 */
export async function GET(req) {
  // Vérification clé admin
  const authHeader = req.headers.get('authorization');
  const adminKey = process.env.ADMIN_SECRET_KEY || 'vestyle-admin-2026';

  if (authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Récupérer les logs de sécurité (si la table existe)
    const { data: logs, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Table n'existe pas encore — retourner instructions
      return NextResponse.json({
        message: 'Table security_logs non créée. Exécutez la migration SQL.',
        sql: `
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip text,
  user_agent text,
  path text,
  reason text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON security_logs (created_at DESC);
CREATE INDEX ON security_logs (ip);
        `.trim(),
      });
    }

    // Statistiques rapides
    const ipCounts = {};
    logs?.forEach(l => {
      ipCounts[l.ip] = (ipCounts[l.ip] || 0) + 1;
    });

    const topAttackers = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return NextResponse.json({
      total: logs?.length || 0,
      topAttackers,
      recentLogs: logs || [],
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
