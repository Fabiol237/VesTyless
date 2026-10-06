'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { leadEngine, LEAD_STATUS, LEAD_STATUS_LABELS, LEAD_REQUEST_TYPES } from '@/lib/lead-engine/LeadEngine';
import {
  Inbox, MessageCircle, Phone, Clock, CheckCircle,
  Filter, RefreshCw, Sparkles, User, Tag, ArrowRight, ExternalLink
} from 'lucide-react';

export default function StudioLeadsManager({ store }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'new' | 'in_progress' | 'converted' | 'closed'
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  const storeId = store?.id;

  const fetchLeads = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?storeId=${storeId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.warn('[StudioLeadsManager] Erreur chargement leads:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId, nextStatus) => {
    setUpdatingLeadId(leadId);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, storeId, status: nextStatus }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: nextStatus } : l)));
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (activeFilter === 'all') return true;
    return l.status === activeFilter;
  });

  const getRequestTypeBadge = (type) => {
    switch (type) {
      case LEAD_REQUEST_TYPES.QUOTE_REQUEST:
        return <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold">Devis sur mesure</span>;
      case LEAD_REQUEST_TYPES.SERVICE_BOOKING:
        return <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">Réservation Service</span>;
      case LEAD_REQUEST_TYPES.PRODUCT_INQUIRY:
        return <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">Question Produit</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[10px] font-bold">Contact Direct</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-200">
      {/* ── Entête & Filtres ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">Demandes & Prospects (Leads)</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
              {leads.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mise en relation directe avec les clients de <span className="font-semibold text-emerald-400">{store?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton rafraîchir */}
          <button
            type="button"
            onClick={fetchLeads}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
            title="Rafraîchir les demandes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Onglets de Statut ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Toutes' },
          { id: LEAD_STATUS.NEW, label: 'Nouvelles' },
          { id: LEAD_STATUS.IN_PROGRESS, label: 'En cours' },
          { id: LEAD_STATUS.CONVERTED, label: 'Converties' },
          { id: LEAD_STATUS.CLOSED, label: 'Fermées' },
        ].map(tab => {
          const count = tab.id === 'all' ? leads.length : leads.filter(l => l.status === tab.id).length;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Liste des Leads ────────────────────────────────────────────── */}
      {loading && leads.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p>Chargement des demandes...</p>
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const statusConfig = LEAD_STATUS_LABELS[lead.status] || LEAD_STATUS_LABELS[LEAD_STATUS.NEW];
            const waUrl = leadEngine.buildFollowupWhatsAppUrl(lead, store?.name);
            const callUrl = `tel:${lead.customer_phone}`;

            return (
              <div
                key={lead.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{lead.customer_name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{lead.customer_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getRequestTypeBadge(lead.request_type)}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Objet de la demande */}
                {lead.item_name && (
                  <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80 text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">{lead.item_name}</span>
                    {lead.item_type && <span className="text-slate-500 text-[10px]">({lead.item_type})</span>}
                  </div>
                )}

                {/* Message du client */}
                {lead.message && (
                  <p className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 italic">
                    "{lead.message}"
                  </p>
                )}

                {/* Actions Marchand */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500">
                    Reçu le {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Changement de statut */}
                    <select
                      value={lead.status}
                      disabled={updatingLeadId === lead.id}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value={LEAD_STATUS.NEW}>Nouveau</option>
                      <option value={LEAD_STATUS.CONTACTED}>Contacté</option>
                      <option value={LEAD_STATUS.IN_PROGRESS}>En cours</option>
                      <option value={LEAD_STATUS.CONVERTED}>Converti 🎉</option>
                      <option value={LEAD_STATUS.CLOSED}>Fermé</option>
                    </select>

                    {/* Appeler */}
                    <a
                      href={callUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </a>

                    {/* WhatsApp */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Répondre sur WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* État vide propre (ZÉRO Fake Data) */
        <div className="py-12 text-center text-slate-500 text-xs space-y-2">
          <Inbox className="w-8 h-8 text-slate-700 mx-auto" />
          <p className="font-bold text-slate-300">Aucune demande reçue pour le moment.</p>
          <p className="max-w-xs mx-auto text-slate-400 text-[11px]">
            Les demandes de devis, messages et questions produits de vos clients apparaîtront ici directement.
          </p>
        </div>
      )}
    </div>
  );
}
