'use client';
import { useState, useEffect } from 'react';

const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

const Loader = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin .8s linear infinite',display:'block'}}><path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/></svg>;
const Save  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const Undo  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
const Trash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const Clock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function StoreVersionHistory({ storeId, onModulesUpdate, onThemeUpdate }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [label, setLabel]       = useState('');
  const [showSave, setShowSave] = useState(false);
  const [success, setSuccess]   = useState('');

  const load = async () => {
    setLoading(true);
    const res  = await fetch(`/api/store/versions?storeId=${storeId}`);
    const data = await res.json();
    setVersions(data.versions || []);
    setLoading(false);
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch('/api/store/versions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, label: label.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLabel(''); setShowSave(false);
      setSuccess('Version sauvegardée !');
      setTimeout(() => setSuccess(''), 2500);
      load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const handleRestore = async (version) => {
    if (!confirm(`Restaurer la version "${version.label}" ? Votre état actuel sera sauvegardé automatiquement.`)) return;
    setRestoring(version.id);
    try {
      const res  = await fetch('/api/store/versions', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, versionId: version.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.updatedModules) onModulesUpdate?.(data.updatedModules);
      if (data.themeData) onThemeUpdate?.(data.themeData);
      setSuccess('✅ Boutique restaurée !');
      setTimeout(() => setSuccess(''), 2500);
      load();
    } catch (e) { alert(e.message); }
    setRestoring(null);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:'Inter,sans-serif', overflow:'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#1e293b,#334155)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <div>
            <div style={{ color:'#fff', fontWeight:'800', fontSize:'13px' }}>🕒 Historique des versions</div>
            <div style={{ color:'#94a3b8', fontSize:'11px' }}>Revenez en arrière à tout moment</div>
          </div>
          <button onClick={() => setShowSave(s => !s)}
            style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 12px', borderRadius:'9px', background:'#3b82f6', border:'none', color:'#fff', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
            <Save /> Sauvegarder
          </button>
        </div>

        {showSave && (
          <div style={{ display:'flex', gap:'8px', animation:'none' }}>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="Nom de cette version (optionnel)"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{ flex:1, padding:'8px 12px', borderRadius:'8px', border:'1px solid #475569', background:'#1e293b', color:'#fff', fontSize:'12px', fontFamily:'inherit', outline:'none' }} />
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'8px 14px', borderRadius:'8px', background:'#22c55e', border:'none', color:'#fff', fontWeight:'800', fontSize:'12px', cursor:'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? '...' : 'OK'}
            </button>
          </div>
        )}
        {success && (
          <div style={{ marginTop:'8px', padding:'7px 12px', background:'#dcfce7', borderRadius:'8px', fontSize:'12px', fontWeight:'700', color:'#16a34a' }}>{success}</div>
        )}
      </div>

      {/* Liste */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px' }}>
        {loading ? (
          <div style={{ padding:'32px', textAlign:'center', color:'#94a3b8' }}><Loader /></div>
        ) : versions.length === 0 ? (
          <div style={{ padding:'32px', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'36px', marginBottom:'8px' }}>📭</div>
            <p style={{ fontWeight:'700', margin:0 }}>Aucune version sauvegardée</p>
            <p style={{ fontSize:'12px', margin:'4px 0 0' }}>Cliquez sur "Sauvegarder" pour créer votre premier point de restauration.</p>
          </div>
        ) : versions.map((v, i) => (
          <div key={v.id} style={{
            padding:'12px 14px', borderRadius:'12px', border:'1px solid #e2e8f0', background:'#fff',
            marginBottom:'8px', display:'flex', alignItems:'center', gap:'10px',
            boxShadow: i === 0 ? '0 0 0 2px #3b82f6' : 'none',
          }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'9px', background: i === 0 ? '#eff6ff' : '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color: i === 0 ? '#3b82f6' : '#94a3b8' }}>
              <Clock />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:'700', fontSize:'13px', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {i === 0 && <span style={{ background:'#3b82f6', color:'#fff', fontSize:'9px', fontWeight:'800', padding:'1px 5px', borderRadius:'4px', marginRight:'5px' }}>ACTUELLE</span>}
                {v.label}
              </div>
              <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>
                {fmtDate(v.created_at)} · {v.modules_count} bloc{v.modules_count > 1 ? 's' : ''}
              </div>
            </div>
            {i > 0 && (
              <button onClick={() => handleRestore(v)} disabled={restoring === v.id}
                style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', borderRadius:'8px', background:'#f1f5f9', border:'none', color:'#475569', fontSize:'11px', fontWeight:'700', cursor:'pointer', flexShrink:0 }}>
                {restoring === v.id ? <Loader /> : <Undo />}
                {restoring === v.id ? '' : 'Restaurer'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding:'8px 12px', borderTop:'1px solid #f1f5f9', textAlign:'center', fontSize:'10px', color:'#94a3b8' }}>
        20 versions max — les plus anciennes sont supprimées automatiquement
      </div>
    </div>
  );
}
