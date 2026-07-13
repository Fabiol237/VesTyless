'use client';
import { useState, useEffect } from 'react';

// ─── Icônes ───────────────────────────────────────────────────────────────────
const StarIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SparkleIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const ArrowIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const RefreshIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
const LoaderIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spinAI 0.8s linear infinite',display:'block'}}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>;

// ─── Jauge circulaire de score ────────────────────────────────────────────────
function ScoreGauge({ score, grade }) {
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const gradeColor = { A: '#22c55e', B: '#84cc16', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[grade] || '#6366f1';

  return (
    <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke={gradeColor} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '28px', fontWeight: '900', color: gradeColor, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>/100</span>
        <span style={{ fontSize: '20px', fontWeight: '900', color: gradeColor }}>{grade}</span>
      </div>
    </div>
  );
}

// ─── Carte de suggestion ──────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  critical: { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: '🔴 Critique' },
  high:     { bg: '#fff7ed', border: '#fed7aa', badge: '#f97316', label: '🟠 Important' },
  medium:   { bg: '#fefce8', border: '#fef08a', badge: '#eab308', label: '🟡 À faire'  },
  low:      { bg: '#f0fdf4', border: '#bbf7d0', badge: '#22c55e', label: '🟢 Bonus'    },
};

function SuggestionCard({ s, onApply, applied, applying }) {
  const ps = PRIORITY_STYLES[s.priority] || PRIORITY_STYLES.low;

  return (
    <div style={{
      background: applied ? '#f0fdf4' : ps.bg,
      border: `1.5px solid ${applied ? '#86efac' : ps.border}`,
      borderRadius: '14px', padding: '14px 16px',
      transition: 'all 0.25s',
      opacity: applied ? 0.75 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#111827', lineHeight: 1.3, flex: 1 }}>{s.title}</h4>
        <span style={{ padding: '2px 8px', borderRadius: '10px', background: ps.badge, color: '#fff', fontSize: '10px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {ps.label}
        </span>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>{s.description}</p>
      {s.impact && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1' }}>💡 {s.impact}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {applied ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#16a34a' }}>
            <CheckIcon /> Appliqué !
          </div>
        ) : s.action ? (
          <button onClick={() => onApply(s)} disabled={applying}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', fontSize: '12px', fontWeight: '800',
              cursor: applying ? 'not-allowed' : 'pointer',
              opacity: applying ? 0.7 : 1, transition: 'opacity 0.15s',
            }}>
            {applying ? <LoaderIcon /> : <SparkleIcon />}
            {applying ? 'Application...' : s.actionLabel || 'Appliquer'}
          </button>
        ) : s.actionLink ? (
          <a href={s.actionLink} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 14px', borderRadius: '10px',
            background: '#f1f5f9', color: '#475569',
            fontSize: '12px', fontWeight: '700', textDecoration: 'none',
          }}>
            {s.actionLabel} <ArrowIcon />
          </a>
        ) : null}
      </div>
    </div>
  );
}

// ─── Panneau conseiller principal ─────────────────────────────────────────────
export default function StoreAdvisorPanel({ storeId, onModulesUpdate }) {
  const [analysis, setAnalysis]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [applied,  setApplied]    = useState({}); // { suggestionId: true }
  const [applying, setApplying]   = useState(null);
  const [filter,   setFilter]     = useState('all');

  const loadAnalysis = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/ai/store-advisor?storeId=${storeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur analyse');
      setAnalysis(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (storeId) loadAnalysis(); }, [storeId]);

  const handleApply = async (suggestion) => {
    setApplying(suggestion.id);
    try {
      const res  = await fetch('/api/ai/store-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, suggestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.updatedModules) onModulesUpdate?.(data.updatedModules);
      setApplied(prev => ({ ...prev, [suggestion.id]: true }));
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setApplying(null);
    }
  };

  const filteredSuggestions = analysis?.suggestions?.filter(s =>
    filter === 'all' || s.priority === filter || s.category === filter
  ) || [];

  const CATEGORY_LABELS = { structure: '🏗️ Structure', branding: '🎨 Branding', confiance: '🛡️ Confiance', catalogue: '🛍️ Catalogue', seo: '🔍 SEO', marketing: '📣 Marketing' };
  const categories = [...new Set(analysis?.suggestions?.map(s => s.category))];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spinAI { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#7c3aed' }}><LoaderIcon /></div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>Mistral analyse votre boutique…</p>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Diagnostic en cours sur 10 critères</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#ef4444', fontWeight: '700' }}>❌ {error}</p>
      <button onClick={loadAnalysis} style={{ marginTop: '12px', padding: '8px 18px', borderRadius: '10px', background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Réessayer</button>
    </div>
  );

  if (!analysis) return null;

  const appliedCount = Object.keys(applied).length;
  const newScore = Math.min(100, analysis.score + appliedCount * 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <style>{`@keyframes spinAI { to { transform: rotate(360deg); } } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }`}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '13px' }}>🔍 Diagnostic IA</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>{analysis.storeName}</div>
          </div>
          <button onClick={loadAnalysis} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            <RefreshIcon /> Relancer
          </button>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ScoreGauge score={appliedCount > 0 ? newScore : analysis.score} grade={analysis.grade} />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>{analysis.gradeLabel}</div>
            {appliedCount > 0 && (
              <div style={{ color: '#86efac', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                🎉 +{appliedCount * 8} pts après vos {appliedCount} amélioration(s) !
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {analysis.scoreDetails?.slice(0, 4).map((d, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: d.ok === true ? '#86efac' : d.ok === 'partial' ? '#fde68a' : '#fca5a5', background: 'rgba(255,255,255,0.1)', padding: '2px 7px', borderRadius: '6px' }}>
                  {d.ok === true ? '✓' : d.ok === 'partial' ? '~' : '✗'} {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Message IA ─────────────────────────────────────────────────────── */}
      {analysis.aiMessage && (
        <div style={{ padding: '12px 16px', background: '#faf5ff', borderBottom: '1px solid #e9d5ff', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <SparkleIcon />
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#4c1d95', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{analysis.aiMessage}"
            </p>
          </div>
        </div>
      )}

      {/* ── Filtres ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')}
          style={{ padding: '4px 10px', borderRadius: '15px', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: filter === 'all' ? '#7c3aed' : '#f1f5f9', color: filter === 'all' ? '#fff' : '#64748b' }}>
          Tout ({analysis.suggestions.length})
        </button>
        {['critical','high','medium','low'].filter(p => analysis.suggestions.some(s => s.priority === p)).map(p => {
          const ps = PRIORITY_STYLES[p];
          const count = analysis.suggestions.filter(s => s.priority === p).length;
          return (
            <button key={p} onClick={() => setFilter(p)}
              style={{ padding: '4px 10px', borderRadius: '15px', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: filter === p ? ps.badge : '#f1f5f9', color: filter === p ? '#fff' : '#64748b' }}>
              {ps.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Liste des suggestions ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredSuggestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#374151' }}>Tout est parfait ici !</p>
          </div>
        ) : filteredSuggestions.map(s => (
          <div key={s.id} style={{ animation: 'fadeIn 0.25s ease-out' }}>
            <SuggestionCard
              s={s}
              onApply={handleApply}
              applied={applied[s.id]}
              applying={applying === s.id}
            />
          </div>
        ))}

        {appliedCount > 0 && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '14px 16px', textAlign: 'center', marginTop: '4px' }}>
            <p style={{ margin: '0 0 4px', fontWeight: '800', color: '#15803d', fontSize: '14px' }}>
              🚀 {appliedCount} amélioration{appliedCount > 1 ? 's' : ''} appliquée{appliedCount > 1 ? 's' : ''} !
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>
              Score estimé : {newScore}/100 — Continuez pour atteindre 100 !
            </p>
          </div>
        )}
      </div>

      {/* Bas */}
      <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '10px', color: '#94a3b8', background: '#fafafa' }}>
        ⚡ Analyse propulsée par <strong>Mistral AI</strong> · {analysis.suggestions.length} recommandations
      </div>
    </div>
  );
}
