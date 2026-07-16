'use client';
import { useState, useRef, useCallback } from 'react';
import { Camera, X, Loader2, Image as ImageIcon, ScanSearch, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function VisualSearchModal({ onClose, onResultsFound }) {
  const [phase, setPhase] = useState('ready'); // ready | analyzing | results | empty | error
  const [statusText, setStatusText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const galleryInputRef = useRef(null);

  // Compression légère côté client avant envoi
  const compressImage = useCallback(async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX = 1024;
          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', 0.82);
        };
      };
    });
  }, []);

  const processImage = useCallback(async (file) => {
    if (!file) return;
    setError(null);
    setPhase('analyzing');
    setStatusText('Téléchargement de votre photo en cours...');

    try {
      const compressed = await compressImage(file);
      const objectUrl = URL.createObjectURL(compressed);
      setImagePreview(objectUrl);

      // Séquence de textes conviviale
      setTimeout(() => setStatusText('Lecture et analyse des couleurs et de la forme...'), 1000);
      setTimeout(() => setStatusText('Recherche des boutiques partenaires les plus proches...'), 2500);

      const formData = new FormData();
      formData.append('image', compressed, 'search.jpg');

      const res = await fetch('/api/search/visual', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      URL.revokeObjectURL(objectUrl);

      if (!res.ok || data.error) throw new Error(data.error || 'Erreur serveur');

      setDescription(data.description || '');

      if (data.products && data.products.length > 0) {
        setResults(data.products);
        setPhase('results');
        setStatusText(`Trouvé !`);
        if (onResultsFound) {
          setTimeout(() => { onResultsFound(data.products); onClose(); }, 900);
        }
      } else {
        setPhase('empty');
        setStatusText('Nous n\'avons pas trouvé d\'article identique pour le moment.');
      }
    } catch (err) {
      console.error('[VisualSearch]', err);
      setError('Oups, l\'analyse a échoué. Essayez de prendre une photo sous un autre angle.');
      setPhase('error');
    }
  }, [compressImage, onResultsFound, onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = '';
  };

  const resetSearch = () => {
    setImagePreview(null);
    setResults([]);
    setError(null);
    setDescription('');
    setPhase('ready');
  };

  // ── PHASE: READY ──
  if (phase === 'ready') {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0a1628]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0f1f35] border border-white/10 rounded-[30px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
          <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0f1f35] rounded-t-[30px] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BF953F] to-[#B38728] rounded-xl flex items-center justify-center shadow-lg shadow-amber-950/20">
                <ScanSearch size={20} className="text-slate-950" />
              </div>
              <h2 className="text-lg font-black text-white">Recherche par Photo</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400 hover:text-white">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 w-full">
            <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
              Prenez en photo un vêtement ou importez une image pour retrouver immédiatement des articles similaires dans les boutiques partenaires.
            </p>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-slate-950 p-8 rounded-[24px] shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-14 h-14 bg-slate-950/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Camera size={32} />
              </div>
              <h3 className="text-lg font-black mb-0.5">Prendre ou choisir une photo</h3>
              <p className="text-slate-900/60 text-[10px] font-bold uppercase tracking-wider">Appareil photo ou Galerie</p>
            </button>

            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: ANALYZING ──
  if (phase === 'analyzing') {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0a1628]/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0f1f35] border border-white/10 rounded-[30px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          
          {imagePreview && (
            <div className="w-48 h-48 rounded-[24px] overflow-hidden mb-6 border-2 border-white/10 shadow-lg relative">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Analyse" />
              {/* LASER SCANNER DE SCIENCE-FICTION (Balaye l'image de haut en bas) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCF6BA] to-transparent shadow-[0_0_15px_#BF953F] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          )}

          {/* Style d'animation de scanner et keyframes */}
          <style>{`
            @keyframes scan {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
          `}</style>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#BF953F] to-[#B38728] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles size={16} className="text-slate-950 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-white">Analyse en cours...</h3>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6 tracking-wide">{statusText}</p>
          
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 bg-[#BF953F] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: RESULTS ──
  if (phase === 'results') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-[40px] z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">{results.length} résultats</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X size={22} />
            </button>
          </div>

          {description && (
            <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2">
              <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-emerald-700 text-xs font-medium leading-relaxed">🔍 Pixtral a analysé : <em>"{description}"</em></p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {results.map((product) => (
              <div key={product.id} className="flex gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 line-clamp-2 text-sm">{product.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{product.store_name}</p>
                  <p className="text-base font-black text-emerald-600 mt-2">
                    {Math.round(product.price || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-[40px]">
            <button onClick={resetSearch} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-[16px] transition">
              Nouvelle recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: EMPTY / ERROR ──
  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl">
        <div className="w-20 h-20 bg-amber-100 rounded-[20px] flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-amber-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          {phase === 'error' ? 'Erreur' : 'Aucun résultat'}
        </h3>
        <p className="text-sm text-slate-600 font-medium mb-6">{error || statusText}</p>
        <div className="space-y-3 w-full">
          <button onClick={resetSearch} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-[16px] transition">
            Réessayer
          </button>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-[16px] transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
