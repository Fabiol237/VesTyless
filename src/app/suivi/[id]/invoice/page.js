'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Printer, Download, ShoppingBag, MapPin, Phone, User, Calendar, CheckCircle2 } from 'lucide-react';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('id', orderData.store_id)
          .single();
        
        setStore(storeData);
      } catch (err) {
        console.error('Error fetching invoice data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wa-teal"></div>
    </div>
  );

  if (!order || (!order.can_print_invoice && order.status !== 'delivered')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Facture non disponible</h1>
        <p className="text-gray-500 mt-2 max-w-md">
          Votre facture sera disponible dès que le vendeur aura validé la livraison finale.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Barre d'outils (cachée à l'impression) */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="text-sm font-bold text-gray-500 hover:text-wa-teal transition-colors flex items-center gap-2"
        >
          Retour au suivi
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-wa-teal text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-wa-teal-dark transition-all active:scale-95"
          >
            <Printer size={18} /> Imprimer la Facture
          </button>
        </div>
      </div>

      {/* La Facture */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[32px] overflow-hidden print:shadow-none print:rounded-none">
        {/* En-tête coloré */}
        <div className="bg-gradient-to-r from-wa-teal to-wa-green p-10 text-white flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">VesTyle</h1>
            <p className="text-wa-chat/80 font-medium text-sm">Marché de Proximité Premium</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl mb-4">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Numéro de Facture</p>
              <p className="text-xl font-black">INV-{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Calendar size={16} />
              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Section Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Vendeur</h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-wa-teal-dark">{store?.name || 'Boutique VesTyle'}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin size={14} /> {store?.address || 'Cameroun'}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone size={14} /> {store?.phone || '+237 ...'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Client</h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone size={14} /> {order.customer_phone}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin size={14} /> {order.shipping_address || 'Livraison à domicile'}
                </p>
              </div>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="mb-12">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Détails de la Commande</h3>
            <div className="w-full border-y border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                    <th className="py-4 px-2">Article</th>
                    <th className="py-4 px-2 text-center">Qté</th>
                    <th className="py-4 px-2 text-right">Prix Unitaire</th>
                    <th className="py-4 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(order.order_items || []).map((item, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.id.slice(0, 8)}</p>
                      </td>
                      <td className="py-4 px-2 text-center font-medium text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-2 text-right text-gray-600">{item.price.toLocaleString()} F</td>
                      <td className="py-4 px-2 text-right font-bold text-wa-teal-dark">{(item.price * item.quantity).toLocaleString()} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="flex flex-col items-end gap-3 mb-12">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-bold text-gray-900">{order.total_amount.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frais de livraison</span>
                <span className="font-bold text-wa-green">Gratuit</span>
              </div>
              <div className="pt-4 border-t-2 border-wa-teal flex justify-between items-center">
                <span className="text-lg font-black text-wa-teal-dark">TOTAL NET</span>
                <span className="text-3xl font-black text-wa-teal">{order.total_amount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Pied de page Facture */}
          <div className="bg-gray-50 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Facture Acquittée</p>
                <p className="text-xs text-gray-500 font-medium">Merci de votre confiance sur VesTyle.</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Authentifié par</p>
              <p className="text-xs font-black text-wa-teal-dark uppercase tracking-widest">VESTYLE CLOUD ENGINE</p>
            </div>
          </div>
        </div>

        {/* Footer print only */}
        <div className="hidden print:block text-center text-[10px] text-gray-400 py-8 border-t border-dashed">
          Ceci est un document numérique généré automatiquement. VesTyle Marketplace - Cameroun.
        </div>
      </div>
    </div>
  );
}
