'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';

export default function WishlistPanel() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les favoris depuis localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('vestyle_favorites') || '[]');
      setFavorites(stored);
    } catch (e) {
      console.error('Erreur chargement favoris:', e);
      setFavorites([]);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-neutral-100">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-5 mx-auto">
          <Heart size={40} className="text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Aucun favori pour le moment</h2>
        <p className="text-neutral-500 text-sm mb-8">Commencez à aimer des produits pour les retrouver ici!</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-wa-teal text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-wa-teal-dark transition-colors shadow-sm"
        >
          <ShoppingCart size={18} />
          Découvrir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
          <Heart size={20} className="text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Mes Favoris</h2>
          <p className="text-sm text-neutral-500">{favorites.length} produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((item) => (
          <Link 
            key={item.id} 
            href={`/produit/${item.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-neutral-100"
          >
            <div className="aspect-square bg-neutral-100 overflow-hidden relative">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              <div className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full">
                <Heart size={14} className="fill-white" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 mb-1">{item.name}</h3>
              <p className="text-wa-teal font-bold text-sm">{Number(item.price).toLocaleString('fr-FR')} F</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
