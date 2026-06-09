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
            /* 
            // Trigger Security Notification on Sign In (Disabled because it fires too often)
            if (event === 'SIGNED_IN') {
              fetch('/api/emails/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: session.user.email,
                  subject: 'Alerte Connexion',
                  type: 'SECURITY',
                  data: {
                    message: `Une nouvelle connexion a été détectée sur votre compte Vestyle Pro à ${new Date().toLocaleTimeString('fr-FR')}. Si ce n'était pas vous, sécurisez votre compte immédiatement.`
                  }
                })
              }).catch(e => console.error('Security notify failed:', e));
            }
            */

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
        // No store found for this user
        // ⚠️ IMPORTANT: Seulement créer UNE FOIS (check if recent creation exists)
        const { data: { user } } = await supabase.auth.getUser();
        const storeNameFromMeta = user?.user_metadata?.store_name;
        
        // Check if user already tried to create a store recently (avoid duplicates on reconnect)
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
        const { data: recentDelete } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', userId)
          .gt('created_at', oneHourAgo)
          .limit(1);

        if (recentDelete && recentDelete.length > 0) {
          console.log('Store creation déjà tentée récemment, skip');
          return;
        }

        const randomString = Math.random().toString(36).substring(2, 8);
        const defaultName = storeNameFromMeta || `Boutique de ${profileData?.full_name?.split(' ')[0] || 'Utilisateur'}`;
        const defaultSlug = (storeNameFromMeta ? storeNameFromMeta.toLowerCase().replace(/\s+/g, '-') : 'boutique') + `-${randomString}`;

        const { data: newStore, error: insertError } = await supabase
          .from('stores')
          .insert([
            {
              owner_id: userId,
              name: defaultName,
              slug: defaultSlug,
              is_active: true,
            }
          ])
          .select()
          .single();

        if (!insertError && newStore) {
          setStore(newStore);
          console.log('✅ Boutique créée (nouvelle)', newStore.id);
        } else {
          console.error("❌ Erreur store creation:", insertError?.message);
          // Ne pas bloquer l'app si la création échoue
          setStore(null);
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
