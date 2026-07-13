'use client';
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ZoomIn, X, Grid3X3, LayoutList, Layers } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE PORTFOLIO — Galerie de réalisations avec Lightbox, Masonry, Carousel
// Configurable: layout, lightbox, featured, tags, date, client
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_PROJECTS = [
  { id: 1, title: 'Identité Visuelle – Bakery Co.', category: 'Branding', image_url: null, tags: ['logo', 'branding'], client: 'Bakery Co.', date: '2025-01-15', featured: true, description: 'Refonte complète de l\'identité visuelle pour une boulangerie artisanale.' },
  { id: 2, title: 'Site E-commerce Mode', category: 'Web Design', image_url: null, tags: ['web', 'ux'], client: 'ModeAfrik', date: '2025-02-20', featured: false, description: 'Conception et développement d\'une boutique en ligne de mode.' },
  { id: 3, title: 'Application Mobile', category: 'App Design', image_url: null, tags: ['mobile', 'ux/ui'], client: 'StartupXYZ', date: '2025-03-10', featured: true, description: 'Design d\'une application mobile fintech intuitive.' },
  { id: 4, title: 'Campagne Réseaux Sociaux', category: 'Social Media', image_url: null, tags: ['social', 'content'], client: 'FMCG Brand', date: '2025-04-01', featured: false, description: 'Création de contenus visuels pour une campagne digitale.' },
  { id: 5, title: 'Packaging Produit', category: 'Packaging', image_url: null, tags: ['packaging', 'print'], client: 'Artisan Savon', date: '2025-05-12', featured: false, description: 'Conception d\'emballages éco-responsables pour une gamme de savons.' },
  { id: 6, title: 'Charte Graphique Complète', category: 'Branding', image_url: null, tags: ['branding', 'print'], client: 'InstitutX', date: '2025-06-05', featured: false, description: 'Élaboration d\'une charte graphique institutionnelle.' },
];

const CATEGORY_COLORS = {
  'Branding': '#6366f1', 'Web Design': '#ec4899', 'App Design': '#f59e0b',
  'Social Media': '#10b981', 'Packaging': '#8b5cf6', 'Packaging': '#f97316',
};

function ProjectCard({ project, config, theme, onClick }) {
  const [hovered, setHovered] = useState(false);
  const p      = theme['--prim']   || '#6366f1';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const bg     = theme['--bg']     || '#fff';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#18181b';
  const catColor = CATEGORY_COLORS[project.category] || p;

  return (
    <div
      onClick={() => onClick(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: `1px solid ${hovered ? `${p}30` : (isDark ? 'rgba(255,255,255,0.07)' : border)}`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hovered ? `0 20px 50px ${p}12, 0 8px 20px rgba(0,0,0,0.08)` : '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: isDark ? '#1a1a2e' : `${catColor}10` }}>
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.6s ease' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 40 }}>{project.category === 'Branding' ? '🎨' : project.category === 'Web Design' ? '💻' : project.category === 'App Design' ? '📱' : '✨'}</div>
            <span style={{ fontSize: 12, color: fg2, fontWeight: 600 }}>{project.category}</span>
          </div>
        )}
        {/* Overlay au hover avec zoom icon */}
        {config.enableLightbox && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s', backdropFilter: hovered ? 'blur(2px)' : 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1)' : 'scale(0.7)', transition: 'transform 0.3s' }}>
              <ZoomIn size={22} color={p} />
            </div>
          </div>
        )}
        {/* Badge featured */}
        {config.showFeatured && project.featured && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.08em' }}>
            ★ En vedette
          </div>
        )}
        {/* Catégorie */}
        <div style={{ position: 'absolute', top: 10, right: 10, background: `${catColor}cc`, backdropFilter: 'blur(4px)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.06em' }}>
          {project.category}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '18px 20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: fg, margin: '0 0 6px', lineHeight: 1.3 }}>{project.title}</h3>
        {project.description && (
          <p style={{ fontSize: 13, color: fg2, lineHeight: 1.6, margin: '0 0 12px' }}>
            {project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {config.showTags && project.tags?.map((tag, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: p, background: `${p}12`, border: `1px solid ${p}20`, padding: '2px 8px', borderRadius: 999 }}>#{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}` }}>
          {config.showClientName && project.client && (
            <span style={{ fontSize: 12, color: fg2, fontWeight: 600 }}>📌 {project.client}</span>
          )}
          {config.showDate && project.date && (
            <span style={{ fontSize: 11, color: fg2 }}>{new Date(project.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ModulePortfolio({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState('all');
  const [lightbox, setLightbox]   = useState(null);
  const [visible, setVisible]     = useState(false);
  const sectionRef = useRef(null);

  const p   = theme['--prim']   || '#6366f1';
  const fg  = theme['--fg']     || '#111827';
  const fg2 = theme['--fg2']    || '#6b7280';
  const bg  = theme['--bg']     || '#ffffff';
  const isDark = bg === '#0f0f1a' || bg === '#120A00';
  const layout  = config.layout || 'grid';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (preview || !storeId) { setProjects(DEMO_PROJECTS); setLoading(false); return; }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase.from('portfolio_items').select('*').eq('store_id', storeId).order('date', { ascending: false });
        setProjects(data?.length ? data : DEMO_PROJECTS);
      } catch { setProjects(DEMO_PROJECTS); }
      setLoading(false);
    })();
  }, [storeId, preview]);

  // Toutes les catégories/tags uniques
  const allTags = ['all', ...new Set(projects.flatMap(p => p.tags || []))];
  const filtered = activeTag === 'all' ? projects : projects.filter(p => p.tags?.includes(activeTag));

  return (
    <section
      ref={sectionRef}
      style={{
        padding: isMobile ? '48px 16px' : '80px 32px',
        background: bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <Layers size={13} /> Nos Réalisations
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Portfolio</h2>
          <p style={{ fontSize: 15, color: fg2, maxWidth: 480, margin: '0 auto' }}>Découvrez une sélection de nos meilleures réalisations.</p>
        </div>

        {/* ── Filtres par tags ── */}
        {config.showTags && allTags.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '8px 18px', borderRadius: 999,
                  border: `1.5px solid ${activeTag === tag ? p : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                  background: activeTag === tag ? p : 'transparent',
                  color: activeTag === tag ? '#fff' : fg2,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s',
                }}
              >
                {tag === 'all' ? '✦ Tout voir' : `#${tag}`}
              </button>
            ))}
          </div>
        )}

        {/* ── Grille de projets ── */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : layout === 'masonry' ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
            alignItems: layout === 'masonry' ? 'start' : 'stretch',
          }}>
            {filtered.map((project, i) => (
              <div key={project.id} style={{ animation: `fadeUp 0.5s ease both ${i * 0.06}s`, gridRow: (layout === 'masonry' && project.featured) ? 'span 2' : 'auto' }}>
                <ProjectCard project={project} config={config} theme={theme} onClick={setLightbox} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: fg2 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
            <p style={{ fontWeight: 700, color: fg, fontSize: 16 }}>Aucun projet dans cette catégorie.</p>
          </div>
        )}

        {/* CTA */}
        {config.ctaText && (
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 12,
                background: `linear-gradient(135deg, ${p}, ${p}cc)`,
                color: '#fff', border: 'none', fontWeight: 800,
                fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: `0 8px 24px ${p}35`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${p}50`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 24px ${p}35`; }}
            >
              {config.ctaText} <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {config.enableLightbox && lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setLightbox(null)}>
          <div style={{ position: 'relative', maxWidth: 720, width: '100%', background: isDark ? '#1a1a2e' : '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
            <div style={{ aspectRatio: '16/9', background: `${p}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {lightbox.image_url
                ? <img src={lightbox.image_url} alt={lightbox.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ fontSize: 64 }}>{lightbox.category === 'Branding' ? '🎨' : '✨'}</div>
              }
            </div>
            <div style={{ padding: '28px 32px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: fg, margin: '0 0 10px' }}>{lightbox.title}</h3>
              {lightbox.description && <p style={{ fontSize: 14, color: fg2, lineHeight: 1.7, margin: '0 0 16px' }}>{lightbox.description}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {lightbox.tags?.map((tag, i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, color: p, background: `${p}12`, padding: '3px 10px', borderRadius: 999 }}>#{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </section>
  );
}
