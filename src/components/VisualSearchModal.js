'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Loader2, Image as ImageIcon, ScanSearch, AlertCircle, CheckCircle2, Sparkles, SwitchCamera } from 'lucide-react';

export default function VisualSearchModal({ onClose, onResultsFound }) {
  const [phase, setPhase] = useState('ready'); // ready | camera | analyzing | results | empty | error
  const [statusText, setStatusText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  
  // Caméra Web en direct
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' ou 'environment'
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Arrêter le flux de la caméra
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Démarrer la caméra
  const startCamera = useCallback(async (mode = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setPhase('camera');
    } catch (err) {
      console.error('[Camera Access Error]', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez vos permissions ou importez une photo.');
      setPhase('ready');
    }
  }, [facingMode, stopCamera]);

  // Nettoyer la caméra au démontage
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Permuter entre caméra avant/arrière
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Prendre la photo depuis le canvas en direct
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Obtenir les dimensions réelles de la vidéo
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      // Dessiner l'image courante
      ctx.drawImage(video, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          stopCamera();
          processImageBlob(blob);
        }
      }, 'image/jpeg', 0.85);
    } catch (err) {
      console.error('[Capture Photo Error]', err);
      setError('Erreur lors de la capture de l\'image.');
      setPhase('error');
    }
  };

  // Compression côté client
  const compressImage = useCallback(async (fileOrBlob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileOrBlob);
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

  const processImageBlob = async (blob) => {
    setError(null);
    setPhase('analyzing');
    setStatusText('Téléchargement de votre photo en cours...');

    try {
      const compressed = await compressImage(blob);
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageBlob(file);
    e.target.value = '';
  };

  const resetSearch = () => {
    stopCamera();
    setImagePreview(null);
    setResults([]);
    setError(null);
    setDescription('');
    setPhase('ready');
  };

  // Close et s'assurer que la caméra s'éteint
  const handleClose = () => {
    stopCamera();
    onClose();
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
            <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400 hover:text-white">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 w-full">
            {cameraError && (
              <div className="w-full p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex gap-2 text-red-200 text-xs font-semibold leading-relaxed">
                <AlertCircle className="shrink-0 text-red-400" size={16} />
                <span>{cameraError}</span>
              </div>
            )}

            <p className="text-sm text-slate-400 font-medium text-center leading-relaxed">
              Prenez en photo un vêtement ou importez une image pour retrouver immédiatement des articles similaires dans les boutiques partenaires.
            </p>

            {/* Bouton Ouvrir caméra Web */}
            <button
              onClick={() => startCamera()}
              className="w-full bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-slate-950 p-8 rounded-[24px] shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-14 h-14 bg-slate-950/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Camera size={32} />
              </div>
              <h3 className="text-lg font-black mb-0.5">Ouvrir la caméra</h3>
              <p className="text-slate-900/60 text-[10px] font-bold uppercase tracking-wider">Prendre une photo en direct</p>
            </button>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ou</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full bg-white/5 hover:bg-white/10 text-white p-4.5 rounded-[18px] border border-white/10 hover:border-[#BF953F]/40 transition-all flex items-center justify-center gap-3 font-bold text-sm"
            >
              <ImageIcon className="text-[#BF953F]" size={20} />
              <span>Choisir depuis la galerie</span>
            </button>

            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: CAMERA (Caméra Web HTML5 en direct) ──
  if (phase === 'camera') {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex flex-col justify-between">
        {/* Header caméra */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
          <button onClick={resetSearch} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            <X size={24} />
          </button>
          <span className="text-white text-sm font-black tracking-widest uppercase">CAMÉRA EN DIRECT</span>
          <button onClick={toggleCamera} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
            <SwitchCamera size={24} />
          </button>
        </div>

        {/* Zone de la vidéo en direct */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover max-w-lg"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          
          {/* Viseur de ciblage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-dashed border-[#FCF6BA] rounded-[40px] opacity-40 shadow-[0_0_20px_rgba(191,149,63,0.3)]"></div>
          </div>
        </div>

        {/* Contrôles bas de la caméra */}
        <div className="p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center gap-4 z-10">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-[6px] border-white/30 flex items-center justify-center active:scale-95 transition-all shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#BF953F] to-[#B38728] flex items-center justify-center text-slate-950">
              <Camera size={26} />
            </div>
          </button>
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Prendre la photo</span>
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
              {/* LASER SCANNER */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FCF6BA] to-transparent shadow-[0_0_15px_#BF953F] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          )}

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
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X size={22} />
            </button>
          </div>

          {description && (
            <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2">
              <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-emerald-700 text-xs font-medium leading-relaxed">🔍 Analyse : <em>"{description}"</em></p>
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
          <button onClick={handleClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-[16px] transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
