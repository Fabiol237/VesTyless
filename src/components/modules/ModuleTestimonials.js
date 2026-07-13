'use client';
import { useState, useRef, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Plus, Loader2, UserCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE TESTIMONIALS — Avis clients premium avec carrousel, étoiles, et form
// Configurable: layout (carousel|grid|list), étoiles, badge vérifié, soumission
// ─────────────────────────────────────────────────────────────────────────────

// ── Demo data pour aperçu ──────────────────────────────────────────────────
const DEMO_REVIEWS = [
  { id: 1, author: 'Amina K.', rating: 5, text: 'Service exceptionnel ! Livraison rapide et qualité au rendez-vous. Je recommande vivement à tous mes proches.', date: '2025-01-10', verified: true, avatar: null },
  { id: 2, author: 'Jean-Paul T.', rating: 5, text: 'Une expérience d\'achat incomparable. L\'équipe est réactive et les produits dépassent mes attentes. Merci !', date: '2025-02-14', verified: true, avatar: null },
  { id: 3, author: 'Fatou B.', rating: 4, text: 'Très satisfaite de mon achat. Le rapport qualité-prix est excellent et le service client très professionnel.', date: '2025-03-22', verified: false, avatar: null },
  { id: 4, author: 'Marc D.', rating: 5, text: 'Je suis client depuis plus d\'un an et je n\'ai jamais été déçu. Continuez comme ça !', date: '2025-04-05', verified: true, avatar: null },
  { id: 5, author: 'Sophie M.', rating: 5, text: 'Boutique magnifique, produits de qualité supérieure. Commande traitée très rapidement. Je reviendrai !', date: '2025-05-18', verified: true, avatar: null },
];

// ── Composant Étoiles ──────────────────────────────────────────────────────
function StarRating({ rating, size = 14, color = '#FBBF24' }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} color={color} fill={i <= rating ? color : 'transparent'} style={{ transition: 'all 0.2s' }} />
      ))}
    </div>
  );
}

// ── Card d'un avis ────────────────────────────────────────────────────────
function ReviewCard({ review, config, theme, style = {} }) {
  const p      = theme['--prim']   || '#6366f1';
  const fg     = theme['--fg']     || '#111827';
  const fg2    = theme['--fg2']    || '#6b7280';
  const border = theme['--border'] || 'rgba(0,0,0,0.08)';
  const isDark = (theme['--bg'] || '#fff') === '#0f0f1a' || (theme['--bg'] || '#fff') === '#120A00';

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`,
      borderRadius: 20,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s',
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isDark ? `0 20px 40px rgba(0,0,0,0.4)` : `0 16px 40px ${p}10`; e.currentTarget.style.borderColor = `${p}30`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : border; }}
    >
      {/* Guillemet décoratif */}
      <div style={{ color: `${p}30`, fontSize: 40, lineHeight: 1, fontFamily: 'Georgia, serif', userSelect: 'none' }}>
        <Quote size={28} color={`${p}40`} />
      </div>

      {/* Note */}
      {config.showStars && (
        <StarRating rating={review.rating} size={15} color="#FBBF24" />
      )}

      {/* Texte */}
      <p style={{ fontSize: 14, color: fg, lineHeight: 1.75, margin: 0, fontStyle: 'italic', flex: 1 }}>
        "{review.text}"
      </p>

      {/* Auteur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}>
        {review.avatar
          ? <img src={review.avatar} alt={review.author} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${p}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCircle2 size={22} color={p} />
            </div>
          )
        }
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: fg, display: 'flex', alignItems: 'center', gap: 6 }}>
            {review.author}
            {config.showVerifiedBadge && review.verified && (
              <CheckCircle2 size={13} color="#22c55e" title={config.verifiedText || 'Avis vérifié'} />
            )}
          </div>
          <div style={{ fontSize: 11, color: fg2 }}>
            {new Date(review.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant Principal
// ─────────────────────────────────────────────────────────────────────────────
export default function ModuleTestimonials({
  config = {}, store = {}, theme = {},
  isMobile, storeId, preview
}) {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ author: '', rating: 5, text: '' });
  const [submitStatus, setSubmitStatus] = useState('idle');
  const sectionRef = useRef(null);
  const [visible, setVisible]       = useState(false);

  const p   = theme['--prim']   || '#6366f1';
  const fg  = theme['--fg']     || '#111827';
  const fg2 = theme['--fg2']    || '#6b7280';
  const bg  = theme['--bg']     || '#ffffff';
  const isDark = bg === '#0f0f1a' || bg === '#120A00' || bg === '#0D0600';

  const layout = config.layout || 'carousel';

  // ── Chargement des avis ───────────────────────────────────────────────────
  useEffect(() => {
    if (preview || !storeId) {
      setReviews(DEMO_REVIEWS);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('store_id', storeId)
          .eq('approved', true)
          .order('created_at', { ascending: false });
        setReviews(data?.length ? data : DEMO_REVIEWS);
      } catch { setReviews(DEMO_REVIEWS); }
      setLoading(false);
    })();
  }, [storeId, preview]);

  // ── Animation d'entrée ────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Navigation carrousel ──────────────────────────────────────────────────
  const next = () => setCarouselIndex(i => (i + 1) % reviews.length);
  const prev = () => setCarouselIndex(i => (i - 1 + reviews.length) % reviews.length);
  const visibleReviews = isMobile ? 1 : layout === 'grid' ? reviews.length : 3;

  // ── Soumission d'avis ─────────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    if (preview) { setTimeout(() => setSubmitStatus('success'), 1000); return; }
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('reviews').insert({
        store_id: storeId,
        author: form.author,
        rating: form.rating,
        text: form.text,
        approved: !config.moderationEnabled,
        date: new Date().toISOString(),
      });
      setSubmitStatus('success');
    } catch { setSubmitStatus('error'); }
  };

  // ── Note moyenne ──────────────────────────────────────────────────────────
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) : 0;

  if (loading) return (
    <div style={{ padding: '80px 32px', display: 'flex', justifyContent: 'center', color: fg2 }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color={p} />
    </div>
  );

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
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .testi-nav-btn {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
          background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'};
          color: ${fg2};
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .testi-nav-btn:hover {
          background: ${p};
          border-color: ${p};
          color: #fff;
          transform: scale(1.1);
        }
        .testi-star-btn { cursor: pointer; transition: transform 0.2s; }
        .testi-star-btn:hover { transform: scale(1.2); }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── En-tête section ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${p}12`, border: `1px solid ${p}25`, fontSize: 12, fontWeight: 700, color: p, marginBottom: 16 }}>
            <Star size={13} fill={p} color={p} /> Ce que disent nos clients
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: fg, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Avis & Témoignages
          </h2>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: fg2, fontSize: 14 }}>
              <StarRating rating={Math.round(avgRating)} size={16} />
              <span style={{ fontWeight: 900, color: fg }}>{avgRating}</span>
              <span>· {reviews.length} avis</span>
            </div>
          )}
        </div>

        {/* ── Layout CAROUSEL ── */}
        {layout === 'carousel' && reviews.length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 20, overflow: 'hidden', justifyContent: 'center' }}>
              {reviews.slice(carouselIndex, carouselIndex + (isMobile ? 1 : 3)).map((r, i) => (
                <div key={r.id} style={{ flex: `0 0 ${isMobile ? '100%' : 'calc(33.33% - 14px)'}`, transition: 'all 0.4s', opacity: i === 0 ? 1 : 0.75, transform: `scale(${i === 0 ? 1 : 0.97})` }}>
                  <ReviewCard review={r} config={config} theme={theme} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
              <button className="testi-nav-btn" onClick={prev}><ChevronLeft size={18} /></button>
              <div style={{ display: 'flex', gap: 6 }}>
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    style={{
                      width: i === carouselIndex ? 24 : 8,
                      height: 8, borderRadius: 4,
                      background: i === carouselIndex ? p : `${p}30`,
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
              <button className="testi-nav-btn" onClick={next}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {/* ── Layout GRID ── */}
        {layout === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {reviews.map(r => <ReviewCard key={r.id} review={r} config={config} theme={theme} />)}
          </div>
        )}

        {/* ── Layout LIST ── */}
        {layout === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, margin: '0 auto' }}>
            {reviews.map(r => <ReviewCard key={r.id} review={r} config={config} theme={theme} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: fg2 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: fg, marginBottom: 6 }}>
              {config.emptyMessage || 'Aucun avis pour le moment'}
            </p>
            <p style={{ fontSize: 14, color: fg2 }}>Soyez le premier à partager votre expérience !</p>
          </div>
        )}

        {/* ── Formulaire d'avis ── */}
        {config.allowSubmit && (
          <div style={{ marginTop: 56, textAlign: 'center' }}>
            {!showForm && submitStatus !== 'success' && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 12,
                  background: `linear-gradient(135deg, ${p}, ${p}cc)`,
                  color: '#fff', border: 'none', fontWeight: 800,
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: `0 8px 24px ${p}35`,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${p}50`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 24px ${p}35`; }}
              >
                <Plus size={18} /> {config.submitText || 'Laisser un avis'}
              </button>
            )}

            {showForm && submitStatus !== 'success' && (
              <div style={{ maxWidth: 520, margin: '0 auto', background: isDark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 20, padding: isMobile ? '24px 16px' : '36px 32px', textAlign: 'left', boxShadow: `0 16px 48px rgba(0,0,0,0.08)` }}>
                <h3 style={{ fontWeight: 900, fontSize: 20, color: fg, margin: '0 0 24px', textAlign: 'center' }}>Votre avis</h3>
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom</label>
                    <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required placeholder="Votre prénom et nom" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: fg, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))} className="testi-star-btn" style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}>
                          <Star size={28} color="#FBBF24" fill={s <= form.rating ? '#FBBF24' : 'transparent'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: fg2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Votre avis</label>
                    <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required rows={4} placeholder="Décrivez votre expérience..." style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: fg, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <button type="submit" disabled={submitStatus === 'loading'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, background: `linear-gradient(135deg, ${p}, ${p}cc)`, color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: submitStatus === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 24px ${p}35`, opacity: submitStatus === 'loading' ? 0.8 : 1 }}>
                    {submitStatus === 'loading' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Envoyer mon avis'}
                  </button>
                  {config.moderationEnabled && <p style={{ fontSize: 12, color: fg2, textAlign: 'center', margin: 0 }}>{config.moderationMessage || 'Votre avis sera visible après modération.'}</p>}
                </form>
              </div>
            )}

            {submitStatus === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} color="#16a34a" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: fg, margin: 0 }}>Merci pour votre avis ! 🎉</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
