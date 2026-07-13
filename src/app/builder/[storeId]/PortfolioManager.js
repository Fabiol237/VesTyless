'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PortfolioManager({ storeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('portfolio_items').select('*').eq('store_id', storeId).order('position');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (storeId) fetchItems();
  }, [storeId]);

  const handleSave = async (item) => {
    if (item.id) {
      await supabase.from('portfolio_items').update(item).eq('id', item.id);
    } else {
      await supabase.from('portfolio_items').insert([{ ...item, store_id: storeId }]);
    }
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette réalisation ?')) {
      await supabase.from('portfolio_items').delete().eq('id', id);
      fetchItems();
    }
  };

  if (loading) return <div style={{ color: '#54656f', fontSize: '12px' }}>Chargement des réalisations...</div>;

  return (
    <div style={{ marginTop: '16px', background: '#f0f2f5', padding: '12px', borderRadius: '12px', border: '1px solid #d1d7db' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#111b21', fontWeight: '700' }}>Mes Réalisations</h4>
        <button onClick={() => setEditingItem({ title: '', description: '', tags: [], image_url: '', is_featured: false, position: items.length })}
          style={{ padding: '4px 10px', borderRadius: '6px', background: '#00a884', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
          + Ajouter
        </button>
      </div>

      {editingItem ? (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input placeholder="Titre" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} style={inputStyle} />
          <textarea placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{...inputStyle, height: '60px'}} />
          <input placeholder="URL de l'image" value={editingItem.image_url} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} style={inputStyle} />
          <input placeholder="Tags (séparés par virgule)" value={editingItem.tags?.join(', ') || ''} onChange={e => setEditingItem({...editingItem, tags: e.target.value.split(',').map(t => t.trim())})} style={inputStyle} />
          <label style={{ fontSize: '11px', color: '#111b21', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={editingItem.is_featured} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} />
            Mettre en avant
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => handleSave(editingItem)} style={{ flex: 1, padding: '6px', background: '#00a884', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Enregistrer</button>
            <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '6px', background: '#e9edef', color: '#54656f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #d1d7db' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', color: '#111b21', fontWeight: '600' }}>
                {item.title || 'Sans titre'} {item.is_featured && '⭐'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => setEditingItem(item)} style={actionBtnStyle}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={actionBtnStyle}>🗑️</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: '11px', color: '#54656f', textAlign: 'center', padding: '8px 0' }}>Aucune réalisation.</div>}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d7db', fontSize: '12px', outline: 'none' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px' };
