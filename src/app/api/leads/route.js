import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { LeadPayloadSchema, leadEngine, LEAD_STATUS } from '@/lib/lead-engine/LeadEngine';
import { notificationEngine, NOTIFICATION_EVENTS } from '@/lib/notification-engine/NotificationEngine';

export const dynamic = 'force-dynamic';

// Mémoire locale transitoire sécurisée en cas d'absence de la table SQL distante
const memoryLeads = new Map();

/**
 * POST /api/leads
 * ─────────────────────────────────────────────────────────────────────────────
 * Enregistre une nouvelle demande client (produit, service, devis, contact direct)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const parseResult = LeadPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Données de demande invalides',
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const leadRecord = leadEngine.createLeadRecord(parseResult.data);

    // Fonction d'alerte post-création best-effort
    const triggerLeadNotification = async () => {
      try {
        const { data: store } = await supabaseAdmin
          .from('stores')
          .select('id, owner_id, name')
          .eq('id', leadRecord.store_id)
          .single();

        let vendorEmail = null;
        if (store?.owner_id) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', store.owner_id)
            .single();
          vendorEmail = profile?.email || null;
        }

        await notificationEngine.dispatch(NOTIFICATION_EVENTS.LEAD_CREATED, {
          storeId:       leadRecord.store_id,
          userId:        store?.owner_id,
          storeName:     store?.name || 'Votre boutique',
          customerName:  leadRecord.customer_name,
          customerPhone: leadRecord.customer_phone,
          itemName:      leadRecord.item_name,
          message:       leadRecord.message,
          vendorEmail,
        });
      } catch (notifErr) {
        console.warn('[Leads API] Notification dispatch error (best-effort):', notifErr?.message);
      }
    };

    // 1. Sauvegarde principale dans Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert([leadRecord])
        .select()
        .single();

      if (!error && data) {
        triggerLeadNotification().catch(() => {});
        return NextResponse.json({ success: true, lead: data }, { status: 201 });
      }
    } catch (dbErr) {
      console.warn('[Leads API] Table leads inaccessible, utilisation de la sauvegarde mémoire/notifications:', dbErr.message);
    }

    // 2. Fallback sécurisé : Enregistrement mémoire et notification
    const storeList = memoryLeads.get(leadRecord.store_id) || [];
    storeList.unshift(leadRecord);
    memoryLeads.set(leadRecord.store_id, storeList);

    triggerLeadNotification().catch(() => {});

    return NextResponse.json({ success: true, lead: leadRecord, source: 'fallback' }, { status: 201 });

  } catch (error) {
    console.error('[Leads API] POST Exception:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la demande' }, { status: 500 });
  }
}

/**
 * GET /api/leads?storeId=...
 * ─────────────────────────────────────────────────────────────────────────────
 * Récupère les demandes pour la boutique active (isolation stricte)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Paramètre storeId requis' }, { status: 400 });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({ success: true, leads: data });
      }
    } catch (_) {}

    // Fallback mémoire
    const local = memoryLeads.get(storeId) || [];
    return NextResponse.json({ success: true, leads: local });

  } catch (error) {
    console.error('[Leads API] GET Exception:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des demandes' }, { status: 500 });
  }
}

/**
 * PATCH /api/leads
 * ─────────────────────────────────────────────────────────────────────────────
 * Met à jour le statut d'un lead (storeId requis pour isolation)
 */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { leadId, storeId, status } = body;

    if (!leadId || !storeId || !status) {
      return NextResponse.json({ error: 'leadId, storeId et status sont requis' }, { status: 400 });
    }

    if (!Object.values(LEAD_STATUS).includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    try {
      const { error } = await supabaseAdmin
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('store_id', storeId);

      if (!error) {
        return NextResponse.json({ success: true, leadId, status });
      }
    } catch (_) {}

    // Fallback mémoire
    const storeList = memoryLeads.get(storeId) || [];
    const target = storeList.find(l => l.id === leadId);
    if (target) {
      target.status = status;
      target.updated_at = new Date().toISOString();
    }

    return NextResponse.json({ success: true, leadId, status });

  } catch (error) {
    console.error('[Leads API] PATCH Exception:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
