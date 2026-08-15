'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Star, Users, Shield, Zap, ShoppingBag, Sparkles, MapPin } from 'lucide-react';

export default function ModuleVitrine({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onNavigate, modules = []
}) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const p      = theme['--prim']        || '#128C7E';
  const bg     = theme['--bg']          || '#ffffff';
  const fg     = theme['--fg']          || '#0f172a';
  const fg2    = theme['--fg2']         || '#64748b';
  const border = theme['--border']      || 'rgba(0,0,0,0.06)';
  const radius = theme['--radius']      || '16px';
  const fontHeading = theme['--font-heading'] || 'inherit';

  const heroLayout = theme.heroLayout || config.heroLayout || 'centered-clean';

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCTA = () => {
    if (!onNavigate) return;
    const catalogueMod = modules.find(m => m.type === 'catalogue' || m.type === 'services');
    if (catalogueMod) onNavigate(catalogueMod.id);
    else onNavigate('produits');
  };

  const coverUrl = store.cover_url || config.coverUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80';
  const logoUrl = store.logo_url || config.logoUrl;
  const storeName = store.name || config.headline || 'Ma Boutique';
  const headline = config.headline || `Bienvenue chez ${storeName}`;
  const subheadline = config.subheadline || store.description || 'Découvrez nos collections exclusives et nos nouveautés.';

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLE 1 : IMMERSIVE LUXE (Vogue / Haute Couture Style)
  // ═══════════════════════════════════════════════════════════════════════════
  if (heroLayout === 'immersive-full') {
    return (
      <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img src={coverUrl} alt={storeName} className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          {logoUrl && (
            <img src={logoUrl} alt={storeName} className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/40 shadow-2xl mb-8" />
          )}

          <span className="text-amber-400 text-xs font-mono font-black uppercase tracking-[0.4em] mb-4">
            ✦ Haute Couture & Collections Exclusives ✦
          </span>

          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none mb-6 text-amber-100" style={{ fontFamily: fontHeading }}>
            {storeName}
          </h1>

          <p className="text-base sm:text-xl text-stone-300 max-w-2xl font-light leading-relaxed mb-10">
            {subheadline}
          </p>

          <button
            onClick={handleCTA}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-[0.25em] rounded-full hover:scale-105 transition-all shadow-2xl shadow-amber-500/30 flex items-center gap-3"
          >
            Exploration Privée <ArrowRight size={16} />
          </button>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLE 2 : ASYMMETRIC BOLD (Streetwear / Urban Tech)
  // ═══════════════════════════════════════════════════════════════════════════
  if (heroLayout === 'asymmetric-bold') {
    return (
      <section ref={sectionRef} className="relative py-16 sm:py-28 px-6 bg-[#050505] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-xs font-black uppercase tracking-widest">
              <Zap size={14} /> Official Store
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black leading-none uppercase tracking-tighter" style={{ fontFamily: fontHeading }}>
              {headline}
            </h1>

            <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
              {subheadline}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={handleCTA}
                className="px-8 py-4 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center gap-2"
              >
                Drop Actuel <ArrowRight size={16} />
              </button>
              {store.city && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 px-4 py-3 bg-white/5 border border-white/10">
                  <MapPin size={14} className="text-[#CCFF00]" /> {store.city}
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full border-2 border-[#CCFF00]/40 overflow-hidden group">
              <img src={coverUrl} alt={storeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              {logoUrl && (
                <div className="absolute top-4 left-4 p-2 bg-black border border-white/20">
                  <img src={logoUrl} alt="" className="w-12 h-12 object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLE 3 : SOFT ORGANIC (Artisanat / Éco & Beauté)
  // ═══════════════════════════════════════════════════════════════════════════
  if (heroLayout === 'soft-split') {
    return (
      <section ref={sectionRef} className="py-16 sm:py-24 px-6" style={{ background: bg }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: `${p}15`, color: p }}>
              🌿 Créations Fait-Main & Authentiques
            </span>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight" style={{ color: fg, fontFamily: fontHeading }}>
              {headline}
            </h1>

            <p className="text-base sm:text-lg leading-relaxed" style={{ color: fg2 }}>
              {subheadline}
            </p>

            <div className="pt-2">
              <button
                onClick={handleCTA}
                className="px-8 py-4 text-white font-bold text-sm rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
                style={{ background: p, borderRadius: radius }}
              >
                Découvrir l&apos;Atelier <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden shadow-2xl" style={{ borderRadius: radius }}>
              <img src={coverUrl} alt={storeName} className="w-full h-full object-cover" />
            </div>
            {logoUrl && (
              <div className="absolute -bottom-6 -left-6 p-3 bg-white shadow-xl rounded-2xl border border-neutral-100 hidden sm:block">
                <img src={logoUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLE 4 : CENTERED CLEAN (Style Minimaliste & Pro par défaut)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section ref={sectionRef} className="py-16 sm:py-28 px-6 text-center" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl ? (
          <img src={logoUrl} alt={storeName} className="w-24 h-24 rounded-3xl object-cover shadow-xl border border-neutral-100 mb-8" />
        ) : (
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl mb-8" style={{ background: p }}>
            {storeName.charAt(0)}
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: `${p}12`, color: p }}>
          <Sparkles size={14} /> Boutique Certifiée
        </div>

        <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight mb-6" style={{ color: fg, fontFamily: fontHeading }}>
          {headline}
        </h1>

        <p className="text-base sm:text-xl leading-relaxed max-w-2xl mb-10" style={{ color: fg2 }}>
          {subheadline}
        </p>

        <button
          onClick={handleCTA}
          className="px-9 py-4 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          style={{ background: p, borderRadius: radius }}
        >
          Voir le Catalogue <ShoppingBag size={16} />
        </button>
      </div>
    </section>
  );
}
