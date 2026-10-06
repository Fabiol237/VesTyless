/**
 * VesTyle V1 — @/lib/notification-engine/NotificationEngine (Stub)
 * ─────────────────────────────────────────────────────────────────────────────
 * Moteur de notifications multi-canaux (WhatsApp, email, push, SMS).
 * Les appels réels sont non-bloquants — les erreurs sont logguées silencieusement.
 */

export const NOTIFICATION_EVENTS = {
  // Commandes
  NEW_ORDER: 'new_order',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  // Leads & Contacts
  NEW_LEAD: 'new_lead',
  LEAD_STATUS_UPDATED: 'lead_status_updated',
  // Réservations
  NEW_BOOKING: 'new_booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  // Boutique
  LOW_STOCK: 'low_stock',
  STORE_PUBLISHED: 'store_published',
  NEW_REVIEW: 'new_review',
};

export const NOTIFICATION_CHANNELS = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  IN_APP: 'in_app',
};

/**
 * Moteur de notifications VesTyle.
 * Chaque méthode retourne { success: boolean, channel: string }.
 * Les erreurs sont capturées silencieusement pour ne pas bloquer les flux critiques.
 */
export const notificationEngine = {
  /**
   * Envoie une notification WhatsApp Business (via Twilio ou WhatsApp API).
   * @param {string} to - Numéro de téléphone au format E.164
   * @param {string} message - Contenu du message
   * @returns {Promise<{success: boolean, channel: string}>}
   */
  async sendWhatsApp(to, message) {
    if (!to || !message) return { success: false, channel: NOTIFICATION_CHANNELS.WHATSAPP, error: 'to ou message manquant' };
    try {
      // Implémentation future via WHATSAPP_API_KEY ou Twilio
      // Pour l'instant : log non-bloquant
      console.log(`[NotificationEngine] WhatsApp → ${to}: ${message.substring(0, 80)}…`);
      return { success: true, channel: NOTIFICATION_CHANNELS.WHATSAPP };
    } catch (err) {
      console.warn('[NotificationEngine] WhatsApp error:', err?.message);
      return { success: false, channel: NOTIFICATION_CHANNELS.WHATSAPP, error: err?.message };
    }
  },

  /**
   * Envoie un email via le fournisseur configuré.
   * @param {string} to - Adresse email destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} html - Contenu HTML
   * @returns {Promise<{success: boolean, channel: string}>}
   */
  async sendEmail(to, subject, html) {
    if (!to || !subject) return { success: false, channel: NOTIFICATION_CHANNELS.EMAIL, error: 'to ou subject manquant' };
    try {
      console.log(`[NotificationEngine] Email → ${to}: ${subject}`);
      return { success: true, channel: NOTIFICATION_CHANNELS.EMAIL };
    } catch (err) {
      console.warn('[NotificationEngine] Email error:', err?.message);
      return { success: false, channel: NOTIFICATION_CHANNELS.EMAIL, error: err?.message };
    }
  },

  /**
   * Déclenche une notification selon un événement système.
   * @param {string} event - Événement (NOTIFICATION_EVENTS.*)
   * @param {object} payload - Données de l'événement
   * @param {string[]} channels - Canaux à utiliser
   * @returns {Promise<{success: boolean, results: object[]}>}
   */
  async trigger(event, payload = {}, channels = [NOTIFICATION_CHANNELS.IN_APP]) {
    const results = [];
    try {
      for (const channel of channels) {
        if (channel === NOTIFICATION_CHANNELS.WHATSAPP && payload.recipientPhone) {
          const msg = this.buildMessage(event, payload);
          const res = await this.sendWhatsApp(payload.recipientPhone, msg);
          results.push(res);
        } else if (channel === NOTIFICATION_CHANNELS.EMAIL && payload.recipientEmail) {
          const msg = this.buildMessage(event, payload);
          const res = await this.sendEmail(payload.recipientEmail, `Notification VesTyle: ${event}`, `<p>${msg}</p>`);
          results.push(res);
        } else {
          // In-app / fallback : log uniquement
          console.log(`[NotificationEngine] ${event} → ${channel}`, payload);
          results.push({ success: true, channel });
        }
      }
      return { success: true, results };
    } catch (err) {
      console.warn('[NotificationEngine] trigger error:', err?.message);
      return { success: false, results, error: err?.message };
    }
  },

  /**
   * Construit un message textuel standard depuis un événement.
   * @param {string} event
   * @param {object} payload
   * @returns {string}
   */
  buildMessage(event, payload) {
    const storeName = payload.storeName || 'VesTyle Store';
    const messages = {
      [NOTIFICATION_EVENTS.NEW_ORDER]: `🛒 Nouvelle commande reçue sur ${storeName}! Montant: ${payload.amount || '?'} FCFA.`,
      [NOTIFICATION_EVENTS.ORDER_CONFIRMED]: `✅ Commande #${payload.orderId || '?'} confirmée sur ${storeName}.`,
      [NOTIFICATION_EVENTS.ORDER_SHIPPED]: `🚚 Commande #${payload.orderId || '?'} expédiée depuis ${storeName}.`,
      [NOTIFICATION_EVENTS.ORDER_DELIVERED]: `🎉 Commande #${payload.orderId || '?'} livrée avec succès.`,
      [NOTIFICATION_EVENTS.NEW_LEAD]: `📩 Nouvelle demande client reçue sur ${storeName}.`,
      [NOTIFICATION_EVENTS.NEW_BOOKING]: `📅 Nouvelle réservation sur ${storeName}.`,
      [NOTIFICATION_EVENTS.LOW_STOCK]: `⚠️ Stock faible pour ${payload.productName || 'un article'} sur ${storeName}.`,
    };
    return messages[event] || `Notification ${event} depuis ${storeName}.`;
  },
};

export default notificationEngine;
