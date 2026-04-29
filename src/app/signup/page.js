'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          store_name: storeName.trim()
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-wa-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-10 px-6 shadow-sm border border-neutral-200 rounded-3xl text-center">
          <div className="w-16 h-16 bg-wa-green rounded-full flex items-center justify-center shadow-md mx-auto mb-6">
            <CheckCircle2 className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-wa-teal-dark mb-4">Vérifiez votre email !</h2>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Nous vous avons envoyé un lien de confirmation à l'adresse <strong>{email}</strong>. 
            Veuillez cliquer sur ce lien pour activer votre boutique avant de vous connecter.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-wa-teal text-white font-bold rounded-xl hover:bg-wa-teal-dark transition-colors">
            Aller à la connexion <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wa-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-wa-teal-dark transition-colors">
        <ArrowLeft size={16} /> Retour au site
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-wa-teal rounded-full flex items-center justify-center shadow-md">
            <Store className="text-white" size={28} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-wa-teal-dark">
          Créer votre boutique
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Rejoignez des milliers de vendeurs aujourd'hui.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-neutral-200 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-wa-teal-dark mb-2">Nom de la boutique</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-wa-teal focus:border-transparent sm:text-sm transition-all"
                  placeholder="Ex: Ma Super Boutique"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-wa-teal-dark mb-2">Mot de passe</label>
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Créer ma boutique <ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center">
            <p className="text-sm text-neutral-500">
              Déjà un compte ?
            </p>
            <Link href="/login" className="mt-2 font-bold text-wa-teal hover:text-wa-teal-dark transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
