'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { deleteCloudinaryByUrl, uploadImage } from '@/lib/cloudinary';
import { useRouter } from 'next/navigation';
import {
  Settings, ArrowLeft, Globe, Palette, Megaphone,
  Bot, Truck, Loader2, CheckCircle2, Eye, Sparkles, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useDistance } from '@/hooks/useDistance';

// Composants du nouveau Store Customizer Studio
import StoreLivePreview from '@/components/store-studio/StoreLivePreview';
import StoreDesignTab from '@/components/store-studio/StoreDesignTab';
import StoreSpatialTab from '@/components/store-studio/StoreSpatialTab';
import StoreIdentityTab from '@/components/store-studio/StoreIdentityTab';
import StoreSectionsTab from '@/components/store-studio/StoreSectionsTab';
import StoreAITab from '@/components/store-studio/StoreAITab';
import StoreLogisticsTab from '@/components/store-studio/StoreLogisticsTab';
import { Move } from 'lucide-react';

const STUDIO_TABS = [
  { id: 'design', label: 'Design & Thème', icon: Palette, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'spatial', label: 'Disposition Spatiale', icon: Move, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'identity', label: 'Identité & Médias', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'sections', label: 'Sections & Blocs', icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'ai', label: 'IA & Confiance', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'logistics', label: 'GPS & Livreurs', icon: Truck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

export default function StoreSettingsPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('design');
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
    ai_prompt: 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client à trouver ce qu\'il cherche.',
    supplier_level: 'Fournisseur Or',
    positive_rating: 100,
    response_time: '< 1h',
    shop_theme: 'boutique_pro',
    store_template: 'boutique_pro',
    layout_config: {},
    shop_tabs: { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
  });

  const { requestLocation, userLocation, isLocating, error: gpsError } = useDistance();

  // Contact picker pour Android Chrome
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

    const validFields = { ...fieldsToUpdate };
    if (!storeSchema.hasCity) delete validFields.city;
    if (!storeSchema.hasPhone) delete validFields.phone;

    const { data, error } = await supabase.from('stores').update(validFields).eq('id', storeId).select().single();

    if (error) {
      console.error("Erreur de sauvegarde:", error);
      setAutoSaveStatus('error');
    } else {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2500);
    }
  };

  // Synchronisation des coordonnées GPS
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

  // Chargement initial des données de la boutique
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
          ai_prompt: data.ai_prompt || 'Vous êtes l\'assistant virtuel de cette boutique. Soyez poli, concis et aidez le client.',
          supplier_level: data.supplier_level || 'Fournisseur Or',
          positive_rating: data.positive_rating !== undefined ? data.positive_rating : 100,
          response_time: data.response_time || '< 1h',
          shop_theme: data.shop_theme || 'boutique_pro',
          store_template: data.store_template || data.shop_theme || 'boutique_pro',
          layout_config: data.layout_config || {},
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
    }, 600);
  };

  const handleTemplateSelect = (tmplId) => {
    setFormData(prev => ({ ...prev, store_template: tmplId, shop_theme: tmplId }));
    updateStore({ store_template: tmplId, shop_theme: tmplId });
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
      updateStore({ [fieldName]: secureUrl });
    } catch (err) {
      alert("Erreur upload image: " + (err?.message || "Impossible de téléverser l'image"));
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

  const handleHoursChange = (dayKey, field, value) => {
    const prevHours = formData.layout_config?.opening_hours || {};
    const updatedHours = {
      ...prevHours,
      [dayKey]: {
        ...prevHours[dayKey],
        [field]: value
      }
    };
    const updatedLayoutConfig = {
      ...formData.layout_config,
      opening_hours: updatedHours
    };
    setFormData(prev => ({ ...prev, layout_config: updatedLayoutConfig }));
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateStore({ layout_config: updatedLayoutConfig });
    }, 600);
  };

  // Gestion des livreurs
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
      if (newLivreur.email) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', newLivreur.email.trim().toLowerCase())
          .single();
        if (userData) userId = userData.id;
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
      }
    } catch {
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

  const handleAddSelfLivreur = async () => {
    if (!session?.id || !storeId) return;
    if (livreurs.some(l => l.user_id === session.id)) {
      alert("Vous êtes déjà enregistré dans la flotte de livraison.");
      return;
    }
    setAddingLivreur(true);
    try {
      const { data, error } = await supabase.from('livreurs').insert([{
        store_id: storeId,
        user_id: session.id,
        name: (formData.name || 'Gérant') + ' (Gérant)',
        phone: formData.whatsapp_number || formData.phone || ''
      }]).select().single();

      if (!error && data) {
        setLivreurs([...livreurs, data]);
        alert("Ajouté avec succès comme coursier !");
      }
    } catch {
      alert("Erreur d'association.");
    } finally {
      setAddingLivreur(false);
    }
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#059669]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto space-y-6 pb-20 px-3 sm:px-6">
      {/* 🚀 Header Supérieur du Studio avec Indicateur d'Auto-Save */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 shadow-2xl text-left border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Store Studio V2
              </span>
              {autoSaveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-bold animate-pulse">
                  <Loader2 size={13} className="animate-spin" /> Synchronisation...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 size={13} /> Sauvegardé
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="text-emerald-400" size={28} />
              Studio de Personnalisation
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Modifiez l'apparence, l'identité et les blocs de votre boutique en visualisant chaque retouche en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {formData.slug && (
              <a
                href={`/boutique/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Eye size={15} /> Voir la boutique
              </a>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs uppercase tracking-wider border border-white/10 transition-all active:scale-95"
            >
              <ArrowLeft size={15} /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* 🧭 Barre de Navigation par Onglets Ergonomiques */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {STUDIO_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : `${tab.bg} ${tab.color}`}`}>
                <Icon size={16} />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ⚡ Contenu Principal Split-Screen (Contrôles à gauche / Live Preview à droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Panneau de Contrôle Actif */}
        <div className="lg:col-span-7 xl:col-span-6 space-y-6">
          {activeTab === 'design' && (
            <StoreDesignTab
              formData={formData}
              onChange={handleChange}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

          {activeTab === 'spatial' && (
            <StoreSpatialTab
              formData={formData}
              onChange={handleChange}
              onConfigChange={(newConfig) => {
                setFormData(prev => ({ ...prev, layout_config: newConfig }));
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = setTimeout(() => {
                  updateStore({ layout_config: newConfig });
                }, 600);
              }}
            />
          )}

          {activeTab === 'identity' && (
            <StoreIdentityTab
              formData={formData}
              onChange={handleChange}
              onFileUpload={handleFileUpload}
              onRemoveImage={handleRemoveImage}
              uploadingField={uploadingField}
              onPickContact={pickContact}
            />
          )}

          {activeTab === 'sections' && (
            <StoreSectionsTab
              formData={formData}
              onChange={handleChange}
              onHoursChange={handleHoursChange}
            />
          )}

          {activeTab === 'ai' && (
            <StoreAITab
              formData={formData}
              onChange={handleChange}
            />
          )}

          {activeTab === 'logistics' && (
            <StoreLogisticsTab
              formData={formData}
              onRequestLocation={requestLocation}
              isLocating={isLocating}
              gpsError={gpsError}
              userLocation={userLocation}
              onPositionChange={(pos) => {
                setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }));
                updateStore({ latitude: pos[0], longitude: pos[1] });
              }}
              livreurs={livreurs}
              newLivreur={newLivreur}
              setNewLivreur={setNewLivreur}
              onAddLivreur={handleAddLivreur}
              addingLivreur={addingLivreur}
              onRemoveLivreur={handleRemoveLivreur}
              onAddSelfLivreur={handleAddSelfLivreur}
              session={session}
            />
          )}
        </div>

        {/* Colonne Droite : Simulateur Interactif Live Preview */}
        <div className="lg:col-span-5 xl:col-span-6 lg:sticky lg:top-4">
          <StoreLivePreview
            formData={formData}
            storeId={storeId}
          />
        </div>
      </div>
    </div>
  );
}
