'use client';
import { useState, useEffect } from 'react';
import { useBuilder } from '@/context/BuilderContext';
import { getTemplate } from '@/templates';
import { StorefrontRenderer } from '@/lib/blockEngine/renderer';
import { supabase } from '@/lib/supabase';
import { Laptop, Smartphone, Tablet } from 'lucide-react';

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

function PreviewContainer({ children, deviceMode, onDeviceChange, bg }) {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#0F172A', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ height: 48, background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aperçu en temps réel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0F172A', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginLeft: 'auto' }}>
          {[
            { id: 'desktop', Icon: Laptop, label: 'Bureau' },
            { id: 'tablet', Icon: Tablet, label: 'Tablette' },
            { id: 'mobile', Icon: Smartphone, label: 'Mobile' },
          ].map(({ id, Icon, label }) => (
            <button key={id} onClick={() => onDeviceChange(id)} title={label} style={{ background: deviceMode === id ? '#334155' : 'transparent', color: deviceMode === id ? '#FFF' : '#64748B', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
              <Icon size={14} />
              {deviceMode === id && <span>{label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Frame */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: deviceMode === 'desktop' ? 0 : 16, background: '#090D16' }}>
        <div style={{
          width: deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '768px' : '390px',
          maxWidth: '100%',
          height: deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '90%' : '844px',
          maxHeight: '100%',
          background: bg || '#fff',
          borderRadius: deviceMode === 'desktop' ? 0 : 24,
          overflowY: 'auto', overflowX: 'hidden',
          boxShadow: deviceMode === 'desktop' ? 'none' : '0 20px 60px rgba(0,0,0,0.6), 0 0 0 12px #1E293B',
          position: 'relative', isolation: 'isolate',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPreview({ externalBlocks, externalTheme }) {
  const { state } = useBuilder();
  const { themeConfig: ctxTheme, store } = state;

  const [deviceMode, setDeviceMode]   = useState('desktop');
  const [products, setProducts]       = useState([]);
  const [storeBlocks, setStoreBlocks] = useState(null);

  const themeConfig = externalTheme ?? ctxTheme ?? {};
  const themeVars   = buildThemeVars(themeConfig);

  // Charger les produits
  useEffect(() => {
    if (!store?.id) return;
    let alive = true;
    supabase.from('products').select('*').eq('store_id', store.id).eq('is_active', true).order('created_at', { ascending: false }).limit(12).then(({ data }) => {
      if (alive && data) setProducts(data);
    });
    return () => { alive = false; };
  }, [store?.id]);

  // Charger les blocs depuis Supabase uniquement si pas de blocs injectés via props
  useEffect(() => {
    if (!store?.id || externalBlocks !== undefined) return; // Skip if parent provides blocks
    let alive = true;
    const load = async () => {
      const { data } = await supabase.from('stores').select('layout_config').eq('id', store.id).single();
      const blocks = data?.layout_config?.blocks;
      if (alive && Array.isArray(blocks) && blocks.length > 0) {
        setStoreBlocks(blocks);
      }
    };
    load();
    // Poll léger toutes les 4s seulement si pas de props directes
    const interval = setInterval(load, 4000);
    return () => { alive = false; clearInterval(interval); };
  }, [store?.id, externalBlocks]);

  // Les blocs à rendre (priorité : externalBlocks > storeBlocks > fallback template legacy)
  const blocks = externalBlocks ?? storeBlocks;
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;

  const themeForRenderer = {
    primaryColor: themeVars['--prim'],
    fontFamily: themeConfig.fontFamily || 'Inter',
    mode: themeConfig.mode || 'light',
  };

  // Fallback legacy si pas de blocs configurés
  const TemplateComponent = !hasBlocks ? getTemplate(state.modules, store) : null;

  const content = hasBlocks ? (
    <div style={{ fontFamily: themeVars['--font'] || 'Inter, sans-serif', minHeight: '100%' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${(themeConfig.fontFamily || 'Inter').replace(/ /g,'+')}:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
      <StorefrontRenderer
        blocks={blocks}
        theme={themeForRenderer}
        store={store || {}}
        products={products}
        onAddToCart={() => {}}
        currency={store?.currency || 'XOF'}
      />
    </div>
  ) : TemplateComponent ? (
    <TemplateComponent
      store={store || { name: 'Ma Boutique' }}
      themeVars={themeVars}
      storeId={store?.id}
      isMobile={deviceMode === 'mobile'}
      productsProp={products}
      isPreview={true}
      onAddToCart={() => {}}
      onOpenCart={() => {}}
      cartCount={0}
      handleShare={() => {}}
      handleDirections={() => {}}
      shared={false}
      currency={store?.currency || 'FCFA'}
    />
  ) : (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: '#9ca3af', padding: 40 }}>
      <div style={{ fontSize: 48 }}>🏪</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Sélectionnez un template</div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
        Choisissez votre secteur et votre template pour voir l'aperçu en temps réel.
      </div>
    </div>
  );

  return (
    <PreviewContainer deviceMode={deviceMode} onDeviceChange={setDeviceMode} bg={themeVars['--bg'] || '#fff'}>
      {content}
    </PreviewContainer>
  );
}
