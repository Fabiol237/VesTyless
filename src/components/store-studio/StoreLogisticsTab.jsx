'use client';
import { MapPin, Navigation, Loader2, CheckCircle2, Truck, User, Trash2, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
      Chargement de la carte interactive...
    </div>
  ),
});

export default function StoreLogisticsTab({
  formData,
  onRequestLocation,
  isLocating,
  gpsError,
  userLocation,
  onPositionChange,
  livreurs,
  newLivreur,
  setNewLivreur,
  onAddLivreur,
  addingLivreur,
  onRemoveLivreur,
  onAddSelfLivreur,
  session,
}) {
  return (
    <div className="space-y-8 text-left">
      {/* 1. Position GPS & Carte Interactive */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Position Géographique (GPS)</h3>
            <p className="text-xs text-gray-400 font-medium">Permet le calcul précis de la distance et des frais de livraison pour vos acheteurs.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              type="button"
              onClick={onRequestLocation}
              disabled={isLocating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold rounded-2xl transition-all disabled:opacity-50 border border-blue-100 text-xs active:scale-95 shadow-xs"
            >
              {isLocating ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
              Capturer ma position GPS actuelle
            </button>

            <div className="w-full sm:flex-1 grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">LAT</span>
                <input
                  type="text"
                  readOnly
                  placeholder="0.00000"
                  value={formData.latitude || ''}
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-gray-700 outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">LON</span>
                <input
                  type="text"
                  readOnly
                  placeholder="0.00000"
                  value={formData.longitude || ''}
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-gray-700 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Carte Leaflet Interactive */}
          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative bg-gray-50">
            <InteractiveMap
              mode="select"
              initialPos={
                formData.latitude && formData.longitude && !isNaN(formData.latitude) && !isNaN(formData.longitude)
                  ? [Number(formData.latitude), Number(formData.longitude)]
                  : null
              }
              userPos={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
              userAccuracy={userLocation?.accuracy}
              onPositionChange={onPositionChange}
            />
            <div className="absolute top-3 left-3 z-[999] bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-blue-600 shadow-md border border-blue-50 pointer-events-none">
              Faites glisser le marqueur sur votre boutique
            </div>
          </div>

          {gpsError && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl">{gpsError}</p>}
          {formData.latitude && !gpsError && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Coordonnées synchronisées avec succès
            </p>
          )}
        </div>
      </div>

      {/* 2. Gestion des Livreurs & Logistique */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Flotte de Livraison</h3>
            <p className="text-xs text-gray-400 font-medium">Associez vos livreurs officiels pour gérer et suivre l'acheminement des commandes.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2.5">
            {livreurs?.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#059669] border border-gray-100 shadow-xs">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-800 text-xs">{l.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{l.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLivreur(l.id)}
                  className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={onAddLivreur} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-3 border-t border-gray-50">
            <input
              required
              type="text"
              placeholder="Nom du coursier"
              value={newLivreur.name}
              onChange={(e) => setNewLivreur({ ...newLivreur, name: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#059669]"
            />
            <input
              required
              type="text"
              placeholder="N° WhatsApp"
              value={newLivreur.phone}
              onChange={(e) => setNewLivreur({ ...newLivreur, phone: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#059669]"
            />
            <input
              type="email"
              placeholder="Email (optionnel)"
              value={newLivreur.email}
              onChange={(e) => setNewLivreur({ ...newLivreur, email: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#059669]"
            />
            <button
              type="submit"
              disabled={addingLivreur}
              className="bg-[#059669] hover:bg-[#047857] text-white rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {addingLivreur ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Ajouter</>}
            </button>
          </form>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onAddSelfLivreur}
              disabled={addingLivreur || livreurs?.some((l) => l.user_id === session?.id)}
              className="flex-1 py-3 px-4 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#059669] rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <User size={14} /> M'assigner comme coursier
            </button>
            <Link
              href="/delivery"
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Truck size={14} /> Ouvrir le Portail Coursier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
