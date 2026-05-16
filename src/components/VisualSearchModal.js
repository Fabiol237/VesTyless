'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Loader2, Image as ImageIcon, ScanSearch, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AI_READY_KEY = 'vestyle_ai_ready';
const MODEL_CACHE_KEY = 'vestyle_model_cache_time';

export default function VisualSearchModal({ onClose, onResultsFound }) {
  const [phase, setPhase] = useState('init');
  const [statusText, setStatusText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const extractorRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    setPhase('consent');
  }, []);

  // Compression d'image optimisée pour Android
  const compressImage = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Redimensionner si trop grand (max 1024px)
          if (width > height) {
            if (width > 1024) {
              height = Math.round((height * 1024) / width);
              width = 1024;
            }
          } else {
            if (height > 1024) {
              width = Math.round((width * 1024) / height);
              height = 1024;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }, []);

  const loadModel = useCallback(async () => {
    try {
      if (!extractorRef.current) {
        setStatusText('Téléchargement du modèle IA (150 Mo)…');
        setPhase('loading');

        const { getAIExtractor } = await import('@/lib/aiService');

        extractorRef.current = await getAIExtractor((info) => {
          if (info.status === 'progress') {
            const p = Math.round(info.progress || 0);
            setProgress(p);
            setStatusText(`Installation… ${p}%`);
          }
        });

        localStorage.setItem(AI_READY_KEY, 'true');
        localStorage.setItem(MODEL_CACHE_KEY, Date.now().toString());
      }
      setPhase('ready');
    } catch (err) {
      console.error('Erreur IA:', err);
      setError('Impossible de charger l\'IA. Vérifiez votre connexion Wi-Fi.');
      setPhase('error');
    }
  }, []);

  const processImage = useCallback(async (file) => {
    if (!file) return;

    try {
      setError(null);
      setPhase('analyzing');
      setStatusText('Compression de l\'image…');

      // Compresser l'image
      const compressedFile = await compressImage(file);
      const objectUrl = URL.createObjectURL(compressedFile);
      setImagePreview(objectUrl);

      if (!extractorRef.current) {
        setStatusText('Initialisation du modèle…');
        await loadModel();
      }

      setStatusText('Analyse des formes et couleurs…');
      const img = new Image();
      img.src = objectUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setStatusText('Création de l\'empreinte IA…');
      const output = await extractorRef.current(objectUrl);
      const vector = Array.from(output.data);

      setStatusText('Recherche dans Vestyle…');
      const { data, error } = await supabase.rpc('search_products_visual', {
        query_embedding: `[${vector.join(',')}]`,
        match_threshold: 0.5,
        match_count: 12
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setResults(data);
        setPhase('results');
        setStatusText(`✅ ${data.length} produit(s) trouvé(s)!`);

        if (onResultsFound) {
          setTimeout(() => {
            onResultsFound(data);
            onClose();
          }, 800);
        }
      } else {
        setPhase('empty');
        setStatusText('Aucun produit similaire trouvé.');
      }

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'analyse. Essayez avec une photo plus nette.');
      setPhase('error');
    }
  }, [compressImage, loadModel, onResultsFound, onClose]);

  const handleFileChange = (e) => processImage(e.target.files?.[0]);
  const resetSearch = () => {
    setImagePreview(null);
    setResults([]);
    setError(null);
    setPhase('ready');
  };

  // ── RENDU ──

  if (phase === 'consent') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl">
              <ScanSearch size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Recherche Visuelle IA</h2>
            <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">
              📸 Photographiez un article ou importez une image → l'IA trouvera les produits similaires dans toutes les boutiques.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-[24px] p-4 mb-6 w-full text-left">
              <p className="text-blue-900 text-xs font-black mb-2">⚡ Première utilisation</p>
              <p className="text-blue-800 text-[12px] leading-relaxed">
                L'IA (150 Mo) s'installe une seule fois sur votre téléphone. Wi-Fi requise.
              </p>
            </div>

            <button
              onClick={loadModel}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-4 rounded-[24px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mb-3"
            >
              ✨ Activer l'IA
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="relative w-28 h-28 mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-[28px] flex items-center justify-center">
              <Loader2 size={48} className="text-emerald-600 animate-spin" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-emerald-600 mb-4">Installation…</h3>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm font-bold text-slate-500 mb-2">{progress}%</p>
          <p className="text-xs text-slate-400 font-medium">{statusText}</p>
          <p className="text-[11px] text-slate-400 bg-slate-50 px-4 py-2 rounded-full mt-4">
            Ne fermez pas cette page
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-[40px]">
            <h2 className="text-xl font-black text-slate-900">Recherche Visuelle</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[24px] px-4 py-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-emerald-700 text-xs font-black uppercase">IA Prête</span>
            </div>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-[32px] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Camera size={36} />
              </div>
              <h3 className="text-xl font-black mb-1">Prendre une photo</h3>
              <p className="text-emerald-100 text-xs font-bold uppercase">Ouvrir la caméra</p>
            </button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase">Ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-6 rounded-[24px] border-2 border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-3 font-black"
            >
              <ImageIcon className="text-emerald-500" size={24} />
              <span>Galerie</span>
            </button>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleFileChange}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={galleryInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl">
          {imagePreview && (
            <div className="w-48 h-48 rounded-[28px] overflow-hidden mb-6 border-4 border-slate-100 shadow-lg relative">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Analyse" />
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={40} />
              </div>
            </div>
          )}

          <h3 className="text-2xl font-black text-slate-900 mb-2">Analyse…</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">{statusText}</p>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-[40px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">{results.length} résultats</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {results.map((product) => (
              <div key={product.id} className="flex gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{product.store_name}</p>
                  <p className="text-lg font-black text-emerald-600 mt-2">
                    {Math.round(product.price || 0).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-[40px]">
            <button
              onClick={resetSearch}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-[16px] transition"
            >
              Nouvelle recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'empty' || phase === 'error') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-100 rounded-[20px] flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-amber-600" />
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {phase === 'error' ? 'Erreur' : 'Aucun résultat'}
          </h3>
          <p className="text-sm text-slate-600 font-medium mb-6">{error || statusText}</p>

          <div className="space-y-3 w-full">
            <button
              onClick={resetSearch}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-[16px] transition"
            >
              Réessayer
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-[16px] transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }
}
