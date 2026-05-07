'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import {
  Settings, Save, Loader2, ArrowLeft, Image as ImageIcon,
  Palette, Type, Megaphone, Globe, Info, CheckCircle2,
  Camera, Trash2, Smartphone, MapPin, Navigation, Bot
} from 'lucide-react';
import Link from 'next/link';
import { useDistance } from '@/hooks/useDistance';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement de la carte...</div>
});

export default function StoreSettingsPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [storeId, setStoreId] = useState(null);
  const [uploadingField, setUploadingField] = useState('');
  const [storeSchema, setStoreSchema] = useState({ hasCity: false, hasPhone: false });
  const [initialMedia, setInitialMedia] = useState({ logo_url: '', banner_url: '' });
  const tempUploadedUrlsRef = useRef(new Set());
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimeoutRef = useRef(null);
  const pendingChangesRef = useRef({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    phone: '',
    slug: '',
    logo_url: '',
    banner_url: '',
    theme_color: '#128C7E',
    secondary_color: '#F3F4F6',
    font_family: 'Inter',
    custom_message: '',
    whatsapp_number: '',
    latitude: '',
    longitude: '',
    ai_enabled: false,
    ai_name: 'Assistant VesTyle',
    ai_prompt: 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu\'il cherche en vous basant sur la description de la boutique.'
  });

  const { requestLocation, userLocation, isLocating, error: gpsError } = useDistance();

  // === API #6 : CONTACT PICKER API ===
  const pickContact = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('L\'API Contacts n\'est pas disponible sur ce navigateur/appareil (Android Chrome requis).');
      return;
    }
    try {
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts.length > 0) {
        const contact = contacts[0];
        const phone = contact.tel?.[0]?.replace(/\s/g, '') || '';
        handleChange({ target: { name: 'whatsapp_number', value: phone } });
      }
    } catch (err) {
      console.error('Contact Picker error:', err);
    }
  };

  const updateStore = async (fieldsToUpdate) => {
    if (!storeId) return;
    setAutoSaveStatus('saving');

    // Assurez-vous qu'on ne met à jour que les champs qui existent dans le schéma
    const validFields = { ...fieldsToUpdate };
    if (!storeSchema.hasCity) delete validFields.city;
    if (!storeSchema.hasPhone) delete validFields.phone;

    const { error } = await supabase.from('stores').update(validFields).eq('id', storeId);

    if (error) {
      console.error("Erreur de sauvegarde:", error);
      setAutoSaveStatus('error');
    } else {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  };

  // Watch for gps updates
  useEffect(() => {
    if (userLocation && storeId) {
      setFormData(prev => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }));
      updateStore({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    }
  }, [userLocation, storeId]);

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
          theme_color: data.theme_color || '#128C7E',
          secondary_color: data.secondary_color || '#F3F4F6',
          font_family: data.font_family || 'Inter',
          custom_message: data.custom_message || '',
          whatsapp_number: data.whatsapp_number || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          ai_enabled: data.ai_enabled || false,
          ai_name: data.ai_name || 'Assistant VesTyle',
          ai_prompt: data.ai_prompt || 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu\'il cherche en vous basant sur la description de la boutique.'
        });
      }
    }
    fetchStore();
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    pendingChangesRef.current[name] = finalValue;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateStore({ ...pendingChangesRef.current });
      pendingChangesRef.current = {};
    }, 1000);
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    try {
      setUploadingField(fieldName);
      const previousUrl = formData[fieldName];
      const { secureUrl } = await uploadImage(file, { folder: 'vestyle/stores' });
      if (!secureUrl) throw new Error("Upload invalide");
      if (previousUrl && previousUrl !== secureUrl && tempUploadedUrlsRef.current.has(previousUrl)) {
        await deleteCloudinaryByUrl(previousUrl);
        tempUploadedUrlsRef.current.delete(previousUrl);
      }
      setFormData((prev) => ({ ...prev, [fieldName]: secureUrl }));
      tempUploadedUrlsRef.current.add(secureUrl);

      // Auto-save the new image
      updateStore({ [fieldName]: secureUrl });
    } catch (err) {
      alert("Erreur upload image: " + (err?.message || "Impossible de televerser l'image"));
    } finally {
      setUploadingField('');
    }
  };

  const handleRemoveImage = async (fieldName) => {
    const currentUrl = formData[fieldName];
    if (!currentUrl) return;
    if (tempUploadedUrlsRef.current.has(currentUrl)) {
      await deleteCloudinaryByUrl(currentUrl);
      tempUploadedUrlsRef.current.delete(currentUrl);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    updateStore({ [fieldName]: null });
  };

  if (session === undefined) return <div className="min-h-screen bg-wa-bg flex justify-center items-center"><Loader2 className="animate-spin text-wa-teal" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-left">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Settings className="text-wa-teal" size={32} />
            Configuration Boutique
          </h1>
          <p className="text-gray-500 font-medium">Sublimez l&apos;apparence et les réglages de votre espace client.</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne de Gauche : Infos de Base & Branding */}
        <div className="lg:col-span-2 space-y-8">

          {/* Identité Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-wa-chat rounded-xl text-wa-teal"><Globe size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Identité & Accès</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la boutique</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Lien (Slug)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">/boutique/</span>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-2xl pl-24 pr-5 py-3.5 text-sm font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description Boutique</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp Client</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                    <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="237655..." className="w-full bg-gray-50 border-2 border-transparent focus:border-wa-teal focus:bg-white rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold outline-none transition-all" />
                  </div>
                  {/* API #6 : CONTACT PICKER */}
                  <button
                    type="button"
                    onClick={pickContact}
                    title="Importer depuis mes contacts"
                    className="flex-shrink-0 p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all font-bold text-xs flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span className="hidden sm:inline">Contacts</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Sur Android Chrome : importez directement depuis votre répertoire téléphonique.</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><MapPin size={20} /></div>
                <h3 className="text-lg font-black text-gray-900">Localisation GPS</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-4">Permet à vos clients de voir à quelle distance ils se trouvent de votre boutique.</p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                    Capturer ma position GPS
                  </button>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">LAT</span>
                      <input type="text" readOnly placeholder="0.000" value={formData.latitude} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-gray-700 outline-none" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">LON</span>
                      <input type="text" readOnly placeholder="0.000" value={formData.longitude} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-gray-700 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="h-[500px] w-full rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative group bg-gray-50">
                  <InteractiveMap 
                    mode="select"
                    initialPos={formData.latitude && formData.longitude && !isNaN(formData.latitude) && !isNaN(formData.longitude) 
                      ? [Number(formData.latitude), Number(formData.longitude)] 
                      : null
                    }
                    onPositionChange={(pos) => {
                      setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }));
                      updateStore({ latitude: pos[0], longitude: pos[1] });
                    }}
                  />
                  <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm border border-blue-100">
                    Ajustez votre position réelle
                  </div>
                </div>
              </div>

              {gpsError && <p className="mt-3 text-xs font-bold text-red-500">{gpsError}</p>}
              {formData.latitude && !gpsError && <p className="mt-3 text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Position synchronisée avec succès</p>}
            </div>
          </section>

          {/* AI Secretary Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 pointer-events-none">
              <Bot size={120} />
            </div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500"><Bot size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Secrétaire IA (WebLLM)</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6 relative z-10">Configurez votre assistant virtuel autonome. Il répondra à vos clients directement depuis leur navigateur via Llama 3.2.</p>

            <div className="space-y-6 relative z-10">
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="relative">
                  <input type="checkbox" name="ai_enabled" checked={formData.ai_enabled} onChange={handleChange} className="sr-only" />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.ai_enabled ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.ai_enabled ? 'translate-x-6' : ''}`}></div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Activer la Secrétaire IA</p>
                  <p className="text-xs text-gray-500">Un widget de discussion apparaîtra sur votre boutique.</p>
                </div>
              </label>

              {formData.ai_enabled && (
                <div className="grid grid-cols-1 gap-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'Assistant</label>
                    <input type="text" name="ai_name" value={formData.ai_name} onChange={handleChange} placeholder="Ex: Sophie (Assistant VesTyle)" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Prompt Système (Comportement)</label>
                    <textarea name="ai_prompt" value={formData.ai_prompt} onChange={handleChange} rows="4" placeholder="Instructions pour l'IA..." className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all resize-none"></textarea>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><Info size={12} /> Décrivez comment l'IA doit s'adresser à vos clients et quelles règles elle doit respecter.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Design & Style Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Palette size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Style & Branding</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Thème Visuel</label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="relative group">
                    <input type="color" name="theme_color" value={formData.theme_color} onChange={handleChange} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-lg overflow-hidden" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="text-white drop-shadow-md" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{formData.theme_color}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Couleur Principale</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Typographie</label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="p-3 bg-white rounded-2xl text-gray-400 shadow-sm"><Type size={24} /></div>
                  <select name="font_family" value={formData.font_family} onChange={handleChange} className="flex-1 bg-transparent border-none outline-none font-black text-sm">
                    <option value="Inter">Inter (Moderne)</option>
                    <option value="'Outfit', sans-serif">Outfit (Élégant)</option>
                    <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section PROMOTION (EMBELLIE) */}
          <section className="bg-gradient-to-br from-wa-teal to-wa-teal-dark p-8 rounded-[40px] text-white shadow-xl shadow-wa-teal/20 space-y-6 text-left relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white"><Megaphone size={20} /></div>
                <h2 className="text-xl font-black">Section Promotionnelle</h2>
              </div>
              <p className="text-white/80 text-sm font-medium mb-6">Ce message s&apos;affichera en haut de votre boutique pour attirer l&apos;œil de vos clients.</p>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    name="custom_message"
                    value={formData.custom_message}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Ex: 🎉 PROMO : -20% sur toute la collection avec le code VESTYLE !"
                    className="w-full bg-white/10 backdrop-blur-md border-2 border-white/20 focus:border-white focus:bg-white/20 rounded-2xl px-5 py-4 text-sm font-black placeholder:text-white/40 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                  <Info size={12} />
                  <span>Apparaît comme une bannière animée sur la boutique</span>
                </div>
              </div>
            </div>
            <Megaphone className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" size={160} />
          </section>
        </div>

        {/* Colonne de Droite : Médias & Sauvegarde */}
        <div className="space-y-8">

          {/* Logo & Banner Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><ImageIcon size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Visuels</h2>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Boutique</p>
              <div className="relative group aspect-square max-w-[120px] mx-auto">
                <div className="w-full h-full rounded-[32px] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <Camera className="text-gray-300" size={32} />
                  )}
                  {uploadingField === 'logo_url' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="animate-spin text-wa-teal" size={24} />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-wa-teal text-white rounded-xl shadow-lg cursor-pointer hover:bg-wa-teal-dark transition-all active:scale-95">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('logo_url', e.target.files?.[0])} />
                </label>
                {formData.logo_url && (
                  <button type="button" onClick={() => handleRemoveImage('logo_url')} className="absolute -top-2 -right-2 p-2.5 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bannière de Fond</p>
              <div className="relative group w-full aspect-[2/1] rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {formData.banner_url ? (
                  <img src={formData.banner_url} className="w-full h-full object-cover" alt="Bannière" />
                ) : (
                  <ImageIcon className="text-gray-300" size={32} />
                )}
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm cursor-pointer">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest shadow-xl">
                    <Camera size={16} /> Changer
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('banner_url', e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </section>

          {/* Action Card (Auto-Save Indicator) */}
          <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-wa-teal">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-white font-black tracking-tight text-lg">Mode Direct (En ligne)</p>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">Vos modifications sont automatiquement enregistrées et publiées en temps réel.</p>

            <div className="w-full py-4 bg-gray-800 text-gray-400 font-black rounded-2xl shadow-inner flex items-center justify-center gap-3 transition-all h-14">
              {autoSaveStatus === 'saving' && <><Loader2 className="animate-spin text-wa-teal" size={20} /> <span className="text-wa-teal">Enregistrement...</span></>}
              {autoSaveStatus === 'saved' && <><CheckCircle2 className="text-emerald-500" size={20} /> <span className="text-emerald-500">Sauvegardé</span></>}
              {autoSaveStatus === 'error' && <span className="text-rose-500">Erreur de sauvegarde</span>}
              {autoSaveStatus === 'idle' && <><Settings size={20} /> <span className="opacity-70">Prêt</span></>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
