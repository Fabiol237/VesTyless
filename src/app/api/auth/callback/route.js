import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const origin = requestUrl.origin;

  // Gérer les erreurs renvoyées par Supabase dans les query params
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  if (errorParam) {
    console.error('[OAuth Callback] ❌ Erreur OAuth reçue:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  // S'assurer que les cookies sont bien persistés
                  sameSite: 'lax',
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                });
              });
            } catch (e) {
              // Les erreurs de cookie en read-only context peuvent être ignorées
              console.warn('[OAuth Callback] Cookie set ignoré (read-only context):', e.message);
            }
          },
        },
      }
    );

    console.log('[OAuth Callback] Code reçu, échange en cours...');

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      console.log('[OAuth Callback] ✅ Session créée pour:', data.session.user?.email);
      const response = NextResponse.redirect(`${origin}${next}`);
      return response;
    }

    if (error) {
      console.error('[OAuth Callback] ❌ Erreur échange code:', error.message, '| Status:', error.status);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  console.warn('[OAuth Callback] Aucun code reçu dans l\'URL');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
