'use client';
import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function PriceAlertButton({ productId, currentPrice }) {
  const { user } = useAuth();
  const [hasAlert, setHasAlert] = useState(false);
  const [targetPrice, setTargetPrice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);

  useEffect(() => {
    if (user) checkAlert();
  }, [user, productId]);

  const checkAlert = async () => {
    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();
    if (data) {
      setHasAlert(true);
      setTargetPrice(data.target_price);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    const calcPrice = currentPrice * (1 - discountPercent / 100);

    try {
      if (hasAlert) {
        await supabase
          .from('price_alerts')
          .update({ target_price: calcPrice })
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('price_alerts')
          .insert([{
            user_id: user.id,
            product_id: productId,
            target_price: calcPrice,
            original_price: currentPrice
          }]);
      }
      setHasAlert(true);
      setTargetPrice(calcPrice);
      setShowForm(false);
    } catch (error) {
      console.error('Alert error:', error);
    }
    setLoading(false);
  };

  const removeAlert = async () => {
    await supabase
      .from('price_alerts')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    setHasAlert(false);
    setTargetPrice(null);
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition ${
            hasAlert
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Bell size={18} />
          {hasAlert ? 'Alerte activée' : 'Alerte de prix'}
        </button>
      )}

      {hasAlert && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-green-700 flex items-center gap-2">
              <Check size={18} />
              Alerte active
            </p>
            <button
              onClick={removeAlert}
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              Supprimer
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Vous recevrez une notification quand le prix baissera à{' '}
            <span className="font-bold">
              {targetPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
            </span>
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={createAlert} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Prix actuel: {currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</label>
            <div className="space-y-3">
              {[5, 10, 15, 20].map(percent => (
                <label key={percent} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    value={percent}
                    checked={discountPercent === percent}
                    onChange={e => setDiscountPercent(parseInt(e.target.value))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    -{percent}% = {(currentPrice * (1 - percent / 100)).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {hasAlert ? 'Modifier' : 'Créer alerte'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-300 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-400 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
