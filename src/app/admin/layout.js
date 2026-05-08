'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  CircleDollarSign, 
  ChevronRight, 
  LogOut, 
  Activity,
  Globe,
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', href: '/admin' },
    { icon: ShoppingBag, label: 'Produits Globaux', href: '/admin/produits' },
    { icon: Users, label: 'Utilisateurs', href: '/admin/utilisateurs' },
    { icon: CircleDollarSign, label: 'Finances & Flux', href: '/admin/finances' },
    { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-wa-teal selection:text-white font-sans overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-wa-teal/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.4]" 
             style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="flex flex-col lg:flex-row relative z-10">
        {/* Sidebar Premium Light */}
        <aside className="w-full lg:w-72 lg:fixed lg:h-screen bg-white/70 backdrop-blur-3xl border-r border-slate-200 p-6 flex flex-col shrink-0 transition-all duration-500">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-wa-teal rounded-xl flex items-center justify-center shadow-lg shadow-wa-teal/20">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-slate-900">
                VESTYLE <span className="text-wa-teal">PRO</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Active</span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-3 px-2">Main Controls</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-wa-teal/10 text-wa-teal' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? 'text-wa-teal' : 'text-slate-400 group-hover:text-slate-900 transition-colors'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-6 bg-wa-teal rounded-full"
                      />
                    )}
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'translate-x-0' : '-translate-x-2'}`} />
                  </motion.div>
                </Link>
              );
            })}

            <div className="mt-8">
               <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-3 px-2">Superpowers</p>
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                  <Globe size={18} className="text-neutral-500" />
                  <span>Réseau Local</span>
               </button>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-wa-teal shadow-sm">SA</div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-xs font-black text-slate-900 truncate">Super Admin</p>
                   <p className="text-[10px] text-slate-400 font-bold truncate tracking-tighter">Root Authority</p>
                </div>
                <button className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                   <LogOut size={16} />
                </button>
             </div>
             <Link href="/" className="group flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-900 border border-transparent hover:bg-slate-100 transition-all uppercase tracking-widest">
                <span>RETOUR AU FRONT</span>
             </Link>
          </div>
        </aside>

        {/* Top Header Floating (Mobile/Tablet) */}
        <header className="lg:hidden h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
           <h2 className="text-lg font-black tracking-tighter text-slate-900">VESTYLE <span className="text-wa-teal">PRO</span></h2>
           <button className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Bell size={18} /></button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-72 min-h-screen p-4 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
