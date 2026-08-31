'use client';
import { Globe, Smartphone, Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function StoreIdentityTab({
  formData,
  onChange,
  onFileUpload,
  onRemoveImage,
  uploadingField,
  onPickContact
}) {
  return (
    <div className="space-y-8 text-left">
      {/* 1. Informations Générales */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Identité & Adresse Web</h3>
            <p className="text-xs text-gray-400 font-medium">Définissez le nom officiel et l'URL personnalisée de votre espace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la boutique</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Maison Krystal"
              className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Lien Web (Slug)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs select-none">/boutique/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={onChange}
                placeholder="maison-krystal"
                className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl pl-24 pr-4 py-3.5 text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Slogan ou Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="3"
              placeholder="Présentez brièvement votre savoir-faire et vos engagements..."
              className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none transition-all resize-none min-h-[90px]"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp Commercial</label>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#059669]" size={18} />
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={onChange}
                  placeholder="Ex: 237655123456"
                  className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold outline-none transition-all"
                />
              </div>
              {onPickContact && (
                <button
                  type="button"
                  onClick={onPickContact}
                  className="px-4 py-3.5 bg-emerald-50 text-[#059669] hover:bg-emerald-100 rounded-2xl transition-all font-bold text-xs flex items-center gap-1.5 border border-emerald-100"
                >
                  <Camera size={14} />
                  <span>Répertoire</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Médias (Logo et Bannière) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-500">
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Images de Marque</h3>
            <p className="text-xs text-gray-400 font-medium">Téléversez un logo officiel haute définition et une bannière de couverture.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* Logo */}
          <div className="space-y-3 text-center sm:text-left">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Officiel (Carré)</label>
            <div className="relative group aspect-square max-w-[150px] mx-auto sm:mx-0">
              <div className="w-full h-full rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                {formData.logo_url ? (
                  <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <Camera className="text-gray-300 animate-pulse" size={32} />
                )}
                {uploadingField === 'logo_url' && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#059669]" size={24} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2.5 bg-[#059669] text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all active:scale-90">
                <Camera size={15} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload('logo_url', e.target.files?.[0])} />
              </label>
              {formData.logo_url && (
                <button
                  type="button"
                  onClick={() => onRemoveImage('logo_url')}
                  className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bannière */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Bannière Principale (2:1)</label>
            <div className="relative group w-full aspect-[2/1] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
              {formData.banner_url ? (
                <img src={formData.banner_url} className="w-full h-full object-cover" alt="Bannière" />
              ) : (
                <ImageIcon className="text-gray-300" size={32} />
              )}
              {uploadingField === 'banner_url' && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#059669]" size={24} />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs cursor-pointer">
                <div className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest shadow-lg">
                  <Camera size={14} /> Remplacer
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload('banner_url', e.target.files?.[0])} />
              </label>
              {formData.banner_url && (
                <button
                  type="button"
                  onClick={() => onRemoveImage('banner_url')}
                  className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
