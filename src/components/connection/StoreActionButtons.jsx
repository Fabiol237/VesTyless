'use client';

import React, { useState } from 'react';
import { connectionEngine, ACTION_TYPES } from '@/lib/connection-engine/ConnectionEngine';
import { MessageCircle, Phone, FileText, HelpCircle, Calendar, Mail, Send, X, Check, Sparkles } from 'lucide-react';

export default function StoreActionButtons({
  profile,
  item = null,
  itemType = 'product',
  intent = null,
  className = '',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActionType, setActiveActionType] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!profile) return null;

  const actions = connectionEngine.getAvailableActions(profile, {
    item,
    itemType,
    intent,
  });

  if (!actions || actions.length === 0) return null;

  const handleOpenModal = (actionType) => {
    setActiveActionType(actionType);
    setIsModalOpen(true);
    setSubmittedSuccess(false);
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || submitting) return;

    setSubmitting(true);
    try {
      let requestType = 'direct_contact';
      if (activeActionType === ACTION_TYPES.QUOTE_REQUEST) requestType = 'quote_request';
      else if (activeActionType === ACTION_TYPES.SERVICE_BOOKING) requestType = 'service_booking';
      else if (activeActionType === ACTION_TYPES.PRODUCT_INQUIRY) requestType = 'product_inquiry';

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: profile.id,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          requestType,
          itemId: item?.id || null,
          itemName: item?.name || item?.title || null,
          itemType,
          message: notes.trim(),
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setName('');
        setPhone('');
        setNotes('');
      } else {
        alert('Erreur lors de l\'envoi de votre demande.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case ACTION_TYPES.WHATSAPP:
        return <MessageCircle className="w-4 h-4" />;
      case ACTION_TYPES.CALL:
        return <Phone className="w-4 h-4" />;
      case ACTION_TYPES.QUOTE_REQUEST:
        return <FileText className="w-4 h-4" />;
      case ACTION_TYPES.SERVICE_BOOKING:
        return <Calendar className="w-4 h-4" />;
      case ACTION_TYPES.PRODUCT_INQUIRY:
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {actions.map((act) => {
        if (act.url) {
          // Action avec lien direct (WhatsApp, Tel)
          return (
            <a
              key={act.type}
              href={act.url}
              target={act.type === ACTION_TYPES.WHATSAPP ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                act.type === ACTION_TYPES.WHATSAPP
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {getActionIcon(act.type)}
              <span>{act.label}</span>
            </a>
          );
        }

        // Action nécessitant le formulaire de demande
        return (
          <button
            key={act.type}
            type="button"
            onClick={() => handleOpenModal(act.type)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-bold transition border border-slate-700 shadow-sm"
          >
            {getActionIcon(act.type)}
            <span>{act.label}</span>
          </button>
        );
      })}

      {/* ── Modal de Demande Rapide ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {submittedSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Demande Transmise !</h3>
                <p className="text-xs text-slate-300">
                  Le vendeur <span className="font-semibold text-emerald-400">{profile.identity.name}</span> a bien reçu votre demande et vous recontactera rapidement.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">
                    {activeActionType === ACTION_TYPES.QUOTE_REQUEST
                      ? 'Demande de Devis sur Mesure'
                      : activeActionType === ACTION_TYPES.SERVICE_BOOKING
                      ? 'Prendre Rendez-vous / Réserver'
                      : 'Contacter le Vendeur'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Boutique : <span className="font-semibold text-emerald-400">{profile.identity.name}</span>
                    {item ? ` • ${item.name || item.title}` : ''}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Votre Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Paul Mbarga"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Numéro de Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 690 00 00 00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Détails de votre demande (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Précisez votre besoin, vos quantités ou vos préférences..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !phone.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Envoi...' : 'Envoyer ma demande'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
