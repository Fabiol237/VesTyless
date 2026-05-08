'use client';
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  Filter, 
  MoreHorizontal,
  ExternalLink,
  Zap,
  Tag,
  Store,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProductsAction, deleteProductAction, toggleProductBoostAction } from '../actions';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProducts() {
      const { data } = await searchProductsAction('');
      setProducts(data || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (loading) return;
    const delayDebounceFn = setTimeout(async () => {
      const { data } = await searchProductsAction(searchQuery);
      setProducts(data || []);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loading]);

  const deleteProduct = async (productId) => {
    if (!confirm("Suppression définitive ?")) return;
    const { error } = await deleteProductAction(productId);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleBoost = async (productId, currentBoost) => {
    const { error } = await toggleProductBoostAction(productId, currentBoost);
    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, is_boosted: !currentBoost } : p));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-200 border-t-wa-teal rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-wa-teal font-black text-xs uppercase tracking-[0.3em] mb-2"
          >
            <ShoppingBag size={14} fill="currentColor" /> Inventory Matrix
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Global <span className="text-slate-300">Catalog.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-wa-teal transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 text-sm text-slate-600 rounded-2xl pl-12 pr-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-wa-teal/50 focus:border-wa-teal transition-all w-full md:w-80 shadow-sm" 
            />
          </div>
          <button className="bg-white border border-slate-200 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400">
             <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <AnimatePresence>
            {products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all flex flex-col shadow-sm"
              >
                 <div className="relative h-64 overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                         <ShoppingBag size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       {product.is_boosted && (
                         <div className="bg-wa-teal text-white px-3 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1.5 shadow-lg shadow-wa-teal/20">
                            <Zap size={10} fill="currentColor" /> BOOSTED
                         </div>
                       )}
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                       <button 
                         onClick={() => toggleBoost(product.id, product.is_boosted)}
                         className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${product.is_boosted ? 'bg-amber-500 text-white' : 'bg-white text-slate-900 hover:bg-amber-500 hover:text-white'}`}
                       >
                          <Sparkles size={18} />
                       </button>
                       <button 
                         onClick={() => deleteProduct(product.id)}
                         className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                       >
                          <X size={18} />
                       </button>
                    </div>
                 </div>

                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <Tag size={10} /> {product.category || 'Non Classé'}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 truncate group-hover:text-wa-teal transition-colors">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between">
                       <span className="text-xl font-black text-slate-900">{product.price?.toLocaleString()} F</span>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{product.stock > 0 ? 'En Stock' : 'Épuisé'}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                          {product.stores?.logo_url ? <img src={product.stores.logo_url} className="w-full h-full object-cover" /> : <Store size={10} className="text-slate-400" />}
                       </div>
                       <span className="text-[10px] font-black truncate max-w-[100px] uppercase tracking-tighter">{product.stores?.name || 'Vestyle'}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </motion.div>
            ))}
         </AnimatePresence>
         {products.length === 0 && (
           <div className="col-span-full py-40 text-center">
              <ShoppingBag size={64} className="mx-auto text-slate-100 mb-6" />
              <p className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">Aucun produit synchronisé</p>
           </div>
         )}
      </div>

      {/* Summary Footer HUD */}
      <footer className="p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
               <Cpu size={32} className="text-wa-teal" />
            </div>
            <div>
               <h4 className="text-lg font-black tracking-tight uppercase">System Logic Active</h4>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Indexing & Caching OK</p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total SKU</p>
               <p className="text-2xl font-black">{products.length}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenue Exp.</p>
               <p className="text-2xl font-black text-wa-teal">{(products.length * 15000).toLocaleString()} F</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
