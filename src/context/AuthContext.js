'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const mountedRef = useRef(false);

  // Timeout ultra-court (2s) pour ne pas bloquer hors-ligne
  const withTimeout = async (promiseFactory, ms = 2000) => {
    let timeoutId;
    try {
      return await Promise.race([
        promiseFactory(),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('AUTH_TIMEOUT')), ms);
        }),
      ]);
    } catch (err) {
      return null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  // ── Chargement rapide depuis le cache local (localStorage / Dexie) ───────────
  const loadFromLocalCache = (userId) => {
    try {
      const cachedProfile = localStorage.getItem(`vestyle_profile_${userId}`);
      const cachedStore = localStorage.getItem(`vestyle_store_${userId}`);
      const cachedStores = localStorage.getItem(`vestyle_stores_${userId}`);
      const cachedActiveId = localStorage.getItem(`vestyle_active_store_${userId}`);

      if (cachedProfile) setProfile(JSON.parse(cachedProfile));
      if (cachedStores) {
        const parsedStores = JSON.parse(cachedStores);
        if (Array.isArray(parsedStores)) {
          setStores(parsedStores);
          const active = parsedStores.find(s => s.id === cachedActiveId) || parsedStores[0] || null;
          if (active) {
            setStore(active);
            setActiveStoreId(active.id);
          }
        }
      } else if (cachedStore) {
        const parsedStore = JSON.parse(cachedStore);
        setStore(parsedStore);
        setStores([parsedStore]);
        setActiveStoreId(parsedStore.id);
      }
    } catch (e) {
      console.warn('[AuthContext] Erreur lecture cache local:', e);
    }
  };

  const saveToLocalCache = (userId, profileData, storeData, storesList = []) => {
    try {
      if (profileData) localStorage.setItem(`vestyle_profile_${userId}`, JSON.stringify(profileData));
      if (storeData) {
        localStorage.setItem(`vestyle_store_${userId}`, JSON.stringify(storeData));
        localStorage.setItem(`vestyle_active_store_${userId}`, storeData.id);
      }
      if (Array.isArray(storesList) && storesList.length > 0) {
        localStorage.setItem(`vestyle_stores_${userId}`, JSON.stringify(storesList));
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return () => {
        mountedRef.current = false;
      };
    }

    // ── Safety Timeout (1.5s max) pour couper tout spinner en attente ─────────
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) {
        setLoading(false);
      }
    }, 1500);

    // 1. Détection immédiate de session
    supabase.auth.getSession().then(({ data }) => {
      if (!mountedRef.current) return;
      const session = data?.session;
      if (session?.user) {
        setUser(session.user);
        loadFromLocalCache(session.user.id);
        // Débloque l'UI IMMÉDIATEMENT (0ms)
        setLoading(false);
        // Rafraîchit les données en arrière-plan
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mountedRef.current) setLoading(false);
    });

    // 2. Écouteur d'évènements Auth
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      if (session?.user) {
        setUser(session.user);
        loadFromLocalCache(session.user.id);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setStore(null);
        setStores([]);
        setActiveStoreId(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      mountedRef.current = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId) => {
    try {
      // 1. Fetch Profile
      let fetchedProfile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (data) {
          fetchedProfile = data;
          setProfile(data);
        }
      } catch (err) {
        console.warn('[AuthContext] Profil réseau non dispo');
      }

      // 2. Fetch All Stores (1 -> N)
      let storesList = [];
      let storesError = null;

      try {
        const res = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });
        storesList = res.data || [];
        storesError = res.error;
      } catch (e) {
        storesError = e;
      }

      if (!storesError && Array.isArray(storesList) && storesList.length > 0) {
        setStores(storesList);
        // Vérifier si un activeStoreId était mémorisé
        const savedActiveId = localStorage.getItem(`vestyle_active_store_${userId}`);
        const selected = storesList.find(s => s.id === savedActiveId) || storesList[0];
        setStore(selected);
        setActiveStoreId(selected.id);
        saveToLocalCache(userId, fetchedProfile, selected, storesList);
      } else if (storesError) {
        console.warn("⚠️ Réseau instable/offline lors de la vérification des boutiques. Utilisation du cache.");
      } else {
        // Aucune boutique trouvée
        setStore(null);
        setStores([]);
        setActiveStoreId(null);
        saveToLocalCache(userId, fetchedProfile, null, []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  /**
   * Bascule la boutique active vers un autre store de l'utilisateur
   */
  const switchStore = (storeId) => {
    if (!storeId || !stores.length) return;
    const targetStore = stores.find(s => s.id === storeId);
    if (targetStore) {
      setStore(targetStore);
      setActiveStoreId(targetStore.id);
      if (user?.id) {
        try {
          localStorage.setItem(`vestyle_store_${user.id}`, JSON.stringify(targetStore));
          localStorage.setItem(`vestyle_active_store_${user.id}`, targetStore.id);
        } catch (e) {}
      }
    }
  };

  const logout = async () => {
    if (user) {
      try {
        localStorage.removeItem(`vestyle_profile_${user.id}`);
        localStorage.removeItem(`vestyle_store_${user.id}`);
        localStorage.removeItem(`vestyle_stores_${user.id}`);
        localStorage.removeItem(`vestyle_active_store_${user.id}`);
      } catch (e) {}
    }
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const value = {
    user,
    session: user,
    profile,
    store,
    stores,
    activeStoreId,
    switchStore,
    loading,
    logout,
    signOut: logout,
    refreshStore: async () => {
      if (user) await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
