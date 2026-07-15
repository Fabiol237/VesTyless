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
  const [success, setSuccess] = useState('');
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
      setSuccess('');
      setStatusText('Upload de l\'image...');
      
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/products' });
      if (!secureUrl) throw new Error('Upload échoué - pas d\'URL retournée');
      
      setImageUrl(secureUrl);
      setSuccess(`✅ Image uploadée avec succès!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Image upload error:', err);
      setError(`❌ Erreur upload image: ${err.message}`);
    } finally {
      setUploadingImage(false);
      setStatusText('');
    }
  };

  const handleSave = async () => {
    // Validation complète
    if (!name?.trim()) {
      setError('❌ Le nom du produit est obligatoire.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError('❌ Le prix est obligatoire et doit être positif.');
      return;
    }
    if (!globalCategoryId) {
      setError('❌ Veuillez sélectionner une catégorie.');
      return;
    }
    
    setLoading(true);
    setStatusText('Enregistrement...');
    setError('');

    const parsedPrice = parseFloat(price);
    const parsedStock = Math.max(0, parseInt(stock) || 0);

    if (parsedPrice > 999999999) {
      setError('❌ Le prix ne peut pas dépasser 999 999 999.');
      return;
    }
    if (parsedStock > 99999) {
      setError('❌ Le stock ne peut pas dépasser 99 999.');
      return;
    }

    const productData = {
      store_id: storeId,
      global_category_id: globalCategoryId,
      name: name.trim(),
      description: description?.trim() || '',
      price: parsedPrice,
      stock_quantity: parsedStock,
      image_url: imageUrl || null,
      is_active: true
    };

    try {
      // Ne régénérer l'embedding QUE si c'est un NOUVEAU produit, OU si l'image/nom/description ont changé lors d'une édition
      const hasImageChanged = !isEdit || (productToEdit && productToEdit.image_url !== imageUrl);
      const hasDetailsChanged = !isEdit || (productToEdit && (productToEdit.name !== name.trim() || productToEdit.description !== description?.trim()));

      let embeddingVector = null;

      if (hasImageChanged || hasDetailsChanged) {
        setStatusText('Génération de l\'embedding...');
        try {
          const embedRes = await fetch('/api/products/generate-embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, imageUrl })
          });
          
          if (embedRes.ok) {
            const embedData = await embedRes.json();
            if (embedData.embedding && Array.isArray(embedData.embedding)) {
              embeddingVector = embedData.embedding;
            }
          } else {
            const errorData = await embedRes.json().catch(() => ({ error: 'Unknown error' }));
            console.warn('Embedding API error:', errorData.error || 'Request failed');
          }
        } catch (e) {
          console.warn('Embedding warning (non-bloquant):', e.message);
        }
      } else {
        console.log('[AddProductModal] Aucun changement d\'image ou de détails textuels détecté. Réutilisation de l\'embedding existant.');
      }
      
      if (embeddingVector) {
        productData.text_embedding_1024 = embeddingVector;
        productData.image_embedding_1024 = embeddingVector;
      }

      setStatusText(isEdit ? 'Modification...' : 'Création...');
      
      if (isEdit) {
        const { error: updateErr } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productToEdit.id)
          .select()
          .single();
        
        if (updateErr) throw new Error(`Erreur modification: ${updateErr.message}`);
      } else {
        const { data, error: insertErr } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (insertErr) throw new Error(`Erreur création: ${insertErr.message}`);
      }

      setStatusText('✅ Succès!');
      setTimeout(() => {
        onSuccess(productData);
      }, 500);
    } catch (err) {
      console.error('Save error:', err);
      setError(`❌ ${err.message || 'Erreur lors de la sauvegarde. Vérifiez les données et réessayez.'}`);
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
           {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm">{error}</div>}
           {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm">{success}</div>}
           
           <div className="space-y-2 relative z-20" ref={catRef}>
               <label className="text-sm font-black text-gray-700 uppercase">Catégorie * ({categories.length})</label>
               <button 
                 type="button"
                 onClick={() => setShowCatDropdown(!showCatDropdown)} 
                 className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-gray-200 font-bold bg-white hover:border-wa-teal hover:bg-wa-teal/5 transition-all"
               >
                 <div className="flex items-center gap-3">
                   {selectedCat && CAT_ICONS[selectedCat.icon] ? (
                     <div className="flex-shrink-0">
                       {(() => {
                         const Icon = CAT_ICONS[selectedCat.icon];
                         return <Icon size={18} className="text-wa-teal" />;
                       })()}
                     </div>
                   ) : null}
                   <span className={selectedCat ? 'text-gray-900' : 'text-gray-400'}>
                     {selectedCat ? selectedCat.name : 'Sélectionner une catégorie...'}
                   </span>
                 </div>
                 <ChevronDown size={18} className={`text-gray-400 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`}/>
               </button>
               {showCatDropdown && (
                 <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                   <div className="max-h-60 overflow-y-auto">
                     {categories.length === 0 ? (
                       <div className="p-4 text-center text-gray-400 text-sm">Aucune catégorie disponible</div>
                     ) : (
                       categories.map(cat => {
                         const Icon = CAT_ICONS[cat.icon];
                         const isSelected = selectedCat?.id === cat.id;
                         return (
                           <button 
                             key={cat.id} 
                             type="button"
                             onClick={() => { setGlobalCategoryId(cat.id); setShowCatDropdown(false); }} 
                             className={`w-full px-5 py-4 text-left font-bold flex items-center gap-3 transition-all ${
                               isSelected 
                                 ? 'bg-wa-teal/10 text-wa-teal border-l-4 border-wa-teal' 
                                 : 'hover:bg-gray-50 text-gray-900'
                             }`}
                           >
                             {Icon && <Icon size={18} />}
                             <span className="flex-1">{cat.name}</span>
                             {isSelected && <CheckCircle2 size={18} className="text-wa-teal" />}
                           </button>
                         );
                       })
                     )}
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
              <div className="flex gap-4 items-center">
                <input 
                  type="file" 
                  className="hidden" 
                  id="img-up"
                  accept="image/*"
                  onChange={e => handleImageFile(e.target.files[0])}
                  disabled={uploadingImage}
                />
                <label 
                  htmlFor="img-up" 
                  className={`px-6 py-4 rounded-2xl cursor-pointer font-bold flex items-center gap-2 transition-all ${
                    uploadingImage 
                      ? 'bg-gray-50 text-gray-400 cursor-wait' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {uploadingImage ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  {uploadingImage ? 'Upload...' : 'Upload Image'}
                </label>
                {imageUrl && (
                  <div className="relative group">
                    <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              {imageUrl && <p className="text-xs text-emerald-600 font-bold">✅ Image sélectionnée</p>}
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
