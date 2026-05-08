'use client';
import Link from 'next/link';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#111B21] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-wa-teal/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <WifiOff size={48} className="text-wa-teal" />
      </div>
      
      <h1 className="text-3xl font-black mb-4 tracking-tight">Oups ! Vous êtes hors-ligne.</h1>
      <p className="text-neutral-400 max-w-md mb-10 leading-relaxed">
        Il semble que votre connexion internet fasse une petite pause. 
        Pas de panique ! VesTyle garde en mémoire vos boutiques préférées.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <button 
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 bg-wa-teal hover:bg-wa-teal-dark text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-xl shadow-wa-teal/20"
        >
          <RefreshCw size={20} />
          Réessayer
        </button>
        
        <Link 
          href="/"
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 transition-all"
        >
          <Home size={20} />
          Accueil
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-md">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-4">Conseil Pro</p>
        <p className="text-sm text-neutral-400 italic">
          "Vous pouvez toujours passer des commandes par téléphone directement auprès des vendeurs si vous avez enregistré leur numéro !"
        </p>
      </div>
    </div>
  );
}
