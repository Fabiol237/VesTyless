'use client';
import { useState } from 'react';
import {
  Move, AlignLeft, AlignCenter, AlignRight, LayoutGrid,
  Sparkles, Layers, Box, Wrench, Zap, Check, Eye
} from 'lucide-react';

export default function StoreSpatialTab({ formData, onChange, onConfigChange }) {
  const layoutConfig = formData.layout_config || {};
  const spatial = layoutConfig.spatial || {
    logoPosition: 'left', // 'left' | 'center' | 'right' | 'floating'
    heroStyle: 'split',    // 'full' | 'split' | 'minimal' | 'carousel'
    gridStyle: 'grid_2',   // 'grid_2' | 'grid_3' | 'hscroll' | 'list'
    cardRadius: 'rounded', // 'sharp' | 'rounded' | 'pill'
    visualStyle: 'glass',  // 'glass' | 'minimal' | 'brutalist' | 'neon' | 'gold'
    businessType: 'hybrid', // 'products' | 'services' | 'hybrid'
  };

  const activeBlocks = layoutConfig.active_blocks || {
    hero: true,
    catalog: true,
    booking: spatial.businessType !== 'products',
    reviews: true,
    hours: true,
    faq: true,
    gallery: true,
  };

  const handleSpatialUpdate = (key, value) => {
    const updatedSpatial = {
      ...spatial,
      [key]: value,
    };
    const updatedConfig = {
      ...layoutConfig,
      spatial: updatedSpatial,
    };

    if (key === 'businessType') {
      updatedConfig.active_blocks = {
        ...activeBlocks,
        booking: value !== 'products',
        catalog: true,
      };
    }

    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }
  };

  const handleBlockToggle = (blockKey) => {
    const updatedBlocks = {
      ...activeBlocks,
      [blockKey]: !activeBlocks[blockKey],
    };
    if (onConfigChange) {
      onConfigChange({
        ...layoutConfig,
        active_blocks: updatedBlocks,
      });
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Typologie Métier : Produits, Services ou Hybride */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#059669]">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Typologie de Vente</h3>
            <p className="text-xs text-gray-400 font-medium">Vendez-vous des articles physiques, des prestations de services, ou les deux ?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'products', label: 'Produits Uniquement', desc: 'Catalogue, stock, variantes & panier', icon: Box, color: 'text-blue-500', bg: 'bg-blue-50' },
            { id: 'services', label: 'Services Uniquement', desc: 'Prestations, durées, devis & réservations', icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-50' },
            { id: 'hybrid', label: 'Hybride (Les Deux)', desc: 'Produits + Réservation de prestations', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map((type) => {
            const isSelected = (spatial.businessType || 'hybrid') === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleSpatialUpdate('businessType', type.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${type.bg} ${type.color}`}>
                    <Icon size={18} />
                  </div>
                  {isSelected && <Check size={16} className="text-emerald-600" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{type.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{type.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Disposition Spatiale du Logo & En-Tête (Header) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <Move size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Position Spatiale du Logo & Header</h3>
            <p className="text-xs text-gray-400 font-medium">Glissez ou alignez l'en-tête de votre marque.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'left', label: 'À Gauche', icon: AlignLeft, desc: 'Classique & E-Commerce' },
            { id: 'center', label: 'Au Centre', icon: AlignCenter, desc: 'Lookbook & Luxe' },
            { id: 'right', label: 'À Droite', icon: AlignRight, desc: 'Asymétrique & Moderne' },
            { id: 'floating', label: 'Barre Flottante', icon: Sparkles, desc: 'Translucide & Moderne' },
          ].map((pos) => {
            const isSelected = (spatial.logoPosition || 'left') === pos.id;
            const Icon = pos.icon;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => handleSpatialUpdate('logoPosition', pos.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} className={isSelected ? 'text-emerald-600' : 'text-gray-400'} />
                  {isSelected && <Check size={14} className="text-emerald-600" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{pos.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{pos.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Disposition du Catalogue & Grille de Produits / Prestations */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Format de Grille & Affichage</h3>
            <p className="text-xs text-gray-400 font-medium">Choisissez la mise en page de vos articles et prestations.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'grid_2', label: 'Grille 2 Colonnes', desc: 'Standard mobile épuré' },
            { id: 'grid_3', label: 'Grille 3 Colonnes', desc: 'Haute densité d\'articles' },
            { id: 'hscroll', label: 'Scroll Horizontal', desc: 'Style Lookbook / Stories' },
            { id: 'list', label: 'Liste Fiches Menu', desc: 'Idéal Restaurants & Services' },
          ].map((grid) => {
            const isSelected = (spatial.gridStyle || 'grid_2') === grid.id;
            return (
              <button
                key={grid.id}
                type="button"
                onClick={() => handleSpatialUpdate('gridStyle', grid.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-gray-700">{grid.label.split(' ')[0]}</span>
                  {isSelected && <Check size={14} className="text-emerald-600" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{grid.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{grid.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Rayon des Bordures & Finitions Graphiques */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Finitions Graphiques & Rayons</h3>
            <p className="text-xs text-gray-400 font-medium">Déterminez le degré d'arrondi des cartes et l'effet de texture.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Rayon des cartes</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'sharp', label: 'Angles Vifs (0px)', preview: 'rounded-none' },
                { id: 'rounded', label: 'Arrondis Doux (16px)', preview: 'rounded-2xl' },
                { id: 'pill', label: 'Capsules Pill (32px)', preview: 'rounded-[32px]' },
              ].map((radius) => {
                const isSelected = (spatial.cardRadius || 'rounded') === radius.id;
                return (
                  <button
                    key={radius.id}
                    type="button"
                    onClick={() => handleSpatialUpdate('cardRadius', radius.id)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 border-2 border-slate-700 bg-white ${radius.preview}`} />
                    <p className="text-xs font-black text-gray-900">{radius.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-50">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Effet de Texture & Reflet</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'glass', label: 'Glassmorphism', desc: 'Verre fumé' },
                { id: 'minimal', label: 'Minimaliste', desc: 'Ultra épuré' },
                { id: 'brutalist', label: 'Brutalisme', desc: 'Contour marqué' },
                { id: 'neon', label: 'Cyber Néon', desc: 'Lueur luminescente' },
                { id: 'gold', label: 'Or Shimmer', desc: 'Reflet doré' },
              ].map((v) => {
                const isSelected = (spatial.visualStyle || 'glass') === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSpatialUpdate('visualStyle', v.id)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <p className="text-xs font-black text-gray-900">{v.label}</p>
                    <p className="text-[9px] text-gray-400 font-semibold">{v.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Blocs Modulaires Actifs */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-500">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Blocs & Sections Actives</h3>
            <p className="text-xs text-gray-400 font-medium">Activez ou masquez les sections de votre vitrine selon vos besoins.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'hero', label: 'Bannière d\'En-Tête Hero', desc: 'Accroche principale et bouton d\'action' },
            { id: 'catalog', label: 'Grille Catalogue / Prestations', desc: 'Affichage des produits et services' },
            { id: 'booking', label: 'Module de Réservation & Devis', desc: 'Formulaire de prise de rendez-vous' },
            { id: 'reviews', label: 'Témoignages & Avis Clients', desc: 'Preuve sociale et notes de satisfaction' },
            { id: 'hours', label: 'Horaires & Disponibilités', desc: 'Statut ouvert/fermé en direct' },
            { id: 'gallery', label: 'Galerie Photos / Réalisations', desc: 'Photos d\'ambiance et savoir-faire' },
            { id: 'faq', label: 'Foire Aux Questions (FAQ)', desc: 'Réponses instantanées aux clients' },
          ].map((block) => {
            const isEnabled = activeBlocks[block.id] !== false;
            return (
              <label
                key={block.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isEnabled ? 'border-emerald-500/60 bg-emerald-50/10' : 'border-gray-100 bg-gray-50/40 opacity-60'
                }`}
              >
                <div>
                  <p className="text-xs font-black text-gray-900">{block.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{block.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => handleBlockToggle(block.id)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
