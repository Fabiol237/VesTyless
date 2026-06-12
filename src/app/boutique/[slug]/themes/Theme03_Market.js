'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  MapPin, MessageCircle, Share2, CheckCircle2, Shield, Star, Clock,
  Package, Search, ChevronRight, Navigation, Zap, ShoppingCart,
  Home, Tag, Info, Leaf, TrendingUp, Phone, Award
} from 'lucide-react';

/* ─────────────────────────────────────────────
   THEME 03 — Marché Frais & Épicerie
   Fresh market vibes, dense product grid,
   vibrant greens + orange accent
───────────────────────────────────────────── */
export default function Theme03_Market({
  store, products, categories, stats, storeInfo,
  filteredProducts, groupedProducts,
  activeTab, setActiveTab,
  activeFilter, setActiveFilter,
  search, setSearch,
  handleShare, handleDirections,
  shared, trackProductView, formatDistance,
  totalProducts, shop_tabs,
}) {
  const [hovered, setHovered] = useState(null);
  const filterRef = useRef(null);

  const G = '#1B7A3A';   // forest green
  const O = '#FF8C00';   // orange
  const Y = '#FFF9C4';   // light yellow
  const BG = '#F0FFF4';  // mint-white

  const waLink = store?.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(store?.custom_message || `Bonjour, je visite votre boutique ${store?.name} sur VesTyless!`)}`
    : '#';

  const tabs = [
    { id: 'accueil',  label: shop_tabs?.accueil || 'Accueil',       Icon: Home },
    { id: 'rayons',   label: shop_tabs?.produits || 'Rayons',         Icon: Package },
    { id: 'offres',   label: shop_tabs?.promotions || 'Offres du Jour', Icon: Zap },
    { id: 'info',     label: shop_tabs?.profil || 'Info Boutique',  Icon: Info },
  ];

  const categoryEmojis = {
    default: ['🥦','🍅','🥕','🧅','🍋','🥝','🫐','🍇','🌽','🧄','🫒','🥑','🍓','🍊','🥩','🐟','🧀','🥚','🍞','🧴'],
  };
  const getEmoji = (cat, i) => {
    const emojiMap = {
      'legume': '🥦', 'fruit': '🍊', 'viande': '🥩', 'poisson': '🐟',
      'fromage': '🧀', 'lait': '🥛', 'boulanger': '🍞', 'boisson': '🧃',
      'épice': '🌶️', 'huile': '🫒', 'sucre': '🍬', 'café': '☕',
      'cosmet': '💄', 'hygien': '🧴', 'nettoy': '🧹',
    };
    const lower = cat?.toLowerCase() || '';
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lower.includes(key)) return emoji;
    }
    return categoryEmojis.default[i % categoryEmojis.default.length];
  };

  const boosted = products?.filter(p => p.is_boosted || p.is_promo) || [];
  const featuredOffers = boosted.length > 0 ? boosted : (products || []).slice(0, 6);

  const scrollFilters = (dir) => {
    if (filterRef.current) filterRef.current.scrollLeft += dir * 160;
  };

  /* ── PRODUCT CARD (MARKET STYLE) ─────────────── */
  const MarketProductCard = ({ item, idx }) => {
    const [added, setAdded] = useState(false);
    const price = Number(item?.price);
    if (!item) return null;
    return (
      <div
        className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300"
        style={{ borderColor: hovered === item.id ? O : '#E8F5E9' }}
        onMouseEnter={() => setHovered(item.id)}
        onMouseLeave={() => setHovered(null)}
      >
        <Link
          href={`/produit/${item.id}`}
          onClick={() => trackProductView && trackProductView(item.id, item.category_id)}
          className="relative block w-full"
        >
          <div className="w-full aspect-[1/1] bg-green-50 overflow-hidden flex items-center justify-center">
            <img
              src={item.image_url || '/placeholder-product.png'}
              alt={item.name}
              loading={idx < 8 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {item.is_promo && (
              <span className="text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg" style={{ background: '#E53935' }}>
                PROMO
              </span>
            )}
            {item.is_boosted && (
              <span className="text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase shadow-lg" style={{ background: O }}>
                <Zap size={8} /> Top
              </span>
            )}
          </div>
        </Link>

        <div className="p-2.5 flex flex-col flex-1">
          <Link href={`/produit/${item.id}`}>
            <p className="text-[11px] sm:text-xs font-bold line-clamp-2 leading-tight mb-1.5" style={{ color: G }}>
              {item.name}
            </p>
          </Link>
          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base font-black" style={{ color: O }}>
                {price.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold ml-0.5" style={{ color: O }}>F</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-90 hover:scale-110"
              style={{ background: added ? '#43A047' : G, color: '#fff' }}
            >
              {added ? <CheckCircle2 size={14} /> : <ShoppingCart size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── TABS CONTENT ────────────────────────────── */

  const AccueilTab = () => (
    <div className="space-y-6 pb-10">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: G }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher des produits frais..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 bg-white text-sm font-semibold focus:outline-none transition-all"
          style={{ borderColor: search ? G : '#C8E6C9', color: '#333' }}
        />
      </div>

      {/* Category filter pills */}
      <div className="relative">
        <div ref={filterRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
          <button
            onClick={() => setActiveFilter('all')}
            className="flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-black transition-all"
            style={{
              background: activeFilter === 'all' ? G : '#E8F5E9',
              color: activeFilter === 'all' ? '#fff' : G,
            }}
          >
            Tout voir
          </button>
          {categories?.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap"
              style={{
                background: activeFilter === cat ? G : '#E8F5E9',
                color: activeFilter === cat ? '#fff' : G,
              }}
            >
              {getEmoji(cat, i)} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {filteredProducts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-5xl">🥬</div>
          <p className="font-bold text-lg" style={{ color: G }}>Aucun produit trouvé</p>
          <p className="text-sm text-gray-500">Essayez une autre recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredProducts?.map((item, idx) => (
            <MarketProductCard key={item.id} item={item} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );

  const RayonsTab = () => (
    <div className="space-y-8 pb-10">
      {/* Category tiles */}
      <div>
        <h2 className="text-lg font-black mb-4" style={{ color: G }}>Tous nos Rayons</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories?.map((cat, i) => (
            <button
              key={cat}
              onClick={() => { setActiveFilter(cat); setActiveTab('accueil'); }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 bg-white transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: '#C8E6C9' }}
            >
              <span className="text-3xl">{getEmoji(cat, i)}</span>
              <span className="text-xs font-black text-center" style={{ color: G }}>{cat}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: O }}>
                {groupedProducts?.[cat]?.length || 0} produits
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products per category */}
      {categories?.map((cat, ci) => {
        const catProducts = groupedProducts?.[cat] || [];
        if (catProducts.length === 0) return null;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{getEmoji(cat, ci)}</span>
              <h3 className="text-base font-black" style={{ color: G }}>{cat}</h3>
              <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: '#C8E6C9' }} />
              <span className="text-xs font-bold" style={{ color: O }}>{catProducts.length} articles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catProducts.slice(0, 10).map((item, idx) => (
                <MarketProductCard key={item.id} item={item} idx={idx} />
              ))}
            </div>
          </div>
        );
      })}

      {categories?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-5xl">📦</div>
          <p className="font-bold text-lg" style={{ color: G }}>Aucun rayon disponible</p>
        </div>
      )}
    </div>
  );

  const OffresTab = () => (
    <div className="space-y-6 pb-10">
      {/* Hero promo banner */}
      <div className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${G} 0%, #145C2C 100%)` }}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-300" />
              <span className="text-yellow-300 font-black text-sm uppercase tracking-wider">Offres Spéciales</span>
            </div>
            <h2 className="text-white font-black text-2xl leading-tight">Profitez de nos<br/>meilleures offres !</h2>
            <p className="text-green-200 text-sm mt-1">Valables aujourd'hui seulement</p>
          </div>
          <div className="text-right">
            <div className="text-5xl">🏷️</div>
          </div>
        </div>
      </div>

      {/* Offers grid */}
      {featuredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-5xl">🎉</div>
          <p className="font-bold text-lg" style={{ color: G }}>Pas d'offres pour le moment</p>
          <p className="text-sm text-gray-500">Revenez bientôt pour découvrir nos promotions</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-bold" style={{ color: G }}>{featuredOffers.length} offre(s) disponible(s)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredOffers.map((item, idx) => (
              <div key={item.id} className="relative">
                <div className="absolute -top-2 -right-2 z-20 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase shadow-lg" style={{ background: '#E53935' }}>
                  {item.is_promo ? 'PROMO' : 'OFFRE'}
                </div>
                <MarketProductCard item={item} idx={idx} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* WhatsApp CTA */}
      <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: Y }}>
        <span className="text-3xl">📱</span>
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: G }}>Offre exclusive WhatsApp</p>
          <p className="text-xs text-gray-600">Contactez-nous pour des prix spéciaux</p>
        </div>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          className="text-white text-xs font-black px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: G }}>
          Contacter
        </a>
      </div>
    </div>
  );

  const InfoTab = () => (
    <div className="space-y-5 pb-10">
      {/* Store card */}
      <div className="rounded-3xl overflow-hidden border-2" style={{ borderColor: '#C8E6C9' }}>
        <div className="p-5" style={{ background: `linear-gradient(135deg, ${G}, #145C2C)` }}>
          <div className="flex items-center gap-4">
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-xl" />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white text-2xl" style={{ background: O }}>
                🛒
              </div>
            )}
            <div>
              <h2 className="text-white font-black text-xl">{store?.name}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={12} className="text-yellow-300" />
                <span className="text-yellow-300 text-xs font-bold">Boutique Vérifiée</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white space-y-4">
          {store?.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{store.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: '#E8F5E9' }}>
              <Package size={20} className="mx-auto mb-1" style={{ color: G }} />
              <p className="text-lg font-black" style={{ color: G }}>{totalProducts}</p>
              <p className="text-xs font-bold text-gray-500">Produits</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: Y }}>
              <Star size={20} className="mx-auto mb-1" style={{ color: O }} />
              <p className="text-lg font-black" style={{ color: O }}>{store?.positive_rating || '—'}%</p>
              <p className="text-xs font-bold text-gray-500">Satisfaction</p>
            </div>
            {store?.response_time && (
              <div className="rounded-xl p-3 text-center" style={{ background: '#E8F5E9' }}>
                <Clock size={20} className="mx-auto mb-1" style={{ color: G }} />
                <p className="text-sm font-black" style={{ color: G }}>{store.response_time}</p>
                <p className="text-xs font-bold text-gray-500">Réponse</p>
              </div>
            )}
            {stats?.totalSold > 0 && (
              <div className="rounded-xl p-3 text-center" style={{ background: Y }}>
                <TrendingUp size={20} className="mx-auto mb-1" style={{ color: O }} />
                <p className="text-lg font-black" style={{ color: O }}>{stats.totalSold}</p>
                <p className="text-xs font-bold text-gray-500">Vendus</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl p-5 bg-white border-2" style={{ borderColor: '#C8E6C9' }}>
        <h3 className="font-black text-base mb-4" style={{ color: G }}>📞 Contact & Localisation</h3>
        <div className="space-y-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: '#25D366' }}>
            <MessageCircle size={20} />
            <span>Contacter sur WhatsApp</span>
          </a>
          {store?.city && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#E8F5E9' }}>
              <MapPin size={20} style={{ color: G }} />
              <span className="text-sm font-bold" style={{ color: G }}>{store.city}</span>
            </div>
          )}
          <button onClick={handleDirections}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: O, color: '#fff' }}>
            <Navigation size={20} />
            <span>Voir l'itinéraire</span>
          </button>
          <button onClick={handleShare}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold border-2 transition-all hover:scale-[1.02] active:scale-95"
            style={{ borderColor: G, color: G, background: shared ? '#E8F5E9' : '#fff' }}>
            {shared ? <CheckCircle2 size={20} /> : <Share2 size={20} />}
            <span>{shared ? 'Lien copié !' : 'Partager la boutique'}</span>
          </button>
        </div>
      </div>

      {/* Store code */}
      {store?.store_code && (
        <div className="rounded-2xl p-4 text-center" style={{ background: Y }}>
          <p className="text-xs font-bold text-gray-500 mb-1">Code boutique</p>
          <p className="text-2xl font-black tracking-widest" style={{ color: G }}>{store.store_code}</p>
        </div>
      )}
    </div>
  );

  /* ── MAIN RENDER ──────────────────────────────── */
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── TOP HEADER BAR ── */}
      <header style={{ background: G }} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-lg"
            style={{ background: '#fff' }}>
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🛒</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-black text-lg leading-none truncate">{store?.name}</h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: O, color: '#fff' }}>
                OUVERT
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-green-200 text-xs font-bold">{totalProducts} produits</span>
              {store?.positive_rating && (
                <span className="text-green-200 text-xs font-bold flex items-center gap-1">
                  <Star size={10} className="fill-yellow-300 text-yellow-300" />
                  {store.positive_rating}%
                </span>
              )}
              {store?.city && (
                <span className="text-green-200 text-xs font-bold flex items-center gap-1">
                  <MapPin size={10} />
                  {store.city}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp button */}
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90"
            style={{ background: '#25D366' }}>
            <MessageCircle size={20} className="text-white" />
          </a>
        </div>
      </header>

      {/* ── BANNER ── */}
      <div className="relative overflow-hidden" style={{
        background: `repeating-linear-gradient(45deg, ${G} 0px, ${G} 10px, #145C2C 10px, #145C2C 20px)`,
        minHeight: store?.banner_url ? 180 : 120,
      }}>
        {store?.banner_url && (
          <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="flex items-center gap-2 mb-2">
            <Leaf size={20} className="text-yellow-300" />
            <span className="text-yellow-300 font-black text-sm uppercase tracking-widest">Marché Frais</span>
            <Leaf size={20} className="text-yellow-300" />
          </div>
          <h2 className="text-white font-black text-2xl sm:text-3xl mb-2">{store?.name}</h2>
          {store?.description && (
            <p className="text-green-100 text-sm max-w-md">{store.description}</p>
          )}
          <div className="flex gap-3 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: O, color: '#fff' }}>
              🏷️ {totalProducts} produits frais
            </span>
            {store?.positive_rating && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white" style={{ color: G }}>
                ⭐ {store.positive_rating}% satisfaits
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex divide-x divide-green-200" style={{ background: '#E8F5E9' }}>
        <div className="flex-1 flex flex-col items-center py-2.5 px-2">
          <span className="text-xs font-black" style={{ color: G }}>{totalProducts}</span>
          <span className="text-[9px] font-bold text-gray-500">Produits</span>
        </div>
        {store?.positive_rating && (
          <div className="flex-1 flex flex-col items-center py-2.5 px-2">
            <span className="text-xs font-black" style={{ color: G }}>{store.positive_rating}%</span>
            <span className="text-[9px] font-bold text-gray-500">Satisfaits</span>
          </div>
        )}
        {stats?.totalSold > 0 && (
          <div className="flex-1 flex flex-col items-center py-2.5 px-2">
            <span className="text-xs font-black" style={{ color: O }}>{stats.totalSold}</span>
            <span className="text-[9px] font-bold text-gray-500">Vendus</span>
          </div>
        )}
        {store?.response_time && (
          <div className="flex-1 flex flex-col items-center py-2.5 px-2">
            <span className="text-xs font-black" style={{ color: G }}>{store.response_time}</span>
            <span className="text-[9px] font-bold text-gray-500">Réponse</span>
          </div>
        )}
      </div>

      {/* ── NAV TABS ── */}
      <nav className="sticky top-[72px] z-40 shadow-sm" style={{ background: '#fff', borderBottom: `3px solid #E8F5E9` }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 px-4 py-3.5 text-xs font-black whitespace-nowrap transition-all relative flex-shrink-0"
                style={{
                  color: activeTab === id ? G : '#9E9E9E',
                  borderBottom: activeTab === id ? `3px solid ${G}` : '3px solid transparent',
                  marginBottom: '-3px',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'accueil' && <AccueilTab />}
        {activeTab === 'rayons' && <RayonsTab />}
        {activeTab === 'offres' && <OffresTab />}
        {activeTab === 'info' && <InfoTab />}
      </main>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90"
        style={{ background: '#25D366' }}
      >
        <MessageCircle size={26} className="text-white" />
      </a>
    </div>
  );
}
