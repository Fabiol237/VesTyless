'use client';
import { useState, useCallback, useEffect } from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { SECTORS, SECTOR_TEMPLATES, getTemplatesBySector } from '@/lib/storeTemplates';
import { PAGE_CONFIGS, getDefaultVariant } from '@/lib/pageConfigs';
import TemplateConfigurator from '@/components/TemplateConfigurator';
import { supabase } from '@/lib/supabase';

/* ─── Icônes ───────────────────────────────────────────────────────────── */
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSpin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'vspin .7s linear infinite', display: 'block' }}>
    <path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconPaint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/>
    <circle cx="6.5" cy="12.5" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);
const IconGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ─── Thèmes de couleurs ─────────────────────────────────────────────────── */
const QUICK_THEMES = [
  { id: 't_jade',    name: 'Jade',     primary: '#25D366', secondary: '#ffffff', accent: '#128C7E', font: 'Inter',             mode: 'light', grad: 'linear-gradient(135deg,#25D366,#128C7E)' },
  { id: 't_gold',    name: 'Or',       primary: '#C9960C', secondary: '#1a1208', accent: '#EA580C', font: 'Playfair Display',  mode: 'dark',  grad: 'linear-gradient(135deg,#C9960C,#EA580C)' },
  { id: 't_violet',  name: 'Violet',   primary: '#6366f1', secondary: '#0f0c29', accent: '#a855f7', font: 'Plus Jakarta Sans', mode: 'dark',  grad: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  { id: 't_rose',    name: 'Rose',     primary: '#ec4899', secondary: '#fdf2f8', accent: '#7c3aed', font: 'Cormorant Garamond',mode: 'light', grad: 'linear-gradient(135deg,#ec4899,#7c3aed)' },
  { id: 't_brick',   name: 'Brique',   primary: '#C87D55', secondary: '#1C0A00', accent: '#FF6B35', font: 'Outfit',            mode: 'dark',  grad: 'linear-gradient(135deg,#C87D55,#FF6B35)' },
  { id: 't_blue',    name: 'Marine',   primary: '#003087', secondary: '#F4F6F9', accent: '#FF6B00', font: 'Inter',             mode: 'light', grad: 'linear-gradient(135deg,#003087,#0052CC)' },
  { id: 't_forest',  name: 'Forêt',    primary: '#1B7A3A', secondary: '#F0FFF4', accent: '#FF8C00', font: 'Inter',             mode: 'light', grad: 'linear-gradient(135deg,#1B7A3A,#2ECC71)' },
  { id: 't_purple',  name: 'Prune',    primary: '#764ba2', secondary: '#ffffff', accent: '#667eea', font: 'Nunito',            mode: 'light', grad: 'linear-gradient(135deg,#764ba2,#667eea)' },
  { id: 't_caramel', name: 'Caramel',  primary: '#92400e', secondary: '#fef9f0', accent: '#f59e0b', font: 'Plus Jakarta Sans', mode: 'light', grad: 'linear-gradient(135deg,#f59e0b,#92400e)' },
  { id: 't_artisan', name: 'Artisan',  primary: '#8B5E3C', secondary: '#FBF9F5', accent: '#D4A574', font: 'Lora',             mode: 'light', grad: 'linear-gradient(135deg,#D4A574,#8B5E3C)' },
  { id: 't_noir',    name: 'Nuit',     primary: '#f1f5f9', secondary: '#0f172a', accent: '#6366f1', font: 'Inter',            mode: 'dark',  grad: 'linear-gradient(135deg,#0f172a,#1e293b)' },
  { id: 't_white',   name: 'Blanc',    primary: '#0f172a', secondary: '#ffffff', accent: '#6366f1', font: 'Inter',            mode: 'light', grad: 'linear-gradient(135deg,#f8fafc,#e2e8f0)' },
];

/* ─── Styles CSS communs ─────────────────────────────────────────────────── */
const css = `
@keyframes vspin { to { transform: rotate(360deg); } }
@keyframes vfade  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.vb-step  { animation: vfade .3s ease; }
.vb-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
.vb-card  { transition: all .2s ease !important; }
.vb-btn:hover { opacity: .88; }
.vb-tmpl:hover { transform: scale(1.01); box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important; }
.vb-tmpl  { transition: all .18s ease !important; cursor: pointer; }
.vb-theme:hover { transform: scale(1.05); }
.vb-theme { transition: all .15s ease !important; cursor: pointer; }
.vb-var:hover { border-color: var(--accent) !important; }
.vb-var  { transition: all .18s ease !important; cursor: pointer; }
`;

export default function BuilderEditor({ storeId, onModulesUpdate, onThemeUpdate, onTemplateSelect }) {
  const { state, setTheme, dispatch } = useBuilder();

  /* État local de l'éditeur */
  const [activeSector, setActiveSector] = useState(null);       // 'boutique' | 'artisan' | 'prestataire'
  const [activeTemplate, setActiveTemplate] = useState(null);   // objet template
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);     // 'theme' | 'pages' | null
  const [pageVariants, setPageVariants] = useState({});         // { accueil: 'carousel', ... }

  /* Initialiser depuis l'état existant */
  useEffect(() => {
    if (!state.store) return;
    const tplId = state.store?.store_template;
    if (!tplId) return;
    // Retrouver le template existant
    const allTplIds = Object.values(SECTOR_TEMPLATES).flat();
    const existing = allTplIds.find(t => t.id === tplId);
    if (existing) {
      setActiveSector(existing.sector);
      setActiveTemplate(existing);
    }
  }, [state.store]);

  /* ── Choisir un secteur ── */
  const handleSectorSelect = useCallback((sector) => {
    // Si on clique sur le secteur déjà actif, on le ferme
    if (activeSector === sector.id) {
      setActiveSector(null);
      return;
    }
    // Sinon on l'ouvre, sans appliquer de template aléatoire
    setActiveSector(sector.id);
  }, [activeSector]);

  /* ── Appliquer un template ── */
  const handleTemplateSelect = useCallback(async (tmpl) => {
    if (!storeId || !tmpl) return;
    if (activeTemplate?.id === tmpl.id) return;

    setApplying(true);
    setActiveTemplate(tmpl);

    try {
      const res = await fetch('/api/store/apply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, templateId: tmpl.id, keepExisting: false }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Mettre à jour le thème
      const newTheme = {
        primaryColor:   tmpl.theme.primaryColor,
        secondaryColor: tmpl.theme.secondaryColor,
        accentColor:    tmpl.theme.accentColor,
        fontFamily:     tmpl.theme.fontFamily,
        mode:           tmpl.theme.mode,
      };
      setTheme(newTheme);
      onThemeUpdate?.(newTheme);

      if (data.updatedModules) {
        onModulesUpdate?.(data.updatedModules);
        dispatch({ type: 'LOAD_TEMPLATE', modules: tmpl.modules, themeConfig: newTheme });
      }

      // Sauvegarder le template choisi
      await supabase.from('stores').update({ store_template: tmpl.id }).eq('id', storeId);

      // Variantes de pages par défaut
      const defaults = {};
      (tmpl.configurablePages || []).forEach(pk => {
        const def = getDefaultVariant(pk, tmpl.id);
        if (def) defaults[pk] = def.id;
      });
      setPageVariants(defaults);

      setApplied(tmpl.id);
      setTimeout(() => setApplied(null), 2500);
      // Notifier BuilderInner du template actif
      onTemplateSelect?.(tmpl.id);
    } catch (e) {
      console.error('[applyTemplate]', e);
    } finally {
      setApplying(false);
    }
  }, [storeId, activeTemplate, setTheme, onThemeUpdate, onModulesUpdate, dispatch]);

  /* ── Appliquer un thème rapide ── */
  const applyQuickTheme = useCallback((qt) => {
    const newTheme = {
      primaryColor:   qt.primary,
      secondaryColor: qt.secondary,
      accentColor:    qt.accent,
      fontFamily:     qt.font,
      mode:           qt.mode,
    };
    setTheme(newTheme);
    onThemeUpdate?.(newTheme);
    if (storeId) {
      fetch('/api/store/save-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, theme_color: qt.primary, accent_color: qt.accent, secondary_color: qt.secondary, font_family: qt.font, theme_mode: qt.mode }),
      }).catch(() => {});
    }
  }, [setTheme, onThemeUpdate, storeId]);

  const accent   = state.themeConfig?.primaryColor || '#6366f1';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', background: '#fff' }}>
      <style>{css}</style>

      {/* ── Header compact ── */}
      <div style={{ padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${state.themeConfig?.accentColor || '#a855f7'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            ✨
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', lineHeight: 1.2 }}>Créer ma boutique</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Aperçu mis à jour en temps réel</div>
          </div>
        </div>
      </div>

      {/* ── Corps scrollable ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* ══ ÉTAPE 1 : Secteur & Template ══ */}
        <Section label={activeSector ? "Choix du Template" : "1. Choisissez votre secteur"} emoji="🎯">
          
          {activeSector && (
            <button 
              onClick={() => setActiveSector(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ← Retour aux secteurs
            </button>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTORS.filter(s => activeSector ? s.id === activeSector : true).map(sector => {
              const isActive = activeSector === sector.id;
              const sectorTemplates = getTemplatesBySector(sector.id);

              return (
                <div key={sector.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Carte du Secteur */}
                  <button
                    className="vb-card"
                    onClick={() => handleSectorSelect(sector)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 14, border: 'none',
                      background: isActive ? sector.gradient : '#f8fafc',
                      cursor: isActive ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      boxShadow: isActive ? `0 4px 16px ${sector.color}30` : '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isActive ? 'rgba(255,255,255,0.2)' : sector.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {sector.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: isActive ? '#fff' : '#0f172a', marginBottom: 2 }}>{sector.label}</div>
                      <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.75)' : '#64748b', lineHeight: 1.4 }}>{sector.description}</div>
                      <div style={{ fontSize: 10, marginTop: 3, color: isActive ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontWeight: 600 }}>
                        {sector.count} template{sector.count !== 1 ? 's' : ''} disponible{sector.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>

                  {/* Liste des Templates si le secteur est actif */}
                  {isActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: `2px solid ${sector.color}40`, marginLeft: 22, marginTop: 4 }}>
                      {sectorTemplates.length === 0 ? (
                        <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>Aucun template pour le moment.</div>
                      ) : (
                        sectorTemplates.map(tmpl => {
                          const isTmplActive = activeTemplate?.id === tmpl.id;
                          return (
                            <button
                              key={tmpl.id}
                              onClick={() => handleTemplateSelect(tmpl)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 10, border: isTmplActive ? `1.5px solid ${sector.color}` : '1px solid #e2e8f0',
                                background: isTmplActive ? `${sector.color}10` : '#fff',
                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: tmpl.preview, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                {tmpl.emoji}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{tmpl.name}</div>
                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tmpl.badge}</div>
                              </div>
                              {isTmplActive && applying && <div style={{ fontSize: 12 }}>⏳</div>}
                              {isTmplActive && !applying && <IconCheck />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ══ ÉTAPE 2 : Personnalisation Dynamique du Template ══ */}
        <div style={{ padding: '12px' }}>
          <TemplateConfigurator
            store={{
              ...(state.store || {}),
              id: storeId,
              store_template: activeTemplate?.id || state.store?.store_template || 'boutique_pro'
            }}
            onUpdateStore={(fields) => {
              if (storeId) {
                supabase.from('stores').update(fields).eq('id', storeId).then(() => {});
              }
            }}
            activeTemplateId={activeTemplate?.id || state.store?.store_template || 'boutique_pro'}
            onTemplateChange={(tmplId) => {
              const tmpl = getTemplatesBySector(activeSector || 'boutique').find(t => t.id === tmplId) || SECTOR_TEMPLATES.boutique[0];
              if (tmpl) handleTemplateSelect(tmpl);
            }}
          />
        </div>



        {/* Espace bas */}
        <div style={{ height: 20 }} />
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9', background: '#fafafa', textAlign: 'center', fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>
        ⚡ Modifications visibles instantanément
      </div>
    </div>
  );
}

/* ─── Composants utilitaires ─────────────────────────────────────────────── */
function Section({ label, emoji, children, className }) {
  return (
    <div className={className} style={{ padding: '16px 14px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ fontWeight: 800, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{emoji}</span> {label}
      </div>
      {children}
    </div>
  );
}

function AccordionItem({ id, open, onToggle, icon, label, sub, children }) {
  return (
    <div style={{ marginBottom: 8, borderRadius: 12, border: `1px solid ${open ? '#e2e8f0' : '#f1f5f9'}`, overflow: 'hidden', background: '#fff' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', background: open ? '#f8fafc' : '#fff',
        border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        borderBottom: open ? '1px solid #f1f5f9' : 'none',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>{label}</div>
          {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
        </div>
        <div style={{ color: '#94a3b8', flexShrink: 0 }}><IconChevron open={open} /></div>
      </button>
      {open && (
        <div style={{ padding: '12px 12px 14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
