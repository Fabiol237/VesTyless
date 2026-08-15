'use client';
import { useState } from 'react';
import { NEIGHBORHOODS_DOUALA, NEIGHBORHOODS_YAOUNDE, estimateDelivery } from '@/lib/deliveryCalculator';
import { triggerFeedback } from '@/lib/haptic';

/**
 * VesTyle — DeliveryEstimator
 * Widget/Modal interactif permettant de calculer les frais et le temps de livraison par quartier.
 */
export default function DeliveryEstimator({ defaultCity = 'Douala', onSelectDelivery, className = "" }) {
  const [city, setCity] = useState(defaultCity);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [estimate, setEstimate] = useState(null);

  const neighborhoods = city.toLowerCase().includes('yaound') ? NEIGHBORHOODS_YAOUNDE : NEIGHBORHOODS_DOUALA;

  const handleNeighborhoodChange = (e) => {
    const id = e.target.value;
    setSelectedNeighborhood(id);
    if (!id) {
      setEstimate(null);
      return;
    }
    triggerFeedback('pop');
    const res = estimateDelivery(city, id);
    setEstimate(res);
    if (onSelectDelivery) onSelectDelivery(res);
  };

  const handleCityChange = (newCity) => {
    triggerFeedback('pop');
    setCity(newCity);
    setSelectedNeighborhood('');
    setEstimate(null);
  };

  return (
    <div className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 ${className}`}>
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛵</span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Estimation de Livraison Moto</h3>
            <p className="text-[10px] font-semibold text-slate-400">Tarifs des livreurs locaux à Douala & Yaoundé</p>
          </div>
        </div>
      </div>

      {/* Onglets Ville */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => handleCityChange('Douala')}
          className={`py-2 text-xs font-black rounded-xl transition-all ${
            !city.toLowerCase().includes('yaound')
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📍 Douala
        </button>
        <button
          type="button"
          onClick={() => handleCityChange('Yaoundé')}
          className={`py-2 text-xs font-black rounded-xl transition-all ${
            city.toLowerCase().includes('yaound')
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📍 Yaoundé
        </button>
      </div>

      {/* Sélecteur de Quartier */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600">Choisissez votre quartier :</label>
        <select
          value={selectedNeighborhood}
          onChange={handleNeighborhoodChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
        >
          <option value="">-- Sélectionner un quartier ({city}) --</option>
          {neighborhoods.map(n => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.fee} FCFA)
            </option>
          ))}
        </select>
      </div>

      {/* Résultat d'estimation */}
      {estimate && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Tarif estimé de la course :</span>
            <span className="text-base font-black text-blue-700 font-mono">{estimate.formattedFee}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 text-xs">
            <span className="font-semibold text-slate-500">Délai moyen d'arrivée :</span>
            <span className="font-bold text-emerald-600">⏱️ {estimate.timeMin}</span>
          </div>
        </div>
      )}
    </div>
  );
}
