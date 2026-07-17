'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin, ArrowUpRight, ShoppingBag, Zap, Star } from 'lucide-react';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&q=80',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
];

export default function LiveShowcase() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, image_url, is_promo, is_boosted, stores(id, name, city, slug, logo_url, latitude, longitude)')
          .eq('is_active', true)
          .order('daily_views', { ascending: false })
          .limit(5),
        supabase
          .from('stores')
          .select('id, name, logo_url, slug, city, is_boosted')
          .order('is_boosted', { ascending: false })
          .limit(4),
      ]);
      if (p.data?.length) setProducts(p.data);
      if (s.data?.length) setStores(s.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!products.length) return;
    const t = setInterval(() => {
      setImgLoaded(false);
      setActiveIdx(i => (i + 1) % products.length);
    }, 4000);
    return () => clearInterval(t);
  }, [products]);

  const feat = products[activeIdx];
  const fallback = FALLBACK_IMGS[activeIdx % FALLBACK_IMGS.length];
  const href = feat?.id ? `/produit/${feat.id}` : '/boutiques';
  const storeHref = feat?.stores?.slug ? `/boutique/${feat.stores.slug}` : '/boutiques';

  if (loading) {
    return (
      <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#0d1f2d] animate-pulse" style={{ height: 460 }} />
    );
  }

  return (
    <div className="space-y-4">

      {/* ── LIVE LABEL ─── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
          </span>
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-[#25D366]">
            Vestyle Live · Tendance
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
          {products.length} produits
        </span>
      </div>

      {/* ── GRANDE CARTE PRODUIT + BOUTIQUE ─── */}
      {feat && (
        <div className="relative w-full rounded-[2rem] overflow-hidden border border-white/8 bg-[#0d1f2d] shadow-2xl"
             style={{ minHeight: 420 }}>

          {/* Image grand format avec transition */}
          <AnimatePresence mode="sync">
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <img
                src={feat.image_url || fallback}
                alt={feat.name}
                onError={e => { e.target.src = fallback; }}
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover"
                style={{ minHeight: 420 }}
              />
              {/* Gradient overlay pour lisibilité */}
              <div className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(10,22,40,0.98) 0%, rgba(10,22,40,0.7) 40%, rgba(10,22,40,0.1) 75%, transparent 100%)'
                }} />
            </motion.div>
          </AnimatePresence>

          {/* Badges top */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
            {/* Boutique (cliquable) */}
            <Link href={storeHref}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md bg-black/40 border border-white/10 hover:border-[#25D366]/40 transition-all group"
            >
              {feat.stores?.logo_url ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#25D366]/40 flex-shrink-0">
                  <img src={feat.stores.logo_url} alt={feat.stores.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#128C7E]/30 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={13} className="text-[#25D366]" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white font-black text-[11px] leading-none truncate group-hover:text-[#25D366] transition-colors">
                  {feat.stores?.name || 'Boutique'}
                </p>
                {feat.stores?.city && (
                  <p className="text-slate-400 text-[9px] font-mono mt-0.5 flex items-center gap-1">
                    <MapPin size={8} /> {feat.stores.city}
                  </p>
                )}
              </div>
            </Link>

            {/* Badges produit */}
            <div className="flex flex-col gap-1.5 items-end">
              {feat.is_boosted && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#25D366] text-black text-[9px] font-black uppercase tracking-wider shadow-lg shadow-[#25D366]/30">
                  <Zap size={9} fill="currentColor" /> Boost
                </span>
              )}
              {feat.is_promo && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-lg">
                  <Star size={9} fill="currentColor" /> Promo
                </span>
              )}
            </div>
          </div>

          {/* Infos bas de carte */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
            <p className="text-[#25D366] text-[9px] font-mono font-black uppercase tracking-[0.25em] mb-1.5">
              Tendance · #{activeIdx + 1} sur {products.length}
            </p>
            <h4 className="text-white font-black text-xl sm:text-2xl leading-tight mb-3 tracking-tight line-clamp-2">
              {feat.name}
            </h4>

            {/* Prix + CTA */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-white font-mono leading-none">
                  {Number(feat.price).toLocaleString()}
                  <span className="text-[#25D366] text-base ml-1 font-bold">F</span>
                </p>
                <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest mt-1">FCFA</p>
              </div>
              <Link
                href={href}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] text-black font-black text-xs uppercase tracking-widest hover:bg-[#1da851] transition-all shadow-xl shadow-[#25D366]/20 active:scale-95 group"
              >
                Voir <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Dots navigation */}
          {products.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setImgLoaded(false); setActiveIdx(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIdx
                      ? 'w-6 h-1.5 bg-[#25D366] shadow-[0_0_8px_#25D366]'
                      : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BOUTIQUES ACTIVES ─── */}
      {stores.length > 0 && (
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 font-black mb-2 px-1">
            Boutiques actives
          </p>
          <div className="flex flex-wrap gap-2">
            {stores.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/boutique/${store.slug}`}
                  className={`group inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 hover:border-[#25D366]/40 hover:bg-[#25D366]/5 ${
                    store.is_boosted
                      ? 'border-[#25D366]/30 bg-[#25D366]/5'
                      : 'border-white/8 bg-[#0d1f2d]'
                  }`}
                >
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0a1628] flex items-center justify-center">
                        <ShoppingBag size={10} className="text-[#25D366]/50" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] border border-[#0d1f2d]" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate max-w-[80px]">
                    {store.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
