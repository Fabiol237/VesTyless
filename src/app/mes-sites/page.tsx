'use client';

/**
 * VesTyle V1 — /mes-sites (Design Validé 1:1 Conforme à la Référence)
 * ─────────────────────────────────────────────────────────────────────────────
 * Reproduction exacte du design de référence :
 * - Bannière de synthèse avec logo officiel VesTyle & texte à droite
 * - Cartes des sites avec avatar boutique, badges domaine & design, bouton Ouvrir
 * - Widget Dashboard global de performance en bas à droite
 * - Mode clair & sombre ultra-lisibles sans texte invisible ni dominance du noir
 * - Navigation mobile fluide avec menu hamburger
 * - Aucune barre de recherche dans la navbar (conservée dans l'espace de filtres)
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveSite } from '@/core/context/ActiveSiteContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/core/context/ThemeContext';
import { VESTYLE_DOMAINS } from '@/core/domains/domainDefinitions';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Home, Globe, TrendingUp, Bell, Search, Plus, Settings,
  HelpCircle, ChevronRight, ChevronDown, LayoutGrid, List,
  MoreHorizontal, ExternalLink, Zap, Copy, Trash2, CheckCircle2,
  AlertCircle, Loader2, Sparkles, Eye, Tag, ShoppingBag,
  Users, Clock, AlertTriangle, Building2, Utensils, Briefcase,
  GraduationCap, HeartPulse, Building, Palette, Landmark, Store,
  Menu, X, ShoppingCart, BarChart3, ArrowUpRight
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

const DOMAIN_THUMBNAILS: Record<string, string> = {
  vendeur: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  restauration: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  hebergement: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  services: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  sante: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
  immobilier_transport: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  creation_medias: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  organisations: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
};

const DOMAIN_LABELS: Record<string, string> = {
  vendeur: 'Mode & Commerce',
  restauration: 'Restauration',
  hebergement: 'Hébergement',
  services: 'Services & Conseils',
  education: 'Éducation',
  sante: 'Santé',
  immobilier_transport: 'Immobilier & Transport',
  creation_medias: 'Créatif & Médias',
  organisations: 'Organisation & Asso',
};

export default function MesSitesPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { isDark } = useTheme();
  const {
    sites,
    loading,
    selectSite,
    publishSite,
    duplicateSite,
    deleteSite,
    refreshSites,
  } = useActiveSite();

  const userId = session?.id || user?.id;

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Menu d'action contextuel
  const [openSiteMenuId, setOpenSiteMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePublish = async (siteId: string) => {
    setActionLoading(`publish-${siteId}`);
    const { success, error } = await publishSite(siteId);
    setActionLoading(null);
    setOpenSiteMenuId(null);
    if (success) {
      showToast('success', 'Site publié avec succès.');
    } else {
      showToast('error', error || 'Erreur lors de la publication.');
    }
  };

  const handleDuplicate = async (siteId: string) => {
    setActionLoading(`dup-${siteId}`);
    const { success, newSiteId, error } = await duplicateSite(siteId);
    setActionLoading(null);
    setOpenSiteMenuId(null);
    if (success && newSiteId) {
      showToast('success', 'Site dupliqué avec succès.');
    } else {
      showToast('error', error || 'Erreur lors de la duplication.');
    }
  };

  const handleDelete = async (siteId: string) => {
    setActionLoading(`del-${siteId}`);
    const { success, error } = await deleteSite(siteId);
    setActionLoading(null);
    setConfirmDeleteId(null);
    setOpenSiteMenuId(null);
    if (success) {
      showToast('success', 'Site supprimé avec succès.');
    } else {
      showToast('error', error || 'Erreur lors de la suppression.');
    }
  };

  const handleOpenSite = (siteId: string) => {
    selectSite(siteId);
    router.push('/dashboard');
  };

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = sites.length;
    const published = sites.filter(s => s.isPublished).length;
    const drafts = sites.filter(s => !s.isPublished && s.draftConfig && Object.keys(s.draftConfig).length > 0).length;
    const inPrep = total - published - drafts;
    return {
      total,
      published,
      drafts: drafts > 0 ? drafts : Math.max(0, total - published),
      inPrep: inPrep > 0 ? inPrep : (total === 0 ? 0 : 1),
    };
  }, [sites]);

  // Filtrage
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = site.name?.toLowerCase().includes(q);
        const matchesDomain = site.domain?.toLowerCase().includes(q);
        const matchesCategory = site.category?.toLowerCase().includes(q);
        const matchesSlug = site.slug?.toLowerCase().includes(q);
        if (!matchesName && !matchesDomain && !matchesCategory && !matchesSlug) return false;
      }

      if (selectedDomainFilter !== 'all' && site.domain !== selectedDomainFilter) {
        return false;
      }

      if (selectedStatusFilter === 'published' && !site.isPublished) return false;
      if (selectedStatusFilter === 'draft' && site.isPublished) return false;

      return true;
    });
  }, [sites, searchTerm, selectedDomainFilter, selectedStatusFilter]);

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Jean Dupont');
  const userAvatar = user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';

  // Sidebar JSX
  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5 vs-bg-sidebar">
      <div className="space-y-6">
        {/* Logo VesTyle */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
            <img
              src="/vestyle-logo.png"
              alt="VesTyle"
              className="w-8 h-8 rounded-xl object-contain shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight vs-text-primary">
              Ves<span style={{ color: 'var(--accent-green)' }}>Tyle</span>
            </span>
          </Link>

          {/* Fermer sur mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-xl vs-btn-secondary"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4 vs-text-muted" />
            <span>Accueil</span>
          </Link>

          <Link
            href="/mes-sites"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link-active flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Mes sites</span>
          </Link>

          <Link
            href="/dashboard/statistiques"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <TrendingUp className="w-4 h-4 vs-text-muted" />
            <span>Activité globale</span>
          </Link>

          <Link
            href="/dashboard/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 vs-text-muted" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">
                3
              </span>
              <ChevronRight className="w-3 h-3 vs-text-muted" />
            </div>
          </Link>

          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Search className="w-4 h-4 vs-text-muted" />
            <span>Recherche</span>
          </Link>

          <Link
            href="/creer-mon-site"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 vs-text-muted" />
            <span>Création de site</span>
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="vs-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 vs-text-muted" />
            <span>Paramètres</span>
          </Link>
        </nav>
      </div>

      {/* Bas de Sidebar */}
      <div className="space-y-4">
        {/* Widget Promotionnel Créez votre site */}
        <div className="vs-sidebar-cta-card relative rounded-2xl p-4 overflow-hidden shadow-sm">
          <img
            src="/vestyle-logo.png"
            alt="VesTyle"
            className="w-6 h-6 rounded-lg object-contain mb-2.5 shadow-sm"
          />
          <h4 className="text-xs font-bold vs-sidebar-cta-title leading-tight mb-1">
            Créez votre site en quelques minutes
          </h4>
          <p className="text-[10px] vs-sidebar-cta-text mb-3 leading-snug">
            VesTyle s'occupe du reste !
          </p>
          <Link
            href="/creer-mon-site"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#F97316] hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer mon site</span>
          </Link>
        </div>

        {/* Besoin d'aide */}
        <Link
          href="/faq"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-3 py-2 text-xs font-medium vs-text-secondary hover:vs-text-primary transition-colors rounded-xl hover:vs-bg-input border vs-border"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="font-semibold block vs-text-primary text-[11px]">Besoin d'aide ?</span>
              <span className="text-[9px] vs-text-muted">Centre d'assistance</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 vs-text-muted" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans antialiased vs-bg-page vs-text-primary`}>

      {/* Sidebar Desktop */}
      <aside className="w-64 flex flex-col justify-between sticky top-0 h-screen z-30 flex-shrink-0 hidden md:flex border-r vs-border vs-bg-sidebar">
        {sidebarContent}
      </aside>

      {/* Drawer Mobile Coulissant */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full vs-bg-sidebar shadow-2xl border-r vs-border z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Topbar Épurée */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 vs-bg-sidebar border-b vs-border shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl vs-btn-secondary transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold vs-text-primary hidden sm:inline">Mes sites</span>
              <span className="text-xs vs-text-muted hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {stats.total} site{stats.total > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/notifications"
              className="vs-sidebar-link relative p-2 rounded-xl transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l vs-border">
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold block leading-tight vs-text-primary">
                  {userName}
                </span>
                <span className="text-[10px] font-medium block vs-text-secondary">
                  Compte Pro
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 vs-text-muted" />
            </div>
          </div>
        </header>

        {/* Toast Notification */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* Titre Principal */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight vs-text-primary">
              Mes sites
            </h1>
            <p className="text-xs sm:text-sm vs-text-secondary mt-0.5">
              Gérez tous vos sites web depuis un seul endroit.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              BANNIÈRE DE SYNTHÈSE (AVEC LOGO & TEXTE VESTYLE À DROITE)
          ══════════════════════════════════════════════════════════════ */}
          <div className="vs-bg-card rounded-2xl p-5 border vs-border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            {/* Gauche : Compteur & Statuts */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold vs-text-primary">
                  Vous avez {stats.total} site{stats.total > 1 ? 's' : ''}
                </h3>
                <div className="flex items-center gap-3 text-xs vs-text-secondary mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    {stats.published} publiés
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    {stats.drafts} en brouillon
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    {stats.inPrep} en préparation
                  </span>
                </div>
              </div>
            </div>

            {/* Droite : Logo VesTyle & Slogan de marque */}
            <div className="flex items-center gap-3.5 pl-0 md:pl-6 border-t md:border-t-0 md:border-l vs-border pt-3 md:pt-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <img
                  src="/vestyle-logo.png"
                  alt="VesTyle Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight vs-text-primary uppercase">
                  Ves<span style={{ color: 'var(--accent-green)' }}>Tyle</span>
                </h4>
                <p className="text-xs vs-text-secondary">
                  Des sites professionnels, pour tous vos projets.
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              BARRE DE RECHERCHE ET FILTRES DU CONTENU
          ══════════════════════════════════════════════════════════════ */}
          <div className="vs-bg-card rounded-2xl p-4 border vs-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 vs-text-muted" />
              <input
                type="text"
                placeholder="Rechercher un site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="vs-input w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm outline-none transition-all border vs-border"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedDomainFilter}
                onChange={(e) => setSelectedDomainFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-medium vs-select border vs-border outline-none shadow-sm cursor-pointer"
              >
                <option value="all">Tous les domaines</option>
                {Object.values(VESTYLE_DOMAINS).map(d => (
                  <option key={d.id} value={d.id}>{d.name.split('(')[0].trim()}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-medium vs-select border vs-border outline-none shadow-sm cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">En brouillon</option>
              </select>

              <div className="flex items-center vs-bg-input border vs-border rounded-xl p-0.5 shadow-sm ml-auto sm:ml-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'vs-bg-card vs-text-primary shadow-xs' : 'vs-text-muted hover:vs-text-primary'}`}
                  title="Vue Grille"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'vs-bg-card vs-text-primary shadow-xs' : 'vs-text-muted hover:vs-text-primary'}`}
                  title="Vue Liste"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs vs-text-secondary font-medium">Chargement de vos sites…</p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              GRILLE DES SITES & WIDGETS
          ══════════════════════════════════════════════════════════════ */}
          {!loading && (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>

              {/* ── CARTE 1 : CTA '+ Créer mon site' (Design Référence) ── */}
              <div className="relative rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center border vs-border shadow-sm min-h-[340px] group transition-all duration-200 hover:shadow-md vs-bg-card">
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.25) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(249, 115, 22, 0.2) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-110">
                    <Plus className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold vs-text-primary mb-1.5">
                    Créer mon site
                  </h3>
                  <p className="text-xs vs-text-secondary max-w-xs mb-6 leading-relaxed">
                    Choisissez un domaine et une catégorie pour créer votre site en quelques minutes.
                  </p>

                  <Link
                    href="/creer-mon-site"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white vs-btn-primary shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer mon site</span>
                  </Link>
                </div>
              </div>

              {/* ── CARTES DES SITES MARCHANDS (Design Référence) ── */}
              {filteredSites.map((site) => {
                const isPublished = site.isPublished;
                const domainLabel = DOMAIN_LABELS[site.domain] || site.domain;
                const previewImg = site.bannerUrl || DOMAIN_THUMBNAILS[site.domain] || DOMAIN_THUMBNAILS.vendeur;
                const formattedDate = site.updatedAt
                  ? new Date(site.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Modifié récemment';

                const DomainIconComp = DOMAIN_ICONS_MAP[site.domain] || Store;
                const isMenuOpen = openSiteMenuId === site.id;

                return (
                  <div
                    key={site.id}
                    className="vs-bg-card rounded-2xl overflow-hidden border vs-border shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-400"
                  >
                    {/* Thumbnail Storefront */}
                    <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden group">
                      <img
                        src={previewImg}
                        alt={site.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 opacity-70 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, transparent 60%)' }}
                      />

                      {/* Badge Statut */}
                      <div className="absolute top-3 right-3">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#10B981] text-white shadow-sm backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F59E0B] text-white shadow-sm backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            Brouillon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informations du Site */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start gap-3">
                          {/* Avatar Boutique */}
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                            <DomainIconComp className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold vs-text-primary leading-tight truncate">
                              {site.name}
                            </h4>
                            <p className="text-xs vs-text-secondary truncate mt-0.5">
                              {site.slug ? `${site.slug}.vestyle.com` : 'site-en-cours.vestyle.com'}
                            </p>
                          </div>
                        </div>

                        {/* Badges Domaine & Design */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg vs-bg-input text-[11px] font-semibold vs-text-secondary border vs-border">
                            <DomainIconComp className="w-3 h-3 text-emerald-500" />
                            <span>{domainLabel}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg vs-bg-input text-[11px] font-semibold vs-text-secondary border vs-border">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Design Premium</span>
                          </span>
                        </div>
                      </div>

                      {/* Bas de Carte : Date & Bouton Ouvrir */}
                      <div className="pt-3 border-t vs-border flex items-center justify-between gap-2">
                        <span className="text-[11px] vs-text-muted truncate">
                          {formattedDate}
                        </span>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleOpenSite(site.id)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold vs-btn-primary transition shadow-xs"
                          >
                            Ouvrir
                          </button>

                          {/* Menu Contextuel */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenSiteMenuId(isMenuOpen ? null : site.id)}
                              className="p-1.5 rounded-xl vs-btn-secondary transition"
                              title="Plus d'actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setOpenSiteMenuId(null)}
                                />
                                <div className="absolute right-0 bottom-8 z-40 w-48 vs-bg-card rounded-xl shadow-xl border vs-border py-1.5 text-xs font-semibold animate-fade-in">
                                  <Link
                                    href={`/studio?siteId=${site.id}`}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:vs-bg-input vs-text-primary text-left transition"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Éditer dans Studio</span>
                                  </Link>

                                  <button
                                    onClick={() => handleDuplicate(site.id)}
                                    disabled={actionLoading === `dup-${site.id}`}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:vs-bg-input vs-text-primary text-left transition"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Dupliquer</span>
                                  </button>

                                  {!isPublished && (
                                    <button
                                      onClick={() => handlePublish(site.id)}
                                      disabled={actionLoading === `publish-${site.id}`}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:vs-bg-input text-emerald-500 text-left transition"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Publier en ligne</span>
                                    </button>
                                  )}

                                  {site.slug && (
                                    <a
                                      href={`/boutique/${site.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:vs-bg-input vs-text-primary text-left transition"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 vs-text-muted" />
                                      <span>Aperçu public</span>
                                    </a>
                                  )}

                                  <div className="my-1 border-t vs-border" />

                                  <button
                                    onClick={() => setConfirmDeleteId(site.id)}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-red-500/10 text-red-500 text-left transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Supprimer</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation suppression */}
                    {confirmDeleteId === site.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="vs-bg-card rounded-2xl p-6 max-w-sm w-full border vs-border shadow-2xl space-y-4">
                          <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold vs-text-primary">Supprimer ce site ?</h4>
                            <p className="text-xs vs-text-secondary mt-1">
                              Êtes-vous sûr de vouloir supprimer définitivement <strong>{site.name}</strong> ? Cette action est irréversible.
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-4 py-2 rounded-xl text-xs font-bold vs-btn-secondary transition"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleDelete(site.id)}
                              disabled={actionLoading === `del-${site.id}`}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition"
                            >
                              {actionLoading === `del-${site.id}` ? 'Suppression…' : 'Confirmer la suppression'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── CARTE WIDGET : DASHBOARD GLOBAL (Design Référence) ── */}
              <div className="vs-bg-card rounded-2xl border vs-border shadow-sm p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold vs-text-primary">Dashboard global</h4>
                      <p className="text-xs vs-text-secondary">Aperçu de vos performances</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl vs-bg-input">
                      <span className="vs-text-secondary flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        Vues totales
                      </span>
                      <div className="flex items-center gap-1.5 font-bold vs-text-primary">
                        <span>12 458</span>
                        <span className="text-emerald-500 text-[10px]">↑ 12%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl vs-bg-input">
                      <span className="vs-text-secondary flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        Visiteurs uniques
                      </span>
                      <div className="flex items-center gap-1.5 font-bold vs-text-primary">
                        <span>8 732</span>
                        <span className="text-emerald-500 text-[10px]">↑ 18%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl vs-bg-input">
                      <span className="vs-text-secondary flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                        Commandes
                      </span>
                      <div className="flex items-center gap-1.5 font-bold vs-text-primary">
                        <span>342</span>
                        <span className="text-emerald-500 text-[10px]">↑ 24%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl vs-bg-input">
                      <span className="vs-text-secondary flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        Taux de conversion
                      </span>
                      <div className="flex items-center gap-1.5 font-bold vs-text-primary">
                        <span>3,8%</span>
                        <span className="text-emerald-500 text-[10px]">↑ 0,6%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-between pt-3 border-t vs-border text-xs font-bold text-emerald-500 hover:underline"
                >
                  <span>Voir tous les détails</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {!loading && filteredSites.length === 0 && sites.length > 0 && (
            <div className="vs-bg-card rounded-2xl p-12 text-center border vs-border shadow-sm space-y-3">
              <Search className="w-8 h-8 vs-text-muted mx-auto" />
              <h4 className="text-base font-bold vs-text-primary">Aucun site correspondant</h4>
              <p className="text-xs vs-text-secondary max-w-md mx-auto">
                Aucun site ne correspond à votre recherche "{searchTerm}". Essayez de réinitialiser vos filtres.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomainFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold vs-btn-secondary transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
