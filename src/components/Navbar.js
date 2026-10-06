'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const artFontClass = 'font-black tracking-tight';

// ── Icônes SVG bulletproof ────────────────────────────────────────────────────
const ShoppingCartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const MenuIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="7" y2="7" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="17" y2="17" />
  </svg>
);
const XIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const StoreIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" />
  </svg>
);
const LogOutIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const UserIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const PackageIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
  </svg>
);
const ZapIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const ArrowRightIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const HomeIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ── Composant Logo SVG inline (cohérent avec la page) ───────────────────────
function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group z-50">
      {/* Icône logo VeStyle */}
      <div className="relative w-11 h-11 rounded-[14px] overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
        <img src="/vestyle-logo.png" className="w-full h-full object-cover" alt="VesTyle Logo" />
        {/* Lueur hover */}
        <div className="absolute -inset-1 rounded-[16px] bg-gradient-to-tr from-blue-500/40 to-purple-500/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>

      {/* Texte */}
      <div className="flex flex-col leading-none">
        <span className={`text-[22px] font-extrabold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors duration-200 ${artFontClass}`}>
          Ves<span className="text-orange-600">Tyle</span>
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/80">Live Marketplace</span>
      </div>
    </Link>
  );
}

// ── NavButton helper ─────────────────────────────────────────────────────────
function NavBtn({ children, onClick, href, title, className = "", variant = "ghost" }) {
  const base = "relative flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
  const variants = {
    ghost: "p-2.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700",
    pill: "px-3.5 py-2 text-[11px] font-black uppercase tracking-widest border",
    solid: "px-4 py-2.5 text-[12px] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100",
    danger: "p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600",
  };
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) return <Link href={href} className={cls} title={title}>{children}</Link>;
  return <button onClick={onClick} className={cls} title={title}>{children}</button>;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, signOut } = useAuth();
  const { cart } = useCart();
  const [dataSaver, setDataSaver] = useState(false);
  const [dataSaverToast, setDataSaverToast] = useState(false);
  const router = useRouter();

  const totalCartItems = cart.reduce((t, i) => t + i.quantity, 0);

  useEffect(() => {
    const saved = localStorage.getItem('vestyle_data_saver') === 'true';
    setDataSaver(saved);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDataSaver = () => {
    const newVal = !dataSaver;
    setDataSaver(newVal);
    localStorage.setItem('vestyle_data_saver', String(newVal));
    window.dispatchEvent(new Event('storage'));
    if (newVal) {
      setDataSaverToast(true);
      setTimeout(() => setDataSaverToast(false), 3500);
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  BARRE DE NAVIGATION PRINCIPALE
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/92 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-100/50 py-2'
          : 'bg-white/75 backdrop-blur-lg border-b border-slate-100/60 py-3'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <NavLogo />

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-2">

            {/* Panier */}
            <NavBtn href="/cart" title="Mon panier" variant="ghost">
              <ShoppingCartIcon size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </NavBtn>

            {/* Mes commandes */}
            <NavBtn href="/mes-commandes" title="Suivre mes commandes" variant="pill"
              className="gap-2 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-200">
              <PackageIcon size={14} /> Commandes
            </NavBtn>

            {/* Lite Mode */}
            <button
              onClick={toggleDataSaver}
              title="Mode économiseur de données"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${dataSaver
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                }`}
            >
              <ZapIcon size={13} /> {dataSaver ? 'Lite ON' : 'Lite'}
            </button>

            {/* Profil */}
            <NavBtn href="/profile" title="Mon profil" variant="ghost">
              <UserIcon size={20} />
            </NavBtn>

            {/* Séparateur */}
            <div className="w-px h-8 bg-slate-200 mx-1" />

            {/* Session : Dashboard + Déco  OU  Vendre */}
            {session ? (
              <div className="flex items-center gap-1">
                <NavBtn href="/dashboard" title="Tableau de bord vendeur" variant="ghost">
                  <StoreIcon size={19} />
                </NavBtn>
                <NavBtn onClick={() => signOut()} title="Déconnexion" variant="danger">
                  <LogOutIcon size={19} />
                </NavBtn>
              </div>
            ) : (
              <NavBtn href="/login" variant="solid">
                🏪 Vendre
              </NavBtn>
            )}
          </nav>

          {/* ── MOBILE : Capsule (Panier + Profil + Hamburger) ── */}
          <div className="flex md:hidden items-center gap-1 bg-white/80 border border-slate-200/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm z-50">

            {/* Panier mobile */}
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
              <ShoppingCartIcon size={18} />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* Profil mobile */}
            <button onClick={() => router.push('/profile')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
              <UserIcon size={18} />
            </button>

            {/* ── HAMBURGER ANIMÉ AVEC HALO LUMINEUX & ROTATION ── */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className={`relative p-2.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none overflow-hidden group ${isMobileMenuOpen
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105 rotate-180 ring-2 ring-blue-400/50'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:scale-105 active:scale-95'
                }`}
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {/* Reflet lumineux animé */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-indigo-400 to-amber-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

              <div className={`relative z-10 transition-transform duration-500 ${isMobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0'}`}>
                {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  MENU MOBILE ANIMÉ (Cosmic Glass Drawer + Stagger Items)
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop sombre ultra flouté */}
        <div
          className={`absolute inset-0 bg-slate-950/75 backdrop-blur-2xl transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={closeMenu}
        />

        {/* Panel menu avec bordure lumineuse et glissement 3D */}
        <div
          className={`absolute top-0 right-0 h-full w-[88vw] max-w-sm bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-l border-white/10 flex flex-col pt-6 px-6 pb-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_60px_rgba(37,99,235,0.3)] ${isMobileMenuOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95'
            }`}
        >
          {/* En-tête menu mobile */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
            <Link href="/" onClick={closeMenu} className={`flex items-center gap-3 ${artFontClass}`}>
              <img src="/vestyle-logo.png" className="w-9 h-9 rounded-xl shadow-md object-cover border border-white/10" alt="VesTyle" />
              <div>
                <span className="text-2xl font-extrabold text-white">Ves<span className="text-orange-500">Tyle</span></span>
                <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-400/90 leading-tight">Live Marketplace</span>
              </div>
            </Link>
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/15 transition-all active:scale-90"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Liens de navigation avec entrée en cascade (Stagger) */}
          <nav className="flex flex-col gap-2 flex-1">
            {[
              { href: '/', label: 'Accueil', icon: <HomeIcon size={18} />, accent: false, delay: 'delay-[50ms]' },
              { href: '/boutiques', label: 'Boutiques', icon: <StoreIcon size={18} />, accent: false, delay: 'delay-[100ms]' },
              { href: '/mes-commandes', label: 'Mes Commandes', icon: <PackageIcon size={18} />, accent: false, delay: 'delay-[150ms]' },
              { href: '/cart', label: `Panier${totalCartItems > 0 ? ` (${totalCartItems})` : ''}`, icon: <ShoppingCartIcon size={18} />, accent: totalCartItems > 0, delay: 'delay-[200ms]' },
              { href: '/profile', label: 'Mon Profil', icon: <UserIcon size={18} />, accent: false, delay: 'delay-[250ms]' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-300 transform ${item.delay} ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                  } ${item.accent
                    ? 'text-blue-400 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 shadow-md shadow-blue-500/10'
                    : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                  }`}
              >
                <span className={item.accent ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
                <ArrowRightIcon size={14} className="ml-auto text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}

            {/* Lite Mode dans le menu mobile */}
            <button
              onClick={toggleDataSaver}
              className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-300 transform delay-[300ms] text-left mt-1 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                } ${dataSaver
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/35'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                }`}
            >
              <ZapIcon size={18} className={dataSaver ? 'text-orange-400 animate-pulse' : 'text-slate-400'} />
              <span>Mode Lite {dataSaver ? '(Actif)' : ''}</span>
              <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${dataSaver ? 'bg-orange-500 text-white shadow-sm' : 'bg-white/10 text-slate-400'}`}>
                {dataSaver ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Dashboard vendeur */}
            {session && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl font-bold text-sm text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all duration-300 transform delay-[350ms] mt-1 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                  }`}
              >
                <StoreIcon size={18} className="text-emerald-400" />
                Tableau de Bord Vendeur
                <ArrowRightIcon size={14} className="ml-auto text-emerald-500" />
              </Link>
            )}
          </nav>

          {/* Actions CTA bas du menu */}
          <div className="space-y-3 mt-6 pt-6 border-t border-white/10">
            {session ? (
              <button
                onClick={() => { signOut(); closeMenu(); }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all active:scale-95"
              >
                <LogOutIcon size={16} /> Déconnexion
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
                >
                  🏪 Vendre sur VesTyle
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-slate-400 border border-white/10 hover:bg-white/8 transition-all"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  TOAST LITE MODE
          ╚══════════════════════════════════════════════════════════════════╝ */}
      {dataSaverToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-orange-500 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-orange-400/30 font-bold text-sm flex items-center gap-3 animate-fade-in">
          <ZapIcon size={16} /> Mode Lite activé — images masquées pour économiser votre DATA
        </div>
      )}
    </>
  );
}
