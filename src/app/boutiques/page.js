'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Store, MapPin, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { useDistance } from '@/hooks/useDistance';

export default function BoutiquesPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { formatDistance, requestLocation, userLocation } = useDistance();

  useEffect(() => {
    if (!userLocation) requestLocation();
  }, [userLocation, requestLocation]);

  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase.from('stores').select('*');
      if (data) setStores(data);
      setLoading(false);
    }
    fetchStores();
  }, []);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-wa-bg flex flex-col">
      <Navbar />
      
      <div className="pt-28 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">Toutes les Boutiques</h1>
          <p className="text-neutral-600 font-medium max-w-2xl">Découvrez les créateurs, vendeurs et artisans qui font battre le cœur de votre ville.</p>
        </header>

        <div className="mb-12 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une boutique par son nom..." 
            className="w-full pl-12 pr-12 py-4 bg-white rounded-3xl shadow-sm border-none focus:ring-2 focus:ring-wa-teal/20 text-neutral-900 font-bold transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <VoiceSearchButton 
               onInterimResult={(text) => setSearch(text)}
               onResult={(text) => setSearch(text)} 
               className="p-1" 
             />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-neutral-200">
            <p className="text-neutral-500 font-bold">Aucune boutique trouvée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <Link 
                key={store.id} 
                href={`/boutique/${store.slug}`}
                className="group bg-white p-6 rounded-[2.5rem] border border-neutral-100 hover:shadow-2xl hover:shadow-wa-teal/10 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden mb-6 bg-wa-bg shadow-sm ring-4 ring-white group-hover:ring-wa-chat transition-all">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-wa-teal font-black text-3xl">
                      {store.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-neutral-900 mb-2 group-hover:text-wa-teal transition-colors">{store.name}</h3>
                <p className="text-sm text-neutral-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                  {store.description || "Boutique partenaire VesTyle. Produits de qualité et service client exceptionnel."}
                </p>
                
                <div className="mt-auto w-full flex items-center justify-between pt-6 border-t border-neutral-50">
                   <div className="flex items-center gap-1.5 text-neutral-400">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                         {store.latitude && store.longitude && formatDistance ? (
                           <span className="text-wa-teal">À {formatDistance(store.latitude, store.longitude)}</span>
                         ) : store.city || "Douala, CM"}
                      </span>
                   </div>
                   <div className="p-2 bg-wa-chat text-wa-teal rounded-xl group-hover:bg-wa-teal group-hover:text-white transition-colors">
                      <ChevronRight size={18} />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
