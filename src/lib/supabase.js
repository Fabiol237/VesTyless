import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URLs ou clés non configurées.");
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

// Custom fetch avec gestion d'erreur et retries silencieux pour éviter les "TypeError: Failed to fetch" intempestifs
const customFetch = async (...args) => {
  const maxRetries = 2;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(...args);
      return response;
    } catch (err) {
      if (i === maxRetries) {
        console.warn('[Supabase Network Warning]: Impossible de contacter Supabase (hors-ligne ou réseau instable).', err?.message);
        // Retourner une réponse d'erreur HTTP factice pour éviter de faire planter les promesses internes de Supabase SDK
        return new Response(
          JSON.stringify({ error: 'Network error', message: 'Failed to fetch' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
      await new Promise(res => setTimeout(res, 500 * (i + 1)));
    }
  }
};

export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: customFetch,
    },
  }
);
