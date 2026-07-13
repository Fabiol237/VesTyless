'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ServicesManager({ storeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').eq('store_id', storeId).order('created_at');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const handleSave = async (item) => {
    const payload = { ...item, store_id: storeId, is_active: true };
    if (item.id) {
      await supabase.from('services').update(payload).eq('id', item.id);
    } else {
      await supabase.from('services').insert([payload]);
    }
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce service ?')) {
      await supabase.from('services').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={{ color: '#54656f', fontSize: '12px' }}>Chargement des services...</div>;

  return (
    <div style={{ marginTop: '16px', background: '#f0f2f5', padding: '12px', borderRadius: '12px', border: '1px solid #d1d7db' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#111b21', fontWeight: '700' }}>Mes Services / Prestations</h4>
        <button onClick={() => setEditingItem({ name: '', description: '', price: 0, duration_minutes: 60, image_url: '' })}
          style={{ padding: '4px 10px', borderRadius: '6px', background: '#00a884', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
          + Ajouter
        </button>
      </div>

      {editingItem ? (
        <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input placeholder="Nom du service (ex: Consultation 1h)" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={inputStyle} />
          <textarea placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{...inputStyle, height: '50px'}} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" placeholder="Prix" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} style={inputStyle} />
            <input type="number" placeholder="Durée (en minutes)" value={editingItem.duration_minutes} onChange={e => setEditingItem({...editingItem, duration_minutes: Number(e.target.value)})} style={inputStyle} />
          </div>
          <input placeholder="URL de l'image (optionnel)" value={editingItem.image_url} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => handleSave(editingItem)} style={{ flex: 1, padding: '6px', background: '#00a884', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Enregistrer</button>
            <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '6px', background: '#e9edef', color: '#54656f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #d1d7db' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', color: '#111b21', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{item.name || 'Sans titre'}</span>
                <span style={{ fontSize: '10px', color: '#54656f' }}>({item.duration_minutes} min)</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                <span style={{ color: '#00a884', fontSize: '11px', fontWeight: 'bold', marginRight: '4px' }}>{item.price} XOF</span>
                <button onClick={() => setEditingItem(item)} style={actionBtnStyle}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={actionBtnStyle}>🗑️</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: '11px', color: '#54656f', textAlign: 'center', padding: '8px 0' }}>Aucun service configuré.</div>}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d7db', fontSize: '12px', outline: 'none' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px' };
