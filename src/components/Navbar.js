'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Menu, X, ArrowRight, Search as SearchIcon, Store, LogOut, Package 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

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
            <ShoppingCart size={22} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-wa-green text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          {session ? (
            <div className="flex items-center gap-2 pl-2">
               <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Tableau de bord vendeur">
                  <Store size={20} />
               </Link>
               <button onClick={() => signOut()} className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors" title="Déconnexion">
                  <LogOut size={20} />
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
            <ShoppingCart size={22} />
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
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100">Accueil <ArrowRight size={16} className="text-neutral-400" /></Link>
          
          {session ? (
             <>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 border-b border-neutral-100 text-wa-teal">Tableau de Bord Vendeur <Store size={18} /></Link>
                <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center justify-between py-3 text-red-500 text-left">Déconnexion <LogOut size={18} /></button>
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
