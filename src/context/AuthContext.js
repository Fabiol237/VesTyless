'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const mountedRef = useRef(false);

  const withTimeout = async (promiseFactory, ms = 12000) => {
    let timeoutId;

    try {
      return await Promise.race([
        promiseFactory(),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('AUTH_TIMEOUT')), ms);
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
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
            await withTimeout(() => fetchUserData(session.user.id));
          } else {
            setUser(null);
            setProfile(null);
            setStore(null);
          }
        } catch (err) {
          if (err?.message !== 'AUTH_TIMEOUT') {
            console.error('Erreur onAuthStateChange:', err);
          }
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!profileError && profileData) {
        setProfile(profileData);
      }

      // 2. Fetch Store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();
        
      if (!storeError && storeData) {
        setStore(storeData);
      } else if (storeError?.code === 'PGRST116' || !storeData) {
        // No store found for this user, let's create a default one
        const randomString = Math.random().toString(36).substring(2, 8);
        const defaultName = `Boutique de ${profileData?.full_name?.split(' ')[0] || 'Utilisateur'}`;
        const defaultSlug = `boutique-${randomString}`;

        const { data: newStore, error: insertError } = await supabase
          .from('stores')
          .insert([
            {
              owner_id: userId,
              name: defaultName,
              slug: defaultSlug,
            }
          ])
          .select()
          .single();

        if (!insertError && newStore) {
          setStore(newStore);
        } else {
          console.error("Erreur lors de la creation de la boutique auto:", insertError);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const logout = async () => {
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
