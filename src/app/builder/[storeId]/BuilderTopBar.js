'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilder } from '@/context/BuilderContext';
import { supabase } from '@/lib/supabase';

/* ── Icônes SVG ─────────────────────────────────────────────────────────── */
const IconSave    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>;
const IconGlobe   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const IconMonitor = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>;
const IconPhone   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>;
const IconBack    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const IconEye     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>;
const IconSpin    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'topspin .7s linear infinite', display: 'block' }}><path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/></svg>;

export default function BuilderTopBar({ storeId }) {
  const { state, dispatch, setPreviewTab } = useBuilder();
  const router = useRouter();
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [publishing, setPublishing] = useState(false);

  const accent      = state.themeConfig?.primaryColor || '#6366f1';
  const storeName   = state.store?.name || 'Ma Boutique';
  const isPublished = state.store?.is_active === true;
  const slug        = state.store?.slug || '';

  /* ── Sauvegarder ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('stores').update({
        shop_theme:      state.themeConfig?._themeId      || 'theme_00',
        theme_color:     state.themeConfig?.primaryColor  || '#6366f1',
        secondary_color: state.themeConfig?.secondaryColor|| '#ffffff',
        accent_color:    state.themeConfig?.accentColor   || '#4f46e5',
        font_family:     state.themeConfig?.fontFamily     || 'Inter',
        business_type:   state.businessType,
        updated_at:      new Date().toISOString(),
      }).eq('id', storeId);

      for (const m of state.modules) {
        if (m.id?.startsWith('temp_')) {
          const { data: ins } = await supabase.from('store_modules').insert({
            store_id: storeId, type: m.type, label: m.label, icon: m.icon,
            position: m.position, is_active: m.is_active, config: m.config,
          }).select().single();
          if (ins) dispatch({ type: 'UPDATE_MODULE_ID', oldId: m.id, newId: ins.id });
        } else {
          await supabase.from('store_modules').update({
            label: m.label, icon: m.icon, position: m.position,
            is_active: m.is_active, config: m.config,
            updated_at: new Date().toISOString(),
          }).eq('id', m.id);
        }
      }
      dispatch({ type: 'MARK_SAVED' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  /* ── Publier ── */
  const handlePublish = async () => {
    const win = window.open('about:blank', '_blank');
    setPublishing(true);
    await handleSave();
    await supabase.from('stores').update({ is_active: true }).eq('id', storeId);
    const { data: s } = await supabase.from('stores').select('slug').eq('id', storeId).single();
    setPublishing(false);
    if (s?.slug && win) win.location.href = `/boutique/${s.slug}`;
    else if (win) win.close();
  };

  return (
    <>
      <style>{`@keyframes topspin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', flexShrink: 0, zIndex: 100, gap: 8,
      }}>

        {/* ── Gauche : retour + nom ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
              fontWeight: 700, flexShrink: 0,
            }}>
            <IconBack /> Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}, ${state.themeConfig?.accentColor || '#a855f7'})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#fff',
            }}>✨</div>
            <span style={{
              fontWeight: 800, fontSize: 13, color: '#0f172a',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140,
            }}>
              {storeName}
            </span>
            {state.isDirty && (
              <span style={{
                fontSize: 9, color: '#f59e0b', background: '#fef3c7',
                padding: '2px 7px', borderRadius: 999, fontWeight: 700, flexShrink: 0,
              }}>
                Modifié
              </span>
            )}
          </div>
        </div>

        {/* ── Centre : PC / Mobile ── */}
        <div style={{
          display: 'flex', background: '#f1f5f9', borderRadius: 10,
          padding: 3, gap: 2, flexShrink: 0,
        }}>
          {[
            { id: 'desktop', Icon: IconMonitor, label: 'PC' },
            { id: 'mobile',  Icon: IconPhone,   label: 'Mobile' },
          ].map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setPreviewTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
              background: state.previewTab === id ? accent : 'transparent',
              color:      state.previewTab === id ? '#fff' : '#64748b',
              transition: 'all 0.2s',
            }}>
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* ── Droite : actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {slug && (
            <a href={`/boutique/${slug}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              color: '#475569', textDecoration: 'none', fontSize: 11, fontWeight: 700,
            }}>
              <IconEye /> Voir
            </a>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: saved ? '#dcf8c6' : '#fff',
            color:      saved ? '#008069' : '#0f172a',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
          }}>
            {saving ? <IconSpin /> : <IconSave />}
            {saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>

          <button onClick={handlePublish} disabled={publishing} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${accent}, ${state.themeConfig?.accentColor || '#a855f7'})`,
            color: '#fff', cursor: publishing ? 'wait' : 'pointer',
            fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
            boxShadow: `0 3px 10px ${accent}40`,
          }}>
            {publishing ? <IconSpin /> : <IconGlobe />}
            {isPublished ? 'Republier' : 'Publier'}
          </button>
        </div>
      </div>
    </>
  );
}
