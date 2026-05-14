'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Loader2, Image as ImageIcon, ScanSearch, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Paramétrage de Transformers.js pour utiliser le web
const configureEnv = async () => {
  const { env } = await import('@xenova/transformers');
  env.allowLocalModels = false;
};

const AI_READY_KEY = 'vestyle_ai_ready';

export default function VisualSearchModal({ onClose, onResultsFound }) {
  const [phase, setPhase] = useState('init'); // 'init' | 'consent' | 'loading' | 'ready' | 'analyzing' | 'results' | 'empty'
  const [statusText, setStatusText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const extractorRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // -- Initialisation au montage (SANS CHARGEMENT AUTOMATIQUE) --
  useEffect(() => {
    configureEnv();
    setPhase('consent'); // On commence toujours par le consentement pour économiser la RAM
  }, []);

  const loadModel = useCallback(async (silent = false) => {
    try {
      if (!extractorRef.current) {
        setStatusText('Initialisation de l\'IA sécurisée…');
        const { getAIExtractor } = await import('@/lib/aiService');
        if (!silent) setPhase('loading');
        
        extractorRef.current = await getAIExtractor((info) => {
          if (info.status === 'progress' && !silent) {
            setProgress(Math.round(info.progress || 0));
            setStatusText(`Préparation… ${Math.round(info.progress || 0)}%`);
          }
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(AI_READY_KEY, 'true');
        }
      }
      setPhase('ready');
    } catch (err) {
      console.error('Erreur IA:', err);
      setPhase('consent');
      setStatusText('Mémoire saturée ou erreur de connexion.');
    }
  }, []);

  const handleActivate = () => {
    loadModel(false);
  };

  const processImage = useCallback(async (file) => {
    if (!file || !extractorRef.current) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setPhase('analyzing');
    setStatusText('Analyse des couleurs et des formes…');

    try {
      // Charger l'image
      const img = new Image();
      img.src = objectUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      setStatusText('Création de l\'empreinte visuelle IA…');
      const output = await extractorRef.current(img.src);
      const vector = Array.from(output.data);

      setStatusText('Recherche dans toutes les boutiques Vestyle…');
      const { data, error } = await supabase.rpc('search_products_visual', {
        query_embedding: `[${vector.join(',')}]`,
        match_threshold: 0.55, // seuil assoupli pour plus de résultats
        match_count: 16
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setResults(data);
        setPhase('results');
        setStatusText(`${data.length} produit(s) trouvé(s) !`);

        // ✅ Envoyer les résultats au feed principal et fermer après 600ms
        if (onResultsFound) {
          setTimeout(() => {
            onResultsFound(data);
            onClose();
          }, 600);
        }
      } else {
        setPhase('empty');
        setStatusText('Aucun produit similaire trouvé dans le catalogue.');
      }
    } catch (err) {
      console.error('Erreur recherche visuelle:', err);
      setPhase('empty');
      setStatusText('Recherche échouée. Essayez avec une photo plus claire.');
    }
  }, [onResultsFound, onClose]);

  const handleFileChange = (e) => processImage(e.target.files?.[0]);
  const resetSearch = () => { setImagePreview(null); setResults([]); setPhase('ready'); };

  // ── Rendu par phase ─────────────────────────────────────────────────────────

  const renderContent = () => {
    if (phase === 'init') {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="text-emerald-500 animate-spin" size={36} />
        </div>
      );
    }

    if (phase === 'consent') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 max-w-sm mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
            <ScanSearch size={44} className="text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">Recherche Visuelle IA</h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            Prenez en photo n'importe quel vêtement et l'IA trouve les produits correspondants dans toutes les boutiques Vestyle.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left w-full">
            <p className="text-amber-800 text-xs font-black mb-1">📦 Téléchargement unique : ~150 Mo</p>
            <p className="text-amber-700 text-[11px] leading-relaxed">L'IA s'installe dans votre appareil une seule fois, puis fonctionne instantanément. <strong>Wi-Fi recommandé.</strong></p>
          </div>
          <button
            onClick={handleActivate}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all mb-3"
          >
            Activer l'IA Visuelle
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm py-2 transition-colors">
            Plus tard
          </button>
          {statusText && <p className="mt-3 text-xs text-red-500 font-bold">{statusText}</p>}
        </div>
      );
    }

    if (phase === 'loading') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-emerald-100 rounded-[28px] flex items-center justify-center">
              <Loader2 size={42} className="text-emerald-500 animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-emerald-600 mb-2">Installation en cours…</p>
            {progress > 0 && (
              <div className="w-64 bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
                <div
                  className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-400 font-bold mt-3 uppercase tracking-widest">
              {statusText || 'Connexion au cerveau IA…'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 bg-slate-50 px-4 py-2 rounded-full">Ne quittez pas cette page</p>
        </div>
      );
    }

    if (phase === 'ready') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8 w-full max-w-sm mx-auto">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full">✅ IA Prête</p>
          
          {/* Bouton caméra */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-[32px] shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-black mb-1">Prendre une photo</h3>
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Ouvrir l'appareil photo</p>
          </button>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-white text-slate-700 p-5 rounded-[24px] shadow-sm border-2 border-slate-100 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-center gap-3 font-black"
          >
            <ImageIcon className="text-emerald-500" size={22} />
            Choisir dans la galerie / Autre
          </button>

          {/* Input unique pour Galerie et Caméra */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={cameraInputRef} 
            onChange={handleFileChange} 
          />
        </div>
      );
    }

    if (phase === 'analyzing') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
          {imagePreview && (
            <div className="w-40 h-40 rounded-[28px] overflow-hidden border-4 border-white shadow-2xl relative">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Analyse" />
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={36} />
              </div>
            </div>
          )}
          <div className="text-center">
            <p className="text-xl font-black text-slate-900 mb-2">Analyse en cours…</p>
            <p className="text-sm text-slate-500 font-medium">{statusText}</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      );
    }

    if (phase === 'results') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
            <ScanSearch className="text-emerald-500" size={36} />
          </div>
          <p className="text-xl font-black text-emerald-600">{statusText}</p>
          <p className="text-sm text-slate-500 font-medium">Redirection vers les résultats…</p>
          <Loader2 className="text-emerald-400 animate-spin" size={24} />
        </div>
      );
    }

    if (phase === 'empty') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8 text-center max-w-sm mx-auto">
          {imagePreview && (
            <div className="w-32 h-32 rounded-[24px] overflow-hidden border-4 border-white shadow-xl opacity-60">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Résultat" />
            </div>
          )}
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <AlertCircle className="text-orange-400" size={30} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Aucun produit correspondant</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              L'IA n'a pas trouvé de vêtement similaire dans notre catalogue. Essayez avec un autre angle ou une photo plus lumineuse.
            </p>
          </div>
          <button
            onClick={resetSearch}
            className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
          >
            Réessayer
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
            Fermer
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white w-full sm:max-w-lg max-h-[90vh] sm:rounded-[36px] rounded-t-[36px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <ScanSearch size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base leading-none">Recherche Visuelle IA</h2>
              {(phase === 'ready' || phase === 'analyzing') && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Propulsé par CLIP</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
