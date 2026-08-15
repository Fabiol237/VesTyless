'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AuthContext = createContext();

// Global lock to prevent race conditions when multiple auth state events fire concurrently
let isCreatingStoreForUser = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
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
      if (cachedProfile) setProfile(JSON.parse(cachedProfile));
      if (cachedStore) setStore(JSON.parse(cachedStore));
    } catch (e) {
      console.warn('[AuthContext] Erreur lecture cache local:', e);
    }
  };

  const saveToLocalCache = (userId, profileData, storeData) => {
    try {
      if (profileData) localStorage.setItem(`vestyle_profile_${userId}`, JSON.stringify(profileData));
      if (storeData) localStorage.setItem(`vestyle_store_${userId}`, JSON.stringify(storeData));
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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const syncAuthState = async () => {
        if (!mountedRef.current) return;

        setLoading(true);
        try {
          if (session?.user) {
            setUser(session.user);
            // 1. Charger d'abord le cache local TOUT DE SUITE (0ms)
            loadFromLocalCache(session.user.id);

            // 2. Si l'appareil est en ligne, rafraîchir en arrière-plan avec un timeout de 2s max
            if (typeof navigator === 'undefined' || navigator.onLine) {
              await withTimeout(() => fetchUserData(session.user.id), 2500);
            }
          } else {
            setUser(null);
            setProfile(null);
            setStore(null);
          }
        } catch (err) {
          console.warn('[AuthContext] Sync auth fallback:', err?.message);
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      };

      syncAuthState();
    });

    return () => {
      mountedRef.current = false;
      authListener.subscription.unsubscribe();
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

      // 2. Fetch Store
      let storeData = null;
      let storeError = null;

      try {
        const res = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        storeData = res.data;
        storeError = res.error;
      } catch (e) {
        storeError = e;
      }

      if (!storeError && storeData) {
        setStore(storeData);
        saveToLocalCache(userId, fetchedProfile, storeData);
      } else if (storeError) {
        console.warn("⚠️ Réseau instable/offline lors de la vérification de la boutique. Utilisation du cache.");
        // NE PAS mettre store à null en cas d'erreur réseau ! Conserver le cache local.
      } else if (!storeError && !storeData && (typeof navigator === 'undefined' || navigator.onLine)) {
        // Aucune boutique trouvée et VRAIMENT en ligne → Création automatique
        if (isCreatingStoreForUser === userId) return;
        isCreatingStoreForUser = userId;

        try {
          const { data: { user } } = await supabase.auth.getUser();
          const storeNameFromMeta = user?.user_metadata?.store_name;

          const randomString = Math.random().toString(36).substring(2, 8);
          const defaultName = storeNameFromMeta || `Boutique de ${fetchedProfile?.full_name?.split(' ')[0] || 'Utilisateur'}`;
          const defaultSlug = (storeNameFromMeta ? storeNameFromMeta.toLowerCase().replace(/\s+/g, '-') : 'boutique') + `-${randomString}`;

          const { data: newStore, error: insertError } = await supabase
            .from('stores')
            .insert([{
                owner_id: userId,
                name: defaultName,
                slug: defaultSlug,
                is_active: true,
            }])
            .select()
            .single();

          if (!insertError && newStore) {
            setStore(newStore);
            saveToLocalCache(userId, fetchedProfile, newStore);
            console.log('✅ Boutique créée', newStore.id);
          }
        } finally {
          isCreatingStoreForUser = null;
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const logout = async () => {
    if (user) {
      try {
        localStorage.removeItem(`vestyle_profile_${user.id}`);
        localStorage.removeItem(`vestyle_store_${user.id}`);
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
