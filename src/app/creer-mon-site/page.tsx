'use client';

/**
 * VesTyle V1 — /creer-mon-site (Édition Responsive & Bi-Thème Pro)
 * ─────────────────────────────────────────────────────────────────────────────
 * Tunnel de création canonique compatible Thème Sombre & Thème Clair :
 * - Stepper d'avancement clair (Mode → Domaine → Catégorie → Design → Infos → Aperçu)
 * - Mode A (Sélection manuelle & Aperçu live multi-pages)
 * - Mode B (Assistant d'intention naturelle)
 * - Menu Hamburger responsive sur mobile avec tiroir latéral
 * - Intégration réelle Supabase + VestinAdaptationEngine + CanonicalStorefrontRenderer
 */

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveSite } from '@/core/context/ActiveSiteContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/core/context/ThemeContext';
import { VESTYLE_DOMAINS } from '@/core/domains/domainDefinitions';
import { LocalDesignRegistry } from '@/core/registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '@/core/adaptation/VestinAdaptationEngine';
import { CanonicalStorefrontRenderer } from '@/core/renderer/CanonicalStorefrontRenderer';
import type { DesignDefinition } from '@/core/contracts/designDefinition';
import ThemeToggle from '@/components/ThemeToggle';
import VestyleSidebar from '@/components/Navigation/VestyleSidebar';
import {
  Globe, TrendingUp, Bell, Plus, Settings,
  ChevronRight, ArrowLeft, ArrowRight,
  CheckCircle2, Loader2, Sparkles, Eye, Palette,
  Building2, MapPin, Phone, ExternalLink, Tag, X, Check,
  Smartphone, Monitor, Zap, Store, ShieldCheck, Utensils,
  Briefcase, GraduationCap, HeartPulse, Building, Landmark,
  ShoppingBag, AlertCircle, AlertTriangle, Menu,
} from 'lucide-react';

const DOMAIN_ICONS_MAP: Record<string, React.ElementType> = {
  vendeur: ShoppingBag,
  restauration: Utensils,
  hebergement: Building2,
  services: Briefcase,
  education: GraduationCap,
  sante: HeartPulse,
  immobilier_transport: Building,
  creation_medias: Palette,
  organisations: Landmark,
};

const VILLES_CAMEROUN = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Kribi', 'Garoua',
  'Bamenda', 'Buea', 'Limbe', 'Maroua', 'Ngaoundéré', 'Ebolowa', 'Bertoua',
];

const STEPS = ['mode', 'domaine', 'categorie', 'design', 'infos', 'apercu'] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  mode: 'Choix du mode',
  domaine: 'Secteur d’activité',
  categorie: 'Catégorie',
  design: 'Sélection du design',
  infos: 'Informations',
  apercu: 'Aperçu & Publication',
};

export default function CreerMonSitePage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { isDark } = useTheme();
  const { createSite, publishSite, selectSite, refreshSites } = useActiveSite();

  const userId = session?.id || user?.id;

  // Responsive Drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // État du tunnel
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<'manuel' | 'ia'>('manuel');

  // Sélections
  const [selectedDomain, setSelectedDomain] = useState<string>('vendeur');
  const [selectedCategory, setSelectedCategory] = useState<string>('mode');
  const [selectedDesignId, setSelectedDesignId] = useState<string>('vst_dsn_prestige_atelier_001');

  // Formulaire métier
  const [formData, setFormData] = useState({
    name: '',
    city: 'Douala',
    phone: '',
    whatsapp: '',
    description: '',
  });

  // Mode IA (VesTyle fait le reste)
  const [promptText, setPromptText] = useState('');
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    domain: string;
    category: string;
    designId: string;
    suggestedName: string;
    suggestedCity: string;
    suggestedDescription: string;
    confidenceReason: string;
  } | null>(null);

  // Création & publication
  const [isCreating, setIsCreating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const [createdSiteSlug, setCreatedSiteSlug] = useState<string>('');
  const [isSitePublished, setIsSitePublished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal aperçu interactif du design (Étape 4)
  const [previewModalDesignId, setPreviewModalDesignId] = useState<string | null>(null);
  const [previewActivePageId, setPreviewActivePageId] = useState<string>('page_home');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');

  // Registre de designs
  const registry = useMemo(() => LocalDesignRegistry.getInstance(), []);
  const allDesigns = useMemo(() => registry.getAllDesignsSync(), [registry]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Domaine actif & Catégories
  const activeDomainMeta = useMemo(() => {
    return VESTYLE_DOMAINS[selectedDomain] || VESTYLE_DOMAINS.vendeur;
  }, [selectedDomain]);

  // Designs compatibles filtrés
  const compatibleDesigns = useMemo(() => {
    return registry.getDesignsByDomainSync(selectedDomain);
  }, [registry, selectedDomain]);

  // Design actuellement sélectionné (ou premier compatible)
  const activeDesignDef: DesignDefinition = useMemo(() => {
    const found = registry.getDesignSync(selectedDesignId);
    if (found) return found;
    if (compatibleDesigns.length > 0) return compatibleDesigns[0];
    return allDesigns[0] || ({} as any);
  }, [registry, selectedDesignId, compatibleDesigns, allDesigns]);

  // Design pour le modal d'aperçu
  const previewModalDesignDef: DesignDefinition | null = useMemo(() => {
    if (!previewModalDesignId) return null;
    return registry.getDesignSync(previewModalDesignId) || null;
  }, [registry, previewModalDesignId]);

  // Moteur d'adaptation dynamique
  const mockSiteConfig = useMemo(() => {
    return VestinAdaptationEngine.synthesizeSiteDraft({
      name: formData.name.trim() || 'Mon Entreprise Pro',
      city: formData.city || 'Douala',
      phone: formData.phone || '+237 600 00 00 00',
      whatsapp: formData.whatsapp || formData.phone || '+237 600 00 00 00',
      description: formData.description || `Bienvenue sur la vitrine officielle de ${formData.name || 'notre établissement'}.`,
      domain: selectedDomain as any,
      category: selectedCategory,
      designId: selectedDesignId,
      designDefinition: activeDesignDef,
    });
  }, [formData, selectedDomain, selectedCategory, selectedDesignId, activeDesignDef]);

  // Aperçu de synthèse pour le modal interactif
  const modalMockSiteConfig = useMemo(() => {
    if (!previewModalDesignDef) return null;
    return VestinAdaptationEngine.synthesizeSiteDraft({
      name: formData.name.trim() || 'Démonstration Storefront',
      city: formData.city || 'Douala',
      phone: '+237 699 00 00 00',
      whatsapp: '+237 699 00 00 00',
      description: 'Aperçu en direct du design sélectionné.',
      domain: selectedDomain as any,
      category: selectedCategory,
      designId: previewModalDesignDef.id,
      designDefinition: previewModalDesignDef,
    });
  }, [previewModalDesignDef, formData.name, formData.city, selectedDomain, selectedCategory]);

  /* ─────────────────────────────────────────────
     Mode B : Assistant Naturel (VesTyle fait le reste)
  ───────────────────────────────────────────── */
  const handleAnalyzeIntent = () => {
    if (!promptText.trim()) return;
    setIsAnalyzingPrompt(true);

    const txt = promptText.toLowerCase();
    let dom = 'vendeur';
    let cat = 'mode';
    let dsn = 'vst_dsn_prestige_atelier_001';
    let suggestedCity = 'Douala';
    let confidenceReason = 'Activité commerciale orientée vente et présentation d’articles';

    for (const v of VILLES_CAMEROUN) {
      if (txt.includes(v.toLowerCase())) {
        suggestedCity = v;
        break;
      }
    }

    if (txt.includes('manger') || txt.includes('restaurant') || txt.includes('plat') || txt.includes('grill') || txt.includes('braise') || txt.includes('burger') || txt.includes('snack') || txt.includes('traiteur') || txt.includes('food') || txt.includes('cuisine') || txt.includes('boisson') || txt.includes('cocktail')) {
      dom = 'restauration';
      cat = 'restaurant';
      dsn = 'vst_dsn_bistro_moderne_002';
      confidenceReason = 'Établissement culinaire avec menu interactif et commande directe';
    } else if (txt.includes('hotel') || txt.includes('hôtel') || txt.includes('chambre') || txt.includes('meublé') || txt.includes('meuble') || txt.includes('appartement') || txt.includes('séjour') || txt.includes('hébergement') || txt.includes('villa') || txt.includes('residence') || txt.includes('résidence')) {
      dom = 'hebergement';
      cat = 'residence';
      dsn = 'vst_dsn_location_standing_005';
      confidenceReason = 'Hébergement & séjours avec réservation et calendrier de disponibilités';
    } else if (txt.includes('salon') || txt.includes('coiffure') || txt.includes('soin') || txt.includes('beauté') || txt.includes('beaute') || txt.includes('massage') || txt.includes('spa') || txt.includes('onglerie') || txt.includes('rdv') || txt.includes('rendez-vous') || txt.includes('consulting') || txt.includes('conseil') || txt.includes('formation') || txt.includes('service')) {
      dom = 'services';
      cat = 'beaute_soin';
      dsn = 'vst_dsn_services_vip_003';
      confidenceReason = 'Prestations de services & soins avec prise de rendez-vous directe';
    } else if (txt.includes('agriculture') || txt.includes('élevage') || txt.includes('elevage') || txt.includes('ferme') || txt.includes('poulet') || txt.includes('vivres') || txt.includes('champ') || txt.includes('agricole')) {
      dom = 'vendeur';
      cat = 'agriculture';
      dsn = 'vst_dsn_agro_elevage_004';
      confidenceReason = 'Production agropastorale & vivres avec commande en gros et détail';
    } else if (txt.includes('livre') || txt.includes('papeterie') || txt.includes('technologie') || txt.includes('téléphone') || txt.includes('gadget') || txt.includes('boutique') || txt.includes('magasin')) {
      dom = 'vendeur';
      cat = 'technologie';
      dsn = 'vst_dsn_commerce_librairie_006';
      confidenceReason = 'Commerce spécialisé avec catalogue interactif et commande directe';
    }

    let suggestedName = '';
    const nameMatch = promptText.match(/(?:nommé|appelé|nom|enseigne|pour)\s+([A-ZÀ-Ýa-zà-ÿ0-9\s'-]{3,30})/i);
    if (nameMatch && nameMatch[1]) {
      suggestedName = nameMatch[1].trim();
    }

    setTimeout(() => {
      setAiAnalysisResult({
        domain: dom,
        category: cat,
        designId: dsn,
        suggestedName: suggestedName || formData.name || '',
        suggestedCity,
        suggestedDescription: promptText.trim(),
        confidenceReason,
      });
      setSelectedDomain(dom);
      setSelectedCategory(cat);
      setSelectedDesignId(dsn);
      setFormData(prev => ({
        ...prev,
        city: suggestedCity,
        description: promptText.trim(),
        name: suggestedName || prev.name,
      }));
      setIsAnalyzingPrompt(false);
    }, 600);
  };

  const handleApplyAiResult = () => {
    if (!aiAnalysisResult) return;
    setSelectedDomain(aiAnalysisResult.domain);
    setSelectedCategory(aiAnalysisResult.category);
    setSelectedDesignId(aiAnalysisResult.designId);
    setStep('infos');
  };

  /* ─────────────────────────────────────────────
     Création & Publication réelles
  ───────────────────────────────────────────── */
  const handleCreateSite = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Veuillez renseigner le nom de votre établissement.');
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const { success, newSiteId, createdSite, error } = await createSite({
        name: formData.name.trim(),
        city: formData.city.trim() || 'Douala',
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        description: formData.description.trim(),
        domain: selectedDomain as any,
        category: selectedCategory,
        designId: selectedDesignId,
      });

      if (!success || !newSiteId) {
        throw new Error(error || 'Erreur lors de l’enregistrement de votre site.');
      }

      setCreatedSiteId(newSiteId);
      setCreatedSiteSlug(createdSite?.slug || `site-${newSiteId.slice(0, 6)}`);
      setIsSitePublished(false);
      selectSite(newSiteId);
      await refreshSites();
      setStep('apercu');
      showToast('success', 'Site généré avec succès !');
    } catch (err: any) {
      console.error('[CreerMonSite] Erreur création:', err);
      setErrorMsg(err?.message || 'Erreur lors de la création du site.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePublishCreatedSite = async () => {
    if (!createdSiteId) return;
    setIsPublishing(true);
    try {
      const { success, error } = await publishSite(createdSiteId);
      if (!success) throw new Error(error || 'Erreur de publication.');
      setIsSitePublished(true);
      await refreshSites();
      showToast('success', 'Votre site est maintenant en ligne !');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Impossible de publier le site.');
    } finally {
      setIsPublishing(false);
    }
  };

  const canGoNext = useMemo(() => {
    if (step === 'domaine') return !!selectedDomain;
    if (step === 'categorie') return !!selectedCategory;
    if (step === 'design') return !!selectedDesignId;
    if (step === 'infos') return !!formData.name.trim() && !!formData.city.trim();
    return true;
  }, [step, selectedDomain, selectedCategory, selectedDesignId, formData]);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      if (mode === 'ia' && step === 'infos') {
        setStep('mode');
      } else {
        setStep(STEPS[idx - 1]);
      }
    } else {
      router.push('/mes-sites');
    }
  };

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Jean Dupont');
  const userAvatar = user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';

  return (
    <div className={`min-h-screen flex font-sans antialiased vs-bg-page vs-text-primary`}>

      {/* Sidebar Desktop & Drawer Mobile */}
      <VestyleSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ══════════════════════════════════════════════════════════════
          CONTENU PRINCIPAL DU TUNNEL
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Topbar Épurée */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 vs-bg-sidebar border-b vs-border shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Bouton Hamburger Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl vs-btn-secondary transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Bouton Retour */}
            <button
              onClick={goBack}
              className="vs-btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{step === 'mode' ? 'Mes sites' : 'Retour'}</span>
            </button>
            <span className="text-xs font-bold hidden sm:inline vs-text-muted">/</span>
            <span className="text-xs font-bold hidden sm:inline text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              {STEP_LABELS[step]}
            </span>
          </div>

          {/* Stepper horizontal (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {STEPS.filter(s => s !== 'mode' && s !== 'apercu').map((s, i) => {
              const stepIdx = STEPS.indexOf(s);
              const currentIdx = STEPS.indexOf(step);
              const isPassed = stepIdx < currentIdx;
              const isCurrent = s === step;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'vs-btn-primary shadow-sm'
                        : 'vs-bg-input vs-text-muted border vs-border'
                    }`}
                  >
                    {isPassed ? '✓' : i + 1}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrent ? 'vs-text-primary' : isPassed ? 'text-emerald-500' : 'vs-text-muted'
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {i < 3 && <ChevronRight className="w-3 h-3 vs-text-muted" />}
                </div>
              );
            })}
          </div>

          {/* Actions Droite */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/notifications"
              className="p-2 rounded-xl vs-btn-secondary transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l vs-border">
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold block leading-tight vs-text-primary truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[10px] font-medium block vs-text-secondary">
                  Compte Pro
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Toast Notif */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border transition-all animate-fade-in ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                : 'bg-red-950 text-red-300 border-red-500/40'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Corps Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 1 — LE CHOIX DU MODE
          ══════════════════════════════════════════════════════════════ */}
          {step === 'mode' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1.5 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight vs-text-primary">
                  Créer un nouveau site
                </h1>
                <p className="text-xs sm:text-sm vs-text-secondary max-w-md mx-auto">
                  Choisissez la méthode qui correspond le mieux à votre façon de travailler.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Carte A — Choisir un Design */}
                <button
                  onClick={() => {
                    setMode('manuel');
                    setStep('domaine');
                  }}
                  className="vs-bg-card rounded-2xl p-7 border vs-border shadow-sm text-left flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-emerald-500 group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-5 border border-emerald-500/30 transition-transform group-hover:scale-105">
                      <Palette className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold vs-text-primary mb-2">
                      A. Choisir un Design
                    </h3>
                    <p className="text-xs vs-text-secondary leading-relaxed mb-6">
                      Sélectionnez votre domaine, explorez les modèles avec aperçu interactif multi-pages et personnalisez vos informations.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 pt-4 border-t vs-border">
                    <span>Parcourir les designs</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Carte B — Assistant IA */}
                <button
                  onClick={() => setMode('ia')}
                  className={`vs-bg-card rounded-2xl p-7 border text-left flex flex-col justify-between transition-all duration-200 hover:shadow-md group ${
                    mode === 'ia' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'vs-border hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center mb-5 border border-indigo-500/30 transition-transform group-hover:scale-105">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold vs-text-primary mb-2">
                      B. VesTyle fait le reste
                    </h3>
                    <p className="text-xs vs-text-secondary leading-relaxed mb-6">
                      Décrivez votre activité avec vos propres mots. Notre assistant comprend votre intention et prépare la structure idéale.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 pt-4 border-t vs-border">
                    <span>Décrire mon projet</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Formulaire Assistant IA */}
              {mode === 'ia' && (
                <div className="vs-bg-card rounded-2xl p-6 border vs-border shadow-sm space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold vs-text-primary mb-1.5">
                      Décrivez votre projet d'activité :
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: J'ouvre un restaurant de grillades et poissons braisés nommé Chez Mama Grill à Douala. Je veux une carte en ligne claire et la commande sur WhatsApp."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm vs-input border vs-border focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[11px] vs-text-secondary">
                      Détection automatique du domaine, de la ville et du modèle adapté.
                    </span>
                    <button
                      onClick={handleAnalyzeIntent}
                      disabled={isAnalyzingPrompt || !promptText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold vs-btn-secondary border vs-border transition shadow-sm disabled:opacity-40"
                    >
                      {isAnalyzingPrompt ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Analyse en cours…</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Comprendre &amp; Préparer</>
                      )}
                    </button>
                  </div>

                  {aiAnalysisResult && (
                    <div className="p-5 rounded-xl vs-bg-input border border-emerald-500/40 space-y-3.5 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Intention comprise avec succès</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs vs-text-primary">
                        <div className="vs-bg-card p-3 rounded-lg border vs-border">
                          <span className="vs-text-secondary block text-[10px]">Secteur &amp; Catégorie</span>
                          <strong className="vs-text-primary">{VESTYLE_DOMAINS[aiAnalysisResult.domain]?.name.split('(')[0]}</strong>
                        </div>
                        <div className="vs-bg-card p-3 rounded-lg border vs-border">
                          <span className="vs-text-secondary block text-[10px]">Ville</span>
                          <strong className="vs-text-primary">{aiAnalysisResult.suggestedCity}</strong>
                        </div>
                        <div className="vs-bg-card p-3 rounded-lg border vs-border sm:col-span-2">
                          <span className="vs-text-secondary block text-[10px]">Design recommandé</span>
                          <strong className="vs-text-primary">{registry.getDesignSync(aiAnalysisResult.designId)?.meta.name}</strong>
                          <p className="text-[11px] vs-text-secondary mt-0.5">{aiAnalysisResult.confidenceReason}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleApplyAiResult}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-sm"
                      >
                        <span>Valider &amp; Compléter les informations</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 2 — DOMAINE
          ══════════════════════════════════════════════════════════════ */}
          {step === 'domaine' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold vs-text-primary">
                  Quel est votre secteur d'activité ?
                </h1>
                <p className="text-xs sm:text-sm vs-text-secondary mt-0.5">
                  Choisissez parmi les 9 domaines métier de VesTyle V1.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(VESTYLE_DOMAINS).map((dom) => {
                  const isSelected = selectedDomain === dom.id;
                  const DomainIcon = DOMAIN_ICONS_MAP[dom.id] || Store;
                  return (
                    <button
                      key={dom.id}
                      onClick={() => {
                        setSelectedDomain(dom.id);
                        setSelectedCategory(dom.categories[0]?.id || 'mode');
                      }}
                      className={`p-5 rounded-2xl text-left border transition-all duration-200 flex items-start gap-4 vs-bg-card shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'vs-border hover:border-slate-400'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500/15 text-emerald-500' : 'vs-bg-input vs-text-secondary'
                      }`}>
                        <DomainIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <h4 className="text-sm font-bold vs-text-primary truncate">
                            {dom.name.split('(')[0].trim()}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs vs-text-secondary leading-relaxed line-clamp-2">
                          {dom.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-sm disabled:opacity-40"
                >
                  <span>Choisir la catégorie</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 3 — CATÉGORIE
          ══════════════════════════════════════════════════════════════ */}
          {step === 'categorie' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold vs-text-primary">
                  Précisez votre spécialité
                </h1>
                <p className="text-xs sm:text-sm vs-text-secondary mt-0.5">
                  Secteur sélectionné : <strong className="vs-text-primary">{activeDomainMeta.name.split('(')[0].trim()}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {activeDomainMeta.categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between vs-bg-card shadow-sm ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                          : 'vs-border hover:border-slate-400'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-emerald-500' : 'vs-text-primary'}`}>
                        {cat.name}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border vs-border" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-full text-xs font-bold vs-btn-secondary transition"
                >
                  Retour
                </button>
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-sm disabled:opacity-40"
                >
                  <span>Choisir le design</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 4 — SÉLECTION DU DESIGN
          ══════════════════════════════════════════════════════════════ */}
          {step === 'design' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold vs-text-primary">
                  Choisissez l'apparence de votre site
                </h1>
                <p className="text-xs sm:text-sm vs-text-secondary mt-0.5">
                  {compatibleDesigns.length} design(s) compatible(s) avec votre secteur.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {compatibleDesigns.map((design) => {
                  const isSelected = selectedDesignId === design.id;
                  const palette = design.styleSystem.palette;
                  const pagesCount = Object.keys(design.pages || {}).length;

                  return (
                    <div
                      key={design.id}
                      className={`vs-bg-card rounded-2xl overflow-hidden border shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'vs-border'
                      }`}
                    >
                      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden group">
                        <img
                          src={design.meta.preview.desktopThumbnailUrl}
                          alt={design.meta.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm border border-white/10">
                          {pagesCount} pages incluses
                        </span>

                        <button
                          onClick={() => {
                            setPreviewModalDesignId(design.id);
                            setPreviewActivePageId('page_home');
                          }}
                          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/80 text-white border border-white/20 shadow-md backdrop-blur-sm hover:bg-emerald-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Aperçu live</span>
                        </button>

                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm" style={{ background: palette.primary }} title="Couleur primaire" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm" style={{ background: palette.accent }} title="Couleur accent" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm" style={{ background: palette.background }} title="Fond" />
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-sm font-bold vs-text-primary mb-1">
                            {design.meta.name}
                          </h3>
                          <p className="text-xs vs-text-secondary leading-relaxed line-clamp-2">
                            {design.meta.description}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedDesignId(design.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'vs-btn-secondary'
                          }`}
                        >
                          {isSelected ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Design sélectionné</>
                          ) : (
                            <span>Sélectionner ce design</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-full text-xs font-bold vs-btn-secondary transition"
                >
                  Retour
                </button>
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-sm disabled:opacity-40"
                >
                  <span>Renseigner mes informations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 5 — INFORMATIONS MÉTIER
          ══════════════════════════════════════════════════════════════ */}
          {step === 'infos' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold vs-text-primary">
                  Informations de votre établissement
                </h1>
                <p className="text-xs sm:text-sm vs-text-secondary mt-0.5">
                  Ces coordonnées apparaîtront sur votre site et configureront la commande WhatsApp.
                </p>
              </div>

              <div className="vs-bg-card rounded-2xl p-6 border vs-border shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold vs-text-primary mb-1.5">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maison Kankou, Grillades du Terroir, Résidence Palmier…"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm vs-input border vs-border focus:border-emerald-500 outline-none transition"
                    maxLength={80}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold vs-text-primary mb-1.5">
                      Ville principale *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm vs-select border vs-border focus:border-emerald-500 outline-none transition cursor-pointer"
                    >
                      {VILLES_CAMEROUN.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold vs-text-primary mb-1.5">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 699 00 00 00"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm vs-input border vs-border focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold vs-text-primary mb-1.5">
                    Numéro WhatsApp dédié aux commandes (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Laissez vide si identique au numéro ci-dessus"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm vs-input border vs-border focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold vs-text-primary mb-1.5">
                    Présentation / Slogan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Spécialistes de la haute gastronomie et grillades au feu de bois à Douala."
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm vs-input border vs-border focus:border-emerald-500 outline-none transition resize-none"
                    maxLength={300}
                  />
                  <div className="text-right text-[10px] vs-text-muted mt-1">
                    {formData.description.length}/300
                  </div>
                </div>

                <div className="p-3.5 rounded-xl vs-bg-input border vs-border flex items-center justify-between text-xs">
                  <div>
                    <span className="vs-text-secondary">Design sélectionné :</span>
                    <strong className="vs-text-primary ml-1.5">{activeDesignDef.meta.name}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('design')}
                    className="text-xs font-bold text-emerald-500 hover:underline"
                  >
                    Changer
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-full text-xs font-bold vs-btn-secondary transition"
                >
                  Retour
                </button>
                <button
                  onClick={handleCreateSite}
                  disabled={!formData.name.trim() || isCreating}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-lg shadow-emerald-500/20 disabled:opacity-40"
                >
                  {isCreating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Génération du site…</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Générer &amp; Prévisualiser</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ÉTAPE 6 — APERÇU LIVE & PUBLICATION
          ══════════════════════════════════════════════════════════════ */}
          {step === 'apercu' && (
            <div className="space-y-6">
              <div className="vs-bg-card rounded-2xl p-6 border vs-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        isSitePublished
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {isSitePublished ? 'En ligne (Publié)' : 'Brouillon prêt'}
                    </span>
                    <span className="text-xs font-mono vs-text-secondary">
                      {createdSiteSlug}.vestyle.com
                    </span>
                  </div>
                  <h2 className="text-xl font-bold vs-text-primary">
                    {formData.name || 'Votre Établissement'}
                  </h2>
                  <p className="text-xs vs-text-secondary mt-0.5">
                    Design : <strong className="vs-text-primary">{activeDesignDef.meta.name}</strong> · Moteur : CanonicalStorefrontRenderer v3.0
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {!isSitePublished && (
                    <button
                      onClick={handlePublishCreatedSite}
                      disabled={isPublishing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-md"
                    >
                      {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>Publier en direct</span>
                    </button>
                  )}

                  {createdSiteSlug && (
                    <a
                      href={`/boutique/${createdSiteSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold vs-btn-secondary transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 vs-text-muted" />
                      <span>Site public</span>
                    </a>
                  )}

                  <button
                    onClick={() => router.push('/mes-sites')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold vs-btn-secondary transition"
                  >
                    <Store className="w-3.5 h-3.5 vs-text-muted" />
                    <span>Mes sites</span>
                  </button>
                </div>
              </div>

              {/* Barre d'outils du Live Preview */}
              <div className="vs-bg-card rounded-2xl p-3 border vs-border shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[11px] font-bold vs-text-secondary mr-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Pages :
                  </span>
                  {Object.entries(activeDesignDef.pages || {}).map(([key, pDef]) => {
                    const isActive = previewActivePageId === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPreviewActivePageId(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'vs-btn-secondary'
                        }`}
                      >
                        <span>{pDef.title || key}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 vs-bg-input p-1 rounded-xl border vs-border">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg transition ${previewDevice === 'desktop' ? 'vs-bg-card vs-text-primary shadow-xs' : 'vs-text-muted'}`}
                    title="Aperçu Ordinateur"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg transition ${previewDevice === 'mobile' ? 'vs-bg-card vs-text-primary shadow-xs' : 'vs-text-muted'}`}
                    title="Aperçu Mobile"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cadre de Rendu Live */}
              <div className="vs-bg-card rounded-2xl border vs-border shadow-sm overflow-hidden p-4 sm:p-6 flex justify-center min-h-[600px]">
                <div className={`transition-all duration-300 w-full ${
                  previewDevice === 'mobile'
                    ? 'max-w-[390px] border-4 border-slate-700 rounded-[32px] overflow-hidden shadow-2xl h-[700px]'
                    : 'max-w-full rounded-xl overflow-hidden'
                }`}>
                  <CanonicalStorefrontRenderer
                    design={activeDesignDef}
                    config={mockSiteConfig}
                    activePageId={previewActivePageId}
                    device={previewDevice}
                    onNavigate={(pageId) => setPreviewActivePageId(pageId)}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL INTERACTIF D'APERÇU MULTI-PAGES DU DESIGN
      ══════════════════════════════════════════════════════════════ */}
      {previewModalDesignDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="vs-bg-card rounded-2xl border vs-border shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b vs-border flex items-center justify-between vs-bg-sidebar">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold vs-text-primary">
                    {previewModalDesignDef.meta.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    {previewModalDesignDef.meta.domain}
                  </span>
                </div>
                <p className="text-xs vs-text-secondary mt-0.5">
                  {previewModalDesignDef.meta.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedDesignId(previewModalDesignDef.id);
                    setPreviewModalDesignId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 transition shadow-sm"
                >
                  Sélectionner ce design
                </button>
                <button
                  onClick={() => setPreviewModalDesignId(null)}
                  className="p-2 rounded-xl vs-btn-secondary transition"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pages switch bar */}
            <div className="px-6 py-2.5 border-b vs-border vs-bg-input flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold vs-text-secondary mr-2">Pages incluses :</span>
                {Object.entries(previewModalDesignDef.pages || {}).map(([key, pageDef]) => (
                  <button
                    key={key}
                    onClick={() => setPreviewActivePageId(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      previewActivePageId === key
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'vs-btn-secondary'
                    }`}
                  >
                    {pageDef.title || key}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 vs-bg-card p-1 rounded-xl border vs-border">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition ${previewDevice === 'desktop' ? 'vs-bg-input vs-text-primary' : 'vs-text-muted'}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition ${previewDevice === 'mobile' ? 'vs-bg-input vs-text-primary' : 'vs-text-muted'}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 vs-bg-page flex justify-center">
              <div className={`w-full transition-all ${
                previewDevice === 'mobile'
                  ? 'max-w-[390px] border-4 border-slate-700 rounded-[32px] overflow-hidden shadow-2xl h-[700px]'
                  : 'max-w-5xl rounded-xl overflow-hidden shadow-md'
              }`}>
                {modalMockSiteConfig && (
                  <CanonicalStorefrontRenderer
                    design={previewModalDesignDef}
                    config={modalMockSiteConfig}
                    activePageId={previewActivePageId}
                    device={previewDevice}
                    onNavigate={(pageId) => setPreviewActivePageId(pageId)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
