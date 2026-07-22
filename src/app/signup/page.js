'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { triggerFeedback } from '@/lib/haptic';

// Premium SVG Icons
const ArrowLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const StoreIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
);
const ArrowRightIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const Loader2Icon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
const CheckCircle2Icon = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    triggerFeedback('pop');

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let attempts = 0;
    const maxAttempts = 3;
    let signupRes = null;

    while (attempts < maxAttempts && !signupRes) {
      attempts++;
      try {
        const res = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              store_name: storeName.trim()
            }
          }
        });

        if (res.error) throw res.error;
        signupRes = res;
      } catch (err) {
        console.warn(`[Signup] Échec création de compte (tentative ${attempts}):`, err.message);
        if (attempts < maxAttempts) {
          await delay(1500 * attempts);
        } else {
          setError(err.message || "Le service d'inscription est momentanément indisponible. Veuillez réessayer.");
          setLoading(false);
          return;
        }
      }
    }

    triggerFeedback('success');
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    triggerFeedback('pop');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#080f1c] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-[#080f1c] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#25D366]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-[#0d2137]/80 backdrop-blur-2xl py-12 px-8 shadow-2xl border border-white/10 rounded-[2.5rem] text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#25D366] to-[#128C7E] rounded-3xl flex items-center justify-center shadow-xl shadow-[#25D366]/20 mx-auto mb-8 animate-bounce">
              <CheckCircle2Icon className="text-slate-950" size={38} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Bienvenue sur VesTyle !</h2>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              Nous venons d'envoyer un lien de confirmation à l'adresse <strong className="text-[#25D366]">{email}</strong>. 
              Veuillez confirmer votre e-mail pour activer votre espace vendeur de prestige.
            </p>
            <Link href="/login" className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-slate-950 font-black rounded-2xl shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider">
              Continuer vers la connexion <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080f1c] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background radial spotlights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#128C7E]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-[#25D366]/80 bg-opacity-[0.06] rounded-full blur-[150px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
        <ArrowLeftIcon size={16} /> Retour au site
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#25D366] to-[#128C7E] rounded-2xl flex items-center justify-center shadow-xl shadow-[#25D366]/15">
            <StoreIcon className="text-slate-950" size={32} />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-white tracking-tight">
          Ouvrir ma <span className="text-[#25D366]">Boutique</span>
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Propulsez vos ventes dès aujourd'hui
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0d2137]/80 backdrop-blur-2xl py-10 px-8 shadow-2xl border border-white/5 sm:rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold p-4 rounded-2xl leading-relaxed">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">Nom de la boutique</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                placeholder="Ex: Prestige Fashion"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">Adresse E-mail pro</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">Mot de passe de sécurité</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-slate-950 font-black rounded-2xl shadow-xl shadow-[#25D366]/10 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2Icon size={18} className="animate-spin" /> : <>Créer ma boutique <ArrowRightIcon size={18}/></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400">Déjà inscrit ?</span>
            <Link href="/login" className="mt-2 text-sm font-black text-[#25D366] hover:text-white transition-colors uppercase tracking-wider">
              Se connecter
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0e2238] px-3 text-slate-400 font-black uppercase tracking-widest">OU</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-white/10 rounded-2xl text-xs font-black text-white bg-slate-950/40 hover:bg-slate-950/80 transition-all active:scale-95 uppercase tracking-wider"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
