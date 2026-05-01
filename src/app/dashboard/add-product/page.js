'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import { ImagePlus, Package, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const { session } = useAuth();
  const router = useRouter();
  
  const [storeId, setStoreId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const tempUploadedUrlsRef = useRef(new Set());
  const saveSucceededRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    stock_quantity: '1',
    image_url: ''
  });

  useEffect(() => {
    if (!session?.id) return;
    async function fetchStore() {
      const { data } = await supabase.from('stores').select('id').eq('owner_id', session.id).single();
      if (data) setStoreId(data.id);
    }
    fetchStore();
  }, [session]);

  useEffect(() => {
    if (!storeId) return;

    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      if (data) {
        setCategories(data);
      }
    }

    fetchCategories();
  }, [storeId]);

  useEffect(() => {
    const urlsRef = tempUploadedUrlsRef.current;
    return () => {
      if (saveSucceededRef.current) return;

      const pending = Array.from(urlsRef);
      pending.forEach((url) => {
        deleteCloudinaryByUrl(url);
      });
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFile = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const previousUrl = formData.image_url;
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/products' });
      if (!secureUrl) {
        throw new Error("Upload invalide");
      }

      if (previousUrl && previousUrl !== secureUrl && tempUploadedUrlsRef.current.has(previousUrl)) {
        await deleteCloudinaryByUrl(previousUrl);
        tempUploadedUrlsRef.current.delete(previousUrl);
      }

      setFormData((prev) => ({ ...prev, image_url: secureUrl }));
      tempUploadedUrlsRef.current.add(secureUrl);
    } catch (err) {
      alert("Erreur upload image: " + (err?.message || "Impossible de televerser l'image"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    const currentUrl = formData.image_url;
    if (!currentUrl) return;

    if (tempUploadedUrlsRef.current.has(currentUrl)) {
      await deleteCloudinaryByUrl(currentUrl);
      tempUploadedUrlsRef.current.delete(currentUrl);
    }

    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) {
      alert("Aucune boutique liée !");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.from('products').insert([{
      store_id: storeId,
      category_id: formData.category_id || null,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      image_url: formData.image_url || null
    }]);

    setLoading(false);
    if (error) {
      alert("Erreur lors de la création : " + error.message);
    } else {
      const currentImage = formData.image_url;
      const staleTemps = Array.from(tempUploadedUrlsRef.current).filter((url) => url && url !== currentImage);
      if (staleTemps.length > 0) {
        await Promise.allSettled(staleTemps.map((url) => deleteCloudinaryByUrl(url)));
      }

      saveSucceededRef.current = true;
      tempUploadedUrlsRef.current.clear();
      router.push('/dashboard');
    }
  };

  if (session === undefined) return <div className="min-h-screen bg-wa-bg flex justify-center items-center"><Loader2 className="animate-spin text-wa-teal" size={48} /></div>;

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 font-medium transition-colors w-max">
        <ArrowLeft size={16} /> Revenir au catalogue
      </Link>
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-wa-teal-dark flex items-center gap-3"><Package size={28} className="text-wa-teal"/> Ajouter un produit</h1>
        <p className="text-neutral-500 mt-2 text-sm">Créez une nouvelle fiche produit qui sera immédiatement visible sur votre boutique Vestyle.</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Nom du produit *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: T-Shirt Vintage Oversize" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:border-wa-teal transition-colors" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Décrivez votre produit en détail (matière, conseils d&apos;entretien...)" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:border-wa-teal transition-colors"></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">Prix (XAF) *</label>
            <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} placeholder="Ex: 15000" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:border-wa-teal transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">Stock disponible *</label>
            <input required type="number" min="1" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} placeholder="Ex: 10" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:border-wa-teal transition-colors" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Catégorie</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 focus:outline-none focus:border-wa-teal"
            >
              <option value="">Aucune catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-neutral-500 mt-2">Aucune catégorie trouvée, le produit sera créé sans catégorie.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Url de l&apos;image (Optionnel)</label>
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <ImagePlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://lien... (Ou connectez Supabase Storage plus tard)" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-wa-teal transition-colors" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors">
                  Choisir une image locale
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                  />
                </label>
                {formData.image_url && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Supprimer l&apos;image
                  </button>
                )}
              </div>
              {uploadingImage && <p className="text-xs text-neutral-500 mt-2">Upload de l&apos;image en cours...</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-end gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors">Annuler</Link>
          <button disabled={loading} type="submit" className="bg-wa-green disabled:bg-neutral-300 disabled:text-neutral-500 hover:bg-wa-teal text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Enregistrer le produit
          </button>
        </div>
      </form>
    </div>
  );
}
