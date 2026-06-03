'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Package, Truck, CheckCircle2, Clock,
  ChevronLeft, AlertCircle, Phone, XCircle, Copy, Check, Printer, Loader2,
  ShieldCheck, Award, Fingerprint, Globe, Verified, Sparkles, Share2, Scale,
  Download, ExternalLink, QrCode, FileText, MapPin, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { status: 'pending',    label: 'Confirmation',       icon: Clock,        desc: 'En attente de validation par le vendeur.' },
  { status: 'processing', label: 'Préparation',        icon: Package,      desc: 'Votre commande est en cours de préparation.' },
  { status: 'shipped',    label: 'Livraison',          icon: Truck,        desc: 'Votre colis est en route pour la livraison.' },
  { status: 'delivered',  label: 'Terminée',           icon: CheckCircle2, desc: 'Livraison effectuée avec succès.' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [store, setStore]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState('tracking'); // 'tracking' or 'invoice'
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, stores(*)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setOrder(data);
        setStore(data.stores);
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`order-tracking-${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders', 
        filter: `id=eq.${id}` 
      }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const copyOrderNumber = () => {
    const num = (order?.id || '').slice(0,8).toUpperCase();
    navigator.clipboard.writeText(num).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-wa-teal animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <AlertCircle size={48} className="text-slate-200 mb-4" />
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Commande introuvable</h1>
        <Link href="/" className="mt-6 px-8 py-3 bg-wa-teal text-white rounded-full font-bold shadow-lg shadow-wa-teal/20 transition-all active:scale-95">Retour à l'accueil</Link>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-wa-teal selection:text-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-card { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important;
            max-height: 277mm !important;
            padding: 10mm !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {viewMode === 'tracking' ? (
          <motion.div 
            key="tracking" 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="no-print max-w-2xl mx-auto px-4 pt-12 pb-24"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <Link href="/mes-commandes" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft size={20} className="text-slate-600" />
              </Link>
              <div className="text-center">
                <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Suivi de commande</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 tracking-tight">#{(order.id||'').slice(0,8).toUpperCase()}</span>
                  <button onClick={copyOrderNumber} className="text-slate-300 hover:text-wa-teal transition-colors">
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="w-10 h-10" /> {/* Spacer */}
            </div>

            {/* Tracking Progress Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
              {isCancelled ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                    <XCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Commande Annulée</h2>
                  <p className="text-slate-400 font-medium">Cette commande a été annulée.</p>
                  <Link href="/" className="mt-10 inline-block px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Découvrir d'autres produits</Link>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="flex justify-between items-center px-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Statut Actuel</span>
                      <span className="text-xl font-black text-slate-900 uppercase tracking-tight">{STEPS[currentStepIndex]?.label || order.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Montant</span>
                      <p className="text-xl font-black text-wa-teal">{Number(order.total_amount).toLocaleString()} F</p>
                    </div>
                  </div>

                  <div className="relative pt-2">
                    {/* Progress Line */}
                    <div className="absolute left-[24px] top-4 bottom-4 w-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }} 
                        className="w-full bg-wa-teal shadow-[0_0_15px_#128c7e]" 
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-10 relative">
                      {STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={step.status} className="flex gap-6 items-start group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 ${isDone ? 'bg-wa-teal text-white shadow-lg shadow-wa-teal/30 scale-110' : 'bg-slate-50 text-slate-200 border border-slate-100'}`}>
                              <step.icon size={20} className={isCurrent ? "animate-pulse" : ""} />
                            </div>
                            <div className="flex-1 pt-1">
                              <h3 className={`font-black text-base tracking-tight ${isDone ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</h3>
                              <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isCurrent ? 'text-wa-teal' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>{step.desc}</p>
                              {isCurrent && (
                                <span className="inline-flex mt-3 px-3 py-1 bg-wa-teal/10 text-wa-teal rounded-full text-[9px] font-black uppercase tracking-widest animate-fade-in">En cours</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items & Actions */}
            <div className="space-y-4">
              <button 
                onClick={() => setViewMode('invoice')}
                className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-lg shadow-slate-200/50 hover:border-wa-teal transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-wa-teal/10 group-hover:text-wa-teal transition-colors">
                    <FileText size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Ma Facture Numérique</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imprimer ou Sauvegarder en PDF</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <img src={store?.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Vendu par</p>
                    <p className="font-black text-slate-900 tracking-tight">{store?.name}</p>
                  </div>
                  <Link href={`/boutique/${store?.slug}`} className="ml-auto w-10 h-10 flex items-center justify-center text-wa-teal bg-wa-teal/5 rounded-xl hover:bg-wa-teal hover:text-white transition-all">
                    <ExternalLink size={18} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {(order.order_items||[]).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qté: {item.quantity}</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">{(item.price * item.quantity).toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="invoice" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-100 flex flex-col items-center pt-10 pb-20 px-4"
          >
            {/* Toolbar */}
            <div className="w-full max-w-[210mm] flex items-center justify-between mb-8 no-print">
              <button onClick={() => setViewMode('tracking')} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
                <ChevronLeft size={16} /> Retour au suivi
              </button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-wa-teal text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-wa-teal/20 hover:-translate-y-1 transition-all">
                  <Printer size={18} /> Imprimer la facture
                </button>
              </div>
            </div>

            {/* A4 INVOICE (Responsive & Print) */}
            <div className="invoice-card bg-white w-full max-w-4xl shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-2xl relative overflow-hidden text-slate-900 p-6 sm:p-14 md:p-20 flex flex-col print:shadow-none print:rounded-none">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 sm:pb-12 mb-6 sm:mb-12 gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img src="/icon-512.png" className="w-10 h-10 sm:w-12 sm:h-12 grayscale" alt="" />
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">VESTYLE <span className="font-light text-slate-400">PRO</span></h1>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Marketplace de Proximité</p>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Douala, Cameroun • www.vestyle.cm</p>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1 sm:space-y-2 w-full sm:w-auto">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-200">FACTURE</h2>
                  <div className="space-y-1 mt-2 sm:mt-0 border-t border-slate-100 pt-2 sm:border-0 sm:pt-0">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Réf: #{(order.id||'').slice(0,8).toUpperCase()}</p>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Date: {new Date(order.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-20 mb-10 sm:mb-20">
                <div className="space-y-3 sm:space-y-4 bg-slate-50 p-4 rounded-xl sm:bg-transparent sm:p-0">
                  <h3 className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest border-b pb-2">Vendeur</h3>
                  <div>
                    <p className="text-xl sm:text-2xl font-black tracking-tight">{store?.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mt-1">{store?.city || 'Localisation certifiée'}</p>
                    {store?.phone && <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2 font-mono">{store.phone}</p>}
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 bg-slate-50 p-4 rounded-xl sm:bg-transparent sm:p-0">
                  <h3 className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest border-b pb-2">Client</h3>
                  <div>
                    <p className="text-xl sm:text-2xl font-black tracking-tight">{order.customer_name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1">N° de téléphone: {order.customer_phone}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Adresse de livraison: {order.delivery_address || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100">
                      <th className="py-3 sm:py-4 text-left">Article</th>
                      <th className="py-3 sm:py-4 text-center w-16 sm:w-24">Qté</th>
                      <th className="py-3 sm:py-4 text-right w-24 sm:w-32">P.U.</th>
                      <th className="py-3 sm:py-4 text-right w-28 sm:w-32">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(order.order_items||[]).map((item, i) => (
                      <tr key={i} className="text-xs sm:text-sm font-bold">
                        <td className="py-4 sm:py-6 text-slate-900">
                           <span className="line-clamp-2 leading-tight">{item.name}</span>
                        </td>
                        <td className="py-4 sm:py-6 text-center text-slate-500">× {item.quantity}</td>
                        <td className="py-4 sm:py-6 text-right text-slate-500">{Number(item.price).toLocaleString()} F</td>
                        <td className="py-4 sm:py-6 text-right font-black">{Number(item.price * item.quantity).toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Security */}
              <div className="relative mt-8 sm:mt-auto pt-8 sm:pt-16">
                {/* SECURITY WATERMARK */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.02] pointer-events-none rotate-[-15deg] select-none hidden sm:block">
                   <h1 className="text-[150px] font-black tracking-[0.2em]">VESTYLE</h1>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-between items-center md:items-end gap-8 md:gap-12 relative z-10 border-t-2 border-slate-900 pt-8 sm:pt-12">
                  <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-100">
                    <div className="p-2 sm:p-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm relative group shrink-0">
                      <img src={qrUrl} className="w-16 h-16 sm:w-28 sm:h-28" alt="Verif" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-wa-teal text-white rounded-full flex items-center justify-center shadow-lg">
                        <Verified size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-wa-teal font-black text-[8px] sm:text-[10px] uppercase tracking-widest bg-wa-teal/5 px-2 sm:px-3 py-1 rounded-full border border-wa-teal/10 w-fit">
                        <ShieldCheck size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span>Authenticité Garantie</span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-[7px] sm:text-[9px] font-mono text-slate-400 break-all max-w-[150px] sm:max-w-[220px]">REF: {order.id.replace(/-/g, '').toUpperCase()}</p>
                        <p className="text-[7px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">Généré via Vestyle Network Authority</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center md:text-right w-full md:w-auto bg-slate-900 text-white md:bg-transparent md:text-slate-900 p-6 rounded-2xl md:p-0 md:rounded-none">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 sm:mb-3">Total Net à payer</p>
                    <p className="text-4xl sm:text-7xl font-black tracking-tighter leading-none">
                      {Number(order.total_amount).toLocaleString()} <span className="text-lg sm:text-xl font-light text-emerald-400 md:text-slate-400 ml-1">F</span>
                    </p>
                    <div className="flex items-center justify-center md:justify-end gap-2 mt-4 sm:mt-6 text-emerald-400 md:text-emerald-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 md:bg-emerald-500 rounded-full md:animate-pulse" />
                      Paiement Sécurisé & Confirmé
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer A4 */}
              <div className="mt-10 sm:mt-20 text-center border-t border-slate-100 sm:border-slate-50 pt-6 sm:pt-8">
                <p className="text-[7px] sm:text-[9px] font-black text-slate-400 sm:text-slate-300 uppercase tracking-[0.4em]">Merci de votre confiance • Vestyle Marketplace Excellence</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
