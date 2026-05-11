'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Package, Truck, CheckCircle2, Clock,
  ChevronLeft, AlertCircle, Phone, XCircle, Copy, Check, Printer, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const STEPS = [
  { status: 'pending',    label: 'Commande reçue',       icon: Clock,        desc: 'Votre commande a bien été transmise au vendeur.' },
  { status: 'processing', label: 'En préparation',        icon: Package,      desc: 'Le vendeur prépare vos articles avec soin.' },
  { status: 'shipped',    label: 'En cours de livraison', icon: Truck,        desc: 'Votre colis est en route vers chez vous.' },
  { status: 'delivered',  label: 'Livraison réussie',     icon: CheckCircle2, desc: 'Colis remis en mains propres. Merci !' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled]   = useState(false);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, stores(name, logo_url, phone, city)')
        .eq('id', id)
        .single();
      if (!error) setOrder(data);
      setLoading(false);
    };

    load();

    // REAL-TIME SUBSCRIPTION: Live updates for the customer
    const channel = supabase
      .channel(`order-tracking-${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders', 
        filter: `id=eq.${id}` 
      }, (payload) => {
        console.log('Live order update:', payload.new);
        setOrder(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return;
    setCancelling(true);
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    if (!error) {
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      setCancelled(true);
    }
    setCancelling(false);
  };

  const copyOrderNumber = () => {
    const num = (order?.id || '').slice(0,8).toUpperCase();
    navigator.clipboard.writeText(num).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Commande introuvable</h1>
        <p className="text-slate-500 mt-2">Le lien semble expiré ou erroné.</p>
        <Link href="/" className="mt-6 text-wa-teal font-bold border-b-2 border-wa-teal pb-1">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'pending' && !cancelled;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">

      <style>{`
        @media print {
          .no-print, header, nav, footer, button, .status-card, .store-card { display:none!important }
          body { background: white!important; padding: 0!important; }
          .receipt-card { 
            position: absolute; top: 0; left: 0; width: 100%!important; 
            box-shadow: none!important; border: 1px solid #eee!important; 
            padding: 20px!important; margin: 0!important;
          }
          @page { margin: 1cm; }
        }
      `}</style>

      {/* Gold header */}
      <header className="relative overflow-hidden pb-20 pt-6 px-6" style={{ background:'linear-gradient(135deg,#F59E0B,#FCD34D,#F59E0B)' }}>
        {/* Shimmer */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage:'radial-gradient(white 1px,transparent 1px)', backgroundSize:'12px 12px' }} />

        <div className="max-w-2xl mx-auto flex items-center justify-between relative z-10">
          <Link href="/" className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <ChevronLeft size={22} className="text-white" />
          </Link>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Suivi de commande</h1>

            {/* BIG order number — easy to recognize */}
            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="text-2xl font-black text-white tracking-widest drop-shadow-sm">
                # {(order.id || '').slice(0, 8).toUpperCase()}
              </p>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                title="Copier le numéro"
              >
                {copied
                  ? <Check size={14} className="text-white" />
                  : <Copy size={14} className="text-white/80" />
                }
              </button>
            </div>

            <p className="text-[10px] text-white/70 font-bold mt-0.5">
              Communiquez ce numéro au vendeur
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 space-y-5">

        {/* Status card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-100 status-card">

          {isCancelled ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Commande Annulée</h2>
              <p className="text-slate-500 text-sm mt-2">
                {cancelled ? 'Vous avez annulé cette commande.' : 'Cette commande a été annulée.'}
              </p>
              <Link href="/" className="mt-5 inline-block px-6 py-3 bg-wa-teal text-white font-bold rounded-2xl text-sm hover:bg-wa-teal-dark transition-colors">
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <div className="space-y-7 relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-amber-100" />
              {STEPS.map((step, idx) => {
                const isActive  = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex gap-5 relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-colors duration-500 flex-shrink-0 ${
                      isActive
                        ? 'text-white shadow-lg shadow-amber-400/30'
                        : 'bg-slate-50 text-slate-300'
                    }`} style={isActive ? { background:'linear-gradient(135deg,#F59E0B,#FCD34D)' } : {}}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-bold text-base ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-amber-600 font-semibold' : 'text-slate-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                    {isCurrent && <div className="absolute -left-1 top-5 w-14 h-3 bg-amber-400/10 blur-xl animate-pulse" />}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Cancel button — only if pending */}
        {canCancel && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Le vendeur n'a pas encore vu votre commande.</p>
                <p className="text-xs text-amber-600 mt-0.5">Vous pouvez encore l'annuler gratuitement.</p>
              </div>
            </div>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="mt-3 w-full py-3.5 flex items-center justify-center gap-2 bg-white border-2 border-rose-200 text-rose-500 font-black rounded-2xl text-sm hover:bg-rose-50 transition-all disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Annuler ma commande
            </button>
          </motion.div>
        )}

        {/* Store card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 shadow-md border border-amber-100 flex items-center gap-4 store-card">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl overflow-hidden border border-amber-100 flex-shrink-0">
            {order.stores?.logo_url
              ? <img src={order.stores.logo_url} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-xl">{order.stores?.name?.[0]}</div>
            }
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boutique</h4>
            <p className="font-bold text-slate-900">{order.stores?.name}</p>
          </div>
          {order.stores?.phone && (
            <a href={`tel:${order.stores.phone}`} className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 transition-colors flex-shrink-0">
              <Phone size={18} />
            </a>
          )}
        </motion.div>

        {/* Order recap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 receipt-card">

          {/* Prominent order number */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-dashed border-amber-100">
            <div>
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Numéro de commande</p>
              <p className="text-2xl font-black text-gray-900 tracking-widest mt-0.5">
                #{(order.id||'').slice(0,8).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={copyOrderNumber} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all">
                {copied ? <><Check size={13}/> Copié !</> : <><Copy size={13}/> Copier</>}
              </button>
              
              {(order.can_print_invoice || order.status === 'delivered') && (
                <Link 
                  href={`/suivi/${order.id}/invoice`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-wa-teal text-white rounded-xl text-xs font-black hover:bg-wa-teal-dark transition-all shadow-lg animate-pulse"
                >
                  <Printer size={13}/> FACTURE OFFICIELLE
                </Link>
              )}

              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-lg">
                <Printer size={13}/> Imprimer
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
             {/* QR Code on Receipt */}
             <div className="w-24 h-24 bg-white p-2 border border-gray-100 rounded-2xl shrink-0">
                {typeof window !== 'undefined' && (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} 
                    alt="QR Authentification" 
                    className="w-full h-full"
                  />
                )}
             </div>
             
             <div className="flex-1 space-y-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Récapitulatif de la transaction</h3>
                <div className="space-y-3">
                  {(order.order_items||[]).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">×{item.quantity} {item.name}</span>
                      <span className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Payé</span>
                    <span className="text-xl font-black" style={{ color:'#F59E0B' }}>{Number(order.total_amount).toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
                
                {/* Authenticity Footer on Receipt */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider space-y-1">
                   <p>ID Transaction: {order.id}</p>
                   <p>Date: {new Date(order.created_at).toLocaleString('fr-FR')}</p>
                   <p className="text-emerald-500">✔ Commande Authentifiée par Vestyle Logistics</p>
                </div>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
