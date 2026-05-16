'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import {
  Settings, Save, Loader2, ArrowLeft, Image as ImageIcon,
  Palette, Type, Megaphone, Globe, Info, CheckCircle2,
  Camera, Trash2, Smartphone, MapPin, Navigation, Bot, Truck, Plus, User, Send, TestTube, Star
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
    ai_prompt: 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu\'il cherche en vous basant sur la description de la boutique.',
    supplier_level: 'Fournisseur Or',
    positive_rating: 100,
    response_time: '< 1h'
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

    const { data, error } = await supabase.from('stores').update(validFields).eq('id', storeId).select().single();
    
    if (error) {
      console.error("Erreur de sauvegarde:", error);
      setAutoSaveStatus('error');
    } else {
        // Mise à jour réussie
        console.log('Paramètres sauvegardés', data);
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
          ai_prompt: data.ai_prompt || 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu\'il cherche en vous basant sur la description de la boutique.',
          supplier_level: data.supplier_level || 'Nouveau Vendeur',
          positive_rating: data.positive_rating !== undefined ? data.positive_rating : 100,
          response_time: data.response_time || '< 2h'
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

  // === LIVREURS MANAGEMENT ===
  const [livreurs, setLivreurs] = useState([]);
  const [newLivreur, setNewLivreur] = useState({ name: '', phone: '', email: '' });
  const [addingLivreur, setAddingLivreur] = useState(false);

  useEffect(() => {
    if (storeId) {
      const fetchLivreurs = async () => {
        const { data } = await supabase.from('livreurs').select('*').eq('store_id', storeId);
        setLivreurs(data || []);
      };
      fetchLivreurs();
    }
  }, [storeId]);

  const handleAddLivreur = async (e) => {
    e.preventDefault();
    if (!newLivreur.name || !newLivreur.phone) return;
    setAddingLivreur(true);
    try {
      let userId = null;
      
      // Si un email est fourni, on cherche l'utilisateur correspondant
      if (newLivreur.email) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', newLivreur.email.trim().toLowerCase())
          .single();
        
        if (userData) {
          userId = userData.id;
        } else {
          alert("Aucun utilisateur trouvé avec cet email. Le livreur pourra être ajouté mais ne pourra pas se connecter au dashboard pour l'instant.");
        }
      }

      const { data, error } = await supabase.from('livreurs').insert([{
        store_id: storeId,
        user_id: userId,
        name: newLivreur.name,
        phone: newLivreur.phone
      }]).select().single();

      if (!error && data) {
        setLivreurs([...livreurs, data]);
        setNewLivreur({ name: '', phone: '', email: '' });
        alert("Livreur ajouté avec succès !");
      } else {
        throw error;
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du livreur.");
    } finally {
      setAddingLivreur(false);
    }
  };

  const handleRemoveLivreur = async (id) => {
    const { error } = await supabase.from('livreurs').delete().eq('id', id);
    if (!error) {
      setLivreurs(livreurs.filter(l => l.id !== id));
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                    userPos={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
                    userAccuracy={userLocation?.accuracy}
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
                <div className="grid grid-cols-1 gap-6 animate-fade-in mt-6">
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

              {/* AI DIAGNOSTIC TOOL */}
              <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnostic IA</p>
                  <p className="text-xs text-gray-500">Vérifiez si l'intelligence artificielle est prête.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: [{ role: 'user', content: 'Vérification de connexion' }] })
                      });
                      const data = await res.json();
                      if (res.ok && data.content) {
                        alert("✅ IA Opérationnelle : " + data.content.slice(0, 50) + "...");
                      } else {
                        alert("❌ Erreur IA : " + (data.error || "Configuration incomplète"));
                      }
                    } catch (err) {
                      alert("❌ Erreur Réseau : " + err.message);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all"
                >
                  <TestTube size={14} /> Tester l'IA
                </button>
              </div>
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

          {/* Performance & Trust (Alibaba Style) Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Star size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Performance & Confiance</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6">Paramétrez les indicateurs de confiance (façon fournisseur vérifié) qui s'affichent sur l'en-tête de votre boutique.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Niveau Fournisseur</label>
                <select name="supplier_level" value={formData.supplier_level} onChange={handleChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all">
                  <option value="Nouveau Vendeur">Nouveau Vendeur</option>
                  <option value="Fournisseur Or">Fournisseur Or</option>
                  <option value="Vendeur Premium">Vendeur Premium</option>
                  <option value="Boutique Officielle">Boutique Officielle</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Avis Positifs (%)</label>
                <div className="relative">
                  <input type="number" step="0.1" max="100" min="0" name="positive_rating" value={formData.positive_rating} onChange={handleChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl pl-5 pr-10 py-3.5 text-sm font-bold outline-none transition-all" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Temps de Réponse</label>
                <select name="response_time" value={formData.response_time} onChange={handleChange} className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all">
                  <option value="< 1h">&lt; 1h (Très rapide)</option>
                  <option value="< 2h">&lt; 2h (Rapide)</option>
                  <option value="< 12h">&lt; 12h (Moyen)</option>
                  <option value="< 24h">&lt; 24h (Lent)</option>
                </select>
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

              {/* NOTIFICATION DIAGNOSTIC */}
              <div className="pt-6 mt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Diagnostic Notifications</p>
                  <p className="text-xs text-white/80">Vérifiez la configuration des emails (Resend).</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!session?.email) return;
                    try {
                      const res = await fetch('/api/emails/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          to: session.email, 
                          subject: 'Test de Notification VesTyle', 
                          type: 'MESSAGE', 
                          data: { message: 'Si vous recevez ceci, votre configuration email fonctionne.' } 
                        })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        if (data.email?.error) {
                          alert("⚠️ Email en mode TEST : " + data.email.error.message + "\n\nNote: Vous devez valider votre domaine sur Resend.com pour envoyer à d'autres adresses.");
                        } else {
                          alert("✅ Email envoyé avec succès à " + session.email);
                        }
                      } else {
                        alert("❌ Erreur Notification : " + (data.error || "Problème serveur"));
                      }
                    } catch (err) {
                      alert("❌ Erreur Réseau : " + err.message);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
                >
                  <Send size={14} /> Tester l'Email
                </button>
              </div>
            </div>
            <Megaphone className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" size={160} />
          </section>

          {/* GESTION DES LIVREURS */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left relative overflow-hidden">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Truck size={20} /></div>
              <h2 className="text-xl font-black text-gray-900">Équipe de Livraison</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-6">Ajoutez les livreurs officiels de votre boutique pour automatiser les livraisons.</p>

            <div className="space-y-4">
               {livreurs.map((l) => (
                 <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-wa-teal shadow-sm"><User size={18} /></div>
                       <div>
                          <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{l.phone}</p>
                       </div>
                    </div>
                    <button onClick={() => handleRemoveLivreur(l.id)} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                 </div>
               ))}

               <form onSubmit={handleAddLivreur} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-gray-50">
                  <input 
                    type="text" 
                    placeholder="Nom complet" 
                    value={newLivreur.name}
                    onChange={e => setNewLivreur({...newLivreur, name: e.target.value})}
                    className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-wa-teal transition-all" 
                  />
                  <input 
                    type="text" 
                    placeholder="WhatsApp" 
                    value={newLivreur.phone}
                    onChange={e => setNewLivreur({...newLivreur, phone: e.target.value})}
                    className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-wa-teal transition-all" 
                  />
                  <input 
                    type="email" 
                    placeholder="Email (pour connexion)" 
                    value={newLivreur.email}
                    onChange={e => setNewLivreur({...newLivreur, email: e.target.value})}
                    className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-wa-teal transition-all" 
                  />
                  <button 
                    disabled={addingLivreur}
                    className="bg-wa-teal text-white rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-wa-teal/10 flex items-center justify-center gap-2 hover:bg-wa-teal-dark disabled:opacity-50"
                  >
                    {addingLivreur ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Ajouter</>}
                  </button>
               </form>
               
               <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!session?.id || !storeId) return;
                      if (livreurs.some(l => l.user_id === session.id)) {
                        alert("Vous êtes déjà enregistré comme livreur.");
                        return;
                      }
                      setAddingLivreur(true);
                      try {
                        const { data, error } = await supabase.from('livreurs').insert([{
                          store_id: storeId,
                          user_id: session.id,
                          name: formData.name + " (Propriétaire)",
                          phone: formData.whatsapp_number || formData.phone || ""
                        }]).select().single();
                        
                        if (!error && data) {
                          setLivreurs([...livreurs, data]);
                          alert("Vous avez été ajouté comme livreur avec succès !");
                        } else {
                          throw error;
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Erreur lors de votre ajout comme livreur.");
                      } finally {
                        setAddingLivreur(false);
                      }
                    }}
                    disabled={addingLivreur || livreurs.some(l => l.user_id === session?.id)}
                    className="flex-1 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-2xl border-2 border-dashed border-emerald-200 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
                  >
                    <User size={16} /> Me rajouter comme livreur
                  </button>
                  <Link 
                    href="/delivery"
                    className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                  >
                    <Truck size={16} /> Voir mon Hub Livreur
                  </Link>
               </div>
            </div>
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

          {/* Live Preview Card (Simulation of the store card) */}
          <section className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Smartphone size={20} /></div>
              <h2 className="text-lg font-black text-gray-900">Aperçu en direct</h2>
            </div>
            
            <div className="relative group w-full aspect-[4/5] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 shadow-inner flex flex-col p-4">
               {/* Mockup Store Card */}
               <div className="bg-white rounded-[24px] overflow-hidden shadow-xl flex flex-col h-full border border-slate-50">
                  <div className="h-24 w-full bg-slate-100 relative">
                     {formData.banner_url ? <img src={formData.banner_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100" />}
                     <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white">
                        {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black bg-slate-50">{formData.name?.[0] || 'V'}</div>}
                     </div>
                  </div>
                  <div className="pt-8 px-4 pb-4 flex-1 flex flex-col justify-between">
                     <div>
                        <h4 className="font-bold text-sm text-slate-900 truncate" style={{ color: formData.theme_color }}>{formData.name || 'Nom de la boutique'}</h4>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1">{formData.description || 'Description courte de votre boutique...'}</p>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest"><MapPin size={10} /> {formData.city || 'Douala'}</div>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: formData.theme_color }}>
                           <ArrowLeft className="rotate-180" size={12} />
                        </div>
                     </div>
                  </div>
               </div>
               <p className="mt-4 text-[10px] text-center font-black text-slate-300 uppercase tracking-widest">Apparence de votre carte boutique</p>
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
      </div>
    </div>
  );
}
