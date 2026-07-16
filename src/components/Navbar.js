'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';


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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80 py-2 sm:py-3 transition-all duration-300 shadow-sm shadow-slate-100/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">

        {/* Left: LOGO */}
        <Link href="/" className="flex items-center gap-4 group z-50">
          <div className="relative w-16 h-16 rounded-2xl overflow-visible shadow-md flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105">
            {/* Lueur externe dynamique */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Gradient background premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-2xl"></div>
            
            {/* Bordure de brillance */}
            <div className="absolute inset-0 border border-white/30 rounded-2xl"></div>
            
            {/* Image du logo agrandie et sublimée */}
            <img src="/icon-512.png" className="w-12 h-12 object-cover relative z-10 contrast-125 brightness-110 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" alt="Vestyle" />
            
            {/* Reflet au survol */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300" style={{fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: '900'}}>
              Vestyle
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/80">Live Marketplace</span>
          </div>
        </Link>

        {/* Right: DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-600">
            <ShoppingCartIcon size={22} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10.5px] font-bold h-5.5 w-5.5 flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                {totalCartItems}
              </span>
            )}
          </Link>

          <button
            onClick={toggleDataSaver}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${dataSaver ? 'bg-orange-500 text-white shadow-sm shadow-orange-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <ZapIcon size={12} /> {dataSaver ? 'Lite ON' : 'Lite Mode'}
          </button>

          <Link href="/mes-commandes" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 border border-slate-100" title="Suivre mes commandes">
            <PackageIcon size={14} /> Mes Commandes
          </Link>

          <Link
            href="/profile"
            className="p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-600"
          >
            <UserIcon size={22} />
          </Link>

          {session ? (
            <div className="flex items-center gap-1 pl-3 border-l border-slate-200/80 ml-1">
              <Link href="/dashboard" className="p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-600" title="Tableau de bord vendeur">
                <StoreIcon size={20} />
              </Link>
              <button onClick={() => signOut()} className="p-2.5 rounded-xl transition-all duration-200 hover:bg-rose-50 text-rose-500 hover:text-rose-600" title="Déconnexion">
                <LogOutIcon size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center pl-3 border-l border-slate-200/80 ml-1">
              <Link href="/login" className="text-xs font-bold px-4 py-2.5 rounded-xl transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100/50 hover:shadow-emerald-200 hover:scale-[1.02]">
                Vendre
              </Link>
            </div>
          )}
        </nav>

        {/* Right: MOBILE TOGGLE - Encapsulated in a premium glass capsule */}
        <div className="flex md:hidden items-center gap-1 bg-slate-50/90 border border-slate-100/80 p-1.5 rounded-full shadow-sm z-50">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-white text-slate-700 transition-colors">
            <ShoppingCartIcon size={18} />
            {totalCartItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm border border-white">
                {totalCartItems}
              </span>
            )}
          </Link>
          <button onClick={() => router.push('/profile')} className="p-2 rounded-full hover:bg-white text-slate-700 transition-colors">
            <UserIcon size={18} />
          </button>
          <button
            className="p-2 rounded-full focus:outline-none hover:bg-white text-slate-850 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden fixed inset-0 bg-[#0a1628]/98 backdrop-blur-2xl z-40 flex flex-col transition-all duration-300 pt-24 px-6 ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <nav className="flex flex-col gap-2 text-base font-bold text-white">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-4 border-b border-white/10 hover:text-[#25D366] transition-colors text-white">Accueil <ArrowRightIcon size={16} className="text-slate-400" /></Link>
          <Link href="/mes-commandes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-4 border-b border-white/10 hover:text-[#25D366] transition-colors text-white">Mes Commandes <PackageIcon size={18} className="text-[#25D366]" /></Link>

          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-4 border-b border-white/10 text-[#25D366] hover:text-emerald-400 font-bold transition-colors">Tableau de Bord Vendeur <StoreIcon size={18} /></Link>
              <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center justify-between py-4 text-rose-500 text-left font-bold transition-colors">Déconnexion <LogOutIcon size={18} /></button>
            </>
          ) : (
            <div className="mt-8 flex flex-col">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-[#25D366] text-slate-950 py-4 rounded-2xl text-center font-black uppercase tracking-wider shadow-lg shadow-[#25D366]/20">Connexion Vendeur</Link>
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

