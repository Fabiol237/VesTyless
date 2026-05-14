'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { 
  Printer, ShoppingBag, MapPin, Phone, 
  Calendar, CheckCircle2, ShieldCheck, 
  Fingerprint, Award, Globe, Scale,
  ChevronLeft, Share2, Verified, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    return Math.abs(hash).toString(16).toUpperCase();
  };

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
        setTimeout(() => setLoading(false), 1500); // Animation delay for premium feel
      }
    };

    if (id) fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-20 h-20 border-4 border-wa-teal/20 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-wa-teal rounded-full animate-spin [animation-duration:800ms]"></div>
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wa-teal" size={32} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-wa-teal mb-2">Authentification Sécurisée</p>
          <p className="text-slate-400 text-xs font-medium italic">Génération du certificat de propriété...</p>
        </div>
      </motion.div>
    </div>
  );

  if (!order || (!order.can_print_invoice && order.status !== 'delivered')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
        <div className="relative mb-12">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute inset-0 bg-wa-teal blur-[100px] rounded-full"
           />
           <div className="relative w-32 h-32 bg-slate-900 border-2 border-wa-teal/30 rounded-[40px] flex items-center justify-center shadow-2xl">
              <ShieldCheck size={56} className="text-wa-teal animate-pulse" />
           </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-lg"
        >
          <h1 className="text-4xl font-luxury font-black text-white tracking-[0.2em] uppercase">Sceau Électronique</h1>
          <div className="h-px w-24 bg-wa-teal mx-auto opacity-30" />
          <p className="text-slate-400 font-medium leading-relaxed tracking-wide italic">
            Ce certificat de propriété est actuellement sous scellé numérique. 
            Il sera libéré et certifié officiellement dès que la livraison aura été validée par nos agents sur le terrain.
          </p>
          <div className="pt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10">
               <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">En attente de certification logistique</span>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="text-[10px] font-black text-wa-teal uppercase tracking-[0.4em] hover:text-white transition-colors"
            >
              Retour au suivi en temps réel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const authHash = generateAuthHash(order);
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/suivi/${order.id}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}&bgcolor=FDFCFB`;

  return (
    <div className="min-h-screen bg-[#0F172A] selection:bg-wa-teal selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        
        .font-luxury { font-family: 'Cinzel', serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .document-wrapper { padding: 0 !important; transform: none !important; background: white !important; }
          .invoice-card { box-shadow: none !important; border: 1px solid #E5E7EB !important; border-radius: 0 !important; max-width: 100% !important; margin: 0 !important; }
          @page { margin: 1cm; }
        }

        .paper-texture {
          background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
          pointer-events: none;
        }

        .gold-leaf {
          background: linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .document-shadow {
          box-shadow: 
            0 10px 30px -10px rgba(0,0,0,0.5),
            0 40px 120px -30px rgba(0,0,0,0.7),
            inset 0 0 1px 1px rgba(255,255,255,0.05);
        }
      `}</style>

      {/* Barre d'outils ultra-premium */}
      <div className="fixed top-0 left-0 w-full z-[100] p-6 flex justify-between items-center no-print bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-wa-teal transition-all"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour au suivi
        </button>
        
        <div className="flex gap-4">
          <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
             <Share2 size={18} />
          </button>
          <button 
            onClick={handlePrint}
            className="group relative bg-wa-teal text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 overflow-hidden shadow-[0_20px_40px_-15px_rgba(18,140,126,0.4)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Printer size={18} /> Générer le PDF Officiel
          </button>
        </div>
      </div>

      {/* CONTENEUR DU DOCUMENT */}
      <div className="document-wrapper pt-32 pb-24 px-4 sm:px-12 flex justify-center perspective-[2000px]">
        <motion.div 
          initial={{ opacity: 0, rotateX: 10, y: 100 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="invoice-card document-shadow relative w-full max-w-[900px] bg-[#FDFCFB] rounded-[24px] overflow-hidden"
        >
          {/* Grain de papier et texture */}
          <div className="absolute inset-0 paper-texture opacity-30 z-0"></div>
          
          {/* Bordure de luxe */}
          <div className="absolute inset-4 border-[3px] border-double border-wa-teal/10 pointer-events-none z-[1]"></div>
          <div className="absolute inset-8 border border-wa-teal/5 pointer-events-none z-[1]"></div>

          {/* HEADER - SCELLEMENT OFFICIEL */}
          <div className="relative z-10 px-12 pt-20 pb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-12">
            <div className="space-y-8 max-w-lg">
               <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center shadow-2xl relative">
                     <div className="absolute inset-0 bg-wa-teal/20 blur-xl"></div>
                     <img src="/icon-512.png" className="w-full h-full object-cover rounded-[20px] relative z-10 border border-white/10" alt="Vestyle" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-luxury font-black tracking-[0.2em] text-slate-900 uppercase">Ves<span className="text-wa-teal">Tyle</span></h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-wa-teal mt-1 ml-1 opacity-80">Official Transaction Seal</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h2 className="text-5xl sm:text-6xl font-serif font-black text-slate-900 leading-[0.9] tracking-tighter italic">Certificat d&apos;Authenticité</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                      <Verified size={12} className="text-wa-teal" /> Document Certifié
                    </span>
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase border-l border-slate-200 pl-4">
                      ID: #{order.id.slice(0, 16).toUpperCase()}
                    </span>
                  </div>
               </div>
            </div>

            <div className="relative">
               {/* QR CODE - PHYSICAL LOOK */}
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: -2 }}
                 className="bg-white p-5 rounded-[40px] shadow-2xl border border-slate-50 relative group cursor-help overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-wa-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                  <img src={qrUrl} alt="Vérification" className="w-40 h-40 mix-blend-multiply" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-md">
                     <Sparkles size={16} className="text-wa-teal" />
                  </div>
                  <p className="text-[8px] font-black uppercase text-center mt-4 text-slate-400 tracking-[0.3em] opacity-60">Validation Publique</p>
               </motion.div>
            </div>
          </div>

          {/* CORPS DU DOCUMENT - LAYOUT ÉPURÉ ET LUXE */}
          <div className="relative z-10 px-12 sm:px-20 pb-20 space-y-20">
            
            {/* GRILLE D'INFORMATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-12 border-t border-slate-100">
               {/* VENDEUR */}
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-wa-teal border border-slate-100 shadow-sm">
                        <Award size={18} />
                     </div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Propriétaire Originel</h3>
                  </div>
                  <div className="space-y-4 pl-2">
                     <p className="text-3xl font-serif font-black text-slate-900 leading-tight italic">{store?.name || 'Vendeur Agréé'}</p>
                     <div className="space-y-2 text-[11px] font-semibold text-slate-500 leading-relaxed max-w-[200px]">
                        <p className="flex items-start gap-3 uppercase tracking-tighter leading-tight"><MapPin size={12} className="mt-0.5 text-wa-teal shrink-0" /> {store?.address || store?.city || 'Douala, Cameroun'}</p>
                        <p className="flex items-center gap-3"><Phone size={12} className="text-wa-teal" /> {store?.whatsapp_number || store?.phone}</p>
                     </div>
                     <div className="inline-block px-4 py-1 border border-wa-teal/20 rounded-lg text-[9px] font-black text-wa-teal uppercase tracking-widest">
                       Boutique Vérifiée 2026
                     </div>
                  </div>
               </div>

               {/* CLIENT */}
               <div className="space-y-8 md:text-right md:items-end flex flex-col">
                  <div className="flex items-center gap-4 md:flex-row-reverse">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-wa-teal border border-slate-100 shadow-sm">
                        <Fingerprint size={18} />
                     </div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Nouveau Détenteur</h3>
                  </div>
                  <div className="space-y-4 pr-2">
                     <p className="text-3xl font-serif font-black text-slate-900 leading-tight italic">{order.customer_name}</p>
                     <div className="space-y-2 text-[11px] font-semibold text-slate-500 leading-relaxed md:items-end flex flex-col">
                        <p className="flex items-center gap-3 md:flex-row-reverse"><Phone size={12} className="text-wa-teal" /> {order.customer_phone}</p>
                        <p className="flex items-start gap-3 md:flex-row-reverse text-right uppercase tracking-tighter leading-tight"><MapPin size={12} className="mt-0.5 text-wa-teal shrink-0" /> {order.shipping_address || 'Adresse certifiée'}</p>
                     </div>
                     <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        Acquis le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                  </div>
               </div>
            </div>

            {/* TABLE DES ARTICLES - MINIMALISTE ET PRO */}
            <div className="space-y-8">
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center italic">Inventaire de Propriété</h3>
               <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Désignation</th>
                        <th className="py-6 text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Quantité</th>
                        <th className="py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Valeur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(order.order_items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-8">
                            <p className="text-lg font-serif font-black text-slate-900 italic">{item.name}</p>
                            <p className="text-[8px] font-black text-wa-teal uppercase tracking-[0.4em] mt-1">Authentic ID: {item.id.slice(0, 12)}</p>
                          </td>
                          <td className="py-8 text-center text-sm font-black text-slate-500">× {item.quantity}</td>
                          <td className="py-8 text-right font-luxury text-xl font-bold text-slate-900">{item.price.toLocaleString()} F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* TOTAL ET SIGNATURES */}
            <div className="pt-20 flex flex-col md:flex-row justify-between items-center gap-16">
               {/* SCEAU DORÉ */}
               <div className="relative group flex items-center justify-center no-print">
                  <div className="absolute inset-0 bg-wa-teal/10 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex flex-col items-center justify-center border-4 border-wa-teal/20 relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                     <CheckCircle2 size={32} className="text-wa-teal mb-1 relative z-10" />
                     <p className="text-[9px] font-black text-wa-teal relative z-10 tracking-[0.2em]">SCELLÉ</p>
                  </div>
               </div>

               <div className="flex-1 w-full md:w-auto text-right space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Valeur Totale Certifiée</p>
                  <div className="flex flex-col items-end">
                     <span className="text-7xl sm:text-8xl font-luxury font-black text-slate-900 tracking-tighter flex items-start gap-2">
                        {order.total_amount.toLocaleString()} <span className="text-xs mt-4 tracking-normal">FCFA</span>
                     </span>
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] italic mt-2">
                       + Frais Logistiques Premium Inclus
                     </p>
                  </div>
               </div>
            </div>

            {/* FOOTER LÉGAL - FINGERPRINT */}
            <div className="pt-20 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-10">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-slate-200 border border-slate-50">
                     <Fingerprint size={32} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 mb-1">Empreinte Cryptographique</p>
                     <p className="text-[11px] font-mono font-black text-slate-900 tracking-wider uppercase bg-slate-50 px-3 py-1 rounded-lg">{authHash}</p>
                  </div>
               </div>

               <div className="text-center sm:text-right space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Archives Digitales</p>
                  <p className="text-xs font-black text-slate-900 uppercase italic">Vestyle Pro • Network Authority</p>
                  <p className="text-[8px] font-bold text-slate-300 tracking-tighter italic">Généré sur infrastructure sécurisée via VesTyle Cloud Node #{order.id.slice(0, 4)}</p>
               </div>
            </div>
          </div>
          
          {/* BARRE FINALE - SIGNATURE VISUELLE */}
          <div className="h-4 w-full bg-slate-900 flex">
             <div className="h-full w-1/4 bg-wa-teal opacity-50"></div>
             <div className="h-full w-1/4 bg-wa-teal opacity-70"></div>
             <div className="h-full w-1/4 bg-wa-teal opacity-90"></div>
             <div className="h-full w-1/4 bg-wa-teal"></div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER PAGE */}
      <div className="pb-12 text-center no-print">
         <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-white/10"></div>
            <ShieldCheck size={16} className="text-wa-teal opacity-50" />
            <div className="h-px w-12 bg-white/10"></div>
         </div>
         <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
           Vestyle Security Framework • 2026 • All Rights Reserved
         </p>
      </div>
    </div>
  );
}
