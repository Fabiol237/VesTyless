'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Printer, ChevronLeft, Share2, ShieldCheck, Verified } from 'lucide-react';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const generateAuthHash = (ord) => {
    if (!ord) return '';
    const seed = `${ord.id}-${ord.total_amount}-${ord.created_at}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: orderData, error } = await supabase
          .from('orders').select('*').eq('id', id).single();
        if (error) throw error;
        setOrder(orderData);
        const { data: storeData } = await supabase
          .from('stores').select('*').eq('id', orderData.store_id).single();
        setStore(storeData);
      } catch (err) {
        console.error('Invoice fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Génération de la facture...</p>
      </div>
    </div>
  );

  if (!order || (!order.can_print_invoice && order.status !== 'delivered')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
        <ShieldCheck size={56} className="text-emerald-500 mb-6 animate-pulse" />
        <h1 className="text-2xl font-black text-white mb-3">Facture non disponible</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-8">
          Ce document sera accessible une fois la livraison confirmée par le vendeur.
        </p>
        <button onClick={() => window.history.back()} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm">
          Retour au suivi
        </button>
      </div>
    );
  }

  const authHash = generateAuthHash(order);
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/suivi/${order.id}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;
  const items = order.order_items || [];
  const invoiceDate = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNum = `VS-${(order.id || '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-page { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; max-width: 100% !important; }
          @page { size: A4; margin: 12mm 15mm; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="flex gap-3">
          <button onClick={() => {
            if (navigator.share) navigator.share({ title: `Facture ${invoiceNum}`, url: window.location.href }).catch(() => {});
            else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !'); }
          }} className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
            <Share2 size={18} />
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
            <Printer size={18} /> Imprimer / PDF
          </button>
        </div>
      </div>

      {/* INVOICE — Responsive & Print Ready */}
      <div className="flex justify-center py-6 sm:py-8 px-2 sm:px-4 no-print-wrapper w-full">
        <div className="invoice-page bg-white w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden print:w-full print:shadow-none print:rounded-none">
          <div className="flex flex-col h-full p-6 sm:p-14 print:p-0">

            {/* === HEADER === */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 sm:pb-6 border-b-2 border-slate-900 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <img src="/icon-512.png" className="w-8 h-8 sm:w-10 sm:h-10" alt="VesTyle" />
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">VESTYLE <span className="font-light text-slate-400">PRO</span></h1>
                </div>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Marketplace de Proximité • Douala, Cameroun</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-end items-end sm:items-end">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-200 tracking-tighter sm:mb-1">FACTURE</h2>
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest">N° {invoiceNum}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">Date : {invoiceDate}</p>
                </div>
              </div>
            </div>

            {/* === ADDRESSES === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mb-6 sm:mb-8">
              <div className="bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b pb-1">Vendeur</p>
                <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">{store?.name || 'Vendeur Agréé'}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">{store?.city || 'Cameroun'}</p>
                {store?.whatsapp_number && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{store.whatsapp_number}</p>}
              </div>
              <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b pb-1">Client</p>
                <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">{order.customer_name}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1">Tél : {order.customer_phone}</p>
                {order.shipping_address && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{order.shipping_address}</p>}
              </div>
            </div>

            {/* === ITEMS TABLE === */}
            <div className="flex-1 overflow-x-auto no-scrollbar mb-6">
              <table className="w-full min-w-[300px] sm:min-w-[400px]">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-2 sm:py-3 text-left text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Désignation</th>
                    <th className="py-2 sm:py-3 text-center text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 w-10 sm:w-20">Qté</th>
                    <th className="py-2 sm:py-3 text-right text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 w-16 sm:w-28">P.U.</th>
                    <th className="py-2 sm:py-3 text-right text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 w-20 sm:w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 sm:py-3">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2">{item.name}</p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">
                            {Object.entries(item.selectedVariants).map(([k,v]) => `${k}: ${v}`).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="py-2 sm:py-3 text-center text-xs sm:text-sm font-bold text-slate-500">× {item.quantity}</td>
                      <td className="py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-slate-500">{Number(item.price).toLocaleString()} F</td>
                      <td className="py-2 sm:py-3 text-right text-xs sm:text-sm font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* === TOTAL + QR === */}
            <div className="border-t-2 border-slate-900 pt-4 sm:pt-6 mt-auto flex flex-col-reverse sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-6">
              <div className="flex flex-row items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <div className="bg-white border border-slate-200 rounded-xl p-1.5 sm:p-2 shadow-sm shrink-0">
                  <img src={qrUrl} className="w-12 h-12 sm:w-20 sm:h-20" alt="QR Vérification" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5 sm:mb-1">
                    <Verified size={14} />
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Authenticité Garantie</span>
                  </div>
                  <p className="text-[7px] sm:text-[8px] font-mono text-slate-400">REF: {authHash}</p>
                  <p className="text-[7px] sm:text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Vestyle Network Authority</p>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto bg-slate-900 sm:bg-transparent text-white sm:text-slate-900 p-4 sm:p-0 rounded-2xl sm:rounded-none">
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-1">Total Net à Payer</p>
                <p className="text-3xl sm:text-4xl font-black tracking-tighter">
                  {Number(order.total_amount).toLocaleString()} <span className="text-xs sm:text-sm text-emerald-400 sm:text-slate-400 font-bold">FCFA</span>
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-2 text-emerald-400 sm:text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-400 sm:bg-emerald-500 rounded-full" />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Transaction Confirmée</span>
                </div>
              </div>
            </div>

            {/* === FOOTER === */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
                Merci de votre confiance • VesTyle Marketplace • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
