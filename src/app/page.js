'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDiscovery from '@/components/ClientDiscovery';
import { 
  ShoppingBag, Search, Sparkles, Star, MapPin, ArrowRight,
  TrendingUp, ShieldCheck, Zap, Layers, Smartphone,
  Menu, X, ChevronRight, Package, Store, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-[#F8F9FA] text-neutral-900">
      <Navbar />

      {/* ═══════════════════════════════════════════
          ULTRA PREMIUM HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-[#E8F5F3] to-[#F8F9FA]">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-wa-teal/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-wa-green/10 rounded-full blur-[100px] mix-blend-multiply opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="space-y-8 animate-fade-in relative z-20">
              <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm text-wa-teal-dark rounded-full text-xs font-black uppercase tracking-[0.2em]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-wa-green"></span>
                </span>
                Le Marché Premium de Douala
              </div>
              
              <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black text-neutral-900 leading-[1.05] tracking-tight">
                L&apos;excellence<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-wa-teal to-emerald-400">
                  à portée de clic.
                </span>
              </h1>
              
              <p className="text-neutral-500 text-lg sm:text-xl max-w-lg font-medium leading-relaxed">
                Plongez dans un écosystème exclusif regroupant les boutiques et restaurants les plus prestigieux. Achetez, discutez sur WhatsApp, et faites-vous livrer en temps réel.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <a href="#explore" className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 text-white rounded-[2rem] font-black text-lg overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-neutral-900/20">
                  <span className="absolute inset-0 bg-gradient-to-r from-wa-teal to-wa-green opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    Explorer le catalogue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-neutral-100 text-neutral-600 rounded-[2rem] font-black text-lg hover:border-wa-teal hover:text-wa-teal transition-all">
                  <Store size={20} /> Devenir Vendeur
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 flex items-center gap-6 text-sm font-bold text-neutral-400">
                <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-wa-green" /> Paiement Sécurisé</div>
                <div className="flex items-center gap-2"><Zap size={18} className="text-orange-400" /> Livraison Flash</div>
              </div>
            </div>

            {/* Right Column: Floating Complex UI */}
            <div className="relative hidden lg:block h-[600px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Central Phone Mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-white rounded-[3rem] border-[8px] border-neutral-900 shadow-2xl overflow-hidden z-20">
                <div className="absolute top-0 inset-x-0 h-6 bg-neutral-900 rounded-b-3xl z-30" />
                <div className="w-full h-full bg-wa-bg p-4 pt-12 relative">
                   {/* Dummy App Interface inside phone */}
                   <div className="space-y-4">
                     <div className="h-24 bg-wa-teal rounded-2xl shadow-inner p-4 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-full mb-2" />
                        <div className="h-4 w-24 bg-white/30 rounded" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="bg-white p-2 rounded-xl shadow-sm">
                           <div className="h-24 bg-neutral-100 rounded-lg mb-2" />
                           <div className="h-3 w-3/4 bg-neutral-200 rounded mb-1" />
                           <div className="h-3 w-1/2 bg-wa-teal/20 rounded" />
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              </div>

              {/* Floating Element 1: Store Card */}
              <div className="absolute top-20 -left-10 bg-white p-4 rounded-2xl shadow-xl shadow-neutral-900/10 z-30 flex items-center gap-4 animate-bounce-slow border border-white/50 backdrop-blur-md">
                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-black">Z</div>
                 <div>
                   <p className="font-black text-neutral-900 text-sm">Zoko Store</p>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                     <Star size={12} fill="currentColor" /> 4.9 (128 avis)
                   </div>
                 </div>
              </div>

              {/* Floating Element 2: Sales notification */}
              <div className="absolute bottom-32 -right-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-30 flex items-center gap-4 animate-bounce-slow border border-white" style={{ animationDelay: '1.5s' }}>
                 <div className="w-10 h-10 bg-wa-green/20 text-wa-green rounded-full flex items-center justify-center">
                   <TrendingUp size={18} />
                 </div>
                 <div>
                   <p className="font-bold text-neutral-900 text-xs">Nouvelle commande</p>
                   <p className="text-[10px] text-neutral-500">Il y a 2 minutes à Akwa</p>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION DISCOVERY — Vraies boutiques & produits
      ════════════════════════════════════════════ */}
      <div id="explore" className="flex-1 w-full relative bg-[#F8F9FA] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ClientDiscovery />
        </div>
      </div>

      <Footer />
    </main>
  );
}
