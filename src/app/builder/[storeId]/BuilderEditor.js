'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilder } from '@/context/BuilderContext';
import { 
  SECTORS, 
  getTemplatesBySector, 
  getTemplateById,
  getTemplatesBySubSector,
  STORE_TEMPLATES,
} from '@/lib/storeTemplates';
import TemplateConfigurator from '@/components/TemplateConfigurator';
import { supabase } from '@/lib/supabase';
import { Outfit } from 'next/font/google';

const artFont = Outfit({ subsets: ['latin'], weight: ['700', '800', '900'] });

// ─── Palettes ───────────────────────────────────────────────────────────────
const PALETTES = [
  { id: 'tech',    name: 'Tech Blue',      primary: '#2563EB', accent: '#F59E0B', bg: '#0F172A', mode: 'dark',  grad: 'linear-gradient(135deg,#1e40af,#2563EB)' },
  { id: 'jade',   name: 'Vert VesTyle',   primary: '#059669', accent: '#10B981', bg: '#ECFDF5', mode: 'light', grad: 'linear-gradient(135deg,#059669,#10B981)' },
  { id: 'gold',   name: 'Or & Luxe',      primary: '#B45309', accent: '#F59E0B', bg: '#1C0A00', mode: 'dark',  grad: 'linear-gradient(135deg,#92400e,#F59E0B)' },
  { id: 'indigo', name: 'Indigo Neon',    primary: '#4F46E5', accent: '#A855F7', bg: '#0F172A', mode: 'dark',  grad: 'linear-gradient(135deg,#312e81,#7c3aed)' },
  { id: 'rose',   name: 'Rose Premium',   primary: '#BE185D', accent: '#EC4899', bg: '#FFF1F2', mode: 'light', grad: 'linear-gradient(135deg,#9d174d,#ec4899)' },
  { id: 'slate',  name: 'Minimaliste',    primary: '#0F172A', accent: '#64748B', bg: '#F8FAFC', mode: 'light', grad: 'linear-gradient(135deg,#0f172a,#334155)' },
  { id: 'amber',  name: 'Soleil Chaud',   primary: '#D97706', accent: '#EF4444', bg: '#FFFBEB', mode: 'light', grad: 'linear-gradient(135deg,#b45309,#ef4444)' },
  { id: 'teal',   name: 'Océan Profond',  primary: '#0D9488', accent: '#06B6D4', bg: '#0F172A', mode: 'dark',  grad: 'linear-gradient(135deg,#0f766e,#0891b2)' },
  { id: 'violet', name: 'Violet Élite',   primary: '#7C3AED', accent: '#C026D3', bg: '#1C0033', mode: 'dark',  grad: 'linear-gradient(135deg,#5b21b6,#c026d3)' },
];

const FONTS = [
  { id: 'Inter', label: 'Inter', sub: 'Neutre & Universel' },
  { id: 'Outfit', label: 'Outfit', sub: 'Moderne & Premium' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sub: 'Tech & SaaS' },
  { id: 'Playfair Display', label: 'Playfair Display', sub: 'Luxe & Éditorial' },
  { id: 'Lora', label: 'Lora', sub: 'Chaleureux & Littéraire' },
  { id: 'Nunito', label: 'Nunito', sub: 'Doux & Amical' },
  { id: 'DM Sans', label: 'DM Sans', sub: 'Épuré & Contemporain' },
];

// ─── Variantes d'animation pour les transitions entre étapes ────────────────
const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
};
const pageTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 38,
  mass: 0.85,
};

// ─── Indicateur de progression ───────────────────────────────────────────────
function StepIndicator({ currentStep, total, accent }) {
  const steps = [
    { n: 1, label: 'Secteur' },
    { n: 2, label: 'Template' },
    { n: 3, label: 'Contenu' },
    { n: 4, label: 'Style' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 16px 16px', position: 'relative' }}>
      {steps.map((s, i) => {
        const isDone = currentStep > s.n;
        const isActive = currentStep === s.n;
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 'initial' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                animate={{
                  background: isDone ? '#10B981' : isActive ? accent : 'rgba(255,255,255,0.15)',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: isDone || isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: isActive ? `2px solid ${accent}` : isDone ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.15)',
                  position: 'relative', zIndex: 2,
                }}
              >
                {isDone ? '✓' : s.n}
              </motion.div>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: isActive ? '#fff' : isDone ? '#10B981' : 'rgba(255,255,255,0.4)',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                animate={{ background: isDone ? '#10B981' : 'rgba(255,255,255,0.12)' }}
                transition={{ duration: 0.4 }}
                style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 20, borderRadius: 2 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal de spécificités [i] ───────────────────────────────────────────────
function TemplateInfoModal({ template, onClose, onSelect }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 0 0',
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '28px 28px 0 0',
            width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
            padding: 24, paddingBottom: 32,
          }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e2e8f0', margin: '0 auto 20px' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: template.preview,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>{template.emoji}</div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '0 0 3px' }}>{template.name}</h3>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 99,
                background: template.badgeColor + '20', color: template.badgeColor,
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{template.badge}</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24, background: '#f8fafc', padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            {template.description}
          </p>

          {/* Pages */}
          {template.specifications?.pagesList?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📄</div>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {template.specifications.pagesCount} Pages Incluses
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {template.specifications.pagesList.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: '#EEF2FF', color: '#4F46E5', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carrousels */}
          {template.specifications?.carousels?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎠</div>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carrousels & Visuels</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {template.specifications.carousels.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>{c.where}</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 99, background: '#F59E0B', color: '#fff', fontSize: 11, fontWeight: 900 }}>{c.count} visuels</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configurables */}
          {template.specifications?.configurables?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚙️</div>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sections Configurables</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {template.specifications.configurables.map((c, i) => (
                  <span key={i} style={{ padding: '6px 12px', borderRadius: 99, background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 800, border: '1px solid #A7F3D0' }}>
                    ✓ {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '14px', borderRadius: 16, border: '2px solid #e2e8f0',
              background: '#fff', color: '#0f172a', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}>Fermer</button>
            <button onClick={() => { onSelect(template); onClose(); }} style={{
              flex: 2, padding: '14px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #1a3fc4, #2d3fd6)',
              color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
            }}>Choisir ce Template →</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function BuilderEditor({ storeId, onModulesUpdate, onThemeUpdate, onTemplateSelect }) {
  const { state, setTheme, dispatch } = useBuilder();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [activeSector, setActiveSector] = useState('boutique');
  const [activeSubSector, setActiveSubSector] = useState('boutique_tech');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [infoTemplate, setInfoTemplate] = useState(null);
  const [applying, setApplying] = useState(false);

  const currentTheme = state.themeConfig || {};
  const accent = currentTheme.primaryColor || '#2563EB';

  // Sync depuis store
  useEffect(() => {
    if (!state.store) return;
    const tplId = state.store?.store_template || 'boutique_tech_pro';
    const tmpl = getTemplateById(tplId);
    if (tmpl) {
      setActiveTemplate(tmpl);
      setActiveSector(tmpl.sector || 'boutique');
      setActiveSubSector(tmpl.subSector || 'boutique_tech');
    }
  }, [state.store]);

  const goTo = useCallback((n) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  }, [step]);

  const next = useCallback(() => goTo(Math.min(step + 1, 4)), [step, goTo]);
  const prev = useCallback(() => goTo(Math.max(step - 1, 1)), [step, goTo]);

  const handleSectorChange = useCallback((secId) => {
    setActiveSector(secId);
    const sec = SECTORS.find(s => s.id === secId);
    if (sec?.subSectors?.[0]) setActiveSubSector(sec.subSectors[0].id);
  }, []);

  const handleTemplateSelect = useCallback(async (tmpl) => {
    if (!storeId || !tmpl) return;
    setApplying(true);
    setActiveTemplate(tmpl);
    try {
      const res = await fetch('/api/store/apply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, templateId: tmpl.id, keepExisting: false }),
      });
      const data = await res.json();
      if (data.success) {
        const newTheme = { primaryColor: tmpl.theme.primaryColor, secondaryColor: tmpl.theme.secondaryColor, accentColor: tmpl.theme.accentColor, fontFamily: tmpl.theme.fontFamily, mode: tmpl.theme.mode };
        setTheme(newTheme);
        onThemeUpdate?.(newTheme);
        if (data.updatedModules) { onModulesUpdate?.(data.updatedModules); dispatch({ type: 'LOAD_TEMPLATE', modules: tmpl.modules, themeConfig: newTheme }); }
      }
      await supabase.from('stores').update({ store_template: tmpl.id }).eq('id', storeId);
      onTemplateSelect?.(tmpl.id);
    } catch (e) { console.error(e); }
    finally { setApplying(false); }
  }, [storeId, setTheme, onThemeUpdate, onModulesUpdate, dispatch, onTemplateSelect]);

  const applyPalette = useCallback((p) => {
    const t = { primaryColor: p.primary, secondaryColor: p.bg, accentColor: p.accent, fontFamily: currentTheme.fontFamily || 'Inter', mode: p.mode };
    setTheme(t); onThemeUpdate?.(t);
    if (storeId) fetch('/api/store/save-theme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeId, theme_color: p.primary, secondary_color: p.bg, accent_color: p.accent, font_family: t.fontFamily, theme_mode: p.mode }) }).catch(() => {});
  }, [currentTheme, setTheme, onThemeUpdate, storeId]);

  const updateTheme = useCallback((field, val) => {
    const t = { ...currentTheme, [field]: val };
    setTheme(t); onThemeUpdate?.(t);
    if (storeId) fetch('/api/store/save-theme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeId, theme_color: t.primaryColor, secondary_color: t.secondaryColor, accent_color: t.accentColor, font_family: t.fontFamily, theme_mode: t.mode }) }).catch(() => {});
  }, [currentTheme, setTheme, onThemeUpdate, storeId]);

  const currentSector = SECTORS.find(s => s.id === activeSector);
  const displayedTemplates = activeSubSector ? getTemplatesBySubSector(activeSubSector) : getTemplatesBySector(activeSector);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F2F5FB', fontFamily: 'Inter, sans-serif' }}>

      {/* ── EN-TÊTE ÉDITEUR AVEC GRADIENT BLEU ── */}
      <div style={{
        background: 'linear-gradient(130deg, #1a3fc4 0%, #1e52d6 45%, #2d3fd6 100%)',
        padding: '20px 20px 0', flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}>
        {/* Halos ambiants */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,60,0.7) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(15px)', pointerEvents: 'none' }} />

        {/* Logo + Nom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(6px)' }}>✨</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }} className={artFont.className}>Créateur de Boutique</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>VesTyle Studio Pro</div>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <StepIndicator currentStep={step} total={4} accent="#F59E0B" />
      </div>

      {/* ── CORPS AVEC TRANSITIONS ANIMÉES ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >

            {/* ══════════════════════════════════════════════════════════════════════
                ÉTAPE 1 : SECTEUR & SOUS-SECTEUR
            ═══════════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }} className={artFont.className}>Quel est votre secteur ?</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Choisissez votre activité principale pour commencer</p>
                </div>

                {/* 3 Grands Secteurs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {SECTORS.map((sec) => {
                    const isSelected = activeSector === sec.id;
                    return (
                      <motion.button
                        key={sec.id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSectorChange(sec.id)}
                        style={{
                          padding: '16px 18px', borderRadius: 20, border: 'none',
                          background: isSelected ? 'linear-gradient(130deg, #1a3fc4 0%, #2d3fd6 100%)' : '#fff',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          boxShadow: isSelected ? '0 8px 32px rgba(37,99,235,0.35)' : '0 2px 12px rgba(0,0,0,0.06)',
                          border: isSelected ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                            background: isSelected ? 'rgba(255,255,255,0.15)' : sec.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                            border: isSelected ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                          }}>{sec.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: isSelected ? '#fff' : '#0f172a', marginBottom: 3 }} className={artFont.className}>{sec.label}</div>
                            <div style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.7)' : '#64748b', fontWeight: 600, lineHeight: 1.4 }}>{sec.description}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {sec.subSectors.map(sub => (
                                <span key={sub.id} style={{
                                  padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                                  background: isSelected ? 'rgba(255,255,255,0.15)' : '#F1F5F9',
                                  color: isSelected ? 'rgba(255,255,255,0.8)' : '#475569',
                                  border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                                }}>
                                  {sub.emoji} {sub.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                              style={{ width: 28, height: 28, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, color: '#fff', fontWeight: 900 }}
                            >✓</motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sous-secteurs */}
                {currentSector && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      Sous-secteur de {currentSector.label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {currentSector.subSectors.map(sub => {
                        const isSub = activeSubSector === sub.id;
                        return (
                          <motion.button
                            key={sub.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveSubSector(sub.id)}
                            style={{
                              padding: '12px 14px', borderRadius: 14,
                              border: isSub ? '2px solid #1a3fc4' : '2px solid #F1F5F9',
                              background: isSub ? '#EEF2FF' : '#F8FAFC',
                              cursor: 'pointer', textAlign: 'left', width: '100%',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 18 }}>{sub.emoji}</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: isSub ? '#1a3fc4' : '#334155' }}>{sub.label}</span>
                            </div>
                            {isSub && <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a3fc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(37,99,235,0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={next}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 18, border: 'none',
                    background: 'linear-gradient(130deg, #1a3fc4 0%, #2d3fd6 100%)',
                    color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 28px rgba(37,99,235,0.4)', letterSpacing: '-0.01em',
                  }}
                  className={artFont.className}
                >
                  Choisir un Template →
                </motion.button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                ÉTAPE 2 : TEMPLATES VISUELS AVEC BOUTON [i]
            ═══════════════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }} className={artFont.className}>Choisissez votre template</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    {SECTORS.find(s => s.id === activeSector)?.subSectors.find(s => s.id === activeSubSector)?.label || 'Tous les templates'}
                  </p>
                </div>

                {displayedTemplates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 20, color: '#64748b' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Templates en préparation</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>Nous créons des templates de qualité pour ce secteur.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {displayedTemplates.map((tmpl) => {
                      const isSelected = activeTemplate?.id === tmpl.id;
                      return (
                        <motion.div
                          key={tmpl.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -3 }}
                          style={{
                            borderRadius: 22, overflow: 'hidden',
                            border: isSelected ? '2.5px solid #1a3fc4' : '2px solid #e2e8f0',
                            background: '#fff',
                            boxShadow: isSelected ? '0 12px 40px rgba(37,99,235,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
                          }}
                        >
                          {/* Aperçu visuel */}
                          <div style={{ height: 100, background: tmpl.preview, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
                            <span style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 32, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{tmpl.emoji}</span>
                            
                            {/* Badge */}
                            <span style={{
                              position: 'absolute', top: 10, right: 44,
                              padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                              background: tmpl.badgeColor, color: '#fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            }}>{tmpl.badge}</span>

                            {/* Bouton [i] */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setInfoTemplate(tmpl); }}
                              style={{
                                position: 'absolute', top: 10, right: 10,
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.3)',
                                color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                              }}
                              title="Voir les spécificités du template"
                            >i</motion.button>
                          </div>

                          {/* Contenu */}
                          <div style={{ padding: '14px 16px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                              <div>
                                <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 3 }} className={artFont.className}>{tmpl.name}</div>
                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{tmpl.tagline}</div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={applying}
                                onClick={() => handleTemplateSelect(tmpl)}
                                style={{
                                  padding: '8px 16px', borderRadius: 12, border: 'none',
                                  background: isSelected ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(130deg, #1a3fc4, #2d3fd6)',
                                  color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
                                  boxShadow: isSelected ? '0 4px 14px rgba(16,185,129,0.4)' : '0 4px 14px rgba(37,99,235,0.35)',
                                  opacity: applying ? 0.7 : 1,
                                }}
                              >
                                {applying ? '...' : isSelected ? '✓ Actif' : 'Choisir'}
                              </motion.button>
                            </div>

                            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{tmpl.description}</p>

                            {/* Stats rapides */}
                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#64748b' }}>
                                📄 {tmpl.specifications?.pagesCount || 4} pages
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#64748b' }}>
                                🎠 {tmpl.specifications?.carousels?.length || 0} carrousel{(tmpl.specifications?.carousels?.length || 0) > 1 ? 's' : ''}
                              </span>
                              <button onClick={() => setInfoTemplate(tmpl)} style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#1a3fc4', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                Fiche technique [i] →
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={prev} style={{ padding: '14px 20px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>← Retour</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next} style={{ flex: 1, padding: '14px', borderRadius: 16, border: 'none', background: 'linear-gradient(130deg, #1a3fc4, #2d3fd6)', color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 22px rgba(37,99,235,0.4)' }} className={artFont.className}>
                    Configurer le Contenu →
                  </motion.button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                ÉTAPE 3 : CONFIGURATION DU CONTENU (DYNAMIQUE SELON TEMPLATE)
            ═══════════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }} className={artFont.className}>Configurez votre boutique</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Contenu, bannières, horaires & modules spécifiques</p>
                  {activeTemplate && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 12px', borderRadius: 99, background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                      <span style={{ fontSize: 14 }}>{activeTemplate.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#3730a3' }}>{activeTemplate.name}</span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <TemplateConfigurator
                    store={{ ...(state.store || {}), id: storeId, store_template: activeTemplate?.id || state.store?.store_template || 'boutique_tech_pro' }}
                    onUpdateStore={(fields) => { if (storeId) supabase.from('stores').update(fields).eq('id', storeId).then(() => {}); }}
                    activeTemplateId={activeTemplate?.id || state.store?.store_template || 'boutique_tech_pro'}
                    onTemplateChange={(tmplId) => { const tmpl = getTemplateById(tmplId); if (tmpl) handleTemplateSelect(tmpl); }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={prev} style={{ padding: '14px 20px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>← Retour</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next} style={{ flex: 1, padding: '14px', borderRadius: 16, border: 'none', background: 'linear-gradient(130deg, #1a3fc4, #2d3fd6)', color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 22px rgba(37,99,235,0.4)' }} className={artFont.className}>
                    Style & Publication →
                  </motion.button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                ÉTAPE 4 : STYLE, COULEURS, TYPO & PUBLICATION
            ═══════════════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }} className={artFont.className}>Style & Publication</h2>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Finalisez l'identité visuelle et publiez en direct</p>
                </div>

                {/* Palettes */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Palettes de Couleurs — 1 Clic</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {PALETTES.map(p => {
                      const isP = currentTheme.primaryColor === p.primary;
                      return (
                        <motion.button
                          key={p.id}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => applyPalette(p)}
                          style={{
                            padding: '10px 8px', borderRadius: 14, border: 'none',
                            background: isP ? '#EEF2FF' : '#F8FAFC',
                            cursor: 'pointer', textAlign: 'center',
                            outline: isP ? '2.5px solid #1a3fc4' : '2px solid transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ height: 36, borderRadius: 10, background: p.grad, marginBottom: 6, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                            <div style={{ position: 'absolute', right: 6, bottom: 5, width: 12, height: 12, borderRadius: '50%', background: p.accent, border: '2px solid rgba(255,255,255,0.7)' }} />
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{p.name}</div>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{p.mode === 'dark' ? '🌙' : '☀️'}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Couleurs précises */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Personnalisation Fine</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Couleur Principale</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Boutons, liens actifs</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{currentTheme.primaryColor || '#2563EB'}</span>
                        <input type="color" value={currentTheme.primaryColor || '#2563EB'} onChange={e => updateTheme('primaryColor', e.target.value)} style={{ width: 36, height: 36, borderRadius: 10, border: '2px solid #e2e8f0', cursor: 'pointer', padding: 2 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Couleur d'Accent</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Badges, promos, highlights</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{currentTheme.accentColor || '#F59E0B'}</span>
                        <input type="color" value={currentTheme.accentColor || '#F59E0B'} onChange={e => updateTheme('accentColor', e.target.value)} style={{ width: 36, height: 36, borderRadius: 10, border: '2px solid #e2e8f0', cursor: 'pointer', padding: 2 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Mode Visuel</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Fond de la boutique</div>
                      </div>
                      <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 3, gap: 2 }}>
                        {[{id:'light',label:'☀️ Clair'},{id:'dark',label:'🌙 Sombre'}].map(m => (
                          <button key={m.id} onClick={() => updateTheme('mode', m.id)} style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 800,
                            background: currentTheme.mode === m.id ? '#fff' : 'transparent',
                            color: currentTheme.mode === m.id ? '#0f172a' : '#64748b',
                            cursor: 'pointer', boxShadow: currentTheme.mode === m.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          }}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typographies */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Typographie</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FONTS.map(f => {
                      const isF = (currentTheme.fontFamily || 'Inter') === f.id;
                      return (
                        <motion.button key={f.id} whileHover={{ x: 4 }} onClick={() => updateTheme('fontFamily', f.id)} style={{
                          padding: '10px 14px', borderRadius: 12, border: 'none',
                          background: isF ? '#EEF2FF' : '#F8FAFC',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          outline: isF ? '2px solid #1a3fc4' : '2px solid transparent',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: isF ? '#1a3fc4' : '#0f172a', fontFamily: f.id }}>{f.label}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{f.sub}</div>
                          </div>
                          {isF && <span style={{ fontSize: 14, color: '#1a3fc4' }}>✓</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Aperçu de publication */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{
                    borderRadius: 20, padding: '20px',
                    background: 'linear-gradient(130deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                    border: '2px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>🚀</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#064E3B', marginBottom: 3 }} className={artFont.className}>Boutique prête à publier</div>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Toutes vos modifications sont synchronisées en temps réel dans l'aperçu.</div>
                  </div>
                </motion.div>

                {/* Bouton retour */}
                <button onClick={prev} style={{ padding: '14px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>← Retour à la Configuration</button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FOOTER STATUS ── */}
      <div style={{
        height: 44, background: '#fff', borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sync en direct</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>
          ✨ VesTyle Studio
        </div>
      </div>

      {/* ── MODAL INFO TEMPLATE [i] ── */}
      {infoTemplate && (
        <TemplateInfoModal
          template={infoTemplate}
          onClose={() => setInfoTemplate(null)}
          onSelect={(tmpl) => { handleTemplateSelect(tmpl); next(); }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
