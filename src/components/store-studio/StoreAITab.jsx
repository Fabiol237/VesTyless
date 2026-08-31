'use client';
import { Bot, Star, TestTube, Sparkles } from 'lucide-react';

export default function StoreAITab({ formData, onChange }) {
  const handleTestChat = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Ping' }] }),
      });
      if (res.ok) {
        alert("✅ L'assistant IA est en ligne et opérationnel !");
      } else {
        alert("❌ Dysfonctionnement temporaire du serveur IA.");
      }
    } catch {
      alert("❌ Impossible de contacter le serveur IA.");
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Secrétaire Virtuelle IA */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Secrétaire Virtuelle IA 24h/24</h3>
            <p className="text-xs text-gray-400 font-medium">Un agent conversationnel intelligent qui répond automatiquement aux questions de vos clients.</p>
          </div>
        </div>

        <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 hover:bg-indigo-50/70 transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              name="ai_enabled"
              checked={formData.ai_enabled}
              onChange={onChange}
              className="sr-only"
            />
            <div className={`block w-12 h-7 rounded-full transition-colors ${formData.ai_enabled ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.ai_enabled ? 'translate-x-5' : ''}`} />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">Activer l'assistant conversationnel</p>
            <p className="text-xs text-gray-500 font-medium">Conseille les clients, suggère des articles et prend les commandes.</p>
          </div>
        </label>

        {formData.ai_enabled && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'assistant</label>
              <input
                type="text"
                name="ai_name"
                value={formData.ai_name || 'Assistant VeStyle'}
                onChange={onChange}
                placeholder="Ex: Sophie"
                className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions de comportement & ton</label>
              <textarea
                name="ai_prompt"
                value={formData.ai_prompt || ''}
                onChange={onChange}
                rows="3"
                placeholder="Vous êtes l'assistant officiel de la boutique. Soyez chaleureux et guidez les clients..."
                className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all resize-none min-h-[90px]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleTestChat}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition-all active:scale-95 border border-indigo-100"
              >
                <TestTube size={14} /> Tester l'assistant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Signaux de Confiance & Réputation */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Signaux de Confiance</h3>
            <p className="text-xs text-gray-400 font-medium">Affichez des badges rassurants pour booster le taux de conversion.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Statut Vendeur</label>
            <select
              name="supplier_level"
              value={formData.supplier_level}
              onChange={onChange}
              className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-4 py-3.5 text-xs font-bold outline-none"
            >
              <option value="Nouveau Vendeur">Nouveau Vendeur</option>
              <option value="Fournisseur Or">Fournisseur Or</option>
              <option value="Vendeur Premium">Vendeur Premium</option>
              <option value="Boutique Officielle">Boutique Officielle</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Taux de Satisfaction</label>
            <div className="relative">
              <input
                type="number"
                max="100"
                min="0"
                name="positive_rating"
                value={formData.positive_rating}
                onChange={onChange}
                className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-4 py-3.5 text-xs font-bold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Délai de Réponse Moyen</label>
            <select
              name="response_time"
              value={formData.response_time}
              onChange={onChange}
              className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-4 py-3.5 text-xs font-bold outline-none"
            >
              <option value="< 1h">&lt; 1h (Ultra Rapide)</option>
              <option value="< 2h">&lt; 2h (Rapide)</option>
              <option value="< 12h">&lt; 12h (Correct)</option>
              <option value="< 24h">&lt; 24h (Standard)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
