"use client";
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, HelpCircle, Trash2, Package, Layers,
  TrendingUp, AlertCircle, Loader2, Edit3, QrCode, X,
  BarChart2, ArrowUpCircle, ArrowDownCircle, RefreshCw,
  Filter, ChevronDown, CheckCircle2, Clock, Zap, Archive,
  MinusCircle, PlusCircle, History, Download, Bell
} from 'lucide-react';
import { getProductQrUrl } from '@/lib/qrcode';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import AddProductModal from './AddProductModal';
import VoiceSearchButton from '@/components/VoiceSearchButton';

// ─── Utilitaires ─────────────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtNum  = (n) => Number(n).toLocaleString('fr-FR');

// ─── Indicateur de niveau de stock ───────────────────────────────────────────
function StockBadge({ qty, threshold = 5 }) {
  if (qty === 0)            return <span style={badge('#ef4444','#fef2f2')}>Rupture</span>;
  if (qty <= threshold)     return <span style={badge('#f59e0b','#fffbeb')}>⚠ Critique ({qty})</span>;
  if (qty <= threshold * 3) return <span style={badge('#3b82f6','#eff6ff')}>Faible ({qty})</span>;
  return                           <span style={badge('#10b981','#ecfdf5')}>OK ({qty})</span>;
}
const badge = (color, bg) => ({
  display:'inline-flex', alignItems:'center', gap:'4px',
  padding:'3px 10px', borderRadius:'20px',
  background: bg, color, fontSize:'11px', fontWeight:'800',
  letterSpacing:'0.02em', whiteSpace:'nowrap',
});

// ─── Composant ligne de stock ─────────────────────────────────────────────────
function StockRow({ p, onAdjust, onHistory, lowThreshold }) {
  const [delta, setDelta]   = useState('');
  const [note,  setNote]    = useState('');
  const [type,  setType]    = useState('add'); // 'add' | 'remove' | 'set'
  const [open,  setOpen]    = useState(false);
  const [saving,setSaving]  = useState(false);

  const handleSubmit = async () => {
    const n = parseInt(delta);
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    await onAdjust(p.id, type, n, note, p.stock_quantity);
    setDelta(''); setNote(''); setOpen(false);
    setSaving(false);
  };

  const barPct = Math.min(100, Math.round((p.stock_quantity / (lowThreshold * 10 || 50)) * 100));
  const barColor = p.stock_quantity === 0 ? '#ef4444' : p.stock_quantity <= lowThreshold ? '#f59e0b' : '#10b981';

  return (
    <div style={{ borderBottom:'1px solid #f3f4f6' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', cursor:'pointer' }}
        onClick={() => setOpen(o => !o)}>
        {/* Image */}
        <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:p.image_url?undefined:'#f3f4f6', flexShrink:0, overflow:'hidden', border:'1px solid #e5e7eb' }}>
          {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#d1d5db' }}><Package size={20}/></div>}
        </div>

        {/* Infos produit */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <span style={{ fontWeight:'700', fontSize:'14px', color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
            <StockBadge qty={p.stock_quantity} threshold={lowThreshold} />
          </div>
          {/* Barre de progression */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ flex:1, height:'5px', background:'#f3f4f6', borderRadius:'3px', overflow:'hidden' }}>
              <div style={{ width:`${barPct}%`, height:'100%', background:barColor, borderRadius:'3px', transition:'width 0.4s' }} />
            </div>
            <span style={{ fontSize:'11px', color:'#6b7280', fontWeight:'700', flexShrink:0 }}>{fmtNum(p.stock_quantity)} unité{p.stock_quantity > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Prix */}
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:'13px', fontWeight:'800', color:'#059669' }}>{fmtNum(p.price)} F</div>
          <div style={{ fontSize:'11px', color:'#9ca3af' }}>{p.global_categories?.name || '–'}</div>
        </div>

        {/* Actions rapides */}
        <div style={{ display:'flex', gap:'4px', flexShrink:0 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { setType('remove'); setOpen(true); }}
            title="Retirer du stock"
            style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#fef2f2', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}>
            <MinusCircle size={15}/>
          </button>
          <button onClick={() => { setType('add'); setOpen(true); }}
            title="Ajouter au stock"
            style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#ecfdf5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981' }}>
            <PlusCircle size={15}/>
          </button>
          <button onClick={() => onHistory(p)}
            title="Historique"
            style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#eff6ff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6' }}>
            <History size={15}/>
          </button>
        </div>

        <ChevronDown size={16} style={{ color:'#9ca3af', transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }} />
      </div>

      {/* Panneau de réglage rapide */}
      {open && (
        <div style={{ padding:'0 16px 16px 76px', background:'#fafafa', borderTop:'1px solid #f3f4f6' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'flex-end', marginTop:'12px' }}>
            {/* Type d'ajustement */}
            <div>
              <label style={lbl}>Action</label>
              <select value={type} onChange={e => setType(e.target.value)} style={sel}>
                <option value="add">➕ Entrée (réception)</option>
                <option value="remove">➖ Sortie (vente/casse)</option>
                <option value="set">🔄 Définir exactement</option>
              </select>
            </div>
            {/* Quantité */}
            <div>
              <label style={lbl}>{type === 'set' ? 'Nouveau stock' : 'Quantité'}</label>
              <input type="number" min="0" value={delta} onChange={e => setDelta(e.target.value)}
                placeholder="0" style={{ ...inp, width:'90px' }} />
            </div>
            {/* Note */}
            <div style={{ flex:1, minWidth:'160px' }}>
              <label style={lbl}>Note (optionnel)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="Réception fournisseur, retour client..." style={inp} />
            </div>
            {/* Bouton */}
            <button onClick={handleSubmit} disabled={saving || delta === ''}
              style={{ padding:'8px 18px', borderRadius:'10px', border:'none', background:'#6366f1', color:'#fff', fontWeight:'800', fontSize:'13px', cursor: saving || !delta ? 'not-allowed' : 'pointer', opacity: saving || !delta ? 0.6 : 1 }}>
              {saving ? '...' : 'Enregistrer'}
            </button>
          </div>
          {/* Info actuel */}
          <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'8px' }}>
            Stock actuel : <strong>{fmtNum(p.stock_quantity)}</strong>
            {type === 'add'    && delta && ` → après : ${fmtNum(p.stock_quantity + parseInt(delta||0))}`}
            {type === 'remove' && delta && ` → après : ${fmtNum(Math.max(0, p.stock_quantity - parseInt(delta||0)))}`}
            {type === 'set'    && delta && ` → nouveau : ${fmtNum(parseInt(delta||0))}`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Styles communs inputs ────────────────────────────────────────────────────
const inp = { padding:'8px 12px', borderRadius:'10px', border:'1.5px solid #e5e7eb', fontSize:'13px', fontFamily:'inherit', outline:'none', background:'#fff', width:'100%', boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer', paddingRight:'32px' };
const lbl = { display:'block', fontSize:'11px', fontWeight:'700', color:'#6b7280', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' };

// ─── Modal Historique ─────────────────────────────────────────────────────────
function HistoryModal({ product, onClose }) {
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('stock_logs')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs(data || []);
      setLoading(false);
    };
    fetch();
  }, [product]);

  const icons = { add: <ArrowUpCircle size={14} color="#10b981"/>, remove: <ArrowDownCircle size={14} color="#ef4444"/>, set: <RefreshCw size={14} color="#6366f1"/> };
  const labels = { add: 'Entrée', remove: 'Sortie', set: 'Réglage' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'24px', width:'100%', maxWidth:'560px', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ margin:0, fontWeight:'800', fontSize:'16px', color:'#111827' }}>📋 Historique des mouvements</h3>
            <p style={{ margin:'2px 0 0', fontSize:'13px', color:'#6b7280' }}>{product.name}</p>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16}/>
          </button>
        </div>
        {/* Body */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}><Loader2 size={24} className="animate-spin" style={{ margin:'0 auto' }}/></div>
          ) : logs.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>
              <Archive size={32} style={{ margin:'0 auto 8px', opacity:0.4 }}/>
              <p style={{ fontWeight:'700' }}>Aucun mouvement enregistré</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ padding:'14px 24px', borderBottom:'1px solid #f9fafb', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: log.type==='add'?'#ecfdf5':log.type==='remove'?'#fef2f2':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {icons[log.type] || icons.set}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'2px' }}>
                    <span style={{ fontWeight:'700', fontSize:'13px', color:'#111827' }}>{labels[log.type] || log.type}</span>
                    <span style={{ fontWeight:'800', fontSize:'13px', color: log.type==='add'?'#10b981':log.type==='remove'?'#ef4444':'#6366f1' }}>
                      {log.type==='add' ? `+${fmtNum(log.quantity)}` : log.type==='remove' ? `-${fmtNum(log.quantity)}` : `= ${fmtNum(log.quantity)}`}
                    </span>
                  </div>
                  {log.note && <p style={{ margin:0, fontSize:'12px', color:'#6b7280' }}>{log.note}</p>}
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'12px', color:'#9ca3af' }}>{fmtDate(log.created_at)}</div>
                  <div style={{ fontSize:'11px', color:'#d1d5db' }}>Avant: {fmtNum(log.before_qty)} → Après: {fmtNum(log.after_qty)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { store } = useAuth();
  const [products, setProducts]     = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [qrModalProduct, setQrModalProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);

  // ── Tab actif ──
  const [activeTab, setActiveTab]   = useState('catalogue'); // 'catalogue' | 'stock'

  // ── Filtres stock ──
  const [stockFilter, setStockFilter] = useState('all'); // all | ok | low | rupture
  const [catFilter,   setCatFilter]   = useState('all');
  const [lowThreshold, setLowThreshold] = useState(5);
  const [adjustSuccess, setAdjustSuccess] = useState(null);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('global_categories').select('*').is('parent_id', null).order('name');
    if (data) setCategories(data);
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, global_categories(name)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    if (!store) return;
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts, store]);

  // ── Ajustement de stock ────────────────────────────────────────────────────
  const handleAdjust = async (productId, type, quantity, note, beforeQty) => {
    let newQty;
    if (type === 'add')    newQty = beforeQty + quantity;
    if (type === 'remove') newQty = Math.max(0, beforeQty - quantity);
    if (type === 'set')    newQty = quantity;

    // Mettre à jour le produit
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) { alert('Erreur lors de la mise à jour'); return; }

    // Enregistrer dans le log (si la table existe)
    try {
      await supabase.from('stock_logs').insert({
        product_id: productId,
        store_id: store.id,
        type,
        quantity,
        before_qty: beforeQty,
        after_qty: newQty,
        note: note || null,
      });
    } catch {}

    // Mettre à jour localement
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newQty } : p));
    setAdjustSuccess(productId);
    setTimeout(() => setAdjustSuccess(null), 2000);
  };

  // ── Supprimer produit ──────────────────────────────────────────────────────
  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.global_categories?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.global_categories?.name === catFilter;
    let matchStock = true;
    if (stockFilter === 'rupture') matchStock = p.stock_quantity === 0;
    if (stockFilter === 'low')     matchStock = p.stock_quantity > 0 && p.stock_quantity <= lowThreshold;
    if (stockFilter === 'ok')      matchStock = p.stock_quantity > lowThreshold;
    return matchSearch && matchCat && matchStock;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:      products.length,
    rupture:    products.filter(p => p.stock_quantity === 0).length,
    critical:   products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= lowThreshold).length,
    ok:         products.filter(p => p.stock_quantity > lowThreshold).length,
    totalStock: products.reduce((s, p) => s + (p.stock_quantity || 0), 0),
    valeur:     products.reduce((s, p) => s + ((p.stock_quantity || 0) * p.price), 0),
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Produit', 'Catégorie', 'Stock', 'Prix', 'Valeur Stock', 'Statut'],
      ...products.map(p => [
        p.name,
        p.global_categories?.name || '–',
        p.stock_quantity,
        p.price,
        p.stock_quantity * p.price,
        p.stock_quantity === 0 ? 'Rupture' : p.stock_quantity <= lowThreshold ? 'Critique' : 'OK',
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `stock-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const uniqueCats = [...new Set(products.map(p => p.global_categories?.name).filter(Boolean))];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px', paddingBottom:'48px' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', borderRadius:'24px', border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'24px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <h1 style={{ margin:0, fontSize:'28px', fontWeight:'900', color:'#111827', letterSpacing:'-0.02em' }}>
              {activeTab === 'stock' ? '📦 Gestion du Stock' : '🛍️ Catalogue Produits'}
            </h1>
            <p style={{ margin:'4px 0 0', color:'#6b7280', fontWeight:'500', fontSize:'14px' }}>
              {activeTab === 'stock' ? 'Suivez, ajustez et analysez vos niveaux de stock en temps réel.' : 'Gérez et sublimez vos articles en quelques clics.'}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            {activeTab === 'stock' && (
              <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:'#f3f4f6', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'13px', color:'#374151', cursor:'pointer' }}>
                <Download size={15}/> Exporter CSV
              </button>
            )}
            <button onClick={() => { setProductToEdit(null); setShowAddModal(true); }}
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', background:'#059669', border:'none', borderRadius:'12px', color:'#fff', fontWeight:'800', fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px #05966930' }}>
              <Plus size={18}/> Nouveau Produit
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display:'flex', gap:'4px', marginTop:'20px', background:'#f9fafb', padding:'4px', borderRadius:'14px', width:'fit-content' }}>
          {[
            { id:'catalogue', label:'🛍️ Catalogue',       desc:'Produits' },
            { id:'stock',     label:'📦 Stock',             desc:'Inventaire' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding:'8px 20px', borderRadius:'10px', border:'none', cursor:'pointer',
                fontWeight:'700', fontSize:'13px', transition:'all 0.15s',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color:      activeTab === tab.id ? '#111827' : '#6b7280',
                boxShadow:  activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats globales ────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'14px' }}>
        {[
          { label:'Total Produits',  value: fmtNum(stats.total),        icon:<Package size={20}/>,      color:'#059669', bg:'#ecfdf5' },
          { label:'Rupture de Stock',value: fmtNum(stats.rupture),       icon:<AlertCircle size={20}/>,  color:'#ef4444', bg:'#fef2f2' },
          { label:'Stock Critique',  value: fmtNum(stats.critical),      icon:<Bell size={20}/>,         color:'#f59e0b', bg:'#fffbeb' },
          { label:'Unités en stock', value: fmtNum(stats.totalStock),    icon:<Archive size={20}/>,      color:'#6366f1', bg:'#eff6ff' },
          { label:'Valeur du stock', value: fmtNum(stats.valeur)+' F',   icon:<BarChart2 size={20}/>,    color:'#0ea5e9', bg:'#f0f9ff' },
        ].map((s, i) => (
          <div key={i} style={{ background:'#fff', borderRadius:'18px', border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'18px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:'10px', fontWeight:'700', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'2px' }}>{s.label}</div>
                <div style={{ fontSize:'20px', fontWeight:'900', color:'#111827', lineHeight:1 }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ ONGLET CATALOGUE ══════════════════════════════════════ */}
      {activeTab === 'catalogue' && (
        <div style={{ background:'#fff', borderRadius:'24px', border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', overflow:'hidden' }}>
          {/* Barre de recherche */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #f9fafb', display:'flex', alignItems:'center', gap:'10px', background:'#fafafa' }}>
            <Search size={16} color="#9ca3af"/>
            <input type="text" placeholder="Chercher par nom ou catégorie..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:'none', background:'transparent', fontSize:'14px', outline:'none', fontFamily:'inherit', color:'#111827' }} />
            <VoiceSearchButton onResult={setSearch} onInterimResult={setSearch} />
          </div>
          {/* Liste */}
          <div style={{ maxHeight:'600px', overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#9ca3af' }}><Loader2 size={28} style={{ margin:'0 auto', animation:'spin 0.8s linear infinite' }}/></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'64px', textAlign:'center' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>📦</div>
                <h4 style={{ margin:'0 0 4px', fontWeight:'800', color:'#111827' }}>Aucun produit</h4>
                <p style={{ color:'#6b7280', fontSize:'14px' }}>Ajoutez votre premier article.</p>
              </div>
            ) : filtered.map(p => (
              <div key={p.id} style={{ padding:'14px 16px', borderBottom:'1px solid #f9fafb', display:'flex', alignItems:'center', gap:'12px' }}>
                {/* Image */}
                <div style={{ width:'52px', height:'52px', borderRadius:'12px', background:'#f3f4f6', flexShrink:0, overflow:'hidden', border:'1px solid #e5e7eb', position:'relative' }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Package size={22} color="#d1d5db" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>}
                  {p.stock_quantity === 0 && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'7px', fontWeight:'900', color:'#fff', background:'#ef4444', padding:'2px 4px', borderRadius:'3px' }}>RUPTURE</span></div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <h4 style={{ margin:0, fontWeight:'700', color:'#111827', fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</h4>
                    <span style={{ fontSize:'10px', fontWeight:'800', color:'#059669', background:'#ecfdf5', padding:'2px 8px', borderRadius:'20px', whiteSpace:'nowrap' }}>{p.global_categories?.name || 'Sans catégorie'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'4px' }}>
                    <span style={{ fontSize:'13px', fontWeight:'800', color:'#059669' }}>{fmtNum(p.price)} F</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: p.stock_quantity > 0 ? '#10b981' : '#ef4444' }}/>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:'#6b7280' }}>{fmtNum(p.stock_quantity)} en stock</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
                      <TrendingUp size={10} color="#818cf8"/>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:'#6366f1' }}>{p.views || 0} vues</span>
                    </div>
                  </div>
                </div>
                {/* Boutons actions */}
                <div style={{ display:'flex', gap:'4px' }}>
                  <button onClick={() => setQrModalProduct(p)} title="QR Code" style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#eff6ff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6366f1' }}><QrCode size={15}/></button>
                  <button onClick={() => { setProductToEdit(p); setShowAddModal(true); }} title="Modifier" style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#ecfdf5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#059669' }}><Edit3 size={15}/></button>
                  <button onClick={() => deleteProduct(p.id)} title="Supprimer" style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#fef2f2', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ ONGLET STOCK ══════════════════════════════════════════ */}
      {activeTab === 'stock' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Alertes critiques */}
          {(stats.rupture > 0 || stats.critical > 0) && (
            <div style={{ background:'linear-gradient(135deg,#fef2f2,#fff7ed)', border:'1.5px solid #fecaca', borderRadius:'18px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#fef2f2', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Bell size={20} color="#ef4444"/>
              </div>
              <div>
                <div style={{ fontWeight:'800', color:'#991b1b', fontSize:'14px' }}>⚠️ Attention stock requis</div>
                <div style={{ fontSize:'13px', color:'#b91c1c', marginTop:'2px' }}>
                  {stats.rupture > 0 && <span><strong>{stats.rupture}</strong> produit{stats.rupture>1?'s':''} en rupture · </span>}
                  {stats.critical > 0 && <span><strong>{stats.critical}</strong> produit{stats.critical>1?'s':''} en stock critique</span>}
                </div>
              </div>
              <button onClick={() => setStockFilter('rupture')} style={{ marginLeft:'auto', padding:'7px 16px', borderRadius:'10px', background:'#ef4444', border:'none', color:'#fff', fontWeight:'800', fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
                Voir les ruptures
              </button>
            </div>
          )}

          {/* Filtres + seuil */}
          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #f3f4f6', padding:'16px 20px', display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {[
                { id:'all',     label:'Tous',         count: products.length },
                { id:'rupture', label:'Rupture',       count: stats.rupture,  color:'#ef4444' },
                { id:'low',     label:'Critique',      count: stats.critical, color:'#f59e0b' },
                { id:'ok',      label:'OK',             count: stats.ok,       color:'#10b981' },
              ].map(f => (
                <button key={f.id} onClick={() => setStockFilter(f.id)}
                  style={{ padding:'6px 14px', borderRadius:'20px', border:`1.5px solid ${stockFilter===f.id?(f.color||'#6366f1'):'#e5e7eb'}`, background: stockFilter===f.id?(f.color||'#6366f1')+'18':'#fff', color: stockFilter===f.id?(f.color||'#6366f1'):'#6b7280', fontWeight:'700', fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
                  {f.label} <span style={{ background: stockFilter===f.id?(f.color||'#6366f1'):'#e5e7eb', color: stockFilter===f.id?'#fff':'#374151', borderRadius:'10px', padding:'0 6px', fontSize:'11px', fontWeight:'800' }}>{f.count}</span>
                </button>
              ))}
            </div>
            {/* Catégorie */}
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ ...sel, width:'auto', fontSize:'12px', padding:'6px 28px 6px 10px' }}>
              <option value="all">Toutes catégories</option>
              {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Seuil critique */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginLeft:'auto' }}>
              <label style={{ fontSize:'12px', color:'#6b7280', fontWeight:'600', whiteSpace:'nowrap' }}>Seuil critique :</label>
              <input type="number" min="1" max="100" value={lowThreshold} onChange={e => setLowThreshold(Number(e.target.value))}
                style={{ ...inp, width:'60px', padding:'4px 8px', fontSize:'13px' }}/>
              <span style={{ fontSize:'12px', color:'#9ca3af' }}>unités</span>
            </div>
          </div>

          {/* Recherche */}
          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #f3f4f6', padding:'12px 16px', display:'flex', gap:'10px', alignItems:'center' }}>
            <Search size={16} color="#9ca3af"/>
            <input type="text" placeholder="Chercher un produit..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:'none', background:'transparent', fontSize:'14px', outline:'none', fontFamily:'inherit' }}/>
            {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={14}/></button>}
          </div>

          {/* Liste de stock */}
          <div style={{ background:'#fff', borderRadius:'18px', border:'1px solid #f3f4f6', overflow:'hidden' }}>
            {/* En-tête tableau */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', background:'#fafafa', borderBottom:'1px solid #f3f4f6' }}>
              <div style={{ width:'48px', flexShrink:0 }}/>
              <div style={{ flex:1, fontSize:'10px', fontWeight:'700', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Produit</div>
              <div style={{ width:'120px', fontSize:'10px', fontWeight:'700', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Actions rapides</div>
              <div style={{ width:'32px' }}/>
            </div>

            {loading ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#9ca3af' }}><Loader2 size={24} style={{ animation:'spin 0.8s linear infinite' }}/></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center' }}>
                <Archive size={32} color="#d1d5db" style={{ margin:'0 auto 10px' }}/>
                <p style={{ fontWeight:'700', color:'#6b7280' }}>Aucun produit pour ce filtre</p>
              </div>
            ) : filtered.map(p => (
              <div key={p.id} style={{ position:'relative' }}>
                {adjustSuccess === p.id && (
                  <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:10, background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'8px', padding:'4px 12px', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:'700', color:'#059669' }}>
                    <CheckCircle2 size={13}/> Mis à jour !
                  </div>
                )}
                <StockRow p={p} onAdjust={handleAdjust} onHistory={setHistoryProduct} lowThreshold={lowThreshold}/>
              </div>
            ))}
          </div>

          {/* Note migration */}
          <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'14px', padding:'14px 18px', fontSize:'13px', color:'#1e40af' }}>
            <strong>💡 Note :</strong> Pour activer l'historique complet des mouvements, exécutez le script SQL ci-dessous dans votre dashboard Supabase :
            <code style={{ display:'block', marginTop:'8px', background:'#1e3a5f', color:'#93c5fd', padding:'10px 14px', borderRadius:'8px', fontSize:'12px', whiteSpace:'pre-wrap' }}>{`CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('add','remove','set')),
  quantity INT NOT NULL,
  before_qty INT NOT NULL,
  after_qty INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</code>
          </div>
        </div>
      )}

      {/* ── QR Modal ─────────────────────────────────────────────────────── */}
      {qrModalProduct && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'16px' }}>
          <div style={{ background:'#fff', borderRadius:'24px', maxWidth:'380px', width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', overflow:'hidden' }}>
            <div style={{ padding:'24px', textAlign:'center' }}>
              <button onClick={() => setQrModalProduct(null)} style={{ position:'absolute', top:'12px', right:'12px', width:'32px', height:'32px', borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={14}/></button>
              <h3 style={{ margin:'0 0 4px', fontWeight:'800', fontSize:'18px' }}>QR Code</h3>
              <p style={{ margin:'0 0 20px', color:'#6b7280', fontSize:'13px' }}>{qrModalProduct.name}</p>
              <div style={{ background:'#f9fafb', padding:'16px', borderRadius:'20px', display:'inline-block', border:'1px solid #e5e7eb' }}>
                <img src={getProductQrUrl(qrModalProduct.id, store?.slug, 300)} alt="QR Code" style={{ width:'180px', height:'180px', borderRadius:'12px' }}/>
              </div>
              <p style={{ fontSize:'12px', color:'#9ca3af', marginTop:'16px' }}>Partagez ce code pour que vos clients accèdent directement à ce produit.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Historique Modal ──────────────────────────────────────────────── */}
      {historyProduct && <HistoryModal product={historyProduct} onClose={() => setHistoryProduct(null)}/>}

      {/* ── Modal Ajout/Édition ───────────────────────────────────────────── */}
      {showAddModal && (
        <AddProductModal
          onClose={() => { setShowAddModal(false); setProductToEdit(null); }}
          categories={categories}
          storeId={store?.id}
          productToEdit={productToEdit}
          onSuccess={() => { setProductToEdit(null); fetchProducts(); setShowAddModal(false); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
