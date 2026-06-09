'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { useUserPreferences } from '@/hooks/useUserPreferences';

// Bulletproof SVG Icons (Bypassing Lucide/Turbopack bug)
const ShoppingCartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
);
const MenuIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
const XIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const StoreIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2 2 0 0 1-2-2V7" /></svg>
);
const LogOutIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const ArrowRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
const UserIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const PackageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" /></svg>
);
const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchQuery, setSearchQuery] = useState("");
  const { addSearch } = useUserPreferences();
  const { session, signOut } = useAuth();
  const { cart } = useCart();
  const [dataSaver, setDataSaver] = useState(false);
  const [dataSaverToast, setDataSaverToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('vestyle_data_saver') === 'true';
    setDataSaver(saved);
  }, []);

  const toggleDataSaver = () => {
    const newVal = !dataSaver;
    setDataSaver(newVal);
    localStorage.setItem('vestyle_data_saver', String(newVal));
    window.dispatchEvent(new Event('storage'));
    if (newVal) {
      setDataSaverToast(true);
      setTimeout(() => setDataSaverToast(false), 3000);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearch(searchQuery.trim());
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm text-slate-900 border-b border-slate-100' : 'bg-transparent text-white'} py-3 sm:py-4`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">

        {/* Left: LOGO */}
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="relative w-14 h-14 rounded-xl overflow-visible shadow-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            {/* Gradient background ultra-lumineux */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500"></div>
            
            {/* Effet de lueur externe */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
            
            {/* Bordure brillante */}
            <div className="absolute inset-0 border-3 border-white/60 rounded-xl group-hover:border-white transition-all duration-300"></div>
            
            {/* Image avec contraste amélioré */}
            <img src="/icon-512.png" className="w-11 h-11 object-cover relative z-10 contrast-150 brightness-110" alt="Vestyle" />
            
            {/* Reflet blanc */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-white/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            {/* Animation pulse */}
            <div className="absolute inset-0 rounded-xl animate-pulse bg-white/10"></div>
          </div>
          <span className={`text-2xl font-black hidden sm:block tracking-wide ${isScrolled ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-emerald-300 to-white bg-clip-text text-transparent'} group-hover:from-emerald-200 group-hover:to-cyan-200 transition-all duration-300`} style={{fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: '800', letterSpacing: '0.06em'}}>
            Vestyle
          </span>
        </Link>

        {/* Center: SEARCH (Desktop) - Hide on home page to avoid redundancy with Hero search */}
        {!isHomePage && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isScrolled ? 'bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-200' : 'bg-white/10 text-white placeholder-white/70 border-white/20'} border rounded-full pl-5 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner`}
            />
            <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center gap-1">
              <VoiceSearchButton
                onInterimResult={(text) => setSearchQuery(text)}
                onResult={(text) => {
                  setSearchQuery(text);
                  router.push(`/search?q=${encodeURIComponent(text.trim())}`);
                }}
                className={`p-1.5 rounded-full ${isScrolled ? 'text-slate-400 hover:text-emerald-600 hover:bg-slate-200' : 'text-white/80 hover:text-white hover:bg-white/20'} transition-colors`}
              />
              <button type="submit" className={`p-1.5 rounded-full flex items-center justify-center ${isScrolled ? 'text-slate-400 hover:text-emerald-600 hover:bg-slate-200' : 'text-white/80 hover:text-white hover:bg-white/20'} transition-colors`}>
                <SearchIcon size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Right: DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/cart" className={`relative p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-slate-100 text-slate-700 hover:text-emerald-600' : 'text-white hover:bg-white/20'}`}>
            <ShoppingCartIcon size={22} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                {totalCartItems}
              </span>
            )}
          </Link>

          <button
            onClick={toggleDataSaver}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${dataSaver ? 'bg-orange-500 text-white animate-pulse shadow-lg' : isScrolled ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            <ZapIcon size={12} /> {dataSaver ? 'Lite ON' : 'Lite Mode'}
          </button>

          <Link href="/mes-commandes" className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isScrolled ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Suivre mes commandes">
            <PackageIcon size={14} /> Mes Commandes
          </Link>

          <Link
            href="/profile"
            className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-slate-100 text-slate-700 hover:text-emerald-600' : 'text-white hover:bg-white/20'}`}
          >
            <UserIcon size={22} />
          </Link>

          {session ? (
            <div className="flex items-center gap-1 pl-2 border-l border-white/20 ml-1">
              <Link href="/dashboard" className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-slate-100 text-slate-700 hover:text-emerald-600' : 'text-white hover:bg-white/20'}`} title="Tableau de bord vendeur">
                <StoreIcon size={20} />
              </Link>
              <button onClick={() => signOut()} className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-rose-50 text-rose-500' : 'text-white hover:bg-white/20 hover:text-rose-200'}`} title="Déconnexion">
                <LogOutIcon size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center pl-2 ml-1">
              <Link href="/login" className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${isScrolled ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md' : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md'}`}>
                Vendre
              </Link>
            </div>
          )}
        </nav>

        {/* Right: MOBILE TOGGLE */}
        <div className={`flex md:hidden items-center gap-2 z-50 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>
          <Link href="/cart" className={`relative p-2 rounded-full ${isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/20'}`}>
            <ShoppingCartIcon size={22} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                {totalCartItems}
              </span>
            )}
          </Link>
          <button onClick={() => router.push('/profile')} className={`p-2 rounded-full ${isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/20'}`}>
            <UserIcon size={22} />
          </button>
          <button
            className={`p-2 rounded-full focus:outline-none ${isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/20'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden fixed inset-0 bg-white z-40 flex flex-col transition-transform duration-200 pt-20 px-4 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 text-neutral-900 rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-wa-teal"
          />
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
            <VoiceSearchButton
              onInterimResult={(text) => setSearchQuery(text)}
              onResult={(text) => {
                setSearchQuery(text);
                router.push(`/search?q=${encodeURIComponent(text.trim())}`);
                setIsMobileMenuOpen(false);
              }}
              className="p-1.5 text-neutral-500 hover:text-wa-teal transition-colors"
            />
            <button type="submit" className="p-1.5 text-neutral-500">
              <SearchIcon size={20} />
            </button>
          </div>
        </form>

        <nav className="flex flex-col gap-1 text-base font-medium text-neutral-800">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100">Accueil <ArrowRightIcon size={16} className="text-neutral-400" /></Link>
          <Link href="/mes-commandes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100">Mes Commandes <PackageIcon size={18} className="text-wa-teal" /></Link>

          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100 text-wa-teal">Tableau de Bord Vendeur <StoreIcon size={18} /></Link>
              <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center justify-between py-3 text-red-500 text-left">Déconnexion <LogOutIcon size={18} /></button>
            </>
          ) : (
            <div className="mt-4 flex flex-col">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-wa-teal text-white py-3 rounded-lg text-center font-medium">Connexion Vendeur</Link>
            </div>
          )}
        </nav>
      </div>

      {/* LITE MODE TOAST */}
      {dataSaverToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-fade-in">
          <ZapIcon size={16} /> Mode Lite activé — images masquées pour économiser votre DATA
        </div>
      )}
    </header>
  );
}
