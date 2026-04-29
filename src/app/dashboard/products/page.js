"use client";
import { useState, useEffect, useCallback } from 'react';

import { Plus, Search, HelpCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './Products.module.css';
import AddProductModal from './AddProductModal';

export default function ProductsPage() {
  const { store } = useAuth();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catInput, setCatInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!store) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', store.id);
    if (!error && data) setCategories(data);
  }, [store]);

  const fetchProducts = useCallback(async () => {
    if (!store) return;
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('store_id', store.id);
    if (!error && data) setProducts(data);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    if (!store) return;
    (async () => {
      await fetchCategories();
      await fetchProducts();
    })();
  }, [fetchCategories, fetchProducts, store]);

  const addCategory = async () => {
    if (!catInput.trim() || !store) return;
    
    // Generate slug from name
    const strName = catInput.trim();
    const slug = strName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ store_id: store.id, name: strName, slug }])
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, data]);
      setCatInput('');
    } else {
      console.error('Erreur categorie:', error);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>Produits</h1>
          <p>Gérez le catalogue de votre boutique.</p>
        </div>
        <div className={styles.actionsBlock}>
          <button className={styles.actionBtnWhite}>
             <HelpCircle size={16} className={styles.iconBlue} />
             <span>Comment utiliser cette section</span>
          </button>
          <button className={styles.actionBtnBlue} onClick={() => setShowAddModal(true)}>
             <Plus size={16} />
             <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      <div className={styles.categoriesCard}>
         <div className={styles.cardInfo}>
           <h3>Catégories produits</h3>
           <p>Créez vos catégories ici pour les réutiliser rapidement dans le formulaire produit.</p>
         </div>
         <div className={styles.catInputBlock}>
            <input 
              type="text" 
              placeholder="Ex: Robes, Electronique, Accessoires" 
              className={styles.catInput}
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button className={styles.actionBtnBlue} onClick={addCategory}>
               <Plus size={16} />
               <span>Ajouter</span>
            </button>
         </div>
         {categories.length === 0 ? (
           <p className={styles.catEmpty}>Aucune catégorie créée pour le moment.</p>
         ) : (
           <div className={styles.catList}>
             {categories.map((c, i) => (
               <span key={i} className={styles.catBadge}>{c.name}</span>
             ))}
           </div>
         )}
      </div>

      <div className={styles.productsTableCard}>
        <div className={styles.searchBlock}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>PRODUIT</th>
              <th>CATEGORIE</th>
              <th>PRIX</th>
              <th>STOCK</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className={styles.emptyTable}>Chargement...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.emptyTable}>
                  Aucun produit trouvé. Cliquez sur &quot;Nouveau produit&quot; en haut.
                </td>
              </tr>
            ) : filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.categories?.name || '-'}</td>
                <td>{p.price} FCFA</td>
                <td>{p.stock_quantity}</td>
                <td>
                  <button onClick={() => deleteProduct(p.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
          categories={categories} 
          storeId={store?.id}
          onSuccess={(newProduct) => {
            fetchProducts();
            setShowAddModal(false);
          }}
        />
      )}

    </div>
  );
}
