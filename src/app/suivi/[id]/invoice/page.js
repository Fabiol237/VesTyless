'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Printer, ChevronLeft, Share2, ShieldCheck, Verified, Phone, Mail, Globe, MapPin } from 'lucide-react';

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
  const themeColor = store?.theme_color || '#128C7E';

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playball&family=Outfit:wght@400;700;900&display=swap');
        
        .invoice-font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        .font-signature {
          font-family: 'Playball', cursive;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-page { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; max-width: 100% !important; height: 100vh !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest invoice-font-outfit">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="flex gap-3">
          <button onClick={() => {
            if (navigator.share) navigator.share({ title: `Facture ${invoiceNum}`, url: window.location.href }).catch(() => {});
            else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !'); }
          }} className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
            <Share2 size={18} />
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 invoice-font-outfit">
            <Printer size={18} /> Imprimer / PDF
          </button>
        </div>
      </div>

      {/* INVOICE — MuniPro Branded Layout (Exactly One Page Layout) */}
      <div className="flex justify-center py-6 sm:py-8 px-2 sm:px-4 no-print-wrapper w-full invoice-font-outfit">
        <div className="invoice-page bg-white w-full max-w-3xl shadow-2xl rounded-[24px] overflow-hidden print:w-full print:shadow-none print:rounded-none relative flex flex-col justify-between" style={{ minHeight: '297mm' }}>
          
          {/* Header Bar like MuniPro */}
          <div className="h-4 w-full" style={{ backgroundColor: themeColor }} />

          <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
            
            {/* 1. HEADER SECTION (Store Logo + Invoice Meta) */}
            <div className="flex flex-row justify-between items-start pb-6 border-b-2 border-slate-100 gap-4">
              <div className="flex items-center gap-4">
                {store?.logo_url ? (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md shrink-0 bg-white p-0.5">
                    <img src={store.logo_url} className="w-full h-full object-cover rounded-xl" alt={store.name} />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold" style={{ color: themeColor }}>{store?.name?.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase leading-none mb-1">
                    {store?.name || 'Boutique Partenaire'}
                  </h1>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {store?.description?.slice(0, 80) || 'Boutique de Proximité Certifiée'}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                    Vendeur Id: {(store?.id || '').slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-md" style={{ backgroundColor: themeColor }}>
                  FACTURE
                </div>
                <div className="mt-3 text-right">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">N° {invoiceNum}</p>
                  <p className="text-[9px] font-bold text-slate-400">Date d&apos;émission : {invoiceDate}</p>
                </div>
              </div>
            </div>

            {/* 2. GRID INFO (Addresses / Logistics) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6">
              
              {/* Vendeur block */}
              <div className="md:col-span-6 bg-slate-50/70 p-4 rounded-[20px] border border-slate-100 flex flex-col justify-between">
                <div>
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-2 border-b pb-1" style={{ color: themeColor }}>EXPÉDITEUR / VENDEUR</p>
                  <p className="text-sm font-black text-slate-900">{store?.name || 'Vendeur Vestyle'}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1.5"><MapPin size={12} /> {store?.city || 'Douala, Cameroun'}</p>
                </div>
                {store?.whatsapp_number && (
                  <p className="text-xs text-slate-400 mt-2 font-bold flex items-center gap-1.5"><Phone size={12} /> {store.whatsapp_number}</p>
                )}
              </div>

              {/* Client block */}
              <div className="md:col-span-6 bg-slate-50/70 p-4 rounded-[20px] border border-slate-100 flex flex-col justify-between">
                <div>
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-2 border-b pb-1" style={{ color: themeColor }}>DESTINATAIRE / CLIENT</p>
                  <p className="text-sm font-black text-slate-900">{order.customer_name}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1.5"><Phone size={12} /> {order.customer_phone}</p>
                </div>
                {order.shipping_address && (
                  <p className="text-[11px] text-slate-400 mt-2 font-medium leading-tight flex items-center gap-1.5"><MapPin size={12} /> {order.shipping_address}</p>
                )}
              </div>
            </div>

            {/* 3. ITEMS TABLE (Designed like MuniPro costs table) */}
            <div className="flex-1 min-h-[160px] overflow-hidden mb-6 border border-slate-100 rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="text-white text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: themeColor }}>
                    <th className="py-3 px-4 text-left">Désignation des Articles</th>
                    <th className="py-3 px-4 text-center w-16">Qté</th>
                    <th className="py-3 px-4 text-right w-24">Prix Unitaire</th>
                    <th className="py-3 px-4 text-right w-28">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{item.name}</p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                            {Object.entries(item.selectedVariants).map(([k,v]) => `${k}: ${v}`).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-black text-slate-500">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-xs font-bold text-slate-500">{Number(item.price).toLocaleString()} F</td>
                      <td className="py-3 px-4 text-right text-xs font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} F</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. TOTALS, QR CODE & SIGNATURE SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end border-t border-slate-100 pt-6">
              
              {/* Authenticity Seal & QR (MuniPro visual seal details) */}
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="bg-white border-2 border-slate-100 rounded-xl p-1 shadow-sm shrink-0">
                  <img src={qrUrl} className="w-16 h-16 sm:w-20 sm:h-20" alt="QR Authentification" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                    <Verified size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">VeStyle Certifié</span>
                  </div>
                  <p className="text-[7px] font-mono text-slate-400">REF: {authHash}</p>
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Secured Network</p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="md:col-span-4 bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-center min-h-[80px]">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL NET À PAYER</p>
                <p className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                  {Number(order.total_amount).toLocaleString()} <span className="text-xs font-bold text-white">FCFA</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Transaction Sécurisée</span>
                </div>
              </div>

              {/* Signature / Stamp Block (Styled identically to Chef de Projet in image) */}
              <div className="md:col-span-4 flex flex-col items-end text-right relative">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fait à Douala, le {invoiceDate}</p>
                <p className="text-[10px] font-black text-slate-900 uppercase mt-1">Le Gérant de la Boutique</p>
                
                <div className="relative h-16 w-full flex items-center justify-end mt-1">
                  {/* Handwritten Signature */}
                  <span className="font-signature text-2xl text-slate-800 italic transform -rotate-3 select-none pr-4 z-10">
                    {store?.name || 'Boutique'}
                  </span>
                  
                  {/* Certified Round Stamp Seal overlapping signature */}
                  <div className="absolute right-2 w-16 h-16 rounded-full border-[3px] border-dashed border-emerald-500/20 flex items-center justify-center rotate-12 select-none pointer-events-none z-0">
                    <div className="text-[7px] font-black text-emerald-600/30 tracking-tighter uppercase text-center leading-none">
                      VESTYLE<br />★<br />AGRÉÉ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. VESTYLE LOGO IN LOWER FOOTER (Centered, Elegant) */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <img src="/icon-512.png" className="w-6 h-6 grayscale opacity-40 shrink-0" alt="VeStyle" />
                <span className="text-[10px] font-black tracking-widest text-slate-400">VE<span className="text-slate-300 font-light">STYLE</span></span>
              </div>
              <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.4em] text-center">
                Facture électronique certifiée par VeStyle Marketplace • Tous droits réservés {new Date().getFullYear()}
              </p>
            </div>

          </div>

          {/* Bottom Contact Details Bar (styled exactly like green contact details bar in image) */}
          <div className="text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-2.5 px-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-1.5 select-none" style={{ backgroundColor: themeColor }}>
            {store?.phone && (
              <span className="flex items-center gap-1"><Phone size={10} className="shrink-0" /> {store.phone}</span>
            )}
            {store?.whatsapp_number && (
              <span className="flex items-center gap-1"><Phone size={10} className="shrink-0" /> WhatsApp: {store.whatsapp_number}</span>
            )}
            <span className="flex items-center gap-1"><Globe size={10} className="shrink-0" /> www.vestyle.app</span>
            <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" /> {store?.city || 'Douala - Cameroun'}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
