import { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ShoppingCart, Shirt, Smartphone, Home, Heart, Star, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';
import { offlineStore } from '@/lib/offlineStore';

const CAT_ICONS = {
  'ShoppingCart': ShoppingCart,
  'Shirt': Shirt,
  'Smartphone': Smartphone,
  'Home': Home,
  'Heart': Heart,
  'Star': Star,
  'Package': Package,
};

const CAT_COLORS = [
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
  'bg-orange-100 text-orange-600',
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
  'bg-slate-100 text-slate-600',
];

export default function AddProductModal({ onClose, categories = [], storeId, onSuccess, productToEdit = null }) {
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit?.price || '');
  const [stock, setStock] = useState(productToEdit?.stock_quantity || '');
  const [globalCategoryId, setGlobalCategoryId] = useState(productToEdit?.global_category_id || '');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.image_url || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const catRef = useRef(null);

  const isEdit = !!productToEdit;
  const selectedCat = categories.find(c => c.id === globalCategoryId);

  useEffect(() => {
    const handler = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setShowCatDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleImageFile = async (file) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      setError('');
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/products' });
      if (!secureUrl) throw new Error('Upload échoué');
      setImageUrl(secureUrl);
    } catch (err) {
      setError(`Erreur upload: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !globalCategoryId) {
      setError('Champs obligatoires manquants.');
      return;
    }
    
    setLoading(true);
    setStatusText('Enregistrement...');

    const productData = {
      store_id: storeId,
      global_category_id: globalCategoryId,
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stock) || 0,
      image_url: imageUrl || null,
      is_active: true
    };

    try {
      // Générer l'embedding via Cohere
      let embeddingVector = null;
      try {
        const embedRes = await fetch('/api/products/generate-embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, imageUrl })
        });
        if (embedRes.ok) {
          const embedData = await embedRes.json();
          if (embedData.embedding) embeddingVector = embedData.embedding;
        }
      } catch (e) {
        console.warn('Embedding error', e);
      }
      
      if (embeddingVector) {
        productData.text_embedding_1024 = embeddingVector;
        productData.image_embedding_1024 = embeddingVector;
      }

      const isOnline = navigator.onLine;
      if (!isOnline) {
        await offlineStore.addToQueue({
          type: isEdit ? 'update_product' : 'create_product',
          data: productData,
          productId: productToEdit?.id
        });
        onSuccess(productData);
        return;
      }

      if (isEdit) {
        await supabase.from('products').update(productData).eq('id', productToEdit.id);
      } else {
        await supabase.from('products').insert([productData]);
      }
      onSuccess(productData);
    } catch (err) {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{isEdit ? 'Modifier le Produit' : 'Nouveau Produit'}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl"><X size={20}/></button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-left">
           {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold">{error}</div>}
           
           <div className="space-y-2" ref={catRef}>
               <label className="text-sm font-black text-gray-700 uppercase">Catégorie *</label>
               <button onClick={() => setShowCatDropdown(!showCatDropdown)} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 font-bold bg-gray-50">
                 {selectedCat ? selectedCat.name : 'Choisir...'}
                 <ChevronDown size={18}/>
               </button>
               {showCatDropdown && (
                 <div className="absolute z-50 w-full left-0 px-8 mt-1">
                   <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
                     {categories.map(cat => (
                       <button key={cat.id} onClick={() => { setGlobalCategoryId(cat.id); setShowCatDropdown(false); }} className="w-full p-4 text-left font-bold hover:bg-gray-50">{cat.name}</button>
                     ))}
                   </div>
                 </div>
               )}
           </div>

           <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase">Nom *</label>
              <input type="text" className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-bold" value={name} onChange={e => setName(e.target.value)}/>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase">Prix *</label>
                <input type="number" className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-bold" value={price} onChange={e => setPrice(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase">Stock</label>
                <input type="number" className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-bold" value={stock} onChange={e => setStock(e.target.value)}/>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase">Description</label>
              <textarea className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-medium h-32" value={description} onChange={e => setDescription(e.target.value)}></textarea>
           </div>

           <div className="space-y-4">
              <label className="text-sm font-black text-gray-700 uppercase">Image</label>
              <div className="flex gap-4">
                <input type="file" className="hidden" id="img-up" onChange={e => handleImageFile(e.target.files[0])}/>
                <label htmlFor="img-up" className="px-6 py-4 bg-gray-100 rounded-2xl cursor-pointer font-bold flex items-center gap-2"><Upload size={20}/> Upload</label>
                {imageUrl && <img src={imageUrl} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"/>}
              </div>
           </div>
        </div>

        <div className="p-8 bg-gray-50 border-t flex justify-end gap-4">
           <button onClick={onClose} className="font-bold text-gray-500">Annuler</button>
           <button onClick={handleSave} disabled={loading} className="px-10 py-4 bg-wa-teal text-white font-black rounded-2xl shadow-xl flex flex-col items-center">
              <span>{loading ? 'Enregistrement...' : 'Valider'}</span>
              {loading && <span className="text-[10px] opacity-80">{statusText}</span>}
           </button>
        </div>
      </div>
    </div>
  );
}
