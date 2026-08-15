'use client';
import { useState, useEffect } from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { getTemplate } from '@/templates';
import { supabase } from '@/lib/supabase';
import { Laptop, Smartphone, Tablet } from 'lucide-react';

/* ─── Calcul des variables CSS depuis le thème ────────────────────────────── */
function buildThemeVars(raw = {}) {
  const primary   = raw.primaryColor   || raw.theme_color      || '#6366f1';
  const accent    = raw.accentColor    || raw.accent_color     || primary;
  const secondary = raw.secondaryColor || raw.secondary_color  || '#ffffff';
  const font      = raw.fontFamily     || raw.font_family      || 'Inter';
  const dark      = raw.mode === 'dark' || raw.theme_mode === 'dark';
  return {
    '--prim':   primary,
    '--acc':    accent,
    '--bg':     dark ? '#0f172a' : secondary,
    '--fg':     dark ? '#f8fafc' : '#111827',
    '--fg2':    dark ? 'rgba(255,255,255,0.55)' : '#6b7280',
    '--border': dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    '--font':   `'${font}', Inter, sans-serif`,
  };
}

/* ─── Conteneur de prévisualisation avec encadrement étanche (pas de débordement) ─── */
function PreviewContainer({ children, deviceMode, onDeviceChange, bg }) {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#0F172A', overflow: 'hidden', position: 'relative' }}>
      
      {/* Barre de contrôle du mode de prévisualisation */}
      <div style={{
        height: 48, background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '0 16px', flexShrink: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aperçu Direct En Temps Réel
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0F172A', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginLeft: 'auto' }}>
          <button
            onClick={() => onDeviceChange('desktop')}
            title="Aperçu Ordinateur"
            style={{
              background: deviceMode === 'desktop' ? '#334155' : 'transparent',
              color: deviceMode === 'desktop' ? '#FFF' : '#64748B',
              border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700
            }}
          >
            <Laptop size={14} /> <span style={{ display: deviceMode === 'desktop' ? 'inline' : 'none' }}>Bureau</span>
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            title="Aperçu Tablette"
            style={{
              background: deviceMode === 'tablet' ? '#334155' : 'transparent',
              color: deviceMode === 'tablet' ? '#FFF' : '#64748B',
              border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700
            }}
          >
            <Tablet size={14} /> <span style={{ display: deviceMode === 'tablet' ? 'inline' : 'none' }}>Tablette</span>
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            title="Aperçu Mobile"
            style={{
              background: deviceMode === 'mobile' ? '#334155' : 'transparent',
              color: deviceMode === 'mobile' ? '#FFF' : '#64748B',
              border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700
            }}
          >
            <Smartphone size={14} /> <span style={{ display: deviceMode === 'mobile' ? 'inline' : 'none' }}>Mobile</span>
          </button>
        </div>
      </div>

      {/* Frame de visualisation confiné pour éviter tout débordement */}
      <div style={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: deviceMode === 'desktop' ? 0 : 20, background: '#090D16' }}>
        <div style={{
          width: deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '768px' : '390px',
          height: deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '90%' : '844px',
          maxHeight: '100%',
          background: bg || '#fff',
          borderRadius: deviceMode === 'desktop' ? 0 : 24,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: deviceMode === 'desktop' ? 'none' : '0 20px 60px rgba(0,0,0,0.6), 0 0 0 12px #1E293B',
          position: 'relative',
          isolation: 'isolate',
          contain: 'paint'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPreview({ externalModules, externalTheme, activeTemplateId }) {
  const { state } = useBuilder();
  const { modules: ctxModules, themeConfig: ctxTheme, previewTab, store } = state;

  const [deviceMode, setDeviceMode] = useState('desktop');

  useEffect(() => {
    if (previewTab === 'mobile') setDeviceMode('mobile');
  }, [previewTab]);

  const modules     = externalModules ?? ctxModules;
  const themeConfig = externalTheme   ?? ctxTheme;
  const themeVars   = buildThemeVars(themeConfig);

  // Store enrichi avec le templateId live et layout_config
  const effectiveStore = {
    ...(store || {}),
    store_template: activeTemplateId || store?.store_template || 'boutique_pro'
  };

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!store?.id) return;
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.from('products').select('*')
          .eq('store_id', store.id).eq('is_active', true)
          .order('created_at', { ascending: false }).limit(12);
        if (alive && data) setProducts(data);
      } catch (_) {}
    })();
    return () => { alive = false; };
  }, [store?.id]);

  const TemplateComponent = getTemplate(modules, effectiveStore);

  const templateProps = {
    store:            effectiveStore || { name: 'Ma Boutique', positive_rating: 100, response_time: '< 1h' },
    themeVars,
    storeId:          store?.id,
    isMobile:         deviceMode === 'mobile',
    productsProp:     products,
    isPreview:        true,
    onAddToCart:      () => {},
    onOpenCart:       () => {},
    cartCount:        0,
    handleShare:      () => {},
    handleDirections: () => {},
    shared:           false,
    currency:         store?.currency || 'FCFA',
  };

  const content = (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <TemplateComponent {...templateProps} />
    </div>
  );

  const bgColor = themeVars['--bg'] || '#fff';

  return (
    <PreviewContainer deviceMode={deviceMode} onDeviceChange={setDeviceMode} bg={bgColor}>
      {content}
    </PreviewContainer>
  );
}
