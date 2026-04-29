"use client";
import { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/cloudinary';


export default function AddProductModal({ onClose, categories = [], storeId, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageFile = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/products' });
      if (!secureUrl) throw new Error('Upload image invalide');
      setImageUrl(secureUrl);
    } catch (err) {
      setError("Erreur upload image. Verifiez votre connexion.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      setError('Champs obligatoires : Nom, Prix, Catégorie.');
      return;
    }
    
    setLoading(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          store_id: storeId,
          category_id: categoryId,
          name,
          description,
          price: parseFloat(price),
          stock_quantity: parseInt(stock) || 0,
          image_url: imageUrl || null,
          is_active: true
        }
      ])
      .select()
      .single();

    if (insertError) {
      setError('Erreur lors de la création du produit.');
      setLoading(false);
    } else {
      if(onSuccess) onSuccess(data);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Nouveau Produit</h2>
            <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">Ajoutez une pépite à votre catalogue.</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all">
             <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
           {error && (
             <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
               <AlertCircle size={18} />
               {error}
             </div>
           )}
           
           <div className="space-y-2">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Nom du produit *</label>
              <input type="text" placeholder="Ex: Robe d'été en lin" className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all placeholder:text-gray-400" value={name} onChange={e => setName(e.target.value)}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Prix (FCFA) *</label>
                <input type="number" placeholder="0" className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all" value={price} onChange={e => setPrice(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Quantité en Stock</label>
                <input type="number" placeholder="0" className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all" value={stock} onChange={e => setStock(e.target.value)}/>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Description</label>
              <textarea 
                placeholder="Matière, coupe, conseils d'entretien..." 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all min-h-[100px] sm:min-h-[120px] resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Visuel du produit</label>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3">
                <input
                  type="url"
                  placeholder="Lien de l'image (URL)..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <label className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-gray-100 text-gray-600 font-bold rounded-xl sm:rounded-2xl cursor-pointer hover:bg-gray-200 transition-all active:scale-95 text-sm sm:text-base">
                  <Upload size={18} className="sm:w-5 sm:h-5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                  />
                </label>
              </div>
             {uploadingImage && (
               <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold bg-indigo-50 p-2 rounded-lg">
                 <Loader2 size={14} className="animate-spin" />
                 Téléversement en cours...
               </div>
             )}
             {imageUrl && (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setImageUrl('')} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-rose-600">
                    <X size={14} />
                  </button>
                </div>
             )}
           </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Catégorie *</label>
              <select className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 font-medium outline-none transition-all appearance-none cursor-pointer" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                 <option value="">Sélectionnez une catégorie</option>
                 {categories.map((c) => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
              </select>
              {categories.length === 0 && (
                <p className="text-[10px] sm:text-xs text-amber-600 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100 uppercase tracking-tight">
                  Aucune catégorie trouvée. Veuillez en créer une avant d&apos;ajouter un produit.
                </p>
              )}
            </div>
        </div>

        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
           <button className="w-full sm:w-auto px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-500 font-bold hover:text-gray-900 transition-colors" onClick={onClose} disabled={loading}>Annuler</button>
           <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 py-3.5 sm:py-4 bg-wa-teal text-white font-black rounded-xl sm:rounded-2xl hover:bg-wa-teal-dark hover:shadow-xl hover:shadow-wa-teal/20 transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none text-sm sm:text-base" 
            onClick={handleSave} 
            disabled={loading || uploadingImage}
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
             <span>{loading ? 'Création...' : 'Valider le produit'}</span>
           </button>
        </div>
      </div>
    </div>
  );
}


