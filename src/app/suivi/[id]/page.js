'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronLeft,
  AlertCircle,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const STEPS = [
  { status: 'pending', label: 'Commande reçue', icon: Clock, desc: 'Nous avons bien reçu votre commande.' },
  { status: 'processing', label: 'En préparation', icon: Package, desc: 'Le vendeur prépare vos articles avec soin.' },
  { status: 'shipped', label: 'En cours de livraison', icon: Truck, desc: 'Votre colis est en route vers chez vous.' },
  { status: 'delivered', label: 'Livraison réussie', icon: CheckCircle2, desc: 'Le colis a été remis en mains propres.' }
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, stores(name, logo_url, phone, city)')
        .eq('id', id)
        .single();
      
      if (!error) setOrder(data);
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Commande introuvable</h1>
        <p className="text-slate-500 mt-2">Le lien semble expiré ou erroné.</p>
        <Link href="/" className="mt-6 text-wa-teal font-bold border-b-2 border-wa-teal pb-1">Retour à l'accueil</Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-wa-teal text-white p-6 pb-20 rounded-b-[40px] shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Suivi de commande</h1>
            <p className="font-serif text-lg font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 -mt-12">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
        >
          {isCancelled ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Commande Annulée</h2>
              <p className="text-slate-500 text-sm mt-1">Désolé, cette commande a été annulée par le vendeur ou le client.</p>
            </div>
          ) : (
            <div className="space-y-10 relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100" />
              
              {STEPS.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex gap-6 relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-colors duration-500 ${isActive ? 'bg-wa-teal text-white shadow-lg shadow-wa-teal/20' : 'bg-slate-50 text-slate-300'}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-bold text-base ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-slate-500 font-medium' : 'text-slate-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                    {isCurrent && (
                       <div className="absolute -left-1 top-5 w-14 h-2 bg-wa-teal/5 blur-xl animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Store Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            {order.stores?.logo_url ? <img src={order.stores.logo_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-wa-teal font-black text-xl">{order.stores?.name[0]}</div>}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Boutique</h4>
            <p className="font-bold text-slate-900">{order.stores?.name}</p>
          </div>
          <a href={`tel:${order.stores?.phone}`} className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 transition-colors">
            <Phone size={20} />
          </a>
        </motion.div>

        {/* Order Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-3xl p-8 shadow-md border border-slate-100"
        >
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-6">Récapitulatif</h3>
          <div className="space-y-4">
             {order.order_items && order.order_items.map((item, i) => (
               <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">x{item.quantity} {item.name}</span>
                  <span className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString('fr-FR')} F</span>
               </div>
             ))}
             <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Payé</span>
                <span className="text-xl font-black text-wa-teal">{Number(order.total_amount).toLocaleString('fr-FR')} F</span>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
