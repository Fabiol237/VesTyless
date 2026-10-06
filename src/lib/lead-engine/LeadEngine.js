/**
 * VesTyle V1 — @/lib/lead-engine/LeadEngine (Stub de compatibilité)
 * ─────────────────────────────────────────────────────────────────────────────
 * Exporte les constantes et l'objet leadEngine utilisés par StudioLeadsManager.
 * Les opérations réelles sur les leads passent par l'API /api/leads (Supabase).
 * Cet objet sert uniquement de référentiel de statuts et de types.
 */

import { z } from 'zod';

/**
 * Statuts possibles d'un lead / prospect.
 */
export const LEAD_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  CONVERTED: 'converted',
  CLOSED: 'closed',
};

/**
 * Labels affichables pour chaque statut.
 */
export const LEAD_STATUS_LABELS = {
  [LEAD_STATUS.NEW]: 'Nouveau',
  [LEAD_STATUS.IN_PROGRESS]: 'En cours',
  [LEAD_STATUS.CONVERTED]: 'Converti ✓',
  [LEAD_STATUS.CLOSED]: 'Clôturé',
};

/**
 * Types de demandes entrantes possibles.
 */
export const LEAD_REQUEST_TYPES = {
  WHATSAPP: 'whatsapp',
  FORM: 'form',
  PHONE: 'phone',
  EMAIL: 'email',
  CHAT: 'chat',
  BOOKING: 'booking',
  ORDER: 'order',
  QUOTE: 'quote',
};

/**
 * Schéma Zod de validation d'un lead entrant (POST /api/leads).
 */
export const LeadPayloadSchema = z.object({
  storeId: z.string().uuid('storeId doit être un UUID valide'),
  type: z.enum(['whatsapp', 'form', 'phone', 'email', 'chat', 'booking', 'order', 'quote']).optional(),
  customerName: z.string().min(1).max(200).optional(),
  customerPhone: z.string().max(30).optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  message: z.string().max(5000).optional(),
  productId: z.string().uuid().optional(),
  productName: z.string().max(300).optional(),
  metadata: z.record(z.unknown()).optional(),
  source: z.string().max(100).optional(),
});

/**
 * Objet leadEngine — Utilitaires pour travailler avec les leads.
 * Les opérations CRUD réelles sont gérées par l'API REST /api/leads.
 */
export const leadEngine = {
  /**
   * Retourne la prochaine transition de statut logique.
   */
  getNextStatus(currentStatus) {
    const transitions = {
      [LEAD_STATUS.NEW]: LEAD_STATUS.IN_PROGRESS,
      [LEAD_STATUS.IN_PROGRESS]: LEAD_STATUS.CONVERTED,
      [LEAD_STATUS.CONVERTED]: LEAD_STATUS.CLOSED,
      [LEAD_STATUS.CLOSED]: LEAD_STATUS.CLOSED,
    };
    return transitions[currentStatus] || LEAD_STATUS.IN_PROGRESS;
  },

  /**
   * Calcule le badge de couleur CSS pour un statut donné.
   */
  getStatusColor(status) {
    const colors = {
      [LEAD_STATUS.NEW]: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
      [LEAD_STATUS.IN_PROGRESS]: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
      [LEAD_STATUS.CONVERTED]: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
      [LEAD_STATUS.CLOSED]: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
    };
    return colors[status] || colors[LEAD_STATUS.NEW];
  },

  /**
   * Formate un timestamp en affichage relatif court (ex: "Il y a 2h").
   */
  formatRelativeTime(timestamp) {
    if (!timestamp) return '—';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  },

  /**
   * Score de priorité d'un lead (0-100).
   * Basé sur l'ancienneté et le statut.
   */
  getPriorityScore(lead) {
    if (!lead) return 0;
    let score = 50;
    if (lead.status === LEAD_STATUS.NEW) score += 30;
    if (lead.status === LEAD_STATUS.IN_PROGRESS) score += 10;
    const ageMs = Date.now() - new Date(lead.created_at || Date.now()).getTime();
    const ageHours = ageMs / 3600000;
    if (ageHours < 1) score += 20;
    else if (ageHours < 24) score += 10;
    else if (ageHours > 72) score -= 20;
    return Math.min(100, Math.max(0, score));
  },
};

export default leadEngine;
