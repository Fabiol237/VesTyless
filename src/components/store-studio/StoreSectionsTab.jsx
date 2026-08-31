'use client';
import { Megaphone, Clock, Calendar, FileText, LayoutList } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

export default function StoreSectionsTab({ formData, onChange, onConfigChange, onHoursChange }) {
  const layoutConfig = formData.layout_config || {};
  const hours = layoutConfig.opening_hours || {
    monday: { open: '08:00', close: '20:00', closed: false },
    tuesday: { open: '08:00', close: '20:00', closed: false },
    wednesday: { open: '08:00', close: '20:00', closed: false },
    thursday: { open: '08:00', close: '20:00', closed: false },
    friday: { open: '08:00', close: '20:00', closed: false },
    saturday: { open: '09:00', close: '21:00', closed: false },
    sunday: { open: '10:00', close: '18:00', closed: true },
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Bannière Promotionnelle Défilante */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-7 rounded-3xl text-white shadow-xl shadow-emerald-950/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-2xl text-white backdrop-blur-md border border-white/10">
            <Megaphone size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">Bandeau Promotionnel Défilant</h3>
            <p className="text-xs text-emerald-100 font-medium">Message animé affiché en haut de votre boutique.</p>
          </div>
        </div>

        <textarea
          name="custom_message"
          value={formData.custom_message || ''}
          onChange={onChange}
          rows="2"
          placeholder="Ex: ⚡ Livraison gratuite à Douala & Yaoundé dès 25.000 FCFA d'achat !"
          className="w-full bg-white/10 placeholder:text-white/40 focus:bg-white/15 border-2 border-white/15 focus:border-white rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none transition-all resize-none text-white"
        />
      </div>

      {/* 2. Horaires d'Ouverture */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Horaires d'Ouverture</h3>
            <p className="text-xs text-gray-400 font-medium">Indiquez à vos clients quand votre boutique physique ou votre service est disponible.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {DAYS.map(({ key, label }) => {
            const dayData = hours[key] || { open: '08:00', close: '20:00', closed: false };
            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  dayData.closed ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[90px]">
                  <input
                    type="checkbox"
                    checked={!dayData.closed}
                    onChange={(e) => onHoursChange(key, 'closed', !e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-black text-gray-900">{label}</span>
                </div>

                {!dayData.closed ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayData.open || '08:00'}
                      onChange={(e) => onHoursChange(key, 'open', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none"
                    />
                    <span className="text-xs text-gray-400 font-bold">à</span>
                    <input
                      type="time"
                      value={dayData.close || '20:00'}
                      onChange={(e) => onHoursChange(key, 'close', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Onglets Personnalisés de Navigation */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <LayoutList size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Libellés des Onglets de Navigation</h3>
            <p className="text-xs text-gray-400 font-medium">Personnalisez les intitulés du menu de votre boutique.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Onglet Accueil</label>
            <input
              type="text"
              name="tab_accueil"
              value={formData.shop_tabs?.accueil || 'Accueil'}
              onChange={onChange}
              className="w-full bg-gray-50/70 border border-gray-200 focus:border-[#059669] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Onglet Catalogue</label>
            <input
              type="text"
              name="tab_produits"
              value={formData.shop_tabs?.produits || 'Catalogue'}
              onChange={onChange}
              className="w-full bg-gray-50/70 border border-gray-200 focus:border-[#059669] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Onglet Promotions</label>
            <input
              type="text"
              name="tab_promotions"
              value={formData.shop_tabs?.promotions || 'Promotions'}
              onChange={onChange}
              className="w-full bg-gray-50/70 border border-gray-200 focus:border-[#059669] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Onglet Profil / À propos</label>
            <input
              type="text"
              name="tab_profil"
              value={formData.shop_tabs?.profil || 'Profil'}
              onChange={onChange}
              className="w-full bg-gray-50/70 border border-gray-200 focus:border-[#059669] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
