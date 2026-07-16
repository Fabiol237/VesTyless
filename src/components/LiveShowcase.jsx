'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin, ArrowUpRight, ShoppingBag } from 'lucide-react';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
  'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300&q=80',
];

export default function LiveShowcase() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, image_url, stores(name, city, slug)')
          .eq('is_active', true)
          .order('daily_views', { ascending: false })
          .limit(5),
        supabase
          .from('stores')
          .select('id, name, logo_url, slug, is_boosted')
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
    const t = setInterval(() => setActiveIdx(i => (i + 1) % products.length), 3500);
    return () => clearInterval(t);
  }, [products]);

  const feat = products[activeIdx];
  const fallback = FALLBACK_IMGS[activeIdx % FALLBACK_IMGS.length];
  const href = feat?.stores?.slug ? `/boutique/${feat.stores.slug}` : '/boutiques';

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl border border-white/10 bg-[#0d1f2d]">
        <div className="w-6 h-6 rounded-full border-2 border-[#25D366]/30 border-t-[#25D366] animate-spin flex-shrink-0" />
        <span className="text-slate-500 text-xs font-mono">Chargement du live...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* ── LIVE LABEL ─── */}
      <div className="flex items-center gap-2 px-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
        </span>
        <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#25D366]">
          Live Vestyle
        </span>
      </div>

      {/* ── FEATURED PRODUCT — compact horizontal card ─── */}
      {feat && (
        <Link href={href} className="group block">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-[#0d1f2d] hover:border-[#25D366]/30 hover:bg-[#0d1f2d] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,211,102,0.07)]">
            {/* Image carrée compacte */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={feat.id}
                  src={feat.image_url || fallback}
                  alt={feat.name}
                  onError={e => { e.target.src = fallback; }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-[#25D366]/70 font-black uppercase tracking-widest mb-0.5">
                Tendance
              </p>
              <h4 className="text-white font-black text-sm leading-tight truncate group-hover:text-[#25D366] transition-colors duration-300">
                {feat.name}
              </h4>
              {feat.stores?.name && (
                <p className="text-slate-500 text-[11px] font-mono truncate mt-0.5">
                  {feat.stores.name}
                  {feat.stores.city ? ` · ${feat.stores.city}` : ''}
                </p>
              )}
            </div>

            {/* Prix + flèche */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <p className="text-white font-black text-base font-mono leading-none">
                {Number(feat.price).toLocaleString()}
                <span className="text-[#25D366] text-[10px] font-bold ml-0.5">F</span>
              </p>
              <ArrowUpRight
                size={16}
                className="text-slate-700 group-hover:text-[#25D366] transition-colors duration-300"
              />
            </div>
          </div>
        </Link>
      )}

      {/* ── DOTS ─── */}
      {products.length > 1 && (
        <div className="flex items-center gap-1.5 px-1">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-5 h-1 bg-[#25D366] shadow-[0_0_6px_#25D366]'
                  : 'w-1 h-1 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── BOUTIQUES — ligne horizontale de chips ─── */}
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
                  {/* Logo ou icône */}
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0a1628] flex items-center justify-center">
                        <ShoppingBag size={10} className="text-[#25D366]/50" />
                      </div>
                    )}
                    {/* Live dot */}
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
