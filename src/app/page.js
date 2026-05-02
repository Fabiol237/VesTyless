'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDiscovery from '@/components/ClientDiscovery';
import { supabase } from '@/lib/supabase';
import { publicProductsIndex } from '@/lib/meilisearch';
import Link from 'next/link';

// Bulletproof SVG Icons
const ShoppingBagIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const SparklesIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);
const StarIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const MapPinIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ArrowRightIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const ZapIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const StoreIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2 2 0 0 1-2-2V7"/></svg>
);
const TrendingUpIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const ShieldCheckIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
const LayersIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.3a2 2 0 0 0 0 3.67L11.17 14.1a2 2 0 0 0 1.66 0l9.07-4.12a2 2 0 0 0 0-3.67z"/><path d="m2.1 14.74 9.07 4.12a2 2 0 0 0 1.66 0l9.07-4.12"/><path d="m2.1 19.16 9.07 4.12a2 2 0 0 0 1.66 0l9.07-4.12"/></svg>
);
const SmartphoneIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
);
const ChevronRightIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

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
                    Explorer le catalogue <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-neutral-100 text-neutral-600 rounded-[2rem] font-black text-lg hover:border-wa-teal hover:text-wa-teal transition-all">
                  <StoreIcon size={20} /> Devenir Vendeur
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 flex items-center gap-6 text-sm font-bold text-neutral-400">
                <div className="flex items-center gap-2"><ShieldCheckIcon size={18} className="text-wa-green" /> Paiement Sécurisé</div>
                <div className="flex items-center gap-2"><ZapIcon size={18} className="text-orange-400" /> Livraison Flash</div>
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
                     <StarIcon size={12} fill="currentColor" /> 4.9 (128 avis)
                   </div>
                 </div>
              </div>

              {/* Floating Element 2: Sales notification */}
              <div className="absolute bottom-32 -right-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-30 flex items-center gap-4 animate-bounce-slow border border-white" style={{ animationDelay: '1.5s' }}>
                 <div className="w-10 h-10 bg-wa-green/20 text-wa-green rounded-full flex items-center justify-center">
                   <TrendingUpIcon size={18} />
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
