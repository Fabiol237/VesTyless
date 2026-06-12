'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, Package, CheckCircle2,
  Store, Search, Zap, Share2, Navigation,
  MessageCircle, ChevronRight, Star, Clock, Shield
} from 'lucide-react';

/**
 * Theme00_Classic — L'ancien thème par défaut de VesTyle
 * Style Alibaba / AliExpress — Tailwind, vert émeraude, blanc
 * Restauré depuis le commit 6824279
 */
export default function Theme00_Classic({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts, activeTab, setActiveTab,
  activeFilter, setActiveFilter, search, setSearch,
  handleShare, handleDirections, shared, trackProductView, formatDistance, totalProducts,
  addToCart, shop_tabs,
}) {
  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">

      {/* ── STORE HEADER (Alibaba style) ── */}
      <div className="w-full bg-white shadow-sm relative z-20">
        {/* Banner */}
        <div className="w-full h-[200px] sm:h-[300px] bg-slate-900 relative overflow-hidden">
          <img
            src={store.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600'}
            className="w-full h-full object-cover opacity-50"
            alt={`Bannière ${store.name}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">

            {/* Logo & Core Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-1 shadow-md border border-slate-200 shrink-0 relative">
                <img src={store.logo_url || '/placeholder-store.png'} className="w-full h-full object-cover rounded-lg" alt={store.name} />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                  <Shield size={12} />
                </div>
              </div>

              <div className="text-center sm:text-left mb-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{store.name}</h1>
                  {store.supplier_level && store.supplier_level !== 'Nouveau Vendeur' && (
                    <span className="flex items-center gap-1 bg-[#fff8e1] text-[#ff8f00] border border-[#ffe082] px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <Star size={10} className="fill-[#ff8f00]" /> {store.supplier_level}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 size={14} /> Vérifié VesTyle
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    <span className="text-rose-500 font-black">{store.positive_rating !== undefined ? store.positive_rating : 100}%</span> Avis Positifs
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" /> Rép: {store.response_time || '< 2h'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              {store.whatsapp_number && (
                <a
                  href={`https://wa.me/${store.whatsapp_number}`}
                  target="_blank"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white px-6 py-2.5 rounded-full font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <MessageCircle size={16} /> Contacter
                </a>
              )}
              <button
                onClick={handleDirections}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-full font-black text-xs border border-slate-200 active:scale-95 transition-all uppercase tracking-widest"
              >
                <MapPin size={16} /> Visiter
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-full active:scale-95 transition-all shrink-0"
              >
                {shared ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-0 pt-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'accueil', label: shop_tabs?.accueil || 'Accueil Boutique' },
              { id: 'produits', label: `${shop_tabs?.produits || 'Tous les Produits'} (${totalProducts})` },
              { id: 'promotions', label: shop_tabs?.promotions || 'Promotions', hot: true },
              { id: 'profil', label: shop_tabs?.profil || 'Profil Fournisseur' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'produits') setActiveFilter('all'); }}
                className={`py-3 border-b-2 font-black text-xs uppercase tracking-widest whitespace-nowrap flex items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? tab.id === 'promotions' ? 'border-rose-500 text-rose-500' : 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {tab.hot && <span className="bg-rose-500 text-white text-[9px] px-1.5 rounded-sm">HOT</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto w-full px-4 mb-32 pt-6">

        {/* === ACCUEIL === */}
        {activeTab === 'accueil' && (
          <div className="animate-fade-in space-y-12">
            {store.custom_message && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex items-center gap-4 shadow-inner">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-1">Annonce de la boutique</h3>
                  <p className="text-emerald-900 font-bold sm:text-lg leading-snug">{store.custom_message}</p>
                </div>
              </div>
            )}

            {Object.entries(groupedProducts).length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-slate-100">
                <Package size={56} className="text-slate-200 mx-auto mb-5" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Aucun produit</h3>
                <p className="text-sm text-slate-400 mb-6">Cette boutique n&apos;a pas encore ajouté de produits.</p>
              </div>
            ) : (
              <div className="space-y-14">
                {Object.entries(groupedProducts).map(([catName, items]) => (
                  <div key={catName}>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                        {catName}
                      </h2>
                      <button
                        onClick={() => { setActiveTab('produits'); setActiveFilter(catName); }}
                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        Voir tout ({items.length}) <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                      {items.slice(0, 10).map((p, idx) => (
                        <ProductCard key={p.id} item={{ ...p, stores: storeInfo }} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === PRODUITS === */}
        {activeTab === 'produits' && (
          <div className="animate-fade-in">
            <div className="relative mb-5">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder={`Chercher parmi ${totalProducts} produits…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-sm focus:shadow-lg"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">✕</button>
              )}
            </div>

            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-6" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                >
                  Tout ({totalProducts})
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => (p.global_categories?.name || 'Autres') === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-300'}`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-slate-100">
                <Package size={56} className="text-slate-200 mx-auto mb-5" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Aucun résultat</h3>
                <p className="text-sm text-slate-400 mb-6">Aucun produit ne correspond à vos filtres.</p>
                <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all">
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    {activeFilter === 'all' ? 'Catalogue Complet' : activeFilter}
                  </h2>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredProducts.length} résultats</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                  {filteredProducts.map((p, idx) => (
                    <ProductCard key={p.id} item={{ ...p, stores: storeInfo }} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === PROMOTIONS === */}
        {activeTab === 'promotions' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center text-white shadow-xl shadow-rose-500/20">
              <Zap size={48} className="mx-auto mb-4 text-white/90 drop-shadow-lg" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight drop-shadow-md">Promotions &amp; Nouveautés</h2>
              <p className="text-lg font-medium text-white/90 max-w-2xl mx-auto drop-shadow-sm">
                {store.custom_message || 'Découvrez nos offres exclusives et nos derniers arrivages !'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-rose-500 rounded-full" />
                <h2 className="text-xl font-black text-slate-900">Articles à la une</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {(products.filter(p => p.is_boosted).length > 0
                  ? products.filter(p => p.is_boosted)
                  : products.slice(0, 5)
                ).map((p, idx) => (
                  <ProductCard key={p.id} item={{ ...p, stores: storeInfo }} idx={idx} trackProductView={trackProductView} formatDistance={formatDistance} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === PROFIL === */}
        {activeTab === 'profil' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Store className="text-emerald-500" size={24} />
                <h2 className="text-xl font-black text-slate-900">À propos du Fournisseur</h2>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                {store.description || 'Ce fournisseur n\'a pas encore ajouté de description détaillée.'}
              </p>
              <div className="pt-6 border-t border-slate-50 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Coordonnées</h3>
                {store.whatsapp_number && (
                  <div className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center"><MessageCircle size={18} /></div>
                    <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" className="hover:text-[#25D366] transition-colors">{store.whatsapp_number}</a>
                  </div>
                )}
                {store.city && (
                  <div className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><MapPin size={18} /></div>
                    <span>{store.city}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Navigation className="text-blue-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">Localisation GPS</h2>
                </div>
                <button onClick={handleDirections} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-100 transition-colors">
                  Itinéraire
                </button>
              </div>
              <div className="flex-1 w-full rounded-3xl overflow-hidden bg-slate-100 border-4 border-slate-50 relative min-h-[300px]">
                {store.latitude && store.longitude ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={48} className="mb-4 opacity-50" />
                    <p className="font-bold text-sm">Position GPS non définie</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
