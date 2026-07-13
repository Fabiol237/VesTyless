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
import ThemePicker from '@/components/ThemePicker';

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
    response_time: '< 1h',
    shop_theme: 'theme_01',
    shop_tabs: { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
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
          response_time: data.response_time || '< 2h',
          shop_theme: data.shop_theme || 'theme_00',
          shop_tabs: data.shop_tabs || { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
        });
      }
    }
    fetchStore();
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name.startsWith('tab_')) {
      const tabKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        shop_tabs: { ...prev.shop_tabs, [tabKey]: finalValue }
      }));
      pendingChangesRef.current['shop_tabs'] = { ...formData.shop_tabs, [tabKey]: finalValue };
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
      pendingChangesRef.current[name] = finalValue;
    }

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

  if (session === undefined) return <div className="min-h-screen bg-[#FAF9F6] flex justify-center items-center"><Loader2 className="animate-spin text-[#059669]" size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 sm:px-6">
      
      {/* Header Premium avec dégradé et verre */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-gray-900 to-slate-800 p-8 md:p-10 shadow-2xl text-left border border-white/5">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Panneau de Contrôle
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Settings className="text-emerald-400 animate-spin-slow" size={32} />
              Configuration de votre Boutique
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-xl">
              Personnalisez l&apos;identité, le design visuel, la localisation GPS et l&apos;équipe de votre espace de vente.
            </p>
          </div>
          
          <Link href="/dashboard" className="self-start md:self-auto flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-lg active:scale-95">
            <ArrowLeft size={16} /> Retour Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Colonne Principale (Gauche) */}
        <div className="lg:col-span-2 space-y-8">

          {/* SECTION 1: Identité & Accès */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]"><Globe size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Identité & Accès</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Configurez le nom et l&apos;adresse web unique de votre marque.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la boutique</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-200" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Lien Web (Slug)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm select-none">/boutique/</span>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl pl-24 pr-5 py-4 text-sm font-bold outline-none transition-all duration-200" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description de la boutique</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Présentez brièvement vos articles et services..." className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-200 resize-none min-h-[100px]"></textarea>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp Client</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#059669]" size={20} />
                    <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="Ex: 237655123456" className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all duration-200" />
                  </div>
                  <button
                    type="button"
                    onClick={pickContact}
                    className="flex-shrink-0 px-5 py-4 bg-emerald-50 text-[#059669] hover:bg-emerald-100/80 rounded-2xl transition-all font-extrabold text-xs flex items-center gap-2 border border-emerald-100 shadow-sm active:scale-95"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span className="hidden sm:inline">Importer</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold ml-1">Android & Chrome uniquement : chargez instantanément le contact depuis votre répertoire.</p>
              </div>
            </div>
          </section>

          {/* SECTION 2: Localisation GPS */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600"><MapPin size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Position Géographique</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Permettez aux acheteurs locaux de mesurer leur distance physique.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 hover:bg-blue-100/80 text-blue-600 font-black rounded-2xl transition-all disabled:opacity-50 border border-blue-100 shadow-sm text-sm active:scale-95"
                >
                  {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                  Capturer mes coordonnées GPS
                </button>
                
                <div className="w-full sm:flex-1 grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">LAT</span>
                    <input type="text" readOnly placeholder="0.00000" value={formData.latitude} className="w-full bg-gray-50/70 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-600 outline-none" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">LON</span>
                    <input type="text" readOnly placeholder="0.00000" value={formData.longitude} className="w-full bg-gray-50/70 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-600 outline-none" />
                  </div>
                </div>
              </div>

              {/* Carte Interactive */}
              <div className="h-[320px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative group bg-gray-50">
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
                <div className="absolute top-4 left-4 z-[999] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-blue-600 shadow-md border border-blue-50 pointer-events-none">
                  Faites glisser le marqueur pour affiner
                </div>
              </div>

              {gpsError && <p className="text-xs font-bold text-rose-500 bg-rose-50/50 p-3 rounded-xl border border-rose-100">{gpsError}</p>}
              {formData.latitude && !gpsError && <p className="text-xs font-black text-[#059669] flex items-center gap-1.5"><CheckCircle2 size={16} /> Coordonnées synchronisées en direct</p>}
            </div>
          </section>

          {/* SECTION 3: Secrétaire IA */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-[0.03] text-indigo-900 pointer-events-none">
              <Bot size={180} />
            </div>
            
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600"><Bot size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Secrétaire Virtuelle IA</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Installez un agent conversationnel entraîné localement.</p>
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                <div className="relative">
                  <input type="checkbox" name="ai_enabled" checked={formData.ai_enabled} onChange={handleChange} className="sr-only" />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${formData.ai_enabled ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.ai_enabled ? 'translate-x-5' : ''}`}></div>
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">Activer l&apos;agent conversationnel</p>
                  <p className="text-[11px] text-gray-400 font-medium">Un chatbot d&apos;accueil répondra à vos clients 24h/24.</p>
                </div>
              </label>

              {formData.ai_enabled && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l&apos;assistant</label>
                    <input type="text" name="ai_name" value={formData.ai_name} onChange={handleChange} placeholder="Sophie" className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-200" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions de comportement</label>
                    <textarea name="ai_prompt" value={formData.ai_prompt} onChange={handleChange} rows="3" placeholder="Vous êtes l'assistant..." className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all duration-200 resize-none min-h-[90px]"></textarea>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Test & Diagnostics</p>
                  <p className="text-xs text-gray-500 font-medium">Vérifiez si l&apos;API de l&apos;assistant répond.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: [{ role: 'user', content: 'Ping' }] })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert("✅ IA active et répond en arrière-plan !");
                      } else {
                        alert("❌ Dysfonctionnement temporaire de l'API.");
                      }
                    } catch (err) {
                      alert("❌ Impossible d'accéder à l'API IA.");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  <TestTube size={14} /> Tester l&apos;agent
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 4: Style & Typographie */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500"><Palette size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Couleurs & Typographie</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Déterminez l&apos;ambiance stylistique globale.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Teinte de marque principale</label>
                <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="relative group flex-shrink-0">
                    <input type="color" name="theme_color" value={formData.theme_color} onChange={handleChange} className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white shadow-md overflow-hidden" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{formData.theme_color}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Couleur Primaire</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Police d&apos;écriture</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Type size={18} /></div>
                  <select name="font_family" value={formData.font_family} onChange={handleChange} className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-800">
                    <option value="Inter">Inter (Sleek & Clean)</option>
                    <option value="'Outfit', sans-serif">Outfit (Premium & Luxe)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Classique)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Moderne)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Choix du Thème de Boutique */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <ThemePicker
              value={formData.shop_theme}
              onChange={(themeId) => {
                setFormData(prev => ({ ...prev, shop_theme: themeId }));
                updateStore({ shop_theme: themeId });
              }}
            />
            
            {/* Configuration des Titres d'Onglets */}
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Libellé des Pages (Navigation)</h3>
                <p className="text-xs text-gray-500 font-medium">Attribuez des noms sur-mesure aux onglets du menu principal.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'accueil', label: 'Onglet Accueil' },
                  { key: 'produits', label: 'Onglet Produits' },
                  { key: 'promotions', label: 'Onglet Offres' },
                  { key: 'profil', label: 'Onglet Profil' }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.label}</label>
                    <input type="text" name={`tab_${item.key}`} value={formData.shop_tabs?.[item.key] || ''} onChange={handleChange} className="w-full bg-gray-50/70 border border-gray-100 focus:border-[#059669] focus:bg-white rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6: Confiance & Performance */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500"><Star size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Signaux de Confiance</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Présentez des indicateurs rassurants en en-tête.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Statut Vendeur</label>
                <select name="supplier_level" value={formData.supplier_level} onChange={handleChange} className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all">
                  <option value="Nouveau Vendeur">Nouveau Vendeur</option>
                  <option value="Fournisseur Or">Fournisseur Or</option>
                  <option value="Vendeur Premium">Vendeur Premium</option>
                  <option value="Boutique Officielle">Boutique Officielle</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Évaluation positive</label>
                <div className="relative">
                  <input type="number" step="1" max="100" min="0" name="positive_rating" value={formData.positive_rating} onChange={handleChange} className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl pl-5 pr-10 py-4 text-sm font-bold outline-none transition-all" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Réponse moyenne</label>
                <select name="response_time" value={formData.response_time} onChange={handleChange} className="w-full bg-gray-50/70 border-2 border-gray-100 focus:border-[#059669] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all">
                  <option value="< 1h">&lt; 1h (Ultra Rapide)</option>
                  <option value="< 2h">&lt; 2h (Rapide)</option>
                  <option value="< 12h">&lt; 12h (Correct)</option>
                  <option value="< 24h">&lt; 24h (Standard)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 7: Message Promotionnel */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#059669] to-emerald-500 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 text-left">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.08] pointer-events-none">
              <Megaphone size={160} />
            </div>
            
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl text-white backdrop-blur-md border border-white/10"><Megaphone size={20} /></div>
                <h2 className="text-xl font-black tracking-tight">Bannière Promotionnelle Défilante</h2>
              </div>
              <p className="text-emerald-100/90 text-sm font-medium">Ce bandeau sera animé en première page de votre boutique pour accrocher le visiteur.</p>

              <div className="space-y-4">
                <textarea
                  name="custom_message"
                  value={formData.custom_message}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Ex: ⚡ Livraison gratuite à partir de 20.000 FCFA cette semaine !"
                  className="w-full bg-white/10 placeholder:text-white/40 focus:bg-white/15 border-2 border-white/10 focus:border-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none transition-all resize-none"
                ></textarea>
                
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  <Info size={12} />
                  <span>Saisie enregistrée instantanément</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest">Envoi e-mail</p>
                  <p className="text-xs text-emerald-100 font-medium">Vérifiez les notifications mail.</p>
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
                          subject: 'Validation email VesTyle', 
                          type: 'MESSAGE', 
                          data: { message: 'Votre système d\'envoi est configuré.' } 
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert("✅ E-mail envoyé avec succès !");
                      } else {
                        alert("❌ Dysfonctionnement sur l'envoi.");
                      }
                    } catch (err) {
                      alert("❌ Réseau inaccessible.");
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-emerald-50 text-[#059669] rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
                >
                  <Send size={13} /> Tester la notification
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 8: Équipe de Livraison */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6 text-left transition-all hover:shadow-2xl hover:shadow-gray-100/50">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]"><Truck size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Logistique & Livreurs</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Associez vos livreurs officiels pour assigner les commandes.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {livreurs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl transition-all hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#059669] border border-gray-100 shadow-sm"><User size={18} /></div>
                      <div>
                        <p className="font-extrabold text-gray-800 text-sm">{l.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{l.phone}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveLivreur(l.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              {/* Formulaire d'ajout livreur */}
              <form onSubmit={handleAddLivreur} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-50">
                <input required type="text" placeholder="Nom complet" value={newLivreur.name} onChange={e => setNewLivreur({...newLivreur, name: e.target.value})} className="sm:col-span-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#059669] transition-all" />
                <input required type="text" placeholder="Numéro WhatsApp" value={newLivreur.phone} onChange={e => setNewLivreur({...newLivreur, phone: e.target.value})} className="sm:col-span-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#059669] transition-all" />
                <input type="email" placeholder="Email de connexion" value={newLivreur.email} onChange={e => setNewLivreur({...newLivreur, email: e.target.value})} className="sm:col-span-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#059669] transition-all" />
                <button disabled={addingLivreur} className="sm:col-span-1 bg-[#059669] hover:bg-[#047857] text-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1">
                  {addingLivreur ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Ajouter</>}
                </button>
              </form>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={async () => {
                    if (!session?.id || !storeId) return;
                    if (livreurs.some(l => l.user_id === session.id)) {
                      alert("Vous y figurez déjà.");
                      return;
                    }
                    setAddingLivreur(true);
                    try {
                      const { data, error } = await supabase.from('livreurs').insert([{
                        store_id: storeId,
                        user_id: session.id,
                        name: formData.name + " (Gérant)",
                        phone: formData.whatsapp_number || formData.phone || ""
                      }]).select().single();
                      
                      if (!error && data) {
                        setLivreurs([...livreurs, data]);
                        alert("Ajouté avec succès comme livreur !");
                      }
                    } catch (err) {
                      alert("Erreur de liaison.");
                    } finally {
                      setAddingLivreur(false);
                    }
                  }}
                  disabled={addingLivreur || livreurs.some(l => l.user_id === session?.id)}
                  className="flex-1 py-3.5 px-4 bg-emerald-50/50 hover:bg-emerald-50 text-[#059669] rounded-2xl border-2 border-dashed border-emerald-100 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <User size={15} /> M&apos;ajouter comme coursier
                </button>
                <Link 
                  href="/delivery"
                  className="flex-1 py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Truck size={15} /> Ouvrir le Portail Livraison
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Colonne Latérale Droite (Uploads & Direct status) */}
        <div className="space-y-8 lg:sticky lg:top-4">

          {/* SECTION: Visuels de Marque */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-8 text-left transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-500"><ImageIcon size={22} /></div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Identité Visuelle</h2>
                <p className="text-[10px] text-gray-400 font-medium">Logo et couverture d&apos;accueil.</p>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo officiel (carré)</p>
              <div className="relative group aspect-square max-w-[140px] mx-auto">
                <div className="w-full h-full rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <Camera className="text-gray-300 animate-pulse" size={28} />
                  )}
                  {uploadingField === 'logo_url' && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#059669]" size={24} />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-[#059669] text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all active:scale-90">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('logo_url', e.target.files?.[0])} />
                </label>
                {formData.logo_url && (
                  <button type="button" onClick={() => handleRemoveImage('logo_url')} className="absolute -top-2 -right-2 p-2.5 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all active:scale-90">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Couverture */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bannière principale (2:1)</p>
              <div className="relative group w-full aspect-[2/1] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                {formData.banner_url ? (
                  <img src={formData.banner_url} className="w-full h-full object-cover" alt="Bannière" />
                ) : (
                  <ImageIcon className="text-gray-300" size={28} />
                )}
                {uploadingField === 'banner_url' && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#059669]" size={24} />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs cursor-pointer">
                  <div className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest shadow-lg">
                    <Camera size={14} /> Mettre à jour
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('banner_url', e.target.files?.[0])} />
                </label>
                {formData.banner_url && (
                  <button type="button" onClick={() => handleRemoveImage('banner_url')} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg shadow hover:bg-rose-600 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Sauvegarde automatique en temps réel */}
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 text-left border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-white font-extrabold tracking-tight text-base">Sauvegarde instantanée</p>
            </div>
            
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Toutes les données modifiées dans ce formulaire sont automatiquement sauvegardées en base et synchronisées en ligne.
            </p>

            <div className="w-full py-4 bg-slate-950/60 border border-slate-850 text-slate-400 font-extrabold rounded-2xl shadow-inner flex items-center justify-center gap-2.5 h-12 text-xs uppercase tracking-wider">
              {autoSaveStatus === 'saving' && <><Loader2 className="animate-spin text-emerald-400" size={16} /> <span className="text-emerald-400 font-bold">Synchronisation...</span></>}
              {autoSaveStatus === 'saved' && <><CheckCircle2 className="text-emerald-400" size={16} /> <span className="text-emerald-400 font-bold">Modifications sauvées</span></>}
              {autoSaveStatus === 'error' && <span className="text-rose-400 font-bold">Échec réseau</span>}
              {autoSaveStatus === 'idle' && <><Settings size={15} /> <span className="opacity-60">Prêt</span></>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
