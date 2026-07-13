'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilder, BUSINESS_TYPES } from '@/context/BuilderContext';
import { supabase } from '@/lib/supabase';

const SaveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>;
const GlobeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const EyeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>;
const MonitorIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>;
const SmartphoneIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>;
const ArrowLeftIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const Loader2Icon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>;

export default function BuilderTopBar({ storeId }) {
  const { state, dispatch, setPreviewTab } = useBuilder();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('stores').update({
        shop_theme: state.themeConfig?._themeId || 'theme_00',
        theme_color: state.themeConfig?.primaryColor || '#00a884',
        secondary_color: state.themeConfig?.secondaryColor || '#f0f0ff',
        font_family: state.themeConfig?.fontFamily || 'Inter',
        business_type: state.businessType,
        updated_at: new Date().toISOString(),
      }).eq('id', storeId);

      for (const m of state.modules) {
        if (m.id.startsWith('temp_')) {
          const { data: inserted } = await supabase.from('store_modules').insert({
            store_id: storeId, type: m.type, label: m.label, icon: m.icon,
            position: m.position, is_active: m.is_active, config: m.config,
          }).select().single();
          if (inserted) dispatch({ type: 'UPDATE_MODULE_ID', oldId: m.id, newId: inserted.id });
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
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const newWindow = window.open('about:blank', '_blank');
    setPublishing(true);
    await handleSave();
    await supabase.from('stores').update({ is_active: true }).eq('id', storeId);
    setPublishing(false);
    const { data: store } = await supabase.from('stores').select('slug').eq('id', storeId).single();
    if (store && newWindow) {
      newWindow.location.href = `/boutique/${store.slug}`;
    } else if (newWindow) {
      newWindow.close();
    }
  };

  const storeName = state.store?.name || 'Ma Boutique';
  const isPublished = state.store?.is_active === true;
  const bt = BUSINESS_TYPES[state.businessType];
  const accentColor = state.themeConfig?.primaryColor || '#00a884';

  return (
    <div style={{
      height: '54px', background: 'rgba(240, 242, 245, 0.98)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #d1d7db', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
      flexShrink: 0, zIndex: 50, gap: '12px',
    }}>
      {/* Left: Back + store name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <button onClick={() => router.push('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px',
          borderRadius: '8px', border: '1px solid #d1d7db',
          background: '#ffffff', color: '#54656f',
          cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', transition: 'all 0.2s', flexShrink: 0,
        }}>
          <ArrowLeftIcon /> Dashboard
        </button>
        <div style={{ width: '1px', height: '20px', background: '#d1d7db', flexShrink: 0 }} />
        {bt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '16px' }}>{bt.emoji}</span>
          </div>
        )}
        <span style={{ color: '#111b21', fontWeight: '700', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
          {storeName}
        </span>
        {state.isDirty && (
          <span style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 7px', borderRadius: '999px', fontWeight: '700', flexShrink: 0 }}>
            Non sauvegardé
          </span>
        )}
      </div>

      {/* Center: Desktop/Mobile switcher */}
      <div style={{ display: 'flex', background: '#e9edef', borderRadius: '9px', padding: '3px', gap: '2px', flexShrink: 0 }}>
        {[
          { id: 'desktop', Icon: MonitorIcon, label: 'Bureau' },
          { id: 'mobile', Icon: SmartphoneIcon, label: 'Mobile' },
        ].map(({ id, Icon, label }) => (
          <button key={id} onClick={() => setPreviewTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px',
            fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.2s',
            background: state.previewTab === id ? accentColor : 'transparent',
            color: state.previewTab === id ? '#ffffff' : '#54656f',
          }}>
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {isPublished && (
          <a href={`/boutique/${state.store?.slug}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            borderRadius: '8px', border: '1px solid #d1d7db',
            background: '#ffffff', color: '#54656f',
            textDecoration: 'none', fontSize: '12px', fontWeight: '600',
          }}>
            <EyeIcon /> Voir
          </a>
        )}
        <button onClick={handleSave} disabled={saving || !state.isDirty} style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px',
          borderRadius: '8px', border: '1px solid #d1d7db',
          background: saved ? '#dcf8c6' : '#ffffff',
          color: saved ? '#008069' : '#54656f',
          cursor: saving || !state.isDirty ? 'not-allowed' : 'pointer',
          fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
          opacity: !state.isDirty && !saved ? 0.5 : 1,
        }}>
          {saving ? <Loader2Icon /> : <SaveIcon />}
          {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
        </button>
        <button onClick={handlePublish} disabled={publishing} style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 16px',
          borderRadius: '8px', border: 'none',
          background: accentColor,
          color: '#ffffff', cursor: publishing ? 'wait' : 'pointer',
          fontSize: '12px', fontWeight: '800', fontFamily: 'inherit',
          boxShadow: `0 2px 8px ${accentColor}50`,
        }}>
          {publishing ? <Loader2Icon /> : <GlobeIcon />}
          {isPublished ? 'Republier' : 'Publier'}
        </button>
      </div>
    </div>
  );
}
