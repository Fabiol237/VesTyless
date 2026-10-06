import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notificationEngine, NOTIFICATION_EVENTS } from '@/lib/notification-engine/NotificationEngine';

export const dynamic = 'force-dynamic';

// ─── Schéma de validation Zod ────────────────────────────────────────────────
const CheckoutItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide (UUID attendu)'),
  quantity:  z.number().int().min(1, 'La quantité doit être au moins 1').max(10000, 'Quantité déraisonnablement élevée'),
  variantId:       z.string().optional(),
  selectedOptions: z.record(z.any()).optional(),
});

const CheckoutPayloadSchema = z.object({
  storeId: z.string().uuid('ID boutique invalide (UUID attendu)'),
  items: z.array(CheckoutItemSchema).min(1, 'Le panier ne peut pas être vide'),
  customer: z.object({
    name:    z.string().min(2, 'Le nom du client est requis (2 caractères min)'),
    phone:   z.string().min(6, 'Le numéro de téléphone est requis'),
    address: z.string().optional().default(''),
    lat:     z.number().optional().nullable(),
    lng:     z.number().optional().nullable(),
    notes:   z.string().optional().default(''),
  }),
  delivery: z.object({
    city:     z.string().optional().default('Douala'),
    zoneId:   z.string().optional().nullable(),
    isPickup: z.boolean().optional().default(false),
  }).optional().default({ city: 'Douala', zoneId: null, isPickup: false }),
  // Clé d'idempotence générée côté client (UUID v4)
  idempotencyKey: z.string().optional().nullable(),
});

// ─── Mapping des codes d'erreur SQL vers HTTP ──────────────────────────────
function mapSqlErrorToHttp(message) {
  if (!message) return { status: 500, error: 'Erreur serveur interne' };

  if (message.includes('INSUFFICIENT_STOCK')) {
    const prodId = message.split(':')[1]?.trim();
    return {
      status: 409,
      error: `Stock insuffisant${prodId ? ` pour le produit ${prodId}` : ''}.`,
      code: 'INSUFFICIENT_STOCK',
    };
  }
  if (message.includes('STORE_NOT_FOUND')) {
    return { status: 404, error: 'Boutique introuvable.', code: 'STORE_NOT_FOUND' };
  }
  if (message.includes('STORE_INACTIVE')) {
    return { status: 403, error: 'Cette boutique est temporairement fermée.', code: 'STORE_INACTIVE' };
  }
  if (message.includes('PRODUCT_NOT_FOUND')) {
    return { status: 400, error: 'Un produit du panier n\'existe plus.', code: 'PRODUCT_NOT_FOUND' };
  }
  if (message.includes('PRODUCT_INACTIVE')) {
    return { status: 400, error: 'Un produit du panier n\'est plus disponible à la vente.', code: 'PRODUCT_INACTIVE' };
  }
  if (message.includes('PRODUCT_WRONG_STORE')) {
    return { status: 400, error: 'Un produit n\'appartient pas à cette boutique.', code: 'PRODUCT_WRONG_STORE' };
  }
  if (message.includes('MOQ_NOT_MET')) {
    return { status: 400, error: 'Quantité minimale non respectée pour un produit.', code: 'MOQ_NOT_MET' };
  }
  if (message.includes('MIN_ORDER_AMOUNT')) {
    return { status: 400, error: 'Le montant minimum de commande n\'est pas atteint.', code: 'MIN_ORDER_AMOUNT' };
  }
  if (message.includes('INVALID_QUANTITY')) {
    return { status: 400, error: 'Quantité invalide dans la commande.', code: 'INVALID_QUANTITY' };
  }
  if (message.includes('STORE_NOT_FOUND') || message.includes('PRODUCT_NOT_FOUND')) {
    return { status: 404, error: message, code: 'NOT_FOUND' };
  }

  return { status: 500, error: 'Erreur serveur lors du traitement de la commande.', code: 'INTERNAL_ERROR' };
}

/**
 * POST /api/orders/checkout
 * ─────────────────────────────────────────────────────────────────────────────
 * Étape 5.0 — Checkout atomique et idempotent.
 *
 * Le flux complet est délégué à la RPC PostgreSQL `process_order_checkout` qui :
 *   1. Vérifie l'idempotence (replay sans doublon)
 *   2. Verrouille les lignes produits FOR UPDATE (ordre déterministe, anti-deadlock)
 *   3. Valide stock, statuts, MOQ côté SQL
 *   4. Crée la commande + décrémente les stocks + écrit stock_logs
 *   — TOUT dans une seule transaction PostgreSQL ACID —
 *
 * Ce handler calcule les frais de livraison côté serveur Next.js (DeliveryEngine),
 * puis passe la valeur validée à la RPC. Les notifications sont déclenchées
 * uniquement APRÈS commit (post-commit, non-bloquantes).
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const parseResult = CheckoutPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Données de commande invalides',
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const { storeId, items, customer, delivery, idempotencyKey } = parseResult.data;

    // ── 1. Calcul des frais de livraison côté serveur (avant la RPC) ─────────
    // On a besoin du store pour calculer les frais, mais on fait une lecture légère
    // uniquement pour la config de livraison — la RPC re-validera complètement la boutique.
    let deliveryFee = 0;
    try {
      const { data: storeConfig } = await supabaseAdmin
        .from('stores')
        .select('id, is_active, delivery_zones, business_specific_config, allow_out_of_stock, min_order_amount, currency')
        .eq('id', storeId)
        .single();

      if (storeConfig) {
        const deliveryCalc = deliveryEngine.calculateDeliveryFee(storeConfig, {
          city:     delivery.city || customer.address || 'Douala',
          zoneId:   delivery.zoneId,
          orderTotal: 0, // Conservative : on ne connaît pas le sous-total ici
          isPickup: delivery.isPickup,
        });
        deliveryFee = Number(deliveryCalc.fee) || 0;
      }
    } catch (deliveryErr) {
      // Frais de livraison non-bloquants : on continue avec 0
      console.warn('[Checkout API] Calcul livraison échoué, frais = 0:', deliveryErr?.message);
    }

    // ── 2. Préparation du payload pour la RPC ────────────────────────────────
    const rpcItems = items.map(item => ({
      product_id: item.productId,
      quantity:   item.quantity,
    }));

    const rpcCustomer = {
      name:    customer.name.trim(),
      phone:   customer.phone.replace(/\D/g, ''),
      address: customer.address?.trim() || (delivery.isPickup ? 'Retrait en boutique' : ''),
      lat:     customer.lat ?? null,
      lng:     customer.lng ?? null,
    };

    // ── 3. Appel de la RPC transactionnelle (atome unique) ────────────────────
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      'process_order_checkout',
      {
        p_store_id:        storeId,
        p_items:           rpcItems,
        p_customer:        rpcCustomer,
        p_delivery_fee:    deliveryFee,
        p_idempotency_key: idempotencyKey || null,
      }
    );

    // ── 4. Gestion des erreurs SQL → HTTP sémantique ──────────────────────────
    if (rpcError || !rpcResult) {
      const errMsg = rpcError?.message || rpcError?.details || 'RPC checkout échoué';
      console.error('[Checkout API] RPC error:', errMsg);
      const { status, error, code } = mapSqlErrorToHttp(errMsg);
      return NextResponse.json({ error, code }, { status });
    }

    const result = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult;

    // ── 5. Réponse HTTP immédiate ─────────────────────────────────────────────
    const isReplay = Boolean(result.idempotent_replay);
    const responseBody = {
      success:          true,
      idempotent_replay: isReplay,
      order: {
        id:           result.order_id,
        storeId,
        totalAmount:  result.total_amount,
        subtotal:     result.subtotal ?? (result.total_amount - deliveryFee),
        deliveryFee:  result.delivery_fee ?? deliveryFee,
        status:       result.status || 'pending',
      },
    };

    // ── 6. Notifications POST-COMMIT (non-bloquantes) ─────────────────────────
    // Exécutées strictement après que la RPC a commité. Tout échec ici
    // ne doit JAMAIS invalider la commande déjà enregistrée.
    if (!isReplay) {
      notifyAsync({ storeId, orderId: result.order_id, customer, items, deliveryFee, result }).catch(
        err => console.warn('[Checkout API] Notification post-commit échouée (non-critique):', err?.message)
      );
    }

    return NextResponse.json(responseBody, { status: 200 });

  } catch (error) {
    console.error('[Checkout API] Uncaught Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur serveur interne lors du passage de commande', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * notifyAsync — Notifications post-commit non-bloquantes (Étape 5.3).
 * Exécutée STRICTEMENT APRÈS que la RPC PostgreSQL a commité avec succès.
 * Les erreurs de notification ne doivent JAMAIS impacter la commande.
 */
async function notifyAsync({ storeId, orderId, customer, items, result }) {
  try {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id, owner_id, name, currency, phone_whatsapp')
      .eq('id', storeId)
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

    await notificationEngine.dispatch(NOTIFICATION_EVENTS.ORDER_CREATED, {
      storeId,
      orderId,
      userId:        store?.owner_id,
      storeName:     store?.name || 'Votre boutique',
      currency:      store?.currency || 'FCFA',
      totalAmount:   result?.total_amount || 0,
      customerName:  customer?.name || 'Client',
      customerPhone: customer?.phone || '',
      vendorEmail,
      items:         items || [],
    });
  } catch (err) {
    // Délibérément silencieux : la commande est committée, les notifs sont best-effort
    console.warn('[Checkout API] notifyAsync error:', err?.message);
  }
}
