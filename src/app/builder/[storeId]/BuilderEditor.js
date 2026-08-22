'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilder } from '@/context/BuilderContext';
import { SECTORS, getTemplatesBySubSector, getTemplatesBySector, getTemplateById } from '@/lib/storeTemplates';
import { loadTemplate } from '@/lib/blockEngine/templateLoader';
import { BLOCK_REGISTRY } from '@/lib/blockEngine/registry';
import { supabase } from '@/lib/supabase';
import { Outfit } from 'next/font/google';

const artFont = Outfit({ subsets: ['latin'], weight: ['700', '800', '900'] });

const slide = {
  enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
};
const spring = { type: 'spring', stiffness: 380, damping: 38, mass: 0.85 };

// ─── Step indicator cliquable ─────────────────────────────────────────────────
function Steps({ step, onStepClick, accent = '#6366f1' }) {
  const items = ['Secteur', 'Template', 'Configurer'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 16px', gap: 0 }}>
      {items.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
            <button
              onClick={() => onStepClick?.(n)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <motion.div
                animate={{ background: done ? '#10B981' : active ? accent : 'rgba(255,255,255,0.15)', scale: active ? 1.1 : 1 }}
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: done || active ? '#fff' : 'rgba(255,255,255,0.45)', border: active ? `2px solid ${accent}` : done ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.15)' }}
              >{done ? '✓' : n}</motion.div>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: active ? '#fff' : done ? '#10B981' : 'rgba(255,255,255,0.4)' }}>{label}</span>
            </button>
            {i < 2 && <motion.div animate={{ background: done ? '#10B981' : 'rgba(255,255,255,0.12)' }} style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 20, borderRadius: 2 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Champ de saisie stylé ────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, marginTop: -2 }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14,
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

// ─── Section accordion ───────────────────────────────────────────────────────
function Section({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: '#111827' }}>{title}</span>
        <span style={{ color: '#9ca3af', fontSize: 16, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>{children}</div>}
    </div>
  );
}

// ─── Save Status Badge ───────────────────────────────────────────────────────
function SaveBadge({ status }) {
  const map = { idle: null, saving: '🔄 Sauvegarde...', saved: '✓ Sauvegardé', error: '⚠️ Erreur' };
  const colors = { saving: '#6366f1', saved: '#10B981', error: '#ef4444' };
  if (!map[status]) return null;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: colors[status], padding: '3px 10px', borderRadius: 20, background: colors[status] + '15' }}>
      {map[status]}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
export default function BuilderEditor({ storeId, onBlocksUpdate, onThemeUpdate }) {
  const { state, setTheme } = useBuilder();

  // ── Navigation ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const goTo = (n) => { setDir(n > step ? 1 : -1); setStep(n); };

  // ── State wizard ──────────────────────────────────────────────────────────
  const [activeSector, setActiveSector] = useState('boutique');
  const [activeSub, setActiveSub] = useState('boutique_tech');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [applying, setApplying] = useState(false);
  const [activeBlocks, setActiveBlocks] = useState([]);

  // ── State formulaires de configuration ───────────────────────────────────
  const [cfg, setCfg] = useState({
    storeName: '', slogan: '', logo: '',
    whatsapp: '', phone: '', email: '', address: '',
    heroTitle: '', heroSubtitle: '', heroCta: '',
    primaryColor: '#6366f1',
    instagram: '', facebook: '', tiktok: '',
    hours: '',
  });

  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimer = useRef(null);

  // ── Hydratation initiale depuis la BDD ─────────────────────────────────────
  useEffect(() => {
    if (!state.store) return;
    const s = state.store;
    const existingBlocks = s.layout_config?.blocks || [];

    // Détermination du template adapté au SECTEUR réel de la boutique
    const storeSector = s.business_type || s.sector || 'boutique';
    let tmplId = s.store_template;
    let tmpl = getTemplateById(tmplId);
    if (!tmpl) {
      tmpl = STORE_TEMPLATES.find(t => t.sector === storeSector) || STORE_TEMPLATES[0] || null;
    }

    if (tmpl) {
      setActiveTemplate(tmpl);
      setActiveSector(tmpl.sector || 'boutique');
      setActiveSub(tmpl.subSector || 'boutique_livres');
    }

    if (existingBlocks.length > 0) {
      setActiveBlocks(existingBlocks);
      setStep(3);
    } else if (tmpl) {
      // Charger automatiquement les blocs du template par défaut
      const tplData = loadTemplate(tmpl.id, storeSector);
      setActiveBlocks(tplData.blocks || []);
    }

    setCfg({
      storeName: s.name || '',
      slogan: s.slogan || s.description || '',
      logo: s.logo_url || '',
      whatsapp: s.whatsapp || s.phone || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      heroTitle: existingBlocks.find(b => b.type === 'hero')?.content?.title || s.name || 'Bienvenue',
      heroSubtitle: existingBlocks.find(b => b.type === 'hero')?.content?.subtitle || '',
      heroCta: existingBlocks.find(b => b.type === 'hero')?.content?.ctaText || 'Découvrir',
      primaryColor: s.theme_color || tmpl?.theme?.primaryColor || '#6366f1',
      instagram: s.social_links?.instagram || '',
      facebook: s.social_links?.facebook || '',
      tiktok: s.social_links?.tiktok || '',
      hours: s.opening_hours || '',
    });
  }, [state.store]);

  // ── Appliquer un template JSON ─────────────────────────────────────────────
  const applyTemplate = useCallback(async (tmpl) => {
    if (!storeId || !tmpl) return;
    setApplying(true);
    try {
      const storeSector = state.store?.business_type || state.store?.sector || 'boutique';
      const tplData = loadTemplate(tmpl.id, storeSector);
      const blocks = tplData?.blocks || [];

      const themedBlocks = blocks.map(b => {
        if (b.type === 'hero') {
          return { ...b, content: { ...b.content, title: state.store?.name || cfg.storeName || 'Bienvenue' } };
        }
        return b;
      });

      await supabase.from('stores').update({
        store_template: tmpl.id,
        theme_color: tmpl.theme.primaryColor,
        secondary_color: tmpl.theme.secondaryColor || '#ffffff',
        accent_color: tmpl.theme.accentColor,
        font_family: tmpl.theme.fontFamily,
        theme_mode: tmpl.theme.mode,
        layout_config: { blocks: themedBlocks },
      }).eq('id', storeId);

      const newTheme = {
        primaryColor: tmpl.theme.primaryColor,
        secondaryColor: tmpl.theme.secondaryColor,
        accentColor: tmpl.theme.accentColor,
        fontFamily: tmpl.theme.fontFamily,
        mode: tmpl.theme.mode,
      };

      setTheme(newTheme);
      onThemeUpdate?.(newTheme);
      onBlocksUpdate?.(themedBlocks);

      setActiveTemplate(tmpl);
      setActiveBlocks(themedBlocks);
      setCfg(prev => ({
        ...prev,
        primaryColor: tmpl.theme.primaryColor,
        heroTitle: state.store?.name || prev.storeName || 'Bienvenue',
      }));

      goTo(3);
    } catch (e) {
      console.error('[applyTemplate]', e);
    } finally {
      setApplying(false);
    }
  }, [storeId, state.store, cfg.storeName, setTheme, onThemeUpdate, onBlocksUpdate]);

  // ── Auto-save des données du formulaire ────────────────────────────────────
  const autoSave = useCallback((newCfg, currentBlocksList) => {
    if (!storeId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');

    saveTimer.current = setTimeout(async () => {
      try {
        const blocksToUse = currentBlocksList || activeBlocks;
        const updatedBlocks = blocksToUse.map(b => {
          if (b.type === 'hero') {
            return {
              ...b,
              content: {
                ...b.content,
                title: newCfg.heroTitle || b.content?.title,
                subtitle: newCfg.heroSubtitle || b.content?.subtitle,
                ctaText: newCfg.heroCta || b.content?.ctaText,
              },
            };
          }
          if (b.type === 'header' || b.type === 'footer') {
            return { ...b, content: { ...b.content, storeName: newCfg.storeName } };
          }
          if (b.type === 'contact') {
            return {
              ...b,
              content: {
                ...b.content,
                phone: newCfg.phone || b.content?.phone,
                email: newCfg.email || b.content?.email,
                address: newCfg.address || b.content?.address,
                whatsapp: newCfg.whatsapp || b.content?.whatsapp,
              },
            };
          }
          if (b.type === 'social') {
            return {
              ...b,
              content: {
                ...b.content,
                instagram: newCfg.instagram,
                facebook: newCfg.facebook,
                tiktok: newCfg.tiktok,
              },
            };
          }
          return b;
        });

        await supabase.from('stores').update({
          ...(newCfg.storeName ? { name: newCfg.storeName } : {}),
          ...(newCfg.logo ? { logo_url: newCfg.logo } : {}),
          ...(newCfg.phone ? { phone: newCfg.phone } : {}),
          ...(newCfg.email ? { email: newCfg.email } : {}),
          ...(newCfg.address ? { address: newCfg.address } : {}),
          ...(newCfg.whatsapp ? { whatsapp: newCfg.whatsapp } : {}),
          ...(newCfg.primaryColor ? { theme_color: newCfg.primaryColor } : {}),
          social_links: { instagram: newCfg.instagram || null, facebook: newCfg.facebook || null, tiktok: newCfg.tiktok || null },
          layout_config: { blocks: updatedBlocks },
        }).eq('id', storeId);

        onBlocksUpdate?.(updatedBlocks);
        onThemeUpdate?.({ primaryColor: newCfg.primaryColor });

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        console.error('[autoSave]', e);
        setSaveStatus('error');
      }
    }, 800);
  }, [storeId, activeBlocks, onBlocksUpdate, onThemeUpdate]);

  // ── Toggle ON/OFF d'un bloc ───────────────────────────────────────────────
  const toggleBlockEnabled = (blockId) => {
    const nextBlocks = activeBlocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b);
    setActiveBlocks(nextBlocks);
    onBlocksUpdate?.(nextBlocks);
    autoSave(cfg, nextBlocks);
  };

  const handleCfg = (key, val) => {
    const next = { ...cfg, [key]: val };
    setCfg(next);
    autoSave(next, activeBlocks);
    if (key === 'primaryColor') {
      setTheme({ ...state.themeConfig, primaryColor: val });
      onThemeUpdate?.({ ...state.themeConfig, primaryColor: val });
    }
  };

  const currentSector = SECTORS.find(s => s.id === activeSector);
  const subTmpls = activeSub ? getTemplatesBySubSector(activeSub) : [];
  const displayedTemplates = subTmpls.length > 0
    ? subTmpls
    : getTemplatesBySector(activeSector);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F2F5FB' }}>

      {/* ── EN-TÊTE ÉDITEUR ───────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(130deg, #1a3fc4 0%, #2d3fd6 100%)',
        padding: '18px 20px 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }} className={artFont.className}>
              {step === 3 ? 'Configurer ma boutique' : 'Créer ma boutique'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeTemplate ? activeTemplate.name : 'VesTyle Studio'}
            </div>
          </div>
          {step === 3 && <div style={{ marginLeft: 'auto' }}><SaveBadge status={saveStatus} /></div>}
        </div>
        <Steps step={step} onStepClick={goTo} accent="#F59E0B" />
      </div>

      {/* ── CORPS ANIMÉ ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >

            {/* ══════════════════════════════════════════
                ÉTAPE 1 — SECTEUR
            ══════════════════════════════════════════ */}
            {step === 1 && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }} className={artFont.className}>Quel est votre secteur ?</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Choisissez votre activité principale</p>
                </div>

                {SECTORS.map((sec) => {
                  const sel = activeSector === sec.id;
                  return (
                    <motion.button
                      key={sec.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setActiveSector(sec.id);
                        setActiveSub(sec.subSectors[0]?.id || '');
                      }}
                      style={{
                        padding: '16px', borderRadius: 18, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                        background: sel ? 'linear-gradient(130deg,#1a3fc4,#2d3fd6)' : '#fff',
                        boxShadow: sel ? '0 8px 32px rgba(37,99,235,0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
                        outline: sel ? '2px solid rgba(255,255,255,0.2)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: sel ? 'rgba(255,255,255,0.15)' : sec.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {sec.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: sel ? '#fff' : '#0f172a', marginBottom: 2 }} className={artFont.className}>{sec.label}</div>
                          <div style={{ fontSize: 11, color: sel ? 'rgba(255,255,255,0.7)' : '#64748b', lineHeight: 1.4 }}>{sec.description}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                            {sec.subSectors.map(s => (
                              <span key={s.id} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sel ? 'rgba(255,255,255,0.15)' : '#f1f5f9', color: sel ? 'rgba(255,255,255,0.8)' : '#475569' }}>
                                {s.emoji} {s.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        {sel && <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>✓</div>}
                      </div>
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goTo(2)}
                  style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: 'linear-gradient(130deg,#1a3fc4,#2d3fd6)', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', marginTop: 4 }}
                  className={artFont.className}
                >
                  Voir les templates →
                </motion.button>
              </>
            )}

            {/* ══════════════════════════════════════════
                ÉTAPE 2 — TEMPLATE
            ══════════════════════════════════════════ */}
            {step === 2 && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }} className={artFont.className}>Choisissez votre template</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Sélectionné par nos experts pour votre secteur</p>
                </div>

                {currentSector && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {currentSector.subSectors.map(sub => (
                      <button key={sub.id} onClick={() => setActiveSub(sub.id)} style={{
                        padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${activeSub === sub.id ? '#1a3fc4' : '#e5e7eb'}`,
                        background: activeSub === sub.id ? '#EEF2FF' : '#fff', color: activeSub === sub.id ? '#1a3fc4' : '#64748b',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}>
                        {sub.emoji} {sub.label}
                      </button>
                    ))}
                  </div>
                )}

                {displayedTemplates.map((tmpl) => {
                  const sel = activeTemplate?.id === tmpl.id;
                  return (
                    <motion.div
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      style={{ borderRadius: 20, overflow: 'hidden', border: sel ? '2.5px solid #1a3fc4' : '2px solid #e5e7eb', background: '#fff', boxShadow: sel ? '0 8px 32px rgba(37,99,235,0.2)' : '0 2px 10px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ height: 90, background: tmpl.preview, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
                        <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 28 }}>{tmpl.emoji}</span>
                        <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 99, background: tmpl.badgeColor, color: '#fff', fontSize: 9, fontWeight: 900 }}>{tmpl.badge}</span>
                      </div>
                      <div style={{ padding: '12px 14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }} className={artFont.className}>{tmpl.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{tmpl.tagline}</div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={applying}
                            onClick={() => applyTemplate(tmpl)}
                            style={{
                              padding: '8px 16px', borderRadius: 10, border: 'none',
                              background: sel ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#1a3fc4,#2d3fd6)',
                              color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
                              opacity: applying ? 0.7 : 1,
                            }}
                          >
                            {applying && sel ? '⏳' : sel ? '✓ Actif' : 'Choisir'}
                          </motion.button>
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{tmpl.description}</p>
                      </div>
                    </motion.div>
                  );
                })}

                <button onClick={() => goTo(1)} style={{ padding: '12px', borderRadius: 14, border: '2px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  ← Retour
                </button>
              </>
            )}

            {/* ══════════════════════════════════════════
                ÉTAPE 3 — CONFIGURATEUR SMART & BLOCS
            ══════════════════════════════════════════ */}
            {step === 3 && (
              <>
                {/* Template Badge & Changer */}
                {activeTemplate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                    <span style={{ fontSize: 22 }}>{activeTemplate.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#3730a3' }}>{activeTemplate.name}</div>
                      <div style={{ fontSize: 10, color: '#6366f1' }}>Template officiel actif</div>
                    </div>
                    <button onClick={() => goTo(2)} style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Changer →</button>
                  </div>
                )}

                {/* ── 1. Structure & Gestion des Blocs ───────────────── */}
                <Section icon="🧩" title="Structure & Blocs du Template">
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, margin: 0 }}>
                    Activez ou désactivez les blocs du template selon vos préférences :
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                    {activeBlocks.map((b) => {
                      const meta = BLOCK_REGISTRY[b.type] || { label: b.type, icon: '📦' };
                      const isEnabled = b.enabled !== false;
                      return (
                        <div key={b.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: 10,
                          background: isEnabled ? '#f8fafc' : '#f1f5f9',
                          border: `1px solid ${isEnabled ? '#e2e8f0' : '#cbd5e1'}`,
                          opacity: isEnabled ? 1 : 0.6,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{meta.icon || '📦'}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{meta.label || b.type}</span>
                            <span style={{ fontSize: 10, color: '#94a3b8', background: '#fff', padding: '1px 6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>{b.variant}</span>
                          </div>
                          <button
                            onClick={() => toggleBlockEnabled(b.id)}
                            style={{
                              padding: '4px 12px', borderRadius: 20, border: 'none',
                              background: isEnabled ? '#10B981' : '#cbd5e1', color: '#fff',
                              fontSize: 11, fontWeight: 800, cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                          >
                            {isEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* ── 2. Identité de la boutique ─────────────────────── */}
                <Section icon="🏪" title="Identité de la boutique">
                  <Field label="Nom de la boutique">
                    <input style={inputStyle} value={cfg.storeName} onChange={e => handleCfg('storeName', e.target.value)} placeholder="Ex: Tech Express Douala" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Slogan" hint="Une phrase courte et mémorable">
                    <input style={inputStyle} value={cfg.slogan} onChange={e => handleCfg('slogan', e.target.value)} placeholder="Ex: La tech au meilleur prix" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Logo URL" hint="Lien de votre logo (hébergé)">
                    <input style={inputStyle} value={cfg.logo} onChange={e => handleCfg('logo', e.target.value)} placeholder="https://..." onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                </Section>

                {/* ── 3. Couleur principale ──────────────────────────── */}
                <Section icon="🎨" title="Couleur principale">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="color" value={cfg.primaryColor} onChange={e => handleCfg('primaryColor', e.target.value)}
                      style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{cfg.primaryColor}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Couleur d'accentuation des boutons</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {['#2563EB', '#059669', '#8C5E3C', '#D4AF37', '#EC4899', '#7C3AED', '#0D9488', '#111827'].map(c => (
                      <button key={c} onClick={() => handleCfg('primaryColor', c)} style={{ width: 30, height: 30, borderRadius: 8, background: c, border: cfg.primaryColor === c ? '3px solid #111' : '2px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
                    ))}
                  </div>
                </Section>

                {/* ── 4. Bannière principale ─────────────────────────── */}
                <Section icon="🎯" title="Bannière principale (Hero)">
                  <Field label="Titre principal">
                    <input style={inputStyle} value={cfg.heroTitle} onChange={e => handleCfg('heroTitle', e.target.value)} placeholder="Ex: Bienvenue dans notre boutique" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Sous-titre">
                    <input style={inputStyle} value={cfg.heroSubtitle} onChange={e => handleCfg('heroSubtitle', e.target.value)} placeholder="Ex: Découvrez nos meilleures collections" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Texte du bouton">
                    <input style={inputStyle} value={cfg.heroCta} onChange={e => handleCfg('heroCta', e.target.value)} placeholder="Ex: Voir le catalogue" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                </Section>

                {/* ── 5. Contact & WhatsApp ──────────────────────────── */}
                <Section icon="📞" title="Contact & WhatsApp">
                  <Field label="Numéro WhatsApp" hint="Format: 237650000000 (avec indicatif)">
                    <input style={inputStyle} type="tel" value={cfg.whatsapp} onChange={e => handleCfg('whatsapp', e.target.value)} placeholder="237650000000" onFocus={e => e.target.style.borderColor = '#25D366'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Téléphone">
                    <input style={inputStyle} type="tel" value={cfg.phone} onChange={e => handleCfg('phone', e.target.value)} placeholder="+237 6XX XXX XXX" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Email">
                    <input style={inputStyle} type="email" value={cfg.email} onChange={e => handleCfg('email', e.target.value)} placeholder="contact@maboutique.com" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Adresse physique">
                    <input style={inputStyle} value={cfg.address} onChange={e => handleCfg('address', e.target.value)} placeholder="Ex: Avenue Kennedy, Douala" onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                </Section>

                {/* ── 6. Réseaux sociaux ─────────────────────────────── */}
                <Section icon="📱" title="Réseaux sociaux" defaultOpen={false}>
                  <Field label="Instagram (lien)">
                    <input style={inputStyle} value={cfg.instagram} onChange={e => handleCfg('instagram', e.target.value)} placeholder="https://instagram.com/maboutique" onFocus={e => e.target.style.borderColor = '#E1306C'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="Facebook (lien)">
                    <input style={inputStyle} value={cfg.facebook} onChange={e => handleCfg('facebook', e.target.value)} placeholder="https://facebook.com/maboutique" onFocus={e => e.target.style.borderColor = '#1877F2'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                  <Field label="TikTok (lien)">
                    <input style={inputStyle} value={cfg.tiktok} onChange={e => handleCfg('tiktok', e.target.value)} placeholder="https://tiktok.com/@maboutique" onFocus={e => e.target.style.borderColor = '#010101'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </Field>
                </Section>

                {/* ── 7. Catalogue produits ───────────────────────────── */}
                <Section icon="📦" title="Gestion du Catalogue" defaultOpen={false}>
                  <div style={{ padding: '10px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>🛍️</div>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                      Ajoutez et modifiez vos articles directement dans votre catalogue.
                    </p>
                    <a href="/dashboard/products" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: cfg.primaryColor || '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                      Gérer mon catalogue →
                    </a>
                  </div>
                </Section>

                {/* ── Link Boutique ──────────────────────────────────── */}
                {state.store?.slug && (
                  <a
                    href={`/boutique/${state.store.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 14,
                      background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff',
                      fontWeight: 800, fontSize: 14, textDecoration: 'none',
                      boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🚀</span>
                    <div>
                      <div>Voir ma boutique en ligne</div>
                      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>vestyle.shop/{state.store.slug}</div>
                    </div>
                  </a>
                )}
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FOOTER STATUS ──────────────────────────────────────────────── */}
      <div style={{ height: 40, background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sync en direct</span>
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>✨ VesTyle Studio</span>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
