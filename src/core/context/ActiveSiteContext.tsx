'use client';

/**
 * VesTyle V1 — Active Site Context (Core Backbone)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fournit l'état du site actif, la liste de tous les sites du compte (1:N),
 * la synchronisation draft/published, et le calcul de santé et complétion.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateSiteHealth, type SiteDefinition, type SiteHealthStatus, type SiteSetupProgress } from '../contracts/siteDefinition';
import { getDomainById } from '../domains/domainDefinitions';
import { LocalDesignRegistry } from '../registry/LocalDesignRegistry';
import { VestinAdaptationEngine } from '../adaptation/VestinAdaptationEngine';

export interface ActiveSiteContextType {
  sites: SiteDefinition[];
  currentSite: SiteDefinition | null;
  currentDomainMeta: ReturnType<typeof getDomainById>;
  loading: boolean;
  refreshSites: () => Promise<void>;
  selectSite: (siteId: string) => void;
  updateDraftConfig: (updatedDraft: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  publishSite: (siteId?: string) => Promise<{ success: boolean; error?: string }>;
  duplicateSite: (siteId: string) => Promise<{ success: boolean; newSiteId?: string; error?: string }>;
  deleteSite: (siteId: string) => Promise<{ success: boolean; error?: string }>;
  createSite: (newSiteData: Partial<SiteDefinition>) => Promise<{ success: boolean; newSiteId?: string; error?: string }>;
  health: { status: SiteHealthStatus; score: number; issues: string[]; warnings: string[] };
  setupProgress: SiteSetupProgress;
}

const ActiveSiteContext = createContext<ActiveSiteContextType | null>(null);

export function ActiveSiteProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuth();
  const [sites, setSites] = useState<SiteDefinition[]>([]);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [catalogItemsCount, setCatalogItemsCount] = useState<number>(0);

  const userId = session?.id || user?.id;

  const refreshSites = useCallback(async () => {
    if (!userId) {
      setSites([]);
      setCurrentSiteId(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSites: SiteDefinition[] = (data || []).map((s: any) => {
        const rawDomain = s.business_type || s.domain || 'vendeur';
        return {
          id: s.id,
          ownerId: s.owner_id,
          name: s.name || 'Mon Établissement',
          slug: s.slug || `site-${s.id.slice(0, 6)}`,
          domain: (['vendeur','hebergement','restauration','services','education','sante','immobilier_transport','creation_medias','organisations'].includes(rawDomain) ? rawDomain : 'vendeur') as any,
          category: s.sub_sector || s.category || 'autres',
          subSector: s.sub_sector || null,
          designId: s.template_id || s.design_id || 'vst_dsn_prestige_atelier_001',
          description: s.description || '',
          city: s.city || 'Douala',
          phone: s.phone || '',
          whatsapp: s.whatsapp_number || s.whatsapp_link || s.phone || '',
          logoUrl: s.logo_url || '',
          bannerUrl: s.banner_url || s.cover_url || '',
          storeCode: s.store_code || null,
          isActive: s.is_active !== false,
          isPublished: Boolean(s.published_at || (s.published_config && Object.keys(s.published_config).length > 0)),
          publishedAt: s.published_at || null,
          draftConfig: s.draft_config || {},
          publishedConfig: s.published_config || {},
          capabilities: s.capabilities || {},
          health: { status: 'yellow', score: 50, issues: [], warnings: [] },
          setupProgress: {
            infoCompleted: true,
            designSelected: true,
            contentAdded: false,
            contactConfigured: Boolean(s.phone || s.whatsapp_number),
            seoConfigured: Boolean(s.description),
            published: Boolean(s.published_at),
            completionPercentage: 50,
          },
          createdAt: s.created_at || new Date().toISOString(),
          updatedAt: s.updated_at || new Date().toISOString(),
        };
      });

      setSites(mappedSites);

      // Conserver ou restaurer le site sélectionné
      if (mappedSites.length > 0) {
        const savedSiteId = typeof window !== 'undefined' ? localStorage.getItem('vestyle_active_site_id') : null;
        const exists = mappedSites.find(s => s.id === savedSiteId);
        if (exists) {
          setCurrentSiteId(exists.id);
        } else {
          setCurrentSiteId(mappedSites[0].id);
        }
      } else {
        setCurrentSiteId(null);
      }
    } catch (err) {
      console.error('[ActiveSiteProvider] Erreur chargement sites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshSites();
  }, [refreshSites]);

  // Récupérer le nombre d'articles du site actif pour le calcul de santé
  useEffect(() => {
    if (!currentSiteId) {
      setCatalogItemsCount(0);
      return;
    }
    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', currentSiteId);
        setCatalogItemsCount(count || 0);
      } catch (_) {
        setCatalogItemsCount(0);
      }
    };
    fetchCount();
  }, [currentSiteId]);

  const selectSite = useCallback((siteId: string) => {
    setCurrentSiteId(siteId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vestyle_active_site_id', siteId);
    }
  }, []);

  const currentSite = useMemo(() => {
    return sites.find(s => s.id === currentSiteId) || sites[0] || null;
  }, [sites, currentSiteId]);

  const currentDomainMeta = useMemo(() => {
    return getDomainById(currentSite?.domain || 'vendeur');
  }, [currentSite?.domain]);

  const { health, setupProgress } = useMemo(() => {
    if (!currentSite) {
      return calculateSiteHealth({}, 0);
    }
    return calculateSiteHealth(currentSite, catalogItemsCount);
  }, [currentSite, catalogItemsCount]);

  // Sauvegarde des modifications en brouillon (Draft)
  const updateDraftConfig = useCallback(async (updatedDraft: Record<string, unknown>) => {
    if (!currentSite?.id) return { success: false, error: 'Aucun site actif.' };
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          draft_config: updatedDraft,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      // Mise à jour de l'état local
      setSites(prev => prev.map(s => s.id === currentSite.id ? { ...s, draftConfig: updatedDraft } : s));
      return { success: true };
    } catch (e: any) {
      console.error('[ActiveSiteProvider] updateDraftConfig error:', e);
      return { success: false, error: e?.message || 'Erreur lors de l’enregistrement du brouillon.' };
    }
  }, [currentSite?.id]);

  // Publication atomique : copie draft_config -> published_config
  const publishSite = useCallback(async (siteId?: string) => {
    const targetId = siteId || currentSite?.id;
    if (!targetId) return { success: false, error: 'Aucun site spécifié.' };
    const site = sites.find(s => s.id === targetId);
    if (!site) return { success: false, error: 'Site introuvable.' };

    try {
      const configToPublish = site.draftConfig && Object.keys(site.draftConfig).length > 0
        ? site.draftConfig
        : site.publishedConfig;

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('stores')
        .update({
          published_config: configToPublish,
          published_at: now,
          is_active: true,
          updated_at: now,
        })
        .eq('id', targetId);

      if (error) throw error;

      setSites(prev => prev.map(s => s.id === targetId ? {
        ...s,
        publishedConfig: configToPublish,
        isPublished: true,
        publishedAt: now,
      } : s));

      return { success: true };
    } catch (e: any) {
      console.error('[ActiveSiteProvider] publishSite error:', e);
      return { success: false, error: e?.message || 'Erreur lors de la publication.' };
    }
  }, [currentSite?.id, sites]);

  // Duplication de site
  const duplicateSite = useCallback(async (siteId: string) => {
    const source = sites.find(s => s.id === siteId);
    if (!source || !userId) return { success: false, error: 'Site source introuvable.' };

    try {
      const newSlug = `${source.slug}-copie-${Date.now().toString(36)}`;
      const newName = `${source.name} (Copie)`;

      const { data, error } = await supabase
        .from('stores')
        .insert({
          owner_id: userId,
          name: newName,
          slug: newSlug,
          business_type: source.domain,
          sub_sector: source.category,
          template_id: source.designId,
          description: source.description,
          city: source.city,
          phone: source.phone,
          whatsapp_number: source.whatsapp,
          logo_url: source.logoUrl,
          banner_url: source.bannerUrl,
          draft_config: source.draftConfig || source.publishedConfig,
          published_config: {},
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await refreshSites();
      return { success: true, newSiteId: data.id };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur lors de la duplication.' };
    }
  }, [sites, userId, refreshSites]);

  // Suppression de site
  const deleteSite = useCallback(async (siteId: string) => {
    if (!userId) return { success: false, error: 'Non authentifié.' };
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', siteId)
        .eq('owner_id', userId);

      if (error) throw error;

      await refreshSites();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur lors de la suppression.' };
    }
  }, [userId, refreshSites]);

  // Création de nouveau site
  const createSite = useCallback(async (newSiteData: Partial<SiteDefinition>) => {
    if (!userId) return { success: false, error: 'Non authentifié.' };
    try {
      const slugBase = (newSiteData.name || 'mon-site')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

      const designId = newSiteData.designId || 'vst_dsn_prestige_atelier_001';
      let draftConfig = newSiteData.draftConfig;
      if (!draftConfig || Object.keys(draftConfig).length === 0) {
        try {
          const design = LocalDesignRegistry.getInstance().getDesignSync(designId);
          draftConfig = VestinAdaptationEngine.adapt(design, {
            businessProfile: {
              storeName: newSiteData.name || 'Mon Établissement',
              city: newSiteData.city || 'Douala',
              phone: newSiteData.phone || '',
              whatsapp: newSiteData.whatsapp || newSiteData.phone || '',
              description: newSiteData.description || '',
            },
            sellerContent: {
              logoUrl: newSiteData.logoUrl,
              bannerUrl: newSiteData.bannerUrl,
            }
          });
        } catch (adaptErr) {
          console.warn('[ActiveSiteContext] Fallback adaptation config:', adaptErr);
          draftConfig = {};
        }
      }

      const { data, error } = await supabase
        .from('stores')
        .insert({
          owner_id: userId,
          name: newSiteData.name || 'Mon Établissement',
          slug: uniqueSlug,
          business_type: newSiteData.domain || 'vendeur',
          sub_sector: newSiteData.category || 'autres',
          template_id: designId,
          description: newSiteData.description || '',
          city: newSiteData.city || 'Douala',
          phone: newSiteData.phone || '',
          whatsapp_number: newSiteData.whatsapp || newSiteData.phone || '',
          draft_config: draftConfig || {},
          published_config: newSiteData.publishedConfig || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await refreshSites();
      selectSite(data.id);
      return { success: true, newSiteId: data.id, createdSite: data };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur lors de la création du site.' };
    }
  }, [userId, refreshSites, selectSite]);

  return (
    <ActiveSiteContext.Provider
      value={{
        sites,
        currentSite,
        currentDomainMeta,
        loading,
        refreshSites,
        selectSite,
        updateDraftConfig,
        publishSite,
        duplicateSite,
        deleteSite,
        createSite,
        health,
        setupProgress,
      }}
    >
      {children}
    </ActiveSiteContext.Provider>
  );
}

export function useActiveSite(): ActiveSiteContextType {
  const ctx = useContext(ActiveSiteContext);
  if (!ctx) {
    throw new Error('useActiveSite must be used within an ActiveSiteProvider');
  }
  return ctx;
}
