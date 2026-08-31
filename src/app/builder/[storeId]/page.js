'use client';
import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Palette, Move, Globe, Megaphone, Bot, Truck,
  ArrowLeft, ExternalLink, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Composants du Studio
import StoreLivePreview from '@/components/store-studio/StoreLivePreview';
import StoreDesignTab from '@/components/store-studio/StoreDesignTab';
import StoreSpatialTab from '@/components/store-studio/StoreSpatialTab';
import StoreIdentityTab from '@/components/store-studio/StoreIdentityTab';
import StoreSectionsTab from '@/components/store-studio/StoreSectionsTab';
import StoreAITab from '@/components/store-studio/StoreAITab';
import StoreLogisticsTab from '@/components/store-studio/StoreLogisticsTab';

const STUDIO_TABS = [
  { id: 'design', label: 'Design & Thème', icon: Palette, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'spatial', label: 'Disposition Spatiale', icon: Move, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'identity', label: 'Identité & Médias', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'sections', label: 'Sections & Blocs', icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'ai', label: 'IA & Confiance', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'logistics', label: 'GPS & Livreurs', icon: Truck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

export default function BuilderPage({ params }) {
  const { storeId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('design');
  const [loading, setLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimeoutRef = useRef(null);

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
    ai_prompt: 'Vous êtes l\'assistant virtuel de cette boutique.',
    supplier_level: 'Fournisseur Or',
    positive_rating: 100,
    response_time: '< 1h',
    shop_theme: 'boutique_pro',
    store_template: 'boutique_pro',
    layout_config: {
      spatial: {
        logoPosition: 'left',
        gridStyle: 'grid_2',
        cardRadius: 'smooth',
        visualStyle: 'glass',
        businessType: 'products'
      }
    },
    shop_tabs: { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
  });

  // Charger les données de la boutique
  useEffect(() => {
    if (!storeId || authLoading) return;
    let alive = true;

    async function loadStore() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();

        if (error || !data) {
          router.push('/dashboard');
          return;
        }

        if (alive) {
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
            whatsapp_number: data.whatsapp_number || data.phone || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            ai_enabled: data.ai_enabled || false,
            ai_name: data.ai_name || 'Assistant VesTyle',
            ai_prompt: data.ai_prompt || 'Vous êtes l\'assistant virtuel de cette boutique.',
            supplier_level: data.supplier_level || 'Fournisseur Or',
            positive_rating: data.positive_rating || 100,
            response_time: data.response_time || '< 1h',
            shop_theme: data.shop_theme || data.store_template || 'boutique_pro',
            store_template: data.store_template || data.shop_theme || 'boutique_pro',
            layout_config: data.layout_config || {
              spatial: {
                logoPosition: 'left',
                gridStyle: 'grid_2',
                cardRadius: 'smooth',
                visualStyle: 'glass',
                businessType: 'products'
              }
            },
            shop_tabs: data.shop_tabs || { accueil: 'Accueil', produits: 'Catalogue', promotions: 'Promotions', profil: 'Profil' }
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('[BuilderPage] load error:', err);
        if (alive) setLoading(false);
      }
    }

    loadStore();
    return () => { alive = false; };
  }, [storeId, authLoading, router]);

  // Sauvegarde automatique avec anti-rebond
  const updateStore = async (fieldsToUpdate) => {
    if (!storeId) return;
    setAutoSaveStatus('saving');

    const { error } = await supabase
      .from('stores')
      .update({
        ...fieldsToUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);

    if (error) {
      console.error('Erreur sauvegarde:', error);
      setAutoSaveStatus('error');
    } else {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2500);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateStore({ [name]: val });
    }, 600);
  };

  const handleTemplateSelect = (template) => {
    const updated = {
      ...formData,
      store_template: template.id,
      shop_theme: template.id,
      theme_color: template.theme?.primaryColor || formData.theme_color,
      secondary_color: template.theme?.secondaryColor || formData.secondary_color,
      font_family: template.theme?.fontFamily || formData.font_family,
    };
    setFormData(updated);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateStore({
        store_template: template.id,
        shop_theme: template.id,
        theme_color: template.theme?.primaryColor || formData.theme_color,
        secondary_color: template.theme?.secondaryColor || formData.secondary_color,
        font_family: template.theme?.fontFamily || formData.font_family,
      });
    }, 400);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-bold text-slate-400">Chargement du Studio VeStyle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── BARRE SUPÉRIEURE DU STUDIO ── */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/5 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              <span>{formData.name || 'Ma Boutique'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Studio Ultra
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Personnalisation Spatiale & Design d&apos;Agence</p>
          </div>
        </div>

        {/* Indicateur de sauvegarde & Lien boutique */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            {autoSaveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 animate-pulse">
                <Loader2 size={12} className="animate-spin" /> Sauvegarde...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 size={12} /> Sauvegardé
              </span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                <AlertCircle size={12} /> Erreur
              </span>
            )}
          </div>

          {formData.slug && (
            <a
              href={`/boutique/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              <ExternalLink size={13} />
              <span>Voir en Direct</span>
            </a>
          )}
        </div>
      </header>

      {/* ── CORPS DU STUDIO : PANNEAU ÉDITION (GAUCHE) | SIMULATEUR LIVE (DROITE) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6 max-w-[1600px] w-full mx-auto overflow-hidden">
        
        {/* Colonne Gauche : Navigation par Onglets & Contrôles */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Navigation par Onglets du Studio */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {STUDIO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-[11px] font-black transition-all text-center ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-md border border-white/15 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? tab.bg + ' ' + tab.color : 'text-slate-400'}`}>
                    <Icon size={16} />
                  </div>
                  <span className="truncate w-full">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 shadow-xl backdrop-blur-md">
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
                uploadingField=""
                setUploadingField={() => {}}
                onMediaUpload={(field, url) => {
                  setFormData(prev => ({ ...prev, [field]: url }));
                  updateStore({ [field]: url });
                }}
                storeSchema={{ hasCity: true, hasPhone: true }}
                pickContact={() => {}}
              />
            )}

            {activeTab === 'sections' && (
              <StoreSectionsTab
                formData={formData}
                onChange={handleChange}
                onTabLabelChange={(key, val) => {
                  const updatedTabs = { ...formData.shop_tabs, [key]: val };
                  setFormData(prev => ({ ...prev, shop_tabs: updatedTabs }));
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  saveTimeoutRef.current = setTimeout(() => {
                    updateStore({ shop_tabs: updatedTabs });
                  }, 600);
                }}
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
                onChange={handleChange}
                isLocating={false}
                gpsError={null}
                requestLocation={() => {}}
              />
            )}
          </div>
        </div>

        {/* Colonne Droite : Simulateur Mobile / Desktop Réactif (0ms) */}
        <div className="lg:col-span-6 xl:col-span-7 sticky top-20 h-[calc(100vh-100px)] min-h-[580px] flex flex-col">
          <StoreLivePreview
            formData={formData}
            storeId={storeId}
          />
        </div>
      </div>
    </div>
  );
}