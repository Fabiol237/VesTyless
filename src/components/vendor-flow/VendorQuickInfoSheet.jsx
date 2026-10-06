'use client';
import { useState } from 'react';
import { Store, Phone, MapPin, Palette, Type, X, Check, Upload, Briefcase } from 'lucide-react';
import { businessTypeRegistry } from '@/lib/business-types/BusinessTypeRegistry';

const CITIES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Kribi',
  'Limbe',
  'Dschang',
  'Autre',
];

const PRESET_COLORS = [
  { name: 'Émeraude Vestyle', value: '#128C7E' },
  { name: 'Violet Sombre', value: '#7c3aed' },
  { name: 'Bleu Roi', value: '#2563eb' },
  { name: 'Rose Glamour', value: '#ec4899' },
  { name: 'Doré Artisanal', value: '#d97706' },
  { name: 'Rouge Passion', value: '#dc2626' },
  { name: 'Noir Minimal', value: '#111827' },
  { name: 'Vert Nature', value: '#16a34a' },
];

export function VendorQuickInfoSheet({
  isOpen,
  onClose,
  storeData,
  onUpdateStore,
}) {
  const [name, setName] = useState(storeData?.name || storeData?.businessDescription?.name || '');
  const [description, setDescription] = useState(storeData?.description || storeData?.businessDescription?.description || '');
  const [phone, setPhone] = useState(storeData?.phone || storeData?.businessDescription?.phone || '');
  const [whatsapp, setWhatsapp] = useState(storeData?.whatsapp_number || storeData?.businessDescription?.whatsapp_number || '');
  const [city, setCity] = useState(storeData?.city || storeData?.businessDescription?.city || 'Douala');
  const [primaryColor, setPrimaryColor] = useState(storeData?.theme?.colors?.primary || storeData?.theme_color || '#128C7E');
  const [businessType, setBusinessType] = useState(
    businessTypeRegistry.normalize(storeData?.businessType || storeData?.business_type || 'product')
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const canonicalType = businessTypeRegistry.normalize(businessType);
    onUpdateStore({
      name,
      description,
      phone,
      whatsapp_number: whatsapp || phone,
      city,
      businessType: canonicalType,
      business_type: canonicalType,
      theme_color: primaryColor,
      theme: {
        ...(storeData?.theme || {}),
        colors: {
          ...(storeData?.theme?.colors || {}),
          primary: primaryColor,
        },
      },
      businessDescription: {
        ...(storeData?.businessDescription || {}),
        name,
        description,
        phone,
        whatsapp_number: whatsapp || phone,
        city,
        businessType: canonicalType,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121217] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#181822]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Infos de ta boutique</h3>
              <p className="text-xs text-slate-400">Remplis une fois, tous les templates s&apos;adaptent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Store size={13} className="text-purple-400" />
              <span>Nom de la boutique</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boulangerie Saint-Honoré"
              className="w-full bg-[#09090d] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition"
            />
          </div>

          {/* Description / Slogan */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Slogan ou courte description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pains chauds et gâteaux d'anniversaire sur commande"
              className="w-full bg-[#09090d] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition"
            />
          </div>

          {/* Téléphone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-purple-400" />
                <span>Téléphone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full bg-[#09090d] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">WA</span>
                <span>WhatsApp commandes</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full bg-[#09090d] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Ville */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-purple-400" />
              <span>Ville</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`px-3 py-1.5 rounded-xl border transition ${
                    city === c
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Secteur d'activité & Métier */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Briefcase size={13} className="text-purple-400" />
              <span>Secteur d&apos;activité</span>
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full bg-[#09090d] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
            >
              {businessTypeRegistry.getAll().map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.emoji} {bt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Couleur principale */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette size={13} className="text-purple-400" />
              <span>Couleur de ta marque</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPrimaryColor(c.value)}
                  className={`h-9 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    primaryColor === c.value
                      ? 'border-white ring-2 ring-white/30'
                      : 'border-white/10'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {primaryColor === c.value && <Check size={14} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181822] border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition"
          >
            <Check size={14} />
            <span>Enregistrer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
