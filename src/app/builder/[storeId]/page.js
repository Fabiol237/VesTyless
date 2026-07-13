'use client';
import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { BuilderProvider, useBuilder, BUSINESS_TYPES } from '@/context/BuilderContext';
import BuilderEditor from './BuilderEditor';
import BuilderPreview from './BuilderPreview';
import BuilderTopBar from './BuilderTopBar';

function BuilderInner({ storeId }) {
  const { user } = useAuth();
  const { init, state, togglePreview, setTheme } = useBuilder();
  const router = useRouter();
  const [loading, setLoading]   = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modules & thème "temps réel" injectés par le chat IA
  const [liveModules, setLiveModules] = useState(null);
  const [liveTheme,   setLiveTheme]   = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const load = async () => {
      const { data: storeData } = await supabase.from('stores').select('*').eq('id', storeId).single();
      if (!storeData || storeData.owner_id !== user?.id) { router.push('/dashboard'); return; }

      const { data: modulesData } = await supabase
        .from('store_modules')
        .select('*')
        .eq('store_id', storeId)
        .order('position', { ascending: true });

      const themeConfig = {
        _themeId:       storeData.shop_theme || 'theme_00',
        primaryColor:   storeData.theme_color    || BUSINESS_TYPES['ecommerce'].theme.primaryColor,
        secondaryColor: storeData.secondary_color || BUSINESS_TYPES['ecommerce'].theme.secondaryColor,
        accentColor:    storeData.accent_color    || '#4f46e5',
        fontFamily:     storeData.font_family     || BUSINESS_TYPES['ecommerce'].theme.fontFamily,
        mode:           storeData.theme_mode      || 'light',
      };
      const businessType = storeData.business_type || null;

      init(storeData, modulesData || [], themeConfig, businessType);
      setLoading(false);
    };
    load();
  }, [storeId, user, init, router]);

  // ── Handlers IA → injectés dans BuilderEditor → MistralBuilderChat ──────
  const handleModulesUpdate = useCallback((updatedModules) => {
    setLiveModules(updatedModules);
  }, []);

  const handleThemeUpdate = useCallback((newTheme) => {
    setLiveTheme(newTheme);
    setTheme(newTheme); // Sync aussi dans le contexte
  }, [setTheme]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#efeae2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(0,168,132,0.3)', borderTop: '3px solid #00a884', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#54656f', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Chargement de l&apos;éditeur...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const accentColor = '#7c3aed';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#efeae2', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <BuilderTopBar storeId={storeId} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left panel - Editor */}
        <div style={{
          width: isMobile ? '100%' : '420px',
          maxWidth: isMobile ? '100%' : '420px',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid #d1d7db',
          boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
          display: (isMobile && state.showPreview) ? 'none' : 'flex',
          flexDirection: 'column',
        }}>
          <BuilderEditor
            storeId={storeId}
            onModulesUpdate={handleModulesUpdate}
            onThemeUpdate={handleThemeUpdate}
          />
        </div>

        {/* Right panel - Live preview */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          background: '#efeae2',
          display: (isMobile && !state.showPreview) ? 'none' : 'block',
        }}>
          <BuilderPreview
            externalModules={liveModules}
            externalTheme={liveTheme}
          />
        </div>
      </div>

      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={togglePreview}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
            padding: '14px 20px', borderRadius: '999px', border: 'none',
            background: accentColor,
            color: '#fff', fontWeight: '800', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            boxShadow: `0 8px 32px ${accentColor}60`,
            fontFamily: 'inherit',
          }}>
          {state.showPreview ? '✏️ Modifier' : '👁 Aperçu web'}
        </button>
      )}
    </div>
  );
}

export default function BuilderPage({ params }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.storeId;

  return (
    <BuilderProvider>
      <BuilderInner storeId={storeId} />
    </BuilderProvider>
  );
}
