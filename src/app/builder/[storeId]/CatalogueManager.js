'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CatalogueManager({ storeId }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('store_id', storeId)
    ]);
    setItems(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const handleSave = async (item) => {
    if (item.id) {
      await supabase.from('products').update(item).eq('id', item.id);
    } else {
      await supabase.from('products').insert([{ ...item, store_id: storeId, is_active: true }]);
    }
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={{ color: '#54656f', fontSize: '12px' }}>Chargement des produits...</div>;

  return (
    <div style={{ marginTop: '16px', background: '#f0f2f5', padding: '12px', borderRadius: '12px', border: '1px solid #d1d7db' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#111b21', fontWeight: '700' }}>Mes Produits</h4>
        <button onClick={() => setEditingItem({ name: '', description: '', price: 0, stock_quantity: 0, image_url: '', category_id: null })}
          style={{ padding: '4px 10px', borderRadius: '6px', background: '#00a884', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
          + Ajouter
        </button>
      </div>

      {editingItem ? (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input placeholder="Nom du produit" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={inputStyle} />
          <textarea placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{...inputStyle, height: '60px'}} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" placeholder="Prix" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} style={inputStyle} />
            <input type="number" placeholder="Stock" value={editingItem.stock_quantity} onChange={e => setEditingItem({...editingItem, stock_quantity: Number(e.target.value)})} style={inputStyle} />
          </div>
          <input placeholder="URL de l'image" value={editingItem.image_url} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} style={inputStyle} />
          <select value={editingItem.category_id || ''} onChange={e => setEditingItem({...editingItem, category_id: e.target.value || null})} style={inputStyle}>
            <option value="">-- Sans catégorie --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => handleSave(editingItem)} style={{ flex: 1, padding: '6px', background: '#00a884', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Enregistrer</button>
            <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '6px', background: '#e9edef', color: '#54656f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #d1d7db' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', color: '#111b21', fontWeight: '600', display: 'flex', gap: '8px' }}>
                <span>{item.name || 'Sans titre'}</span>
                <span style={{ color: '#00a884' }}>{item.price} XOF</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => setEditingItem(item)} style={actionBtnStyle}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={actionBtnStyle}>🗑️</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: '11px', color: '#54656f', textAlign: 'center', padding: '8px 0' }}>Aucun produit.</div>}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d7db', fontSize: '12px', outline: 'none' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px' };
