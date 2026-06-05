'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, X, Sparkles, ShoppingBag, Loader2, RefreshCw, Zap, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VestyleLens({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [foundProducts, setFoundProducts] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [error, setError] = useState(null);
  const [scanPulse, setScanPulse] = useState(false);
  
  const extractorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      initIA();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError("Caméra inaccessible. Vérifiez les permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const initIA = async () => {
    // Plus besoin d'init local (Xenova), on utilise l'API Cohere
    setLoadingIA(false);
  };

  useEffect(() => {
    let interval;
    if (isOpen && stream && !loadingIA && foundProducts.length === 0) {
      interval = setInterval(performScan, 3000); // Scan every 3s to save battery
    }
    return () => clearInterval(interval);
  }, [isOpen, stream, loadingIA, foundProducts]);

  const performScan = async () => {
    if (!videoRef.current || scanning) return;

    setScanning(true);
    setScanPulse(true);
    setTimeout(() => setScanPulse(false), 500);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 224, 224);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Erreur de capture d'image");

      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      const res = await fetch('/api/search/visual', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success && result.products && result.products.length > 0) {
        setFoundProducts(result.products);
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]); // Powerful vibration pattern
      }
    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-black flex flex-col font-sans overflow-hidden">
      {/* HUD HEADER */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ${scanning ? 'bg-wa-teal shadow-[0_0_20px_#22c55e]' : 'bg-white/10'}`}>
            <Zap size={24} className={scanning ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-tight uppercase leading-none mb-1">Vestyle Lens <span className="text-wa-teal text-[10px] bg-wa-teal/20 px-2 py-0.5 rounded-full ml-2">PRO</span></h2>
            <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">Intelligence Visuelle Active</p>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md transition-all">
          <X size={24} />
        </button>
      </div>

      {/* SCANNER VIEWPORT */}
      <div className="flex-1 relative flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {/* Futuristic HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20">
           <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-wa-teal rounded-tl-3xl opacity-50" />
           <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-wa-teal rounded-tr-3xl opacity-50" />
           <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-wa-teal rounded-bl-3xl opacity-50" />
           <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-wa-teal rounded-br-3xl opacity-50" />
        </div>

        {/* Dynamic Scanning Circle */}
        <AnimatePresence>
          {!foundProducts.length && (
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-72 h-72 rounded-full border-2 border-dashed border-wa-teal/40 flex items-center justify-center"
               >
                  <div className={`w-64 h-64 rounded-full border-4 border-wa-teal transition-all duration-300 ${scanPulse ? 'scale-95 opacity-100 shadow-[0_0_50px_#22c55e]' : 'scale-100 opacity-20'}`} />
               </motion.div>
               <div className="absolute bottom-1/4 flex flex-col items-center">
                  <div className="flex gap-2 mb-4">
                     {[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i*0.3 }} className="w-1.5 h-1.5 bg-wa-teal rounded-full" />)}
                  </div>
                  <p className="text-wa-teal font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Scanning...</p>
               </div>
            </div>
          )}
        </AnimatePresence>

        {/* RESULTS POWER-LIST */}
        <AnimatePresence>
          {foundProducts.length > 0 && (
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="absolute bottom-12 left-0 right-0 px-6 z-30"
            >
              <div className="max-w-md mx-auto space-y-3">
                 <div className="flex items-center justify-between px-4">
                    <p className="text-[10px] font-black text-wa-teal uppercase tracking-widest bg-wa-teal/20 px-3 py-1 rounded-full">3 Matches trouvés</p>
                    <button onClick={() => setFoundProducts([])} className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Re-scanner <RefreshCw size={12}/></button>
                 </div>
                 
                 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {foundProducts.map((p, idx) => (
                      <motion.div 
                        key={p.id}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="shrink-0 w-[280px] bg-white rounded-[2rem] p-4 flex items-center gap-4 shadow-2xl border-2 border-wa-teal"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                          <img src={p.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-sm truncate">{p.name}</h3>
                          <p className="text-lg font-black text-wa-teal">{Number(p.price).toLocaleString()} F</p>
                          <a href={`/produit/${p.id}`} className="mt-2 inline-flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-wa-teal transition-colors">Détails <ShoppingBag size={10}/></a>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING / ERROR */}
        {loadingIA && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-white z-50">
            <Loader2 size={48} className="animate-spin text-wa-teal mb-6" />
            <h3 className="text-xl font-black tracking-tighter uppercase">Cerveau IA Vestyle</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Chargement de la vision par ordinateur...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
