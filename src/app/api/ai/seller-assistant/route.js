import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ─── POST: Analyser messages, suggérer réponses, résumer activité ────────────
export async function POST(request) {
  try {
    const { storeId, action, messages, period = '24h' } = await request.json();
    console.log('[SellerAssistant] storeId=', storeId, 'SUPABASE_SERVICE_ROLE_KEY present=', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!storeId || !action) {
      return NextResponse.json({ error: 'storeId et action requis' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );


    // Récupérer la boutique
      const { data: store } = await supabase
        .from('stores')
        .select('id, name, description, city, phone')
        .eq('id', storeId)
        .single();

    if (!store) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });

    // Récupérer les commandes récentes pour contexte
    const since = new Date();
    since.setDate(since.getDate() - (period === '24h' ? 1 : period === '7d' ? 7 : 30));
    
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, customer_name, customer_phone, total_amount, status, created_at')
      .eq('store_id', storeId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, stock_quantity, price')
      .eq('store_id', storeId)
      .lte('stock_quantity', 3)
      .order('stock_quantity', { ascending: true });

    let systemPrompt = '';
    let userMessage = '';

    switch (action) {
      case 'suggest_reply': {
        if (!messages?.length) {
          return NextResponse.json({ error: 'messages requis pour suggest_reply' }, { status: 400 });
        }
        systemPrompt = `Tu es un assistant de vente expert pour "${store.name}" au Cameroun.
Réponds à ce message client de manière professionnelle, chaleureuse et rapide.
La boutique vend : ${store.description || 'produits variés'}.

RÈGLES :
- Sois concis (max 2 phrases) et en français camerounais accessible
- Si le client demande un prix, donne-le directement
- Si le client veut commander, demande son nom et téléphone
- Propose toujours une solution, jamais un "désolé"
- Si tu as besoin du téléphone du vendeur pour WhatsApp, mentionne-le`;
        userMessage = `Message du client: "${messages[messages.length - 1]?.content || messages[0]}" 
Historique: ${messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join(' | ')}
Génère UNE réponse suggérée et UNIQUEMENT le texte de la réponse.`;
        break;
      }

      case 'daily_summary': {
        const pendingOrders = (recentOrders || []).filter(o => o.status === 'pending').length;
        const revenue = (recentOrders || [])
          .filter(o => o.status === 'delivered')
          .reduce((s, o) => s + Number(o.total_amount || 0), 0);

        systemPrompt = `Tu es un assistant analytics pour commerçants camerounais.
Génère un résumé d'activité quotidien ultra-concis, motivant et actionnable.
Réponds en 3-4 phrases maximum. Format naturel, pas de liste.`;
        userMessage = `Boutique: ${store.name}
Période: ${period}
Commandes totales: ${(recentOrders || []).length}
En attente: ${pendingOrders}
Revenus: ${revenue.toLocaleString()} FCFA
Produits en stock faible: ${(lowStock || []).map(p => p.name).join(', ') || 'aucun'}
Génère le résumé du jour.`;
        break;
      }

      case 'quick_actions': {
        systemPrompt = `Tu es un conseiller e-commerce. Basé sur l'état actuel de la boutique, suggère 2-3 actions prioritaires que le vendeur devrait prendre aujourd'hui.
Réponds en JSON: {"actions": [{"title": "...", "description": "...", "priority": "high|medium|low", "link": "/dashboard/..."}]}`;
        const pendingOrders2 = (recentOrders || []).filter(o => o.status === 'pending').length;
        userMessage = `Boutique: ${store.name}
Commandes en attente: ${pendingOrders2}
Stock faible: ${(lowStock || []).length} produits
Dernières commandes: ${(recentOrders || []).slice(0, 3).map(o => `${o.customer_name} (${o.status}) ${o.total_amount}F`).join(', ') || 'aucune'}
Génère 2-3 actions prioritaires pour aujourd'hui au format JSON.`;
        break;
      }

      default:
        return NextResponse.json({ error: `Action "${action}" inconnue` }, { status: 400 });
    }

    // ─── Appel Mistral ───────────────────────────────────────────────────
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: action === 'quick_actions' ? 'mistral-small-latest' : 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: action === 'quick_actions' ? 0.2 : 0.7,
        max_tokens: action === 'quick_actions' ? 400 : 300,
        responseFormat: action === 'quick_actions' ? { type: 'json_object' } : undefined,
      }),
    });

    if (!mistralRes.ok) {
      const err = await mistralRes.text();
      throw new Error(`Mistral API: ${mistralRes.status} - ${err.slice(0, 200)}`);
    }

    const data = await mistralRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (action === 'quick_actions') {
      try {
        const parsed = JSON.parse(content);
        return NextResponse.json({ success: true, actions: parsed.actions || [] });
      } catch {
        return NextResponse.json({ success: true, actions: [] });
      }
    }

    return NextResponse.json({
      success: true,
      reply: content,
      context: {
        pendingOrders: (recentOrders || []).filter(o => o.status === 'pending').length,
        lowStockCount: (lowStock || []).length,
        todayRevenue: (recentOrders || []).filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount || 0), 0),
      },
    });

  } catch (error) {
    console.error('[Seller Assistant Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
