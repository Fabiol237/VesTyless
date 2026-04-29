'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, Tag, Sprout } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductsPreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Vrais produits de la base de données, contrôlés par un algorithme. Pas de simulation.
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          image_url, 
          created_at,
          stores ( name )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-24 bg-wa-bg relative overflow-hidden">
      
      {/* Touches WhatsApp (Fonds flous) */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-wa-chat rounded-full blur-[150px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-wa-green/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header de la section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wa-chat text-xs font-bold text-wa-teal uppercase tracking-widest mb-6">
               <Sprout size={14} className="text-wa-teal" />
               Nouveautés
            </div>
             <h2 className="text-3xl md:text-4xl font-bold text-wa-teal-dark mb-4 tracking-tight">
               Boutiques Récentes
             </h2>
             <p className="text-base text-neutral-600">
               Découvrez les derniers produits ajoutés par les vendeurs sur la plateforme.
             </p>
          </div>
          <button className="group flex items-center gap-2 text-sm font-bold text-wa-teal uppercase tracking-widest pb-1 border-b border-wa-teal hover:text-wa-teal-dark hover:border-wa-teal-dark transition-colors">
            Voir tout
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Grille des produits ou Chargement */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-teal"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
             <ShoppingBag className="mx-auto text-neutral-300 mb-6" size={48} strokeWidth={1} />
             <h3 className="text-xl font-bold text-wa-teal-dark mb-2">Les rayons sont vides pour le moment</h3>
             <p className="text-neutral-500 text-base">De nouveaux produits arrivent bientôt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((item, idx) => (
              <div
                key={item.id}
                className="group cursor-pointer flex flex-col h-full opacity-100 animate-fade-in"
              >
                {/* Image Conteneur */}
                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden mb-4 bg-white shadow-sm border border-neutral-100 group-hover:border-wa-teal transition-colors duration-300">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badge Vendeur */}
                  {item.stores && item.stores.name && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex flex-col shadow-md border border-neutral-100 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                       <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none mb-1">Boutique</span>
                       <span className="text-sm text-wa-teal-dark font-bold truncate leading-none">{item.stores.name}</span>
                    </div>
                  )}
                </div>

                {/* Contenu Produit */}
                <div className="flex flex-col flex-1 justify-between px-1">
                  <div>
                    <h3 className="text-lg font-bold text-wa-teal-dark mb-1 group-hover:text-wa-teal transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-base font-bold text-wa-teal">
                      {Number(item.price).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                    </span>
                    <button className="w-10 h-10 rounded-full bg-wa-chat text-wa-teal flex items-center justify-center hover:bg-wa-teal hover:text-white transition-colors group-hover:scale-105 duration-300">
                      <ShoppingBag size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
