'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getSuggestions } from '@/lib/searchUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutGrid, Store, ShoppingBag, Search } from 'lucide-react';

/**
 * Composant de recherche avec autocomplétion intelligente :
 * - Insensible aux accents (robe = robé = Robe)
 * - Tolérance aux fautes de frappe
 * - Navigation clavier (↑↓ Enter Escape)
 * - Suggestions groupées par type
 */
export default function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  onSubmit,
  suggestions = [],
  placeholder = 'Rechercher...',
  maxSuggestions = 7,
  className = '',
  inputClassName = '',
  dropdownOffset = 'mt-2',
  children, // éléments à droite de l'input (icône voix, etc.)
  leftIcon = null,
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);

  const filtered = useMemo(
    () => getSuggestions(value, suggestions, maxSuggestions),
    [value, suggestions, maxSuggestions]
  );

  useEffect(() => { setHighlighted(-1); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      if (open && highlighted >= 0 && filtered.length > 0) {
        e.preventDefault();
        selectSuggestion(filtered[highlighted]);
      } else {
        setOpen(false);
        onSubmit?.(value);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  const selectSuggestion = (s) => {
    onChange(s.value);
    onSelect?.(s);
    setOpen(false);
    setHighlighted(-1);
  };

  const showDropdown = open && filtered.length > 0;

  // Grouper les suggestions par type pour un affichage propre
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const type = s.type || 'Autre';
      if (!groups[type]) groups[type] = [];
      groups[type].push(s);
    });
    return groups;
  }, [filtered]);

  let globalIdx = -1;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { if (value) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
          autoComplete="off"
          spellCheck="false"
        />
        {children}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute left-0 right-0 ${dropdownOffset} bg-white rounded-3xl shadow-2xl border border-neutral-100 z-[999] overflow-hidden max-h-96 overflow-y-auto document-shadow`}
          >
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="px-5 pt-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50/50 flex items-center justify-between">
                  {type}
                  <div className="h-px bg-slate-200 flex-1 ml-4 opacity-50" />
                </div>
                {items.map((s) => {
                  globalIdx++;
                  const idx = globalIdx;
                  return (
                    <button
                      key={`${s.label}-${idx}`}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                      className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all ${
                        highlighted === idx ? 'bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500' : 'hover:bg-slate-50 text-slate-700 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 bg-slate-100/50 rounded-2xl flex items-center justify-center text-slate-500 shadow-sm">
                        {type === 'Catégorie' ? <LayoutGrid size={18} /> :
                         type === 'Boutique' ? <Store size={18} /> :
                         type === 'Produit' ? <ShoppingBag size={18} /> :
                         <Search size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate tracking-tight">{s.label}</p>
                        {s.sublabel && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">{s.sublabel}</p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 text-emerald-500">
                        <ArrowLeft className="rotate-180" size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
