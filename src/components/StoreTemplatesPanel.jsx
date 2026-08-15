'use client';
import { useState } from 'react';
import { TEMPLATE_CATEGORIES } from '@/lib/storeTemplates';

const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Loader = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin .8s linear infinite',display:'block'}}><path d="M12 2v4M16.2 7.8l2.9-2.9M18 12h4M16.2 16.2l2.9 2.9M12 18v4M4.9 19.1l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/></svg>;

export default function StoreTemplatesPanel({ storeId, onModulesUpdate, onThemeUpdate }) {
  const [applying, setApplying]  = useState(null);
  const [applied,  setApplied]   = useState(null);
  const [selectedCat, setSelectedCat] = useState('shop'); // 'shop' | 'artisan' | 'services'
  const [expandedTmpl, setExpandedTmpl] = useState(null);

  const handleApply = async (template) => {
    if (!confirm(`Appliquer le template "${template.name}" ? Votre design de boutique sera mis à jour.`)) return;

    setApplying(template.id);
    try {
      const res  = await fetch('/api/store/apply-template', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, templateId: template.id, keepExisting: false }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Enregistrer également dans le localStorage / appeler les callbacks
      if (data.updatedModules) onModulesUpdate?.(data.updatedModules);
      if (data.themeConfig) {
        onThemeUpdate?.(data.themeConfig);
        // Sauvegarder dans la table stores pour persister le templateId
        await fetch('/api/store/save-theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId,
            store_template: template.id,
            theme_color: template.theme.primaryColor,
            accent_color: template.theme.accentColor,
            secondary_color: template.theme.secondaryColor,
            font_family: template.theme.fontFamily,
            theme_mode: template.theme.mode
          }),
        });
      }

      setApplied(template.id);
      setTimeout(() => setApplied(null), 3000);
    } catch (e) { alert(e.message); }
    setApplying(null);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', fontFamily:'Inter,sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <p style={{ color:'#54656f', fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>
        1. Choisissez votre Modèle de Boutique
      </p>
      <p style={{ color:'#8696a0', fontSize:'11px', marginBottom:'16px', lineHeight:1.5 }}>
        Sélectionnez la catégorie qui correspond le mieux à votre activité, puis choisissez l'un de ses designs.
      </p>

      {/* Tabs Catégories */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px', background:'#f1f5f9', padding:'3px', borderRadius:'10px' }}>
        {TEMPLATE_CATEGORIES.map(cat => {
          const isAct = selectedCat === cat.id;
          return (
            <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setExpandedTmpl(null); }}
              style={{
                flex:1, padding:'8px 0', border:'none', borderRadius:'8px', fontSize:'11px', fontWeight:'700',
                background: isAct ? '#fff' : 'transparent', color: isAct ? '#0f172a' : '#64748b',
                cursor:'pointer', boxShadow: isAct ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', transition:'all 0.15s'
              }}>
              <span style={{ marginRight:'4px' }}>{cat.emoji}</span>
              {cat.label.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Description de la catégorie */}
      <div style={{ background:'#f8fafc', padding:'10px 12px', borderRadius:'8px', marginBottom:'14px', border:'1px solid #f1f5f9' }}>
        <p style={{ fontSize:'11px', color:'#475569', fontWeight:'600' }}>
          {TEMPLATE_CATEGORIES.find(c => c.id === selectedCat)?.description}
        </p>
      </div>

      {/* Liste des templates pour la catégorie sélectionnée */}
      <div>
        {TEMPLATE_CATEGORIES.find(c => c.id === selectedCat)?.templates.map(tmpl => {
          const isExp = expandedTmpl === tmpl.id;
          return (
            <div key={tmpl.id} style={{
              borderRadius:'14px', border:`2px solid ${applied === tmpl.id ? '#22c55e' : isExp ? '#7c3aed' : '#e2e8f0'}`,
              marginBottom:'10px', overflow:'hidden', background:'#fff',
              boxShadow: isExp ? '0 4px 16px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
              transition:'all 0.2s',
            }}>
              {/* Header de la carte */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', cursor:'pointer' }}
                onClick={() => setExpandedTmpl(e => e === tmpl.id ? null : tmpl.id)}>
                <div style={{
                  width:'44px', height:'44px', borderRadius:'10px', background:tmpl.preview,
                  flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.08)'
                }}>
                  {tmpl.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ fontWeight:'850', fontSize:'13px', color:'#0f172a' }}>{tmpl.name}</span>
                    <span style={{ fontSize:'9px', fontWeight:'700', color:'#fff', background:tmpl.badgeColor, padding:'1px 5px', borderRadius:'4px' }}>{tmpl.badge}</span>
                  </div>
                  <div style={{ fontSize:'11px', color:'#64748b', marginTop:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {tmpl.tagline}
                  </div>
                </div>
                <div style={{ color:'#94a3b8', transform: isExp ? 'rotate(180deg)' : 'none', transition:'all 0.15s' }}>▾</div>
              </div>

              {/* Détails du template */}
              {isExp && (
                <div style={{ borderTop:'1px solid #f1f5f9', padding:'12px 14px', background:'#fafafa' }}>
                  <p style={{ fontSize:'11px', color:'#475569', lineHeight:1.5, marginBottom:'10px' }}>
                    {tmpl.description}
                  </p>

                  <div style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'9px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', marginBottom:'4px' }}>Pages incluses (5) :</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                      {tmpl.pages.map(p => (
                        <span key={p} style={{ fontSize:'10px', background:'#fff', border:'1px solid #e2e8f0', padding:'2px 6px', borderRadius:'4px', color:'#334155' }}>
                          📄 {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize:'9px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', marginBottom:'4px' }}>Fonctionnalités :</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                      {tmpl.features.map(f => (
                        <span key={f} style={{ fontSize:'9px', color:'#7c3aed', background:'#f5f3ff', padding:'2px 6px', borderRadius:'4px', fontWeight:'600' }}>
                          ✨ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton d'action */}
              <div style={{ padding:'0 14px 12px', display:'flex' }}>
                <button onClick={() => handleApply(tmpl)} disabled={!!applying}
                  style={{
                    flex:1, padding:'8px 0', borderRadius:'8px', border:'none',
                    background: applied === tmpl.id ? '#22c55e' : `linear-gradient(135deg, ${tmpl.theme.primaryColor}, ${tmpl.theme.accentColor || '#7c3aed'})`,
                    color:'#fff', fontWeight:'800', fontSize:'11px', cursor: applying ? 'not-allowed':'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                    transition:'all .15s',
                  }}>
                  {applying === tmpl.id ? <Loader /> : applied === tmpl.id ? <CheckIcon /> : '✨'}
                  {applying === tmpl.id ? 'Installation...' : applied === tmpl.id ? 'Modèle appliqué !' : 'Appliquer ce modèle'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
