'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// Bulletproof SVG Icons (Bypassing Lucide/Turbopack bug)
const ShoppingCartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const MenuIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x1="20" y1="12" y2="12"/><line x1="4" x1="20" y1="6" y2="6"/><line x1="4" x1="20" y1="18" y2="18"/></svg>
);
const XIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const StoreIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2.7 2.7 0 0 1-4.8 0v0a2 2 0 0 1-2-2V7"/></svg>
);
const LogOutIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const ArrowRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { session, signOut } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-wa-teal py-3 shadow-md`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Left: LOGO */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-wa-teal font-black text-xl leading-none">V</span>
          </div>
          <span className="font-bold text-xl text-white hidden sm:block tracking-wide">
            Vestyle
          </span>
        </Link>
        
        {/* Center: SEARCH (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
           <input 
             type="text" 
             placeholder="Rechercher..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-white/10 text-white placeholder-white/70 rounded-full pl-5 pr-12 py-2 text-sm focus:outline-none focus:bg-white/20 transition-colors border-none"
           />
           <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 flex items-center justify-center text-white/80 hover:text-white transition-colors">
              <SearchIcon size={18} />
           </button>
        </form>

        {/* Right: DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-4 text-white">
          <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
            <ShoppingCartIcon size={22} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-wa-green text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          {session ? (
            <div className="flex items-center gap-2 pl-2">
               <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Tableau de bord vendeur">
                  <StoreIcon size={20} />
               </Link>
               <button onClick={() => signOut()} className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors" title="Déconnexion">
                  <LogOutIcon size={20} />
               </button>
            </div>
          ) : (
             <div className="flex items-center gap-2 pl-2">
               <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                 Vendeur
               </Link>
             </div>
          )}
        </nav>

        {/* Right: MOBILE TOGGLE */}
        <div className="flex md:hidden items-center gap-3 z-50 text-white">
           <Link href="/cart" className="relative p-2">
            <ShoppingCartIcon size={22} />
            {totalCartItems > 0 && (
              <span className="absolute 0 right-0 bg-wa-green text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {totalCartItems}
              </span>
            )}
          </Link>
          <button 
            className="p-2 focus:outline-none" 
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
             className="w-full bg-neutral-100 text-neutral-900 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-wa-teal"
           />
           <button type="submit" className="absolute right-3 top-3 text-neutral-500">
              <SearchIcon size={20} />
           </button>
        </form>

        <nav className="flex flex-col gap-1 text-base font-medium text-neutral-800">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100">Accueil <ArrowRightIcon size={16} className="text-neutral-400" /></Link>
          
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
    </header>
  );
}
