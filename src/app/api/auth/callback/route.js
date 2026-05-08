import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    console.log('[OAuth Callback] Code reçu, échange en cours...');
    console.log('[OAuth Callback] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('[OAuth Callback] Succès ! Redirection vers /dashboard');
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      console.error('[OAuth Callback] Erreur échange:', error.message);
    }
  } else {
    console.warn('[OAuth Callback] Aucun code trouvé dans l\'URL');
  }

  // En cas d'erreur, retourner à la page de login
  return NextResponse.redirect(`${origin}/login?error=oauth_error`);
}
