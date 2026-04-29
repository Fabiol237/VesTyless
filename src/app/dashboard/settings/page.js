'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StoreSettingsPage() {
  const { session } = useAuth();
  const router = useRouter();
  
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const [storeSchema, setStoreSchema] = useState({ hasCity: false, hasPhone: false });
  const [initialMedia, setInitialMedia] = useState({ logo_url: '', banner_url: '' });
  const tempUploadedUrlsRef = useRef(new Set());
  const saveSucceededRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    phone: '',
    slug: '',
    logo_url: '',
    banner_url: '',
    theme_color: '#6D28D9',
    secondary_color: '#F3F4F6',
    font_family: 'Inter',
    custom_message: ''
  });

  useEffect(() => {
    if (!session?.id) return;
    async function fetchStore() {
      const { data } = await supabase.from('stores').select('*').eq('owner_id', session.id).single();
      if (data) {
        setStoreSchema({
          hasCity: Object.prototype.hasOwnProperty.call(data, 'city'),
          hasPhone: Object.prototype.hasOwnProperty.call(data, 'phone'),
        });
        setStoreId(data.id);
        setInitialMedia({
          logo_url: data.logo_url || '',
          banner_url: data.banner_url || '',
        });
        setFormData({
          name: data.name || '',
          description: data.description || '',
          city: data.city || '',
          phone: data.phone || '',
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          banner_url: data.banner_url || '',
          theme_color: data.theme_color || '#6D28D9',
          secondary_color: data.secondary_color || '#F3F4F6',
          font_family: data.font_family || 'Inter',
          custom_message: data.custom_message || ''
        });
      }
    }
    fetchStore();
  }, [session]);

  useEffect(() => {
    return () => {
      if (saveSucceededRef.current) return;

      const pending = Array.from(tempUploadedUrlsRef.current);
      pending.forEach((url) => {
        deleteCloudinaryByUrl(url);
      });
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;

    try {
      setUploadingField(fieldName);
      const previousUrl = formData[fieldName];
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/stores' });
      if (!secureUrl) {
        throw new Error("Upload invalide");
      }

      if (previousUrl && previousUrl !== secureUrl && tempUploadedUrlsRef.current.has(previousUrl)) {
        await deleteCloudinaryByUrl(previousUrl);
        tempUploadedUrlsRef.current.delete(previousUrl);
      }

      setFormData((prev) => ({ ...prev, [fieldName]: secureUrl }));
      tempUploadedUrlsRef.current.add(secureUrl);
    } catch (err) {
      alert("Erreur upload image: " + (err?.message || "Impossible de televerser l'image"));
    } finally {
      setUploadingField('');
    }
  };

  const handleRemoveImage = async (fieldName) => {
    const currentUrl = formData[fieldName];
    if (!currentUrl) return;

    // If it's a temporary uploaded image in this session, delete it immediately.
    if (tempUploadedUrlsRef.current.has(currentUrl)) {
      await deleteCloudinaryByUrl(currentUrl);
      tempUploadedUrlsRef.current.delete(currentUrl);
    }

    setFormData((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) return;
    
    setLoading(true);
    const { error } = await supabase.from('stores').update({
      name: formData.name,
      description: formData.description,
      ...(storeSchema.hasCity ? { city: formData.city } : {}),
      ...(storeSchema.hasPhone ? { phone: formData.phone } : {}),
      slug: formData.slug,
      logo_url: formData.logo_url,
      banner_url: formData.banner_url,
      theme_color: formData.theme_color,
      secondary_color: formData.secondary_color,
      font_family: formData.font_family,
      custom_message: formData.custom_message
    }).eq('id', storeId);

    setLoading(false);
    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      const cleanupTasks = [];
      const fields = ['logo_url', 'banner_url'];

      fields.forEach((fieldName) => {
        const oldUrl = initialMedia[fieldName];
        const newUrl = formData[fieldName];

        if (oldUrl && oldUrl !== newUrl) {
          cleanupTasks.push(deleteCloudinaryByUrl(oldUrl));
        }
      });

      const activeUrls = new Set([formData.logo_url, formData.banner_url].filter(Boolean));
      const staleTemps = Array.from(tempUploadedUrlsRef.current).filter((url) => !activeUrls.has(url));
      staleTemps.forEach((url) => cleanupTasks.push(deleteCloudinaryByUrl(url)));

      if (cleanupTasks.length > 0) {
        await Promise.allSettled(cleanupTasks);
      }

      saveSucceededRef.current = true;
      tempUploadedUrlsRef.current.clear();
      router.push('/dashboard');
    }
  };

  if (session === undefined) return <div className="min-h-screen bg-wa-bg flex justify-center items-center"><Loader2 className="animate-spin text-wa-teal" size={48} /></div>;

  return (    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      <Link href="/dashboard" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 mb-4 sm:mb-6 font-medium transition-colors w-max">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </Link>
      
      <header className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-wa-teal-dark flex items-center gap-2 sm:gap-3"><Settings size={24} className="text-wa-teal sm:w-7 sm:h-7"/> Paramètres</h1>
        <p className="text-neutral-500 mt-1 sm:mt-2 text-xs sm:text-sm">Modifiez les informations publiques de votre espace vendeur.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Nom de la boutique *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Lien personnalisé (Slug)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Ex: ma-boutique-pro" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">Sera utilisé pour votre lien : /boutique/{formData.slug || 'id'}</p>
          </div>

          {storeSchema.hasCity && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Ville / Localisation</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Douala" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
            </div>
          )}

          {storeSchema.hasPhone && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Numéro de Contact</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+237..." className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Présentez votre entreprise..." className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal"></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Lien du Logo (URL)</label>
            <input type="url" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex-1 sm:flex-none text-center inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm font-medium text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors">
                Choisir un logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('logo_url', e.target.files?.[0])}
                />
                </label>
                {formData.logo_url && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('logo_url')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              {uploadingField === 'logo_url' && <p className="text-[10px] text-neutral-500 mt-2">Upload en cours...</p>}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Lien de la bannière (URL)</label>
            <input type="url" name="banner_url" value={formData.banner_url} onChange={handleChange} placeholder="https://..." className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex-1 sm:flex-none text-center inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm font-medium text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors">
                Choisir une bannière
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('banner_url', e.target.files?.[0])}
                />
                </label>
                {formData.banner_url && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('banner_url')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              {uploadingField === 'banner_url' && <p className="text-[10px] text-neutral-500 mt-2">Upload en cours...</p>}
            </div>
          </div>

          <div className="md:col-span-2 pt-4 sm:pt-6 border-t border-neutral-100">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">Branding</h3>
            <p className="text-[10px] sm:text-sm text-neutral-500 mb-4 sm:mb-6">Personnalisez l&apos;apparence de votre boutique.</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Couleur Principale</label>
            <div className="flex gap-2 sm:gap-3 items-center">
              <input type="color" name="theme_color" value={formData.theme_color} onChange={handleChange} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-0 p-0" />
              <input type="text" name="theme_color" value={formData.theme_color} onChange={handleChange} className="flex-1 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-wa-teal uppercase font-mono text-xs sm:text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Couleur Secondaire</label>
            <div className="flex gap-2 sm:gap-3 items-center">
              <input type="color" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-0 p-0" />
              <input type="text" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="flex-1 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 focus:outline-none focus:border-wa-teal uppercase font-mono text-xs sm:text-sm" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Police</label>
            <select name="font_family" value={formData.font_family} onChange={handleChange} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal">
              <option value="Inter">Inter (Moderne)</option>
              <option value="'Outfit', sans-serif">Outfit (Élégant)</option>
              <option value="'Roboto', sans-serif">Roboto (Standard)</option>
              <option value="'Playfair Display', serif">Playfair (Luxe)</option>
              <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 sm:mb-2">Message de bienvenue</label>
            <input type="text" name="custom_message" value={formData.custom_message} onChange={handleChange} placeholder="Ex: Livraison gratuite !" className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-wa-teal" />
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors text-center text-sm sm:text-base order-2 sm:order-1">Annuler</Link>
          <button disabled={loading} type="submit" className="bg-wa-green disabled:bg-neutral-300 disabled:text-neutral-500 hover:bg-wa-teal text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base order-1 sm:order-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
}
