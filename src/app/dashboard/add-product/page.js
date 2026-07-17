'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import CategorySearch from '@/components/CategorySearch';
import BackNavigation from '@/components/BackNavigation';
import { ImagePlus, Package, ArrowLeft, Loader2, Save, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductDescriptionAI from '@/components/ProductDescriptionAI';

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
    images: [] // Tableau pour multi-images (URLs strings uniquement)
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
    
    const uploadPromises = [];
    let remainingSlots = 4 - formData.images.length;
    
    for (const file of files) {
      if (remainingSlots <= 0) break;
      remainingSlots--;
      
      uploadPromises.push(
        uploadImage(file)
          .then(result => {
            // uploadImage() returns { secureUrl, publicId } — extract secureUrl
            const url = result?.secureUrl || result;
            if (!url || typeof url !== 'string') {
              throw new Error('URL invalide reçue de Cloudinary');
            }
            tempUploadedUrlsRef.current.add(url);
            return url;
          })
          .catch(err => {
            console.error('Upload failed:', err);
            alert('❌ Erreur upload image: ' + (err?.message || 'Cloudinary indisponible'));
            return null;
          })
      );
    }
    
    const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
    
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploadingImage(false);
  };

  const removeImage = async (index) => {
    const urlToRemove = formData.images[index];
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (urlToRemove && tempUploadedUrlsRef.current.has(urlToRemove)) {
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
    
    // Validations
    if (!storeId) {
      alert("❌ Aucune boutique liée !");
      return;
    }
    if (!formData.name?.trim()) {
      alert("❌ Le nom du produit est requis !");
      return;
    }
    if (!formData.price) {
      alert("❌ Le prix est requis !");
      return;
    }
    if (!formData.global_category_id) {
      alert("❌ La catégorie est requise !");
      return;
    }
    if (formData.images.length === 0) {
      alert("❌ Au moins une image est requise !");
      return;
    }
    
    setLoading(true);

    // Fonction utilitaire de pause
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ============ ÉTAPE 1: Générer l'embedding pour l'image PRINCIPALE (Avec Retry automatique) ============
    let primaryEmbedding = null;
    let primaryText = '';
    const primaryImageUrl = formData.images[0];
    let embedAttempts = 0;
    const maxEmbedAttempts = 3;

    while (embedAttempts < maxEmbedAttempts && !primaryEmbedding) {
      embedAttempts++;
      try {
        console.log(`[AddProduct] Génération embedding (Tentative ${embedAttempts}/${maxEmbedAttempts})...`);
        const embedRes = await fetch('/api/products/generate-embeddings-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: primaryImageUrl,
            categoryId: parseInt(formData.global_category_id) || 1,
            name: formData.name,
            description: formData.description || ''
          })
        });

        // Si limitation de débit (429), on attend plus longtemps avant de réessayer
        if (embedRes.status === 429) {
          console.warn("[AddProduct] Surcharge détectée (Rate Limit 429). File d'attente activée...");
          if (embedAttempts < maxEmbedAttempts) {
            await delay(2000 * embedAttempts); // Attente progressive : 2s, 4s...
            continue;
          }
        }

        if (!embedRes.ok) {
          throw new Error(`HTTP ${embedRes.status}`);
        }

        const embedData = await embedRes.json();
        if (!embedData.success || !embedData.embedding) {
          throw new Error(embedData.error || 'Invalid embedding response');
        }

        primaryEmbedding = embedData.embedding;
        primaryText = embedData.visionAnalysis;
        console.log(`[AddProduct] Embedding image principale ✅`);
      } catch (err) {
        console.error(`[AddProduct] Échec embedding (tentative ${embedAttempts}):`, err.message);
        if (embedAttempts < maxEmbedAttempts) {
          await delay(1500 * embedAttempts); // Délai progressif
        }
      }
    }

    if (!primaryEmbedding) {
      alert("❌ Les serveurs de traitement d'images sont actuellement très chargés. Votre image n'a pas pu être analysée. Veuillez réessayer dans quelques instants.");
      setLoading(false);
      return;
    }

    // ============ ÉTAPE 2: Créer le produit (Avec Retry de base de données) ============
    const newProduct = {
      store_id: storeId,
      global_category_id: parseInt(formData.global_category_id),
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity) || 1,
      image_url: formData.images[0] || null,
      images: formData.images,
      text_embedding_1024: primaryEmbedding,
      image_embedding_1024: primaryEmbedding,
      is_active: true
    };

    let product = null;
    let dbAttempts = 0;
    const maxDbAttempts = 3;

    while (dbAttempts < maxDbAttempts && !product) {
      dbAttempts++;
      try {
        console.log(`[AddProduct] Insertion base de données (Tentative ${dbAttempts}/${maxDbAttempts})...`);
        const { data, error: insertError } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
          .single();

        if (insertError) throw insertError;
        product = data;
        console.log('[AddProduct] Produit inséré en base ✅');
      } catch (err) {
        console.error(`[AddProduct] Échec écriture base (tentative ${dbAttempts}):`, err.message);
        if (dbAttempts < maxDbAttempts) {
          await delay(1500 * dbAttempts); // Attente progressive avant de retenter
        } else {
          alert("❌ La base de données est occupée. Votre produit n'a pas pu être enregistré immédiatement. Veuillez cliquer à nouveau sur Enregistrer.");
          setLoading(false);
          return;
        }
      }
    }

    console.log('[AddProduct] Produit créé:', product.id);

    // ============ ÉTAPE 3: Ajouter les variantes (Avec Retry de base de données) ============
    if (variants.length > 0) {
      let variantSuccess = false;
      let varAttempts = 0;
      const maxVarAttempts = 3;

      while (varAttempts < maxVarAttempts && !variantSuccess) {
        varAttempts++;
        try {
          console.log(`[AddProduct] Insertion variantes (Tentative ${varAttempts}/${maxVarAttempts})...`);
          const variantRecords = variants.map(v => ({
            product_id: product.id,
            variant_type: v.type,
            variant_value: v.value,
            stock_quantity: parseInt(v.stock) || 1
          }));
          const { error: varError } = await supabase.from('product_variants').insert(variantRecords);
          if (varError) throw varError;
          
          variantSuccess = true;
          console.log('[AddProduct] Variantes ajoutées ✅:', variantRecords.length);
        } catch (e) {
          console.warn(`[AddProduct] Échec écriture variantes (tentative ${varAttempts}):`, e.message);
          if (varAttempts < maxVarAttempts) {
            await delay(1000 * varAttempts);
          }
        }
      }
    }

    // ============ SUCCÈS ============
    saveSucceededRef.current = true;
    
    const successMsg = `✅ Produit créé avec succès!\n\n📸 Embedding 1024D généré (Jina CLIP v2)\n🎯 Prêt pour la recherche visuelle!`;
    
    alert(successMsg);
    
    // Reset formulaire
    setFormData({
      name: '',
      description: '',
      global_category_id: '',
      price: '',
      stock_quantity: '1',
      images: []
    });
    setVariants([]);
    tempUploadedUrlsRef.current.clear();
    
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <BackNavigation title="Nouveau Produit" />
        
        <header className="mb-8">
          <h1 className="text-3xl font-black text-wa-teal-dark flex items-center gap-3">
            <div className="w-12 h-12 bg-wa-teal/10 rounded-2xl flex items-center justify-center text-wa-teal">
              <Package size={28} />
            </div>
            Nouveau Produit
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* IMAGES */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <label className="block text-sm font-black text-neutral-900 mb-4 uppercase tracking-widest">Photos (Max 4)</label>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              {formData.images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-neutral-100">
                  <img src={url} className="w-full h-full object-cover" alt="product" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <X size={20} className="text-white" />
                  </button>
                  {idx === 0 && <div className="absolute bottom-1 left-1 bg-wa-teal text-white text-[8px] font-black px-1.5 py-0.5 rounded">PRINCIPALE</div>}
                </div>
              ))}
              
              {formData.images.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:border-wa-teal hover:bg-wa-teal/5 transition-all text-neutral-400 hover:text-wa-teal">
                  {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* NOM */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Nom du produit *</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Ex: Robe de soirée"
              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              rows={3} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Détails du produit..."
              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all resize-none"
            />
          </div>

          {/* GÉNÉRATION IA DESCRIPTION */}
          {formData.name && (
            <ProductDescriptionAI
              productName={formData.name}
              category={formData.global_category_id ? 'produit' : ''}
              onDescriptionGenerated={(desc) => setFormData(prev => ({ ...prev, description: desc }))}
            />
          )}

          {/* CATÉGORIE & PRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Catégorie</label>
              <CategorySearch 
                selectedId={formData.global_category_id} 
                onSelect={(cat) => setFormData({...formData, global_category_id: cat.id})} 
              />
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Prix (FCFA) *</label>
              <input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                placeholder="0"
                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 font-bold text-neutral-900 placeholder-neutral-300 focus:ring-2 focus:ring-wa-teal transition-all"
              />
            </div>
          </div>

          {/* VARIANTES */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Variantes</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => addVariant('Taille')} className="text-[10px] font-black bg-wa-teal/10 text-wa-teal hover:bg-wa-teal/20 px-3 py-1.5 rounded-full transition-colors">
                  + Taille
                </button>
                <button type="button" onClick={() => addVariant('Couleur')} className="text-[10px] font-black bg-wa-teal/10 text-wa-teal hover:bg-wa-teal/20 px-3 py-1.5 rounded-full transition-colors">
                  + Couleur
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {variants.length === 0 ? (
                <p className="text-center text-neutral-300 text-xs py-4">Aucune variante</p>
              ) : (
                variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 bg-neutral-50 p-3 rounded-lg">
                    <div className="bg-white px-2 py-1 rounded text-[10px] font-black text-wa-teal border border-neutral-100 min-w-fit">{v.type}</div>
                    <input type="text" required placeholder="Ex: XL" value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} className="flex-1 bg-transparent border-none p-0 text-sm font-bold outline-none" />
                    <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="Stock" className="w-16 bg-transparent border-none p-0 text-sm font-bold text-center outline-none" />
                    <button type="button" onClick={() => removeVariant(i)} className="text-neutral-300 hover:text-red-500 transition-colors p-1">
                      <X size={16}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BOUTON */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-wa-teal-dark text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-wa-teal-dark/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Ajouter le Produit</>}
          </button>
        </form>
      </div>
    </div>
  );
}
