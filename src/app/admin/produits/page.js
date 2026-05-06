'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Sparkles, X, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
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
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    const { error } = await deleteProductAction(productId);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
    } else {
      alert("Erreur: " + error);
    }
  };

  const toggleBoost = async (productId, currentBoost) => {
    const { error } = await toggleProductBoostAction(productId, currentBoost);
    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, is_boosted: !currentBoost } : p));
    } else {
      alert("Erreur: " + error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div></div>;
  }

  return (
    <div className="flex-1 lg:ml-64 p-8 overflow-y-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-wa-teal" /> 
            Gestion des Produits
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Supervisez l'ensemble des articles du catalogue.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
             <input 
               type="text" 
               placeholder="Rechercher un produit..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-wa-teal transition-colors w-full md:w-64" 
             />
           </div>
        </div>
      </header>

      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900/50 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-700">
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium">Boutique</th>
                <th className="px-6 py-4 font-medium">Prix</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Boost (À la une)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {products.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-neutral-500 text-sm">Aucun produit trouvé.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-700 border border-neutral-600">
                             {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex justify-center items-center text-neutral-500"><ShoppingBag size={20}/></div>}
                         </div>
                         <div className="font-semibold text-white text-sm">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300">
                      {product.stores?.name ? (
                        <Link href={`/boutique/${product.stores.slug}`} className="hover:text-wa-teal transition-colors">{product.stores.name}</Link>
                      ) : 'Boutique Inconnue'}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-400">{Number(product.price).toLocaleString()} F</td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'}`}>
                         {product.is_active ? <><CheckCircle size={12}/> Actif</> : <><AlertTriangle size={12}/> Inactif</>}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleBoost(product.id, product.is_boosted)}
                        className={`p-2 rounded-lg transition-all ${product.is_boosted ? 'bg-wa-teal text-white shadow-lg shadow-wa-teal/20' : 'bg-neutral-700 text-neutral-500 hover:text-neutral-300'}`}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => deleteProduct(product.id)}
                           className="text-neutral-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                           title="Supprimer"
                         >
                           <X size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
