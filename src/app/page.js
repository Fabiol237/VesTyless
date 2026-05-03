'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import VoiceSearchButton from '@/components/VoiceSearchButton';

// ── SVG Icons ──────────────────────────────────────────────
const SearchIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const QrIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/><rect x="14" y="18" width="3" height="3" fill="none" opacity="0"/><path d="M18 14h.01M18 14v.01"/></svg>
);
const ArrowIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const StoreIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
);
const BagIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const StarIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const MapPinIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ZapIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const ShieldIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
const TruckIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><path d="M9 18h6"/><circle cx="19" cy="18" r="2"/></svg>
);
const HashIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
);

// ── Main Component ────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [featuredStores, setFeaturedStores] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'stores'
  const searchRef = useRef(null);

  useEffect(() => {
    loadFeatured();
  }, []);

  async function loadFeatured() {
    const [{ data: stores }, { data: products }] = await Promise.all([
      supabase.from('stores').select('id,name,slug,logo_url,city,store_code').eq('is_active', true).limit(8),
      supabase.from('products').select('id,name,price,image_url,store_id,stores(name,slug)').eq('is_active', true).order('created_at', { ascending: false }).limit(12),
    ]);
    setFeaturedStores(stores || []);
    setFeaturedProducts(products || []);
  }

  async function handleCodeSearch(e) {
    e.preventDefault();
    const code = codeQuery.trim();
    if (code.length !== 5 || isNaN(code)) {
      setCodeError('Entrez un code de 5 chiffres valide');
      return;
    }
    setCodeLoading(true);
    setCodeError('');
    setCodeResult(null);
    const { data } = await supabase.from('stores').select('id,name,slug,logo_url,city,description,whatsapp_number,store_code').eq('store_code', code).eq('is_active', true).single();
    setCodeLoading(false);
    if (data) setCodeResult(data);
    else setCodeError('Aucune boutique trouvée avec ce code.');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO — WhatsApp Style ══════════════════════════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-[#111B21] px-4 pt-24 pb-12">
        
        {/* Image de fond (Dragon Kali / Custom) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-lighten" 
            onError={(e) => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111B21]/80 via-[#111B21]/50 to-[#111B21]"></div>
        </div>

        {/* Animated background bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10 animate-bounce-slow"
              style={{
                width: `${[300,200,150,400,180,250][i]}px`,
                height: `${[300,200,150,400,180,250][i]}px`,
                background: ['#25D366','#128C7E','#075E54','#25D366','#128C7E','#075E54'][i],
                top: `${[10,60,30,5,70,40][i]}%`,
                left: `${[70,10,80,20,60,45][i]}%`,
                animationDelay: `${i * 0.7}s`,
                filter: 'blur(80px)',
              }}
            />
          ))}
        </div>

        {/* Badge */}
        <div className="relative z-10 mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs font-bold uppercase tracking-widest">
          <div className="w-2 h-2 bg-[#25D366] rounded-full animate-ping" />
          Le marketplace du Cameroun
        </div>

        {/* Title */}
        <h1 className="relative z-10 text-center text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none mb-4">
          Ves<span className="text-[#25D366]">Tyle</span>
        </h1>
        <p className="relative z-10 text-center text-white/50 font-medium text-lg max-w-md mb-10">
          Trouvez les meilleures boutiques et produits — en ligne ou hors ligne.
        </p>

        {/* Search Bar — WhatsApp Green */}
        <form onSubmit={handleSearch} className="relative z-10 w-full max-w-2xl">
          <div className="relative flex items-center bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="pl-6 text-neutral-400">
              <SearchIcon size={22} />
            </div>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Chercher un produit, une boutique..."
              className="flex-1 py-5 px-4 text-neutral-900 text-lg font-medium bg-transparent border-none outline-none placeholder:text-neutral-400"
            />
            <VoiceSearchButton 
              onInterimResult={(text) => setSearchQuery(text)}
              onResult={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(text.trim())}`;
                }
              }} 
              className="p-3 mr-1 hover:text-[#25D366]"
            />
            <button type="submit" className="m-2 px-8 py-3 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/30 text-sm uppercase tracking-wide whitespace-nowrap">
              Chercher
            </button>
          </div>
        </form>

        {/* Trust pills */}
        <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-3">
          {[
            { icon: <ShieldIcon size={14} />, label: 'Paiement Sécurisé' },
            { icon: <TruckIcon size={14} />, label: 'Livraison Rapide' },
            { icon: <ZapIcon size={14} />, label: 'Accès Hors-ligne' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/70 text-xs font-bold">
              <span className="text-[#25D366]">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-1 animate-bounce-slow">
          <div className="w-0.5 h-8 bg-white/20 rounded-full" />
        </div>
      </section>

      {/* ═══ CODE LOOKUP ═══════════════════════════════════════ */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-gradient-to-r from-[#128C7E]/5 to-[#25D366]/5 border border-[#25D366]/20 rounded-3xl p-6 md:p-8">
            <div className="flex-shrink-0 w-14 h-14 bg-[#128C7E] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#128C7E]/30">
              <HashIcon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-[#128C7E] uppercase tracking-widest mb-1">Accès Direct</p>
              <h2 className="text-xl font-black text-neutral-900 mb-1">Vous avez un code boutique ?</h2>
              <p className="text-sm text-neutral-500 font-medium">Tapez le code à 5 chiffres pour accéder directement.</p>
            </div>
            <form onSubmit={handleCodeSearch} className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                maxLength={5}
                value={codeQuery}
                onChange={e => { setCodeQuery(e.target.value.replace(/\D/g, '')); setCodeError(''); setCodeResult(null); }}
                placeholder="00000"
                className="w-36 px-5 py-3.5 bg-white border-2 border-neutral-200 focus:border-[#25D366] rounded-2xl text-2xl font-black text-center tracking-[0.3em] outline-none transition-all"
              />
              <button type="submit" disabled={codeLoading} className="px-6 py-3.5 bg-[#128C7E] text-white font-black rounded-2xl hover:bg-[#075E54] transition-colors disabled:opacity-50 flex items-center gap-2">
                {codeLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowIcon size={18} />}
              </button>
            </form>
          </div>

          {codeError && (
            <div className="mt-4 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">{codeError}</div>
          )}

          {codeResult && (
            <Link href={`/boutique/${codeResult.slug}`} className="mt-4 flex items-center gap-5 p-5 bg-white border-2 border-[#25D366] rounded-3xl hover:shadow-xl hover:shadow-[#25D366]/10 transition-all group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-neutral-100 flex-shrink-0 bg-neutral-50">
                {codeResult.logo_url ? <img src={codeResult.logo_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[#128C7E]">{codeResult.name[0]}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-neutral-900 text-lg truncate">{codeResult.name}</p>
                <p className="text-sm text-neutral-500 font-medium">{codeResult.city || 'Cameroun'}</p>
                <p className="text-[10px] font-black text-[#128C7E] uppercase tracking-widest mt-1">Code #{codeResult.store_code}</p>
              </div>
              <ArrowIcon className="text-[#128C7E] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          )}
        </div>
      </section>

      {/* ═══ DISCOVERY FEED ════════════════════════════════════ */}
      <section id="explore" className="max-w-7xl mx-auto px-4 py-12 space-y-10">

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-neutral-100 shadow-sm w-fit">
          {[
            { key: 'products', label: 'Produits', icon: <BagIcon size={16} /> },
            { key: 'stores', label: 'Boutiques', icon: <StoreIcon size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === tab.key ? 'bg-[#128C7E] text-white shadow-lg shadow-[#128C7E]/20' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.length === 0 ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-neutral-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
                    <div className="h-4 bg-neutral-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/boutique/${p.stores?.slug}?product=${p.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-[#128C7E]/8 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                  prefetch
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50">
                    {p.image_url
                      ? <img src={p.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={p.name} loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-neutral-200"><BagIcon size={48} /></div>
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-black text-neutral-900 text-sm truncate mb-1">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#128C7E] text-base">{Number(p.price).toLocaleString()} F</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <StarIcon size={11} /> <span className="text-[10px] font-bold text-neutral-400">4.9</span>
                      </div>
                    </div>
                    {p.stores?.name && (
                      <p className="text-[10px] font-bold text-neutral-400 mt-1 truncate flex items-center gap-1">
                        <StoreIcon size={10} className="text-[#25D366]" /> {p.stores.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Stores Grid */}
        {activeTab === 'stores' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredStores.length === 0 ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 animate-pulse flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded-full" />
                    <div className="h-3 bg-neutral-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))
            ) : (
              featuredStores.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/boutique/${s.slug}`}
                  className="group bg-white rounded-3xl p-5 border border-neutral-100 hover:shadow-xl hover:shadow-[#128C7E]/8 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                  prefetch
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-neutral-100 flex-shrink-0 bg-neutral-50">
                      {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-cover" alt="" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center font-black text-xl text-[#128C7E]">{s.name[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-neutral-900 truncate">{s.name}</p>
                      {s.city && <p className="text-xs text-neutral-400 font-medium flex items-center gap-1"><MapPinIcon size={11} /> {s.city}</p>}
                      {s.store_code && <p className="text-[10px] font-black text-[#128C7E] mt-1">#{s.store_code}</p>}
                    </div>
                    <ArrowIcon size={16} className="text-neutral-300 group-hover:text-[#128C7E] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href={activeTab === 'products' ? '/search' : '/boutiques'} className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
            Voir tout <ArrowIcon size={18} />
          </Link>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════ */}
      <section className="bg-[#111B21] text-white px-4 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: <ZapIcon size={28} className="text-[#25D366]" />, title: 'Ultra Rapide', desc: 'Pages pré-chargées, navigation instantanée même sans connexion.' },
            { icon: <QrIcon size={28} />, title: 'QR & Code 5 Digits', desc: 'Scannez un QR ou tapez le code pour accéder à n\'importe quelle boutique.' },
            { icon: <ShieldIcon size={28} className="text-[#25D366]" />, title: '100% Sécurisé', desc: 'Commandes protégées, WhatsApp direct, aucune donnée vendue.' },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">{f.icon}</div>
              <h3 className="font-black text-lg">{f.title}</h3>
              <p className="text-sm text-white/50 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0D1417] text-white/30 text-xs font-bold text-center py-8 uppercase tracking-widest">
        © 2026 VesTyle — Douala, Cameroun
      </footer>
    </div>
  );
}
