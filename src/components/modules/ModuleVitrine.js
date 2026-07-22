'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Star, Users, Shield, Zap, Trophy, Globe } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE VITRINE — Page d'accueil configurable selon le secteur d'activité
// Adapte automatiquement son visuel au thème injecté par le parent
// ─────────────────────────────────────────────────────────────────────────────

export default function ModuleVitrine({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview, onNavigate, modules = []
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // ── Extraction des variables de thème ──────────────────────────────────────
  const p      = theme['--prim']   || '#6366f1';
  const acc    = theme['--acc']    || p;
  const bg     = theme['--bg']     || '#ffffff';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600' || bg === '#18181b' || bg === '#111827';

  // ── Intersection Observer pour animation d'entrée ─────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Navigation CTA vers un module ────────────────────────────────────────
  const handleCTA = () => {
    if (!onNavigate || !config.ctaLink) return;
    const target = modules.find(m => m.type === config.ctaLink || m.id === config.ctaLink);
    if (target) onNavigate(target.id);
  };

  // ── Données depuis config ─────────────────────────────────────────────────
  const badges = [config.badge1, config.badge2, config.badge3].filter(Boolean);

  const socials = [
    config.whatsapp  && { icon: '📲', label: 'WhatsApp', href: `https://wa.me/${config.whatsapp.replace(/\D/g,'')}` },
    config.instagram && { icon: '📸', label: 'Instagram', href: config.instagram },
    config.facebook  && { icon: '👤', label: 'Facebook', href: config.facebook },
    config.tiktok    && { icon: '🎵', label: 'TikTok', href: config.tiktok },
  ].filter(Boolean);

  // ── Stats contextuelles (badges de confiance) ─────────────────────────────
  const trustStats = [
    config.ratingValue && { icon: <Star size={14} fill={p} color={p} />, value: `${config.ratingValue}/5`, label: `${config.ratingCount || '100'}+ avis` },
    store?.followers_count && { icon: <Users size={14} color={p} />, value: store.followers_count, label: 'Abonnés' },
    { icon: <Shield size={14} color={p} />, value: 'Vérifié', label: 'VesTyle' },
  ].filter(Boolean);

  // ── Palette de particules décoratives ────────────────────────────────────
  const particles = Array.from({ length: 6 }, (_, i) => ({
    x: [15, 80, 45, 70, 25, 90][i],
    y: [20, 15, 75, 60, 85, 40][i],
    size: [120, 200, 80, 150, 100, 180][i],
    opacity: [0.07, 0.05, 0.09, 0.06, 0.08, 0.04][i],
    delay: i * 0.5,
  }));

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: isMobile ? '88vh' : '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        padding: isMobile ? '60px 20px' : '100px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Fond décoratif — orbes colorées animées ─────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map((pt, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            width: pt.size,
            height: pt.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i % 2 === 0 ? p : acc}${Math.round(pt.opacity * 255).toString(16).padStart(2,'0')} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            animation: `floatOrb ${6 + i}s ease-in-out infinite alternate`,
            animationDelay: `${pt.delay}s`,
          }} />
        ))}
        {/* Grille subtile */}
        {!isDark && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            opacity: 0.5,
          }} />
        )}
      </div>

      <style>{`
        @keyframes floatOrb {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-50%, -50%) scale(1.15) rotate(5deg); }
        }
        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vitrine-visible .anim-0 { animation: fadeUpIn 0.6s ease both 0.0s; }
        .vitrine-visible .anim-1 { animation: fadeUpIn 0.6s ease both 0.12s; }
        .vitrine-visible .anim-2 { animation: fadeUpIn 0.6s ease both 0.24s; }
        .vitrine-visible .anim-3 { animation: fadeUpIn 0.6s ease both 0.36s; }
        .vitrine-visible .anim-4 { animation: fadeUpIn 0.6s ease both 0.48s; }
        .vitrine-visible .anim-5 { animation: fadeUpIn 0.6s ease both 0.60s; }
      `}</style>

      {/* ── Contenu central ─────────────────────────────────────────────── */}
      <div
        className={visible ? 'vitrine-visible' : ''}
        style={{ maxWidth: 820, textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}
      >
        {/* Logo / Avatar boutique */}
        <div className="anim-0" style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          {store?.logo_url ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={store.logo_url}
                alt={store.name}
                style={{
                  width: isMobile ? 72 : 88, height: isMobile ? 72 : 88,
                  borderRadius: 22, objectFit: 'cover',
                  boxShadow: `0 16px 48px ${p}35, 0 0 0 3px ${p}20`,
                }}
              />
              <div style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 22, height: 22, borderRadius: '50%',
                background: '#22c55e',
                border: `3px solid ${bg}`,
                boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
              }} />
            </div>
          ) : (
            <div style={{
              width: isMobile ? 72 : 88, height: isMobile ? 72 : 88,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${p}, ${acc})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900,
              color: '#fff',
              boxShadow: `0 16px 48px ${p}40`,
            }}>
              {store?.name ? store.name.charAt(0).toUpperCase() : '🏪'}
            </div>
          )}
        </div>

        {/* Badges de confiance */}
        {config.showBadges && badges.length > 0 && (
          <div className="anim-1" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {badges.map((badge, i) => (
              <span key={i} style={{
                padding: '5px 14px', borderRadius: 999,
                background: isDark ? `${p}18` : `${p}10`,
                border: `1px solid ${p}30`,
                fontSize: 12, fontWeight: 700, color: p,
                letterSpacing: '0.04em',
              }}>
                ✦ {badge}
              </span>
            ))}
          </div>
        )}

        {/* Note / Avis */}
        {config.showRating && config.ratingValue && (
          <div className="anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, background: isDark ? 'rgba(254,240,138,0.08)' : '#fef9c3', border: `1px solid ${isDark ? 'rgba(254,240,138,0.15)' : '#fde68a'}`, marginBottom: 24, fontSize: 13, fontWeight: 800, color: isDark ? '#fef08a' : '#92400e' }}>
            ⭐ {config.ratingValue} / 5 &nbsp;·&nbsp; {config.ratingCount || '100'}+ avis
          </div>
        )}

        {/* ── Tag secteur spécifique ── */}
        {(config.season || config.cuisine || config.hotelTagline) && (
          <div className="anim-1" style={{ marginBottom: 20 }}>
            {config.season && (
              <span style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 999, background: `${p}15`, color: p, fontWeight: 800, fontSize: 13 }}>
                ✨ {config.season}
              </span>
            )}
            {config.cuisine && (
              <span style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 999, background: `${p}15`, color: p, fontWeight: 800, fontSize: 13 }}>
                🍽️ {config.cuisine}
              </span>
            )}
            {config.hotelTagline && (
              <p style={{ color: fg2, fontSize: 14, fontStyle: 'italic' }}>"{config.hotelTagline}"</p>
            )}
          </div>
        )}

        {/* ── Headline principal ── */}
        <h1 className="anim-2" style={{
          fontSize: isMobile ? 'clamp(28px,8vw,40px)' : 'clamp(36px,5vw,60px)',
          fontWeight: 900,
          color: fg,
          margin: '0 0 18px',
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
        }}>
          {config.headline || `Bienvenue chez ${store?.name || 'notre boutique'}`}
        </h1>

        {/* ── Sous-titre ── */}
        <p className="anim-3" style={{
          fontSize: isMobile ? 15 : 18,
          color: fg2,
          lineHeight: 1.75,
          maxWidth: 580,
          margin: '0 auto 40px',
        }}>
          {config.subheadline || 'Découvrez notre sélection exclusive, pensée pour vous.'}
        </p>

        {/* ── Bouton CTA ── */}
        <div className="anim-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: socials.length > 0 ? 40 : 0 }}>
          <button
            onClick={handleCTA}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: isMobile ? '14px 32px' : '16px 44px',
              borderRadius: 999,
              background: `linear-gradient(135deg, ${p}, ${acc})`,
              color: '#fff',
              border: 'none',
              fontWeight: 900,
              fontSize: isMobile ? 15 : 17,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: hovered ? `0 20px 50px ${p}55, 0 0 0 4px ${p}18` : `0 10px 36px ${p}40`,
              transform: hovered ? 'translateY(-3px) scale(1.03)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              letterSpacing: '0.02em',
            }}
          >
            {config.ctaText || 'Découvrir'}
            <ArrowRight size={18} style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* ── Stats de confiance ── */}
        {trustStats.length > 0 && (
          <div className="anim-4" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: socials.length > 0 ? 32 : 0, marginTop: 16 }}>
            {trustStats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 900, color: fg }}>
                  {stat.icon} {stat.value}
                </div>
                <span style={{ fontSize: 11, color: fg2, fontWeight: 600 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Réseaux sociaux ── */}
        {config.showSocials && socials.length > 0 && (
          <div className="anim-5" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 999,
                  border: `1.5px solid ${border}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                  color: fg2, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = p;
                  e.currentTarget.style.color = p;
                  e.currentTarget.style.background = `${p}10`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.color = fg2;
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
