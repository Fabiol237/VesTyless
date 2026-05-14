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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .invoice-card { 
            box-shadow: none !important; 
            border: none !important; 
            width: 210mm !important;
            height: 297mm !important;
            padding: 20mm !important;
            margin: 0 !important;
          }
          .page-break { page-break-after: always; }
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

            {/* A4 INVOICE */}
            <div className="invoice-card bg-white w-full max-w-[210mm] min-h-[297mm] shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-[4px] relative overflow-hidden text-slate-900 p-16 sm:p-24 flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-12 mb-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img src="/icon-512.png" className="w-12 h-12 grayscale" alt="" />
                    <h1 className="text-3xl font-black tracking-tighter">VESTYLE <span className="font-light text-slate-400">PRO</span></h1>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">Marketplace de Proximité</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Douala, Cameroun • www.vestyle.cm</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <h2 className="text-5xl font-black tracking-tighter text-slate-200">FACTURE</h2>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">Réf: #{(order.id||'').slice(0,8).toUpperCase()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date: {new Date(order.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-20 mb-20">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b pb-2">Vendeur</h3>
                  <div>
                    <p className="text-2xl font-black tracking-tight">{store?.name}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">{store?.city || 'Localisation certifiée'}</p>
                    {store?.phone && <p className="text-xs text-slate-500 mt-2 font-mono">{store.phone}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b pb-2">Client</h3>
                  <div>
                    <p className="text-2xl font-black tracking-tight">{order.customer_name}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">N° de téléphone: {order.customer_phone}</p>
                    <p className="text-xs text-slate-500 mt-1">Adresse de livraison: {order.delivery_address || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-1">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100">
                      <th className="py-4 text-left">Article</th>
                      <th className="py-4 text-center">Quantité</th>
                      <th className="py-4 text-right">Prix Unitaire</th>
                      <th className="py-4 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(order.order_items||[]).map((item, i) => (
                      <tr key={i} className="text-sm font-bold">
                        <td className="py-6 text-slate-900">{item.name}</td>
                        <td className="py-6 text-center text-slate-500">× {item.quantity}</td>
                        <td className="py-6 text-right text-slate-500">{Number(item.price).toLocaleString()} F</td>
                        <td className="py-6 text-right font-black">{Number(item.price * item.quantity).toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Security */}
              <div className="relative mt-auto pt-16">
                {/* SECURITY WATERMARK */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none rotate-[-15deg] select-none">
                   <h1 className="text-[150px] font-black tracking-[0.2em]">VESTYLE</h1>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10 border-t-2 border-slate-900 pt-12">
                  <div className="flex items-center gap-8">
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm relative group">
                      <img src={qrUrl} className="w-28 h-28" alt="Verif" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-wa-teal text-white rounded-full flex items-center justify-center shadow-lg">
                        <Verified size={14} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-wa-teal font-black text-[10px] uppercase tracking-widest bg-wa-teal/5 px-3 py-1 rounded-full border border-wa-teal/10 w-fit">
                        <ShieldCheck size={14} />
                        <span>Authenticité Garantie</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-slate-400 break-all max-w-[220px]">REF: {order.id.replace(/-/g, '').toUpperCase()}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Généré via Vestyle Network Authority</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Total Net à payer</p>
                    <p className="text-7xl font-black tracking-tighter text-slate-900 leading-none">
                      {Number(order.total_amount).toLocaleString()} <span className="text-xl font-light text-slate-400 ml-1">F</span>
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-6 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Paiement Sécurisé & Confirmé
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer A4 */}
              <div className="mt-20 text-center border-t border-slate-50 pt-8">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Merci de votre confiance • Vestyle Marketplace Excellence</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
