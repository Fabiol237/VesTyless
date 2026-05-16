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

      {/* INVOICE — A4 Single Page */}
      <div className="flex justify-center py-8 px-4 no-print-wrapper">
        <div className="invoice-page bg-white w-full max-w-[210mm] shadow-2xl rounded-lg overflow-hidden" style={{ minHeight: '297mm', maxHeight: '297mm' }}>
          <div className="flex flex-col h-full p-10 sm:p-14" style={{ minHeight: '273mm' }}>

            {/* === HEADER === */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img src="/icon-512.png" className="w-10 h-10" alt="VesTyle" />
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">VESTYLE <span className="font-light text-slate-400">PRO</span></h1>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Marketplace de Proximité • Douala, Cameroun</p>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-black text-slate-200 tracking-tighter mb-1">FACTURE</h2>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">N° {invoiceNum}</p>
                <p className="text-[10px] font-bold text-slate-400">Date : {invoiceDate}</p>
              </div>
            </div>

            {/* === ADDRESSES === */}
            <div className="grid grid-cols-2 gap-12 mb-8">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b pb-1">Vendeur</p>
                <p className="text-lg font-black text-slate-900 leading-tight">{store?.name || 'Vendeur Agréé'}</p>
                <p className="text-[11px] text-slate-500 font-bold mt-1">{store?.city || 'Cameroun'}</p>
                {store?.whatsapp_number && <p className="text-[11px] text-slate-400 mt-0.5">{store.whatsapp_number}</p>}
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b pb-1">Client</p>
                <p className="text-lg font-black text-slate-900 leading-tight">{order.customer_name}</p>
                <p className="text-[11px] text-slate-500 font-bold mt-1">Tél : {order.customer_phone}</p>
                {order.shipping_address && <p className="text-[11px] text-slate-400 mt-0.5">{order.shipping_address}</p>}
              </div>
            </div>

            {/* === ITEMS TABLE === */}
            <div className="flex-1">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Désignation</th>
                    <th className="py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 w-20">Qté</th>
                    <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-28">P.U.</th>
                    <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-3">
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {Object.entries(item.selectedVariants).map(([k,v]) => `${k}: ${v}`).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-center text-sm font-bold text-slate-500">× {item.quantity}</td>
                      <td className="py-3 text-right text-sm font-bold text-slate-500">{Number(item.price).toLocaleString()} F</td>
                      <td className="py-3 text-right text-sm font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* === TOTAL + QR === */}
            <div className="border-t-2 border-slate-900 pt-6 mt-6 flex justify-between items-end">
              <div className="flex items-center gap-5">
                <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                  <img src={qrUrl} className="w-20 h-20" alt="QR Vérification" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <Verified size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Authenticité Garantie</span>
                  </div>
                  <p className="text-[8px] font-mono text-slate-400">REF: {authHash}</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Vestyle Network Authority</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net à Payer</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {Number(order.total_amount).toLocaleString()} <span className="text-sm text-slate-400 font-bold">FCFA</span>
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-2 text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Transaction Confirmée</span>
                </div>
              </div>
            </div>

            {/* === FOOTER === */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
                Merci de votre confiance • VesTyle Marketplace • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
