'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { MapPin, Search, Store } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans overflow-x-hidden text-neutral-800">
      <Navbar />
      
      {/* WhatsApp Styled Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-wa-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            
            {/* Location Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6 sm:mb-8 text-sm font-medium text-wa-teal-dark border border-neutral-200/60">
              <div className="bg-wa-chat text-wa-teal p-1.5 rounded-full">
                <MapPin size={16} />
              </div>
              Boutiques autour de vous
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-tight mb-6">
              Le marché de votre ville,<br/>
              <span className="text-wa-teal">dans votre poche.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discutez, achetez et soutenez le commerce local. Retrouvez vos vendeurs préférés sur une interface ultra-rapide et sécurisée.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <a href="#explore" className="w-full sm:w-auto px-8 py-3.5 bg-wa-green text-white rounded-full font-bold hover:bg-wa-teal transition-colors flex items-center justify-center gap-2 shadow-sm text-base">
                <Search size={20} /> Chercher un article
              </a>
              <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-white text-wa-teal-dark rounded-full font-bold hover:bg-neutral-50 border border-neutral-200 transition-colors flex items-center justify-center gap-2 text-base shadow-sm">
                <Store size={20} /> Créer ma boutique
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="explore" className="flex-1 w-full py-16 relative z-10 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-neutral-500 italic">Recherche et boutiques à venir...</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
