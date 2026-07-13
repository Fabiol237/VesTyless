'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

const STATUS_STYLES = {
  active:    { bg:'#dcfce7', color:'#16a34a', label:'🟢 Active' },
  scheduled: { bg:'#eff6ff', color:'#2563eb', label:'🔵 Planifiée' },
  expired:   { bg:'#f1f5f9', color:'#64748b', label:'⚫ Expirée'  },
};

const DiscountBadge = ({ type, value }) => {
  const text = type === 'percentage' ? `${value}% off` : type === 'fixed' ? `${Number(value).toLocaleString()} FCFA off` : 'Livraison gratuite';
  return <span style={{ background:'#fef3c7', color:'#92400e', padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'800' }}>{text}</span>;
};

export default function PromotionManager() {
  const { store } = useAuth();
  const [promos,  setPromos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({
    title: '', description: '', discount_type: 'percentage', discount_value: 10,
    start_date: '', end_date: '', applicable_to: 'all', show_countdown: true,
    countdown_text: 'Offre expire dans :',
  });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    const res  = await fetch(`/api/promotions?storeId=${store.id}`);
    const data = await res.json();
    setPromos(data.promotions || []);
    setLoading(false);
  }, [store]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: store.id, ...form }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowForm(false);
      setForm({ title:'', description:'', discount_type:'percentage', discount_value:10, start_date:'', end_date:'', applicable_to:'all', show_countdown:true, countdown_text:'Offre expire dans :' });
      load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' });
    setPromos(p => p.filter(x => x.id !== id));
  };

  const handleToggle = async (p) => {
    await fetch('/api/promotions', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: p.id, is_active: !p.is_active }) });
    setPromos(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
  };

  const inp = { width:'100%', padding:'9px 12px', borderRadius:'10px', border:'1.5px solid #e2e8f0', fontSize:'13px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' };
  const stats = { total: promos.length, active: promos.filter(p => p.status === 'active').length, scheduled: promos.filter(p => p.status === 'scheduled').length };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', padding:'0 0 48px', fontFamily:'Inter,sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
          <div>
            <h1 style={{ margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.02em' }}>📅 Planification des Promotions</h1>
            <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:'13px' }}>Créez et planifiez vos promotions à l'avance — elles s'activent automatiquement.</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'#f97316', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'800', fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px #f9731630' }}>
            {showForm ? '✕ Annuler' : '+ Nouvelle promo'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:'12px', marginTop:'16px', flexWrap:'wrap' }}>
          {[
            { label:'Total', value: stats.total,     color:'#6366f1', bg:'#eff6ff' },
            { label:'Actives', value: stats.active,  color:'#16a34a', bg:'#dcfce7' },
            { label:'Planifiées', value: stats.scheduled, color:'#2563eb', bg:'#eff6ff' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'10px', background:s.bg }}>
              <span style={{ fontSize:'18px', fontWeight:'900', color:s.color }}>{s.value}</span>
              <span style={{ fontSize:'11px', fontWeight:'700', color:s.color }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background:'#fff', borderRadius:'20px', border:'1.5px solid #f97316', boxShadow:'0 4px 20px #f9731620', padding:'24px' }}>
          <h3 style={{ margin:'0 0 20px', fontWeight:'800', color:'#0f172a' }}>🆕 Nouvelle Promotion</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>Titre de la promotion *</label>
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Ex: Soldes d'été — jusqu'à -40%" style={inp} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>Description (optionnel)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} placeholder="Détails de l'offre..." style={{ ...inp, resize:'vertical' }} />
            </div>
            <div>
              <label style={lbl}>Type de réduction *</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({...f, discount_type: e.target.value}))} style={inp}>
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
                <option value="free_shipping">Livraison gratuite</option>
              </select>
            </div>
            {form.discount_type !== 'free_shipping' && (
              <div>
                <label style={lbl}>Valeur *</label>
                <input type="number" min="1" required value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))}
                  placeholder={form.discount_type === 'percentage' ? 'Ex: 20' : 'Ex: 5000'} style={inp} />
              </div>
            )}
            <div>
              <label style={lbl}>Date de début *</label>
              <input type="datetime-local" required value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Date de fin *</label>
              <input type="datetime-local" required value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Applicable à</label>
              <select value={form.applicable_to} onChange={e => setForm(f => ({...f, applicable_to: e.target.value}))} style={inp}>
                <option value="all">Tous les produits</option>
                <option value="category">Par catégorie</option>
                <option value="specific">Produits spécifiques</option>
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop:'20px' }}>
              <input type="checkbox" id="countdown" checked={form.show_countdown} onChange={e => setForm(f => ({...f, show_countdown: e.target.checked}))} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
              <label htmlFor="countdown" style={{ fontSize:'13px', fontWeight:'600', color:'#374151', cursor:'pointer' }}>Afficher un compte à rebours sur la boutique</label>
            </div>
            {form.show_countdown && (
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Texte du compte à rebours</label>
                <input value={form.countdown_text} onChange={e => setForm(f => ({...f, countdown_text: e.target.value}))} style={inp} />
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'20px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding:'9px 18px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Annuler</button>
            <button type="submit" disabled={saving} style={{ padding:'9px 22px', borderRadius:'10px', background:'#f97316', border:'none', color:'#fff', fontWeight:'800', fontSize:'13px', cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Création...' : '✅ Créer la promotion'}
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', background:'#fff', borderRadius:'20px' }}>Chargement...</div>
        ) : promos.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', background:'#fff', borderRadius:'20px', border:'2px dashed #e2e8f0' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📅</div>
            <h4 style={{ margin:'0 0 4px', fontWeight:'800', color:'#0f172a' }}>Aucune promotion</h4>
            <p style={{ color:'#64748b', fontSize:'13px' }}>Créez votre première promotion planifiée.</p>
          </div>
        ) : promos.map(p => {
          const ss = STATUS_STYLES[p.status] || STATUS_STYLES.expired;
          return (
            <div key={p.id} style={{ background:'#fff', borderRadius:'16px', border:'1px solid #f1f5f9', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', opacity: !p.is_active ? 0.7 : 1 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'4px' }}>
                  <span style={{ fontWeight:'800', fontSize:'15px', color:'#0f172a' }}>{p.title}</span>
                  <span style={{ padding:'2px 8px', borderRadius:'10px', background:ss.bg, color:ss.color, fontSize:'11px', fontWeight:'800' }}>{ss.label}</span>
                  <DiscountBadge type={p.discount_type} value={p.discount_value} />
                  {p.show_countdown && <span style={{ fontSize:'10px', background:'#fef3c7', color:'#92400e', padding:'2px 6px', borderRadius:'8px' }}>⏰ Countdown actif</span>}
                </div>
                {p.description && <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#64748b' }}>{p.description}</p>}
                <p style={{ margin:0, fontSize:'11px', color:'#94a3b8' }}>Du {fmtDate(p.start_date)} → {fmtDate(p.end_date)}</p>
              </div>
              <div style={{ display:'flex', gap:'8px', flexShrink:0, alignItems:'center' }}>
                <button onClick={() => handleToggle(p)} title={p.is_active ? 'Désactiver' : 'Activer'}
                  style={{ padding:'6px 12px', borderRadius:'8px', border:'none', background: p.is_active ? '#fef2f2' : '#ecfdf5', color: p.is_active ? '#ef4444' : '#16a34a', fontWeight:'700', fontSize:'11px', cursor:'pointer' }}>
                  {p.is_active ? '⏸ Pause' : '▶ Activer'}
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#fef2f2', border:'none', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
