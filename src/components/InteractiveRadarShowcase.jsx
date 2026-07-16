'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { MapPin, Navigation, Compass, Store, RefreshCw, Smartphone } from 'lucide-react';

export default function InteractiveRadarShowcase() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('idle'); // 'idle', 'scanning', 'completed'
  const [storesFound, setStoresFound] = useState([]);

  // 3D Tilt Mockup Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [10, -10]), { damping: 25, stiffness: 120 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-10, 10]), { damping: 25, stiffness: 120 });

  const mockStores = [
    { name: 'Glow Mode Douala', dist: '250m', type: 'Mode & Beauté', x: 40, y: 35 },
    { name: 'Krystal Supermarché', dist: '700m', type: 'Alimentation & Supermarché', x: -55, y: -40 },
    { name: 'Douala High-Tech', dist: '1.2km', type: 'Électronique & High-Tech', x: 60, y: -65 },
  ];

  const startRadarScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep('scanning');
    setStoresFound([]);

    setTimeout(() => {
      setScanStep('completed');
      setIsScanning(false);
      setStoresFound(mockStores);
    }, 2500);
  };

  return (
    <div className="relative w-full h-[550px] flex items-center justify-center">
      {/* Background ambient circular glow behind smartphone */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

      {/* Floating Interactive Smartphone Mockup */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-72 h-[500px] bg-slate-950 border-4 border-slate-800 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden p-3 cursor-pointer select-none group"
      >
        {/* Glass glare effect layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-30 rounded-[2.7rem]" />

        {/* Dynamic Island Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center z-40">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-2 animate-pulse" />
          <div className="w-12 h-1 bg-slate-950 rounded-full" />
        </div>

        {/* Phone screen container */}
        <div className="relative flex-1 w-full h-full rounded-[2.3rem] overflow-hidden bg-slate-900 flex flex-col border border-slate-800">
          {/* Futuristic matrix background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#25d366_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

          {/* Top Info Bar */}
          <div className="relative z-10 w-full pt-8 px-5 flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span>DLA-NET // 5G</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" /> LAT: 4.0511° N
            </span>
          </div>

          {/* MAIN RADAR GRAPH DISPLAY */}
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
            {/* Concentric Radar Rings */}
            <div className="absolute w-48 h-48 border border-emerald-500/20 rounded-full flex items-center justify-center">
              <div className="absolute w-36 h-36 border border-emerald-500/15 rounded-full flex items-center justify-center">
                <div className="absolute w-24 h-24 border border-emerald-500/10 rounded-full flex items-center justify-center">
                  <div className="absolute w-12 h-12 border border-emerald-500/5 rounded-full" />
                </div>
              </div>
            </div>

            {/* Radar Crosshairs */}
            <div className="absolute w-56 h-[1px] bg-emerald-500/10" />
            <div className="absolute h-56 w-[1px] bg-emerald-500/10" />

            {/* Sweeping Radar Scanner Line */}
            {scanStep === 'scanning' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-48 h-48 rounded-full origin-center pointer-events-none z-10"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(37,211,102,0.15) 0deg, rgba(37,211,102,0) 90deg)',
                }}
              />
            )}

            {/* Glowing Center Proximity Anchor */}
            <div className="relative z-20 flex items-center justify-center">
              <div className="absolute w-6 h-6 bg-[#25d366]/20 rounded-full animate-ping" />
              <div className="w-3 h-3 bg-[#25d366] rounded-full border border-white shadow-[0_0_10px_#25d366] z-10" />
            </div>

            {/* Simulated Live Ticking Coordinates */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-20">
              <p className="font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-widest">
                {scanStep === 'idle' && 'PRÊT POUR LE DEPISTAGE'}
                {scanStep === 'scanning' && 'BALAYAGE RADAR EN COURS...'}
                {scanStep === 'completed' && 'CONNEXIONS ÉTABLIES'}
              </p>
            </div>

            {/* Glowing store nodes mapped after scan */}
            <AnimatePresence>
              {scanStep === 'completed' &&
                storesFound.map((store, i) => (
                  <motion.div
                    key={store.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.3, type: "spring", stiffness: 200 }}
                    className="absolute z-20 flex flex-col items-center"
                    style={{
                      transform: `translate(${store.x}px, ${store.y}px)`,
                    }}
                  >
                    {/* Beam connector line to center anchor */}
                    <svg className="absolute overflow-visible pointer-events-none opacity-50" style={{ transform: 'translate(0, 0)' }}>
                      <line
                        x1={0}
                        y1={0}
                        x2={-store.x}
                        y2={-store.y}
                        stroke="#25d366"
                        strokeWidth="0.8"
                        strokeDasharray="4 4"
                      />
                    </svg>

                    {/* Glowing Pin */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-4 h-4 bg-emerald-400/30 rounded-full animate-ping" />
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-[0_0_8px_#25d366]" />
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* LOWER CARDS & ACTION CONTROLLER */}
          <div className="relative z-20 p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md rounded-b-[2.3rem] min-h-[140px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {scanStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Découvrez les commerces les plus proches de vous
                  </p>
                  <button
                    onClick={startRadarScan}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full"
                  >
                    Lancer le scan
                  </button>
                </motion.div>
              )}

              {scanStep === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-mono text-emerald-400 font-black tracking-widest uppercase animate-pulse">
                    RECHERCHE DE SIGNAUX...
                  </span>
                </motion.div>
              )}

              {scanStep === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col gap-2.5"
                >
                  {/* Swipable layout showing nearby stores list */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {storesFound.map((store, i) => (
                      <motion.div
                        key={store.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex-shrink-0 w-32 bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col justify-between h-20"
                      >
                        <div>
                          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 truncate uppercase tracking-tighter">
                            <Store size={8} className="text-emerald-500" />
                            {store.type.split(' ')[0]}
                          </div>
                          <h4 className="text-[9px] font-black text-white truncate mt-1 leading-tight">{store.name}</h4>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-mono text-emerald-400 font-bold">
                          <span>📍 PROCHE</span>
                          <span>{store.dist}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={startRadarScan}
                    className="flex items-center justify-center gap-1.5 py-2 border border-slate-800 hover:border-[#25d366]/40 rounded-xl text-slate-400 hover:text-white font-mono text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    <RefreshCw size={8} /> Scanner à nouveau
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
