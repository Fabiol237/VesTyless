'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import CategorySearch from '@/components/CategorySearch';

import { ImagePlus, Package, ArrowLeft, Loader2, Save, Plus, X, List, Palette, Maximize, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const { session } = useAuth();
  const router = useRouter();
  
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const tempUploadedUrlsRef = useRef(new Set());
  const saveSucceededRef = useRef(false);

  // Nouvel état étendu
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    global_category_id: '',
    price: '',
    stock_quantity: '1',
    images: [] // Tableau pour multi-images
  });

  const [variants, setVariants] = useState([]); // [{type: 'taille', value: 'M', stock: 10}]

  useEffect(() => {
    if (!session?.id) return;
    async function fetchStore() {
      const { data } = await supabase.from('stores').select('id').eq('owner_id', session.id).single();
      if (data) setStoreId(data.id);
    }
    fetchStore();
  }, [session]);

  useEffect(() => {
    const urlsRef = tempUploadedUrlsRef.current;
    return () => {
      if (saveSucceededRef.current) return;
      const pending = Array.from(urlsRef);
      pending.forEach((url) => deleteCloudinaryByUrl(url));
    };
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setUploadingImage(true);
    const newImages = [...formData.images];
    
    for (const file of files) {
      if (newImages.length >= 4) break;
      try {
        const url = await uploadImage(file);
        newImages.push(url);
        tempUploadedUrlsRef.current.add(url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setUploadingImage(false);

    // IA: Si c'est la première image, on essaie de deviner la catégorie
    if (newImages.length === 1 && !formData.global_category_id) {
       suggestCategory(newImages[0]);
    }
  };

  const suggestCategory = async (imageUrl) => {
    // Suggestion de catégorie désactivée (Xenova supprimé)
    // L'embedding est généré côté serveur via Cohere lors de la sauvegarde
    console.log('[AddProduct] Image prête pour indexation Cohere:', imageUrl);
  };

  const removeImage = async (index) => {
    const urlToRemove = formData.images[index];
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (tempUploadedUrlsRef.current.has(urlToRemove)) {
       await deleteCloudinaryByUrl(urlToRemove);
       tempUploadedUrlsRef.current.delete(urlToRemove);
    }
  };

  const addVariant = (type) => {
    setVariants([...variants, { type, value: '', stock: formData.stock_quantity || 1 }]);
  };

  const updateVariant = (index, field, val) => {
    const newVariants = [...variants];
    newVariants[index][field] = val;
    setVariants(newVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) return alert("Aucune boutique liée !");
    
    setLoading(true);

    // Génération de l'embedding via Cohere API (côté serveur)
    let embeddingVector = null;
    if (formData.images.length > 0 && formData.name) {
      try {
        const embedRes = await fetch('/api/products/generate-embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || '',
            imageUrl: formData.images[0]
          })
        });
        if (embedRes.ok) {
          const embedData = await embedRes.json();
          if (embedData.embedding) {
            embeddingVector = embedData.embedding;
          }
        }
      } catch (err) { console.warn('[AddProduct] Embedding Cohere échoué (non bloquant):', err); }
    }

    const newProduct = {
      store_id: storeId,
      global_category_id: formData.global_category_id || null,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      image_url: formData.images[0] || null,
      images: formData.images,
      image_embedding: embeddingVector
    };

    const { data: product, error } = await supabase.from('products').insert([newProduct]).select().single();

    if (error) {
      alert("Erreur création produit : " + error.message);
      setLoading(false);
      return;
    }

    if (variants.length > 0) {
      try {
        const variantRecords = variants.map(v => ({
          product_id: product.id,
          variant_type: v.type,
          variant_value: v.value,
          stock_quantity: parseInt(v.stock)
        }));
        await supabase.from('product_variants').insert(variantRecords);
      } catch (e) { console.warn("Erreur variantes:", e); }
    }

    saveSucceededRef.current = true;
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-wa-teal font-bold text-sm mb-8 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour au Dashboard
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl font-black text-wa-teal-dark flex items-center gap-3">
            <div className="w-12 h-12 bg-wa-teal/10 rounded-2xl flex items-center justify-center text-wa-teal">
              <Package size={28} />
            </div>
            Nouveau Produit
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">Ajoutez un article avec variantes et multi-photos.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLONNE GAUCHE: IMAGES */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100">
              <label className="block text-sm font-black text-neutral-900 mb-4 uppercase tracking-widest">Photos du produit (Max 4)</label>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-neutral-100">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/90 backdrop-blur-md p-1.5 rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                    {idx === 0 && <div className="absolute bottom-1 left-1 bg-wa-teal text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">PRINCIPALE</div>}
                  </div>
                ))}
                
                {formData.images.length < 4 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-wa-teal hover:bg-wa-teal/5 transition-all text-neutral-400 hover:text-wa-teal">
                    {uploadingImage ? <Loader2 className="animate-spin" /> : <ImagePlus size={24} />}
                    <span className="text-[10px] font-black uppercase">Ajouter</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                Tip: La première image sera utilisée pour le Scan Live (Vestyle Lens).
              </p>
            </div>
          </div>

          {/* COLONNE DROITE: INFOS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-neutral-100 space-y-6">
              {/* NOM & DESCRIPTION */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Nom de l'article</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Robe de soirée en soie" className="w-full bg-neutral-50 border-none rounded-2xl px-5 py-4 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Détails du produit..." className="w-full bg-neutral-50 border-none rounded-2xl px-5 py-4 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all resize-none" />
                </div>
              </div>

              {/* CATÉGORIE & PRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Catégorie Standard</label>
                  <CategorySearch 
                    selectedId={formData.global_category_id} 
                    onSelect={(cat) => setFormData({...formData, global_category_id: cat.id})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Prix (FCFA)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0" className="w-full bg-neutral-50 border-none rounded-2xl px-5 py-4 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all" />
                </div>
              </div>

              {/* VARIANTES */}
              <div className="pt-6 border-t border-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Variantes (Tailles / Couleurs)</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addVariant('Taille')} className="text-[10px] font-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                      <Maximize size={12} /> + Taille
                    </button>
                    <button type="button" onClick={() => addVariant('Couleur')} className="text-[10px] font-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                      <Palette size={12} /> + Couleur
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 bg-neutral-50 p-3 rounded-2xl animate-fade-in">
                      <div className="bg-white px-3 py-2 rounded-xl text-[10px] font-black text-wa-teal border border-neutral-100">{v.type}</div>
                      <input type="text" required placeholder="Ex: XL ou Rouge" value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} className="flex-1 bg-transparent border-none p-0 text-sm font-bold outline-none" />
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-100">
                        <span className="text-[9px] font-black text-neutral-400">STOCK</span>
                        <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="w-12 bg-transparent border-none p-0 text-sm font-black text-center outline-none" />
                      </div>
                      <button type="button" onClick={() => removeVariant(i)} className="text-neutral-300 hover:text-red-500 transition-colors p-1"><X size={16}/></button>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-neutral-50 rounded-3xl text-neutral-300 text-[10px] font-bold uppercase tracking-widest">
                      Aucune variante définie
                    </div>
                  )}
                </div>
              </div>

              {/* BOUTON SAUVEGARDER */}
              <button type="submit" disabled={loading} className="w-full bg-wa-teal-dark text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-wa-teal-dark/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Certifier et Publier</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
