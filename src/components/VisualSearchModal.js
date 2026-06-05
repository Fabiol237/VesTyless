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

  const cameraInputRef = useRef(null);
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
    setStatusText('Compression de l\'image…');

    try {
      const compressed = await compressImage(file);
      const objectUrl = URL.createObjectURL(compressed);
      setImagePreview(objectUrl);

      setStatusText('Gemini analyse votre image…');

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
        setStatusText(`✅ ${data.products.length} produit(s) trouvé(s)!`);
        if (onResultsFound) {
          setTimeout(() => { onResultsFound(data.products); onClose(); }, 900);
        }
      } else {
        setPhase('empty');
        setStatusText('Aucun produit similaire trouvé.');
      }
    } catch (err) {
      console.error('[VisualSearch]', err);
      setError('Erreur lors de l\'analyse. Essayez avec une photo plus nette.');
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
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-[40px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <ScanSearch size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Recherche Visuelle IA</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8">
            {/* Badge Gemini */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-4 py-2">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-blue-700 text-xs font-bold">Propulsé par Google Gemini AI</span>
            </div>

            <p className="text-sm text-slate-500 font-medium text-center leading-relaxed">
              📸 Photographiez ou importez un article → Gemini l'analyse et trouve les produits similaires <strong>instantanément</strong>.
            </p>

            {/* Bouton caméra */}
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
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-5 rounded-[24px] border-2 border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-3 font-black"
            >
              <ImageIcon className="text-emerald-500" size={22} />
              <span>Choisir depuis la galerie</span>
            </button>

            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: ANALYZING ──
  if (phase === 'analyzing') {
    return (
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md p-8 flex flex-col items-center text-center shadow-2xl">
          {imagePreview && (
            <div className="w-48 h-48 rounded-[28px] overflow-hidden mb-6 border-4 border-slate-100 shadow-lg relative">
              <img src={imagePreview} className="w-full h-full object-cover" alt="Analyse" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="text-white animate-spin" size={36} />
                  <span className="text-white text-xs font-bold bg-black/30 px-3 py-1 rounded-full">Gemini analyse…</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Analyse IA…</h3>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6">{statusText}</p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-5 bg-slate-50 px-4 py-2 rounded-full">
            Aucun téléchargement requis — 100% cloud
          </p>
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
              <p className="text-blue-700 text-xs font-medium leading-relaxed">Gemini a détecté : <em>"{description}"</em></p>
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
