'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RestaurantManager({ storeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('restaurant_menu').select('*').eq('store_id', storeId).order('category').order('position');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const handleSave = async (item) => {
    const payload = {
      ...item,
      store_id: storeId,
      allergens: typeof item.allergens === 'string' ? item.allergens.split(',').map(a => a.trim()).filter(Boolean) : item.allergens
    };
    if (item.id) {
      await supabase.from('restaurant_menu').update(payload).eq('id', item.id);
    } else {
      await supabase.from('restaurant_menu').insert([payload]);
    }
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce plat ?')) {
      await supabase.from('restaurant_menu').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={{ color: '#54656f', fontSize: '12px' }}>Chargement du menu...</div>;

  return (
    <div style={{ marginTop: '16px', background: '#f0f2f5', padding: '12px', borderRadius: '12px', border: '1px solid #d1d7db' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#111b21', fontWeight: '700' }}>Menu & Plats</h4>
        <button onClick={() => setEditingItem({ name: '', description: '', price: 0, category: 'Plats', image_url: '', is_available: true, allergens: '' })}
          style={{ padding: '4px 10px', borderRadius: '6px', background: '#00a884', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
          + Ajouter
        </button>
      </div>

      {editingItem ? (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input placeholder="Nom du plat" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={inputStyle} />
          <textarea placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{...inputStyle, height: '50px'}} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" placeholder="Prix" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} style={inputStyle} />
            <input placeholder="Catégorie (ex: Entrées, Plats...)" value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} style={inputStyle} />
          </div>
          <input placeholder="URL de l'image" value={editingItem.image_url} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} style={inputStyle} />
          <input placeholder="Allergènes (séparés par virgule)" value={Array.isArray(editingItem.allergens) ? editingItem.allergens.join(', ') : editingItem.allergens} onChange={e => setEditingItem({...editingItem, allergens: e.target.value})} style={inputStyle} />
          
          <label style={{ fontSize: '11px', color: '#111b21', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={editingItem.is_available} onChange={e => setEditingItem({...editingItem, is_available: e.target.checked})} />
            Disponible à la commande
          </label>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => handleSave(editingItem)} style={{ flex: 1, padding: '6px', background: '#00a884', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Enregistrer</button>
            <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '6px', background: '#e9edef', color: '#54656f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #d1d7db', opacity: item.is_available ? 1 : 0.6 }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', color: '#111b21', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#54656f', fontSize: '10px', textTransform: 'uppercase' }}>[{item.category}]</span>
                <span style={{ fontWeight: '600' }}>{item.name || 'Sans titre'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                <span style={{ color: '#00a884', fontSize: '11px', fontWeight: 'bold', marginRight: '4px' }}>{item.price} XOF</span>
                <button onClick={() => setEditingItem(item)} style={actionBtnStyle}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={actionBtnStyle}>🗑️</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: '11px', color: '#54656f', textAlign: 'center', padding: '8px 0' }}>Aucun plat au menu.</div>}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d7db', fontSize: '12px', outline: 'none' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px' };
