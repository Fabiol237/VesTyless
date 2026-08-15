'use client';
import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { BuilderProvider, useBuilder, BUSINESS_TYPES } from '@/context/BuilderContext';
import { normalizeStoreModules } from '@/lib/storeModuleUtils.mjs';
import BuilderEditor from './BuilderEditor';
import BuilderPreview from './BuilderPreview';
import BuilderTopBar from './BuilderTopBar';

/* ── Loader ─────────────────────────────────────────────────────────────── */
function Loader() {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ position: 'relative', width: 60, height: 60 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid rgba(99,102,241,0.15)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%', animation: 'lspin .8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(168,85,247,0.2)',
          borderBottom: '2px solid #a855f7',
          borderRadius: '50%', animation: 'lspin .6s linear infinite reverse',
        }} />
        <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', fontSize: 16 }}>✨</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>Chargement de l&apos;éditeur</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '6px 0 0' }}>Préparation de votre espace créatif…</p>
      </div>
      <style>{`@keyframes lspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Corps principal ────────────────────────────────────────────────────── */
function BuilderInner({ storeId }) {
  const { user, loading: authLoading } = useAuth();
  const { init, state, toggleMobilePreview, setTheme } = useBuilder();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [liveModules, setLiveModules] = useState(null);
  const [liveTheme, setLiveTheme] = useState(null);
  const [liveTemplateId, setLiveTemplateId] = useState(null);

  /* Détection mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Chargement des données boutique */
  useEffect(() => {
    if (!storeId || authLoading) return;
    (async () => {
      const { data: storeData } = await supabase
        .from('stores').select('*').eq('id', storeId).single();
      if (!storeData || storeData.owner_id !== user?.id) {
        router.push('/dashboard');
        return;
      }
      const { data: modulesData } = await supabase
        .from('store_modules').select('*')
        .eq('store_id', storeId).order('position', { ascending: true });

      const themeConfig = {
        _themeId:       storeData.shop_theme       || 'theme_00',
        primaryColor:   storeData.theme_color      || '#6366f1',
        secondaryColor: storeData.secondary_color  || '#ffffff',
        accentColor:    storeData.accent_color     || '#4f46e5',
        fontFamily:     storeData.font_family      || 'Inter',
        mode:           storeData.theme_mode       || 'light',
      };
      init(storeData, normalizeStoreModules(modulesData || []), themeConfig, storeData.business_type || null);
      setLoading(false);
    })();
  }, [storeId, user, authLoading, init, router]);

  const handleModulesUpdate  = useCallback((m) => setLiveModules(m), []);
  const handleThemeUpdate    = useCallback((t) => { setLiveTheme(t); setTheme(t); }, [setTheme]);
  const handleTemplateSelect = useCallback((id) => setLiveTemplateId(id), []);

  if (loading || authLoading) return <Loader />;

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden', background: '#f1f5f9',
    }}>
      {/* Barre supérieure */}
      <BuilderTopBar storeId={storeId} />

      {/* Corps : Éditeur | Aperçu */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Panneau gauche — Éditeur */}
        <div style={{
          width: isMobile ? '100%' : 400,
          flexShrink: 0,
          display: isMobile && state.showPreview ? 'none' : 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e2e8f0',
          background: '#ffffff',
          overflow: 'hidden',
        }}>
          <BuilderEditor
            storeId={storeId}
            onModulesUpdate={handleModulesUpdate}
            onThemeUpdate={handleThemeUpdate}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>

        {/* Panneau droit — Prévisualisation */}
        <div style={{
          flex: 1,
          display: isMobile && !state.showPreview ? 'none' : 'block',
          overflow: 'hidden',
          background: '#111827',
          position: 'relative',
        }}>
          <BuilderPreview
            externalModules={liveModules}
            externalTheme={liveTheme}
            activeTemplateId={liveTemplateId}
          />
        </div>
      </div>

      {/* Bouton flottant mobile */}
      {isMobile && (
        <button
          onClick={toggleMobilePreview}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 200,
            padding: '13px 20px', borderRadius: 999, border: 'none',
            background: `linear-gradient(135deg, ${state.themeConfig?.primaryColor || '#6366f1'}, ${state.themeConfig?.accentColor || '#a855f7'})`,
            color: '#fff', fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(99,102,241,0.45)', fontFamily: 'inherit',
          }}>
          {state.showPreview ? '✏️ Modifier' : '👁 Aperçu'}
        </button>
      )}
    </div>
  );
}

export default function BuilderPage({ params }) {
  const { storeId } = use(params);
  return (
    <BuilderProvider>
      <BuilderInner storeId={storeId} />
    </BuilderProvider>
  );
}