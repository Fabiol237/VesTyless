"use client";
import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, HelpCircle, Trash2, Package, Layers, 
  TrendingUp, AlertCircle, Loader2, Edit3, MoreVertical
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { productsIndex } from '@/lib/meilisearch';
import AddProductModal from './AddProductModal';
import Image from 'next/image';

export default function ProductsPage() {
  const { store } = useAuth();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [catInput, setCatInput] = useState('');
  const [search, setSearch] = useState('');
  const [meiliResults, setMeiliResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!store) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', store.id);
    if (!error && data) setCategories(data);
  }, [store]);

  const fetchProducts = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    if (!store) return;
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts, store]);

  // Recherche Meilisearch avec Debounce
  useEffect(() => {
    if (!store) return;
    
    if (search.trim() === '') {
      setMeiliResults(null);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const response = await productsIndex.search(search, {
          filter: `store_id = ${store.id}`,
          limit: 50
        });
        setMeiliResults(response.hits);
      } catch (err) {
        console.error('Meilisearch search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [search, store]);

  const addCategory = async () => {
    if (!catInput.trim() || !store) return;
    setCategoryLoading(true);
    
    const strName = catInput.trim();
    const slug = strName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ store_id: store.id, name: strName, slug }])
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, data]);
      setCatInput('');
    }
    setCategoryLoading(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      try {
        await productsIndex.deleteDocument(id);
      } catch (err) {
        console.error('Meilisearch delete error:', err);
      }
    }
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setShowAddModal(true);
  };

  const displayProducts = meiliResults || products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categories?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock_quantity === 0).length,
    categories: categories.length
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Catalogue Produits</h1>
          <p className="text-gray-500 font-medium mt-1">Gérez et sublimez vos articles en quelques clics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm">
            <HelpCircle size={18} className="text-wa-teal" />
            <span className="hidden sm:inline">Aide</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-wa-teal text-white font-black rounded-2xl hover:bg-wa-teal-dark hover:shadow-xl hover:shadow-wa-teal/20 transition-all active:scale-95 text-sm"
          >
            <Plus size={20} />
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Produits', value: stats.total, icon: Package, color: 'bg-wa-teal' },
          { label: 'Rupture de Stock', value: stats.outOfStock, icon: AlertCircle, color: 'bg-rose-500' },
          { label: 'Catégories', value: stats.categories, icon: Layers, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 text-left">
            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Management */}
        <div className="lg:col-span-1 space-y-4 text-left">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Catégories</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Organisez votre boutique</p>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nom de la catégorie..." 
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all pr-12"
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <button 
                  onClick={addCategory}
                  disabled={categoryLoading}
                  className="absolute right-2 top-2 p-1.5 bg-wa-teal text-white rounded-xl hover:bg-wa-teal-dark transition-all disabled:opacity-50"
                >
                  {categoryLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Aucune catégorie...</p>
                ) : (
                  categories.map((c) => (
                    <span key={c.id} className="px-3 py-1.5 bg-wa-chat text-wa-teal-dark text-[10px] font-black uppercase tracking-tight rounded-lg border border-wa-teal/10">
                      {c.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-wa-teal to-wa-teal-dark p-6 rounded-3xl text-white shadow-xl shadow-wa-teal/20 relative overflow-hidden group">
            <TrendingUp size={80} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Astuce Pro</h4>
            <p className="text-xs font-medium leading-relaxed">Utilisez des noms de catégories simples pour aider vos clients à trouver leurs produits plus rapidement.</p>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-left">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Chercher par nom ou catégorie..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading || isSearching ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-bold uppercase tracking-widest">{isSearching ? 'Recherche...' : 'Chargement du catalogue...'}</p>
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                    <Package size={40} />
                  </div>
                  <h4 className="text-gray-900 font-black">Aucun produit</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Commencez par ajouter votre premier article.</p>
                </div>
              ) : (
                displayProducts.map(p => (
                  <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 relative">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={24} />
                          </div>
                        )}
                        {p.stock_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter bg-rose-500 px-1 rounded">Rupture</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                          <span className="text-[10px] font-black text-wa-teal bg-wa-chat px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {p.categories?.name || 'Sans catégorie'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm font-black text-wa-teal-dark">{p.price.toLocaleString()} F</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${p.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            <p className="text-[10px] font-bold text-gray-500">{p.stock_quantity} en stock</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="p-2 text-wa-teal hover:bg-wa-chat rounded-xl transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
          categories={categories} 
          storeId={store?.id}
          productToEdit={productToEdit}
          onSuccess={() => {
            fetchProducts();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
