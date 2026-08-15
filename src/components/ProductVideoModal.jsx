'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { triggerSuccessPop } from '@/lib/confetti';

export default function ProductVideoModal({ product, isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const videoRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setIsPlaying(true);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // URL vidéo fiable (ou image du produit si la vidéo ne charge pas)
  const videoSrc = product.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const imageUrl = product.image_url || product.images?.[0] || '/placeholder-product.png';

  const togglePlay = () => {
    if (videoRef.current && !hasError) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const promise = videoRef.current.play();
        if (promise !== undefined) {
          promise
            .then(() => setIsPlaying(true))
            .catch(() => {
              setIsPlaying(false);
              setHasError(true);
            });
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setAdded(true);
    triggerSuccessPop();
    setTimeout(() => setAdded(false), 2000);
  };

  const currencyFmt = (val) => new Intl.NumberFormat('fr-FR').format(Number(val || 0)) + ' FCFA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* En-tête / Bouton Fermer */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {!hasError && (
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-xl font-bold hover:bg-black/80 transition-all backdrop-blur-sm"
          >
            ✕
          </button>
        </div>

        {/* Tag Badge Vidéo 15s */}
        <div className="absolute top-4 left-4 z-20 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          🎥 Démo Direct 15s
        </div>

        {/* Reader Vidéo / Fallback Image HD */}
        <div className="relative w-full h-[380px] bg-black cursor-pointer overflow-hidden flex items-center justify-center" onClick={togglePlay}>
          {!hasError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onError={() => setHasError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 max-w-[80%]">
                  <span className="text-2xl mb-1 block">🖼️</span>
                  <p className="text-xs font-bold text-slate-200">Aperçu HD du Magasin</p>
                  <p className="text-[10px] text-slate-400 mt-1">Démonstration vidéo bientôt disponible</p>
                </div>
              </div>
            </div>
          )}

          {!isPlaying && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white text-3xl flex items-center justify-center pl-1 shadow-2xl animate-pulse">
                ▶
              </div>
            </div>
          )}
        </div>

        {/* Contenu Produit sous la vidéo */}
        <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white space-y-4">
          <div>
            <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">
              {product.category || 'Article Sélectionné'}
            </span>
            <h3 className="text-lg font-bold text-slate-100 line-clamp-1 mt-0.5">
              {product.name}
            </h3>
            <p className="text-xl font-extrabold text-blue-400 mt-1">
              {currencyFmt(product.price)}
            </p>
          </div>

          {/* Sélecteur de quantité & Ajout Panier */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl">
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white font-bold text-lg"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
                className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white font-bold text-lg"
              >
                +
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40'
              }`}
            >
              {added ? '✓ Ajouté au Panier !' : '🛒 Ajouter au Panier'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
