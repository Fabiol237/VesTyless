import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function createSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}

function renderHtml(report) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rapport hebdomadaire ${report.store.name}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 24px; background: #f7f8fb; color: #111827; }
    .page { max-width: 900px; margin: 0 auto; background: white; border-radius: 28px; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12); overflow: hidden; }
    header { background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%); color: white; padding: 32px; }
    header h1 { margin: 0; font-size: 2rem; }
    .meta { margin-top: 12px; opacity: 0.85; font-size: 0.95rem; }
    section { padding: 32px; }
    .grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .card { background: #f8fafc; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; }
    .card strong { display: block; margin-bottom: 8px; color: #334155; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 9999px; background: #eef2ff; color: #4338ca; font-weight: 700; font-size: 0.85rem; }
    .footer { padding: 24px 32px; background: #111827; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer small { opacity: 0.72; }
    ul { margin: 0; padding-left: 18px; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>${report.headline || `Rapport de la semaine pour ${report.store.name}`}</h1>
      <p class="meta">Période : ${new Date(report.period.from).toLocaleDateString('fr-FR')} - ${new Date(report.period.to).toLocaleDateString('fr-FR')}</p>
      <p class="meta">Boutique : ${report.store.name} • ${report.store.city || 'Ville inconnue'} • ${report.store.business_type || 'Type inconnu'}</p>
    </header>
    <section>
      <div class="badge">Résumé</div>
      <p style="margin-top: 18px; line-height: 1.8;">${report.summary || 'Rapport généré automatiquement.'}</p>
    </section>
    <section class="grid">
      <div class="card">
        <strong>Revenus</strong>
        <div style="font-size: 2rem; font-weight: 800;">${formatCurrency(report.metrics.revenue)} FCFA</div>
        <p style="margin-top: 8px; color: #475569;">Croissance : ${report.metrics.growth}%</p>
      </div>
      <div class="card">
        <strong>Commandes</strong>
        <div style="font-size: 2rem; font-weight: 800;">${report.metrics.orders}</div>
        <p style="margin-top: 8px; color: #475569;">En attente : ${report.metrics.pending}</p>
      </div>
      <div class="card">
        <strong>Stocks à surveiller</strong>
        <div style="font-size: 2rem; font-weight: 800;">${report.metrics.lowStock}</div>
        <p style="margin-top: 8px; color: #475569;">Nouveaux produits : ${report.metrics.newProducts}</p>
      </div>
    </section>
    <section>
      <div class="badge">Meilleures ventes</div>
      <ul style="margin-top: 18px;">${(report.bestSellers || []).map((item) => `<li>${item}</li>`).join('') || '<li>Aucun produit enregistré</li>'}</ul>
    </section>
    <section class="grid">
      <div class="card">
        <strong>Insights</strong>
        <ul style="margin-top: 12px;">${(report.insights || []).map((insight) => `<li><strong>${insight.icon || ''} ${insight.title} :</strong> ${insight.description}</li>`).join('') || '<li>Aucun insight supplémentaire.</li>'}</ul>
      </div>
      <div class="card">
        <strong>Recommandations</strong>
        <ul style="margin-top: 12px;">${(report.recommendations || []).map((rec) => `<li><strong>${rec.priority.toUpperCase()} :</strong> ${rec.action} <em>(${rec.impact})</em></li>`).join('') || '<li>Aucune recommandation disponible.</li>'}</ul>
      </div>
    </section>
    <section>
      <div class="card" style="padding: 28px;">
        <strong>Focus semaine prochaine</strong>
        <p style="margin-top: 12px; line-height: 1.8;">${report.nextWeekFocus || 'Concentrez-vous sur les produits à forte marge et le stock faible.'}</p>
      </div>
    </section>
    <footer class="footer">
      <span>VesTyle Market • Rapport généré le ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}</span>
      <small>Imprimez en PDF ou enregistrez ce rapport pour le partager avec votre équipe.</small>
    </footer>
  </div>
</body>
</html>`;
}

function renderCsv(report) {
  const header = ['Section', 'Clé', 'Valeur'];
  const rows = [
    ['Boutique', 'Nom', report.store.name],
    ['Boutique', 'Ville', report.store.city || 'N/A'],
    ['Boutique', 'Type', report.store.business_type || 'N/A'],
    ['Métriques', 'Revenus', formatCurrency(report.metrics.revenue)],
    ['Métriques', 'Croissance', `${report.metrics.growth}%`],
    ['Métriques', 'Commandes', report.metrics.orders],
    ['Métriques', 'En attente', report.metrics.pending],
    ['Métriques', 'Stock faible', report.metrics.lowStock],
    ['Métriques', 'Nouveaux produits', report.metrics.newProducts],
  ];
  const sellerRows = (report.bestSellers || []).map((item) => ['Top produit', '', item]);
  const insightsRows = (report.insights || []).map((insight) => ['Insight', insight.title, insight.description]);
  const recommendationsRows = (report.recommendations || []).map((rec) => ['Recommandation', rec.priority, `${rec.action} (${rec.impact})`]);
  return [header, ...rows, ...sellerRows, ...insightsRows, ...recommendationsRows]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

async function buildReportForStore(storeId) {
  const supabase = createSupabaseClient();
  const { data: store, error: storeError } = await supabase.from('stores').select('id, name, description, city, business_type, slug').eq('id', storeId).single();
  if (storeError || !store) {
    return { error: 'Boutique introuvable', status: 404 };
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const prevSince = new Date(since);
  prevSince.setDate(prevSince.getDate() - 7);

  const [{ data: orders }, { data: prevOrders }, { data: products }, { data: newProducts }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at, customer_name')
      .eq('store_id', storeId)
      .gte('created_at', since.toISOString()),
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('store_id', storeId)
      .gte('created_at', prevSince.toISOString())
      .lt('created_at', since.toISOString()),
    supabase
      .from('products')
      .select('id, name, price, stock_quantity, daily_views')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('daily_views', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name, created_at')
      .eq('store_id', storeId)
      .gte('created_at', since.toISOString()),
  ]);

  const thisWeekDelivered = (orders || []).filter((o) => o.status === 'delivered');
  const prevWeekDelivered = (prevOrders || []).filter((o) => o.status === 'delivered');
  const revenue = thisWeekDelivered.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const prevRevenue = prevWeekDelivered.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : revenue > 0 ? 100 : 0;
  const ordersCount = (orders || []).length;
  const pendingCount = (orders || []).filter((o) => o.status === 'pending').length;
  const lowStockItems = (products || []).filter((p) => Number(p.stock_quantity) <= 3);
  const topProducts = (products || []).slice(0, 5);

  const dataStr = `Semaine du ${since.toLocaleDateString('fr-FR')} au ${new Date().toLocaleDateString('fr-FR')}
Boutique: ${store.name} (${store.city || 'N/A'}) - ${store.business_type || 'ecommerce'}

Revenus: ${formatCurrency(revenue)} FCFA
Commandes totales: ${ordersCount}
Commandes en attente: ${pendingCount}
Stock faible: ${lowStockItems.map((p) => `${p.name} (${p.stock_quantity})`).join(', ') || 'Aucun'}
Top produits: ${topProducts.map((p) => `${p.name} (${p.daily_views || 0} vues)`).join(', ') || 'Aucun'}
Nouveaux produits: ${newProducts?.length || 0}`;

  const systemPrompt = `Tu es un analyste business expert pour VesTyle Marketplace au Cameroun. Génère un rapport hebdomadaire ultra-actionnable pour le commerçant.

Le rapport doit être clair, structuré et contenir les métriques principales, des insights, des recommandations et une action prioritaire pour la semaine suivante.

Réponds uniquement avec un objet JSON valide contenant :
{
  "headline": "titre accrocheur du rapport",
  "summary": "résumé de 3-4 phrases en français, enthousiaste et précis",
  "metrics": {
    "revenue": montant,
    "growth": pourcentage,
    "orders": nombre,
    "pending": nombre
  },
  "insights": [
    {"icon": "📈", "title": "insight 1", "description": "..."},
    {"icon": "⚠️", "title": "alerte 1", "description": "..."}
  ],
  "recommendations": [
    {"priority": "high|medium|low", "action": "action concrète", "impact": "impact attendu"}
  ],
  "bestSellers": ["produit 1", "produit 2"],
  "nextWeekFocus": "conseil principal pour la semaine à venir"
}`;

  let parsedResult = null;

  if (process.env.MISTRAL_API_KEY) {
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${dataStr}\n\nGénère le rapport hebdomadaire au format JSON.` },
        ],
        temperature: 0.45,
        max_tokens: 800,
        responseFormat: { type: 'json_object' },
      }),
    });

    if (mistralRes.ok) {
      const data = await mistralRes.json();
      const raw = data.choices?.[0]?.message?.content || '{}';
      try {
        parsedResult = JSON.parse(raw);
      } catch (error) {
        console.error('Mistral JSON parse error', error);
      }
    } else {
      console.error('Mistral request failed', mistralRes.status, await mistralRes.text());
    }
  }

  const parsed = parsedResult || {
    headline: `Rapport hebdomadaire ${store.name}`,
    summary: `Cette semaine, votre boutique a généré ${formatCurrency(revenue)} FCFA avec ${ordersCount} commandes, dont ${pendingCount} en attente. Gardez un oeil sur le stock des meilleurs produits et priorisez les relances.`,
    metrics: { revenue, growth, orders: ordersCount, pending: pendingCount },
    insights: [
      { icon: '📈', title: 'Meilleure performance', description: topProducts[0]?.name ? `Le produit ${topProducts[0].name} attire le plus de vues.` : 'Aucun produit leader identifié.' },
      { icon: '⚠️', title: 'Alerte stock', description: lowStockItems.length > 0 ? `Stock faible sur ${lowStockItems.length} produit(s).` : 'Aucun produit en stock critique.' },
    ],
    recommendations: [
      { priority: 'high', action: 'Mettre en avant le produit le plus populaire et proposer une remise ciblée.', impact: 'Augmentation des ventes et rotation de stock.' },
    ],
    bestSellers: topProducts.map((p) => p.name),
    nextWeekFocus: topProducts[0]?.name ? `Concentrez-vous sur ${topProducts[0].name} et surveillez le stock faible.` : 'Concentrez-vous sur les meilleures ventes et les produits en stock faible.',
  };

  return {
    store,
    headline: parsed.headline,
    summary: parsed.summary,
    metrics: {
      revenue: parsed.metrics?.revenue || revenue,
      growth: parsed.metrics?.growth || growth,
      orders: parsed.metrics?.orders || ordersCount,
      pending: parsed.metrics?.pending || pendingCount,
      lowStock: lowStockItems.length,
      newProducts: newProducts?.length || 0,
    },
    insights: parsed.insights || [],
    recommendations: parsed.recommendations || [],
    bestSellers: parsed.bestSellers || topProducts.map((p) => p.name),
    nextWeekFocus: parsed.nextWeekFocus || 'Continuez à promouvoir vos meilleurs produits.',
    generatedAt: new Date().toISOString(),
    period: { from: since.toISOString(), to: new Date().toISOString() },
  };
}

export async function POST(request) {
  try {
    const { storeId } = await request.json();
    if (!storeId) {
      return NextResponse.json({ error: 'storeId requis' }, { status: 400 });
    }

    const report = await buildReportForStore(storeId);
    if (report.error) {
      return NextResponse.json({ error: report.error }, { status: report.status || 500 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[Weekly Report Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const format = (searchParams.get('format') || 'html').toLowerCase();

    if (!storeId) {
      return NextResponse.json({ error: 'storeId requis' }, { status: 400 });
    }

    const report = await buildReportForStore(storeId);
    if (report.error) {
      return NextResponse.json({ error: report.error }, { status: report.status || 500 });
    }

    if (format === 'csv') {
      const csv = renderCsv(report);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapport-${report.store.slug || report.store.id}.csv"`,
        },
      });
    }

    const html = renderHtml(report);
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('[Weekly Report GET Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
