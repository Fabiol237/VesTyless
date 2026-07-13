'use client';
import { useState } from 'react';
import { STORE_TEMPLATES } from '@/lib/storeTemplates';

const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Loader = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin .8s linear infinite',display:'block'}}><path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/></svg>;

export default function StoreTemplatesPanel({ storeId, onModulesUpdate, onThemeUpdate }) {
  const [applying, setApplying]  = useState(null);
  const [applied,  setApplied]   = useState(null);
  const [keepExisting, setKeep]  = useState(false);
  const [preview,  setPreview]   = useState(null);

  const handleApply = async (template) => {
    const msg = keepExisting
      ? `Ajouter les blocs du template "${template.name}" à votre boutique existante ?`
      : `Remplacer TOUTE votre boutique par le template "${template.name}" ? Votre état actuel sera sauvegardé automatiquement.`;
    if (!confirm(msg)) return;

    setApplying(template.id);
    try {
      const res  = await fetch('/api/store/apply-template', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, templateId: template.id, keepExisting }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.updatedModules) onModulesUpdate?.(data.updatedModules);
      if (data.themeConfig)    onThemeUpdate?.(data.themeConfig);
      setApplied(template.id);
      setTimeout(() => setApplied(null), 3000);
    } catch (e) { alert(e.message); }
    setApplying(null);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', fontFamily:'Inter,sans-serif', overflow:'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', flexShrink:0 }}>
        <div style={{ color:'#fff', fontWeight:'800', fontSize:'13px', marginBottom:'4px' }}>🎨 Templates de boutiques</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'11px', marginBottom:'12px' }}>
          Lancez-vous en quelques secondes avec un design complet
        </div>
        {/* Toggle mode */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.12)', padding:'8px 12px', borderRadius:'10px' }}>
          <input type="checkbox" id="keepExisting" checked={keepExisting} onChange={e => setKeep(e.target.checked)} style={{ width:'15px', height:'15px', cursor:'pointer', accentColor:'#a78bfa' }} />
          <label htmlFor="keepExisting" style={{ fontSize:'12px', color:'rgba(255,255,255,0.9)', cursor:'pointer', fontWeight:'600' }}>
            Ajouter à ma boutique existante (ne pas remplacer)
          </label>
        </div>
      </div>

      {/* Liste des templates */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px' }}>
        {STORE_TEMPLATES.map(tmpl => (
          <div key={tmpl.id} style={{
            borderRadius:'14px', border:`2px solid ${applied === tmpl.id ? '#22c55e' : preview === tmpl.id ? '#7c3aed' : '#e2e8f0'}`,
            marginBottom:'10px', overflow:'hidden', background:'#fff',
            boxShadow: preview === tmpl.id ? '0 4px 16px rgba(124,58,237,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition:'all 0.2s',
          }}>
            {/* Preview gradient + infos */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', cursor:'pointer' }}
              onClick={() => setPreview(p => p === tmpl.id ? null : tmpl.id)}>
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:tmpl.preview, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                {tmpl.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:'800', fontSize:'13px', color:'#0f172a' }}>{tmpl.name}</div>
                <div style={{ fontSize:'11px', color:'#64748b', marginTop:'2px' }}>{tmpl.description}</div>
                <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'5px' }}>
                  <span style={{ fontSize:'10px', fontWeight:'700', color:'#7c3aed', background:'#f5f3ff', padding:'2px 7px', borderRadius:'8px' }}>{tmpl.blocks.length} blocs</span>
                  {tmpl.tags.slice(0,2).map(tag => <span key={tag} style={{ fontSize:'10px', color:'#64748b', background:'#f1f5f9', padding:'2px 7px', borderRadius:'8px' }}>{tag}</span>)}
                </div>
              </div>
              <div style={{ color:'#94a3b8', transition:'transform 0.2s', transform: preview === tmpl.id ? 'rotate(180deg)' : 'none' }}>▾</div>
            </div>

            {/* Détail des blocs */}
            {preview === tmpl.id && (
              <div style={{ borderTop:'1px solid #f1f5f9', padding:'10px 14px', background:'#fafafa' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Blocs inclus :</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'10px' }}>
                  {tmpl.blocks.map((b, i) => (
                    <span key={i} style={{ fontSize:'10px', background:'#fff', border:'1px solid #e2e8f0', padding:'3px 8px', borderRadius:'8px', color:'#374151', fontWeight:'600' }}>
                      {b.type}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'8px' }}>
                  Thème : <span style={{ display:'inline-flex', gap:'4px', alignItems:'center' }}>
                    <span style={{ width:'12px', height:'12px', borderRadius:'50%', background:tmpl.theme.primaryColor, display:'inline-block', border:'1px solid #e2e8f0' }} />
                    <span style={{ width:'12px', height:'12px', borderRadius:'50%', background:tmpl.theme.secondaryColor, display:'inline-block', border:'1px solid #e2e8f0' }} />
                    <span style={{ fontWeight:'600', color:'#374151' }}>{tmpl.theme.fontFamily}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Bouton appliquer */}
            <div style={{ padding:'0 14px 12px', display:'flex', gap:'8px' }}>
              <button onClick={() => handleApply(tmpl)} disabled={!!applying}
                style={{
                  flex:1, padding:'9px 0', borderRadius:'10px', border:'none',
                  background: applied === tmpl.id ? '#22c55e' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color:'#fff', fontWeight:'800', fontSize:'12px', cursor: applying ? 'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                  opacity: applying && applying !== tmpl.id ? 0.5 : 1, transition:'all .15s',
                }}>
                {applying === tmpl.id ? <Loader /> : applied === tmpl.id ? <CheckIcon /> : '✨'}
                {applying === tmpl.id ? 'Application...' : applied === tmpl.id ? 'Appliqué !' : keepExisting ? 'Ajouter les blocs' : 'Appliquer ce template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'8px 12px', borderTop:'1px solid #f1f5f9', textAlign:'center', fontSize:'10px', color:'#94a3b8', background:'#fafafa' }}>
        ⚡ 5 templates · Votre état sera sauvegardé automatiquement avant application
      </div>
    </div>
  );
}
