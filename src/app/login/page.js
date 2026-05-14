'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ArrowLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const StoreIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
);
const ArrowRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const Loader2Icon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
const FingerprintIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-1.2.5-2.3 1.4-3"/><path d="M17.5 19.5c-.5-2-.5-4.5.5-6.5a5 5 0 0 0-5.3-7.4"/><path d="M12 12a3 3 0 0 0-3 3c0 1.5-.5 3-1 4"/><path d="M12 12a3 3 0 0 1 3 3c0 1.5.5 3.5 1 5"/></svg>
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      // Redirection intelligente : Vendeur vs Livreur
      const { data: isLivreur } = await supabase
        .from('livreurs')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      if (isLivreur) {
        router.push('/delivery');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err.message.includes('Email not confirmed')) {
        setError("Veuillez vérifier votre email avant de vous connecter.");
      } else if (err.message.includes('Invalid login credentials')) {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  // === API #7 : WebAuthn / PASSKEYS (Biométrie) ===
  const handlePasskeyLogin = async () => {
    if (!window.PublicKeyCredential) {
      setError("Votre navigateur ne supporte pas les Passkeys. Utilisez Chrome ou Edge récent.");
      return;
    }

    setPasskeyLoading(true);
    setError(null);

    try {
      // Étape 1 : Vérifier si les passkeys sont disponibles sur cet appareil
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError("Aucun capteur biométrique détecté sur cet appareil (empreinte, visage).");
        setPasskeyLoading(false);
        return;
      }

      // Étape 2 : Demande de création/utilisation d'un passkey
      // Challenge aléatoire (dans un vrai système, il viendrait du serveur)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
        }
      });

      if (credential) {
        // Le credential.id identifie l'utilisateur de façon unique et sécurisée.
        // Dans un vrai système, on l'enverrait au backend pour vérification et connexion Supabase.
        // Pour l'instant, on montre un message de succès et on redirige vers le dashboard.
        console.log('[WebAuthn] Authentification biométrique réussie:', credential.id);
        setError(null);
        
        // Redirection intelligente
        const { data: isLivreur } = await supabase
          .from('livreurs')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user.id)
          .single();

        if (isLivreur) {
          router.push('/delivery');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError("Authentification annulée ou temps expiré.");
      } else if (err.name === 'SecurityError') {
        setError("Sécurité: le passkey ne peut être utilisé que sur HTTPS (localhost accepté).");
      } else {
        setError("Erreur biométrie: " + err.message);
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (!mounted) return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-wa-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeftIcon size={16} /> Retour au site
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
            <img src="/icon-512.png" className="w-full h-full object-cover" alt="Vestyle" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-wa-teal-dark">
          Espace Vendeur
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Gérez votre boutique, vos produits et vos ventes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-neutral-200 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-wa-teal-dark mb-2">Email pro</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-wa-teal focus:border-transparent sm:text-sm transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-wa-teal-dark">Mot de passe</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email.trim()) { setError("Entrez votre email d'abord."); return; }
                    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login` });
                    if (err) setError(err.message);
                    else setError(null), alert("✅ Email de réinitialisation envoyé ! Vérifiez votre boîte.");
                  }}
                  className="text-xs text-wa-teal hover:underline font-bold"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-wa-teal focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-wa-green hover:bg-wa-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wa-green transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2Icon size={18} className="animate-spin" /> : <>Se connecter <ArrowRightIcon size={18}/></>}
            </button>
          </form>

          {/* CONNEXIONS RAPIDES : GOOGLE + PASSKEY */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-neutral-500 font-bold uppercase tracking-wider">Ou connexion rapide</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 hover:shadow-md transition-all active:scale-95"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Continuer avec Google
              </button>

              {/* PASSKEY / BIOMÉTRIE */}
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={passkeyLoading}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-dashed border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:border-wa-teal hover:text-wa-teal hover:bg-wa-teal/5 transition-all disabled:opacity-50"
              >
                {passkeyLoading
                  ? <Loader2Icon size={20} className="animate-spin text-wa-teal" />
                  : <FingerprintIcon size={20} />
                }
                <span>{passkeyLoading ? 'Vérification biométrique...' : 'Empreinte / Visage (Passkey)'}</span>
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-neutral-400">
              Google OAuth activé via Supabase — Passkey nécessite Chrome/Edge avec capteur biométrique.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col items-center">
            <p className="text-sm text-neutral-500">
              Vous n&apos;avez pas de boutique ?
            </p>
            <Link href="/signup" className="mt-2 font-bold text-wa-teal hover:text-wa-teal-dark transition-colors">
              Créer un compte Vendeur gratuit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
