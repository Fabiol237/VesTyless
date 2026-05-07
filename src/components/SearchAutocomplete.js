'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getSuggestions } from '@/lib/searchUtils';

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

      {showDropdown && (
        <div className={`absolute left-0 right-0 ${dropdownOffset} bg-white rounded-2xl shadow-2xl border border-neutral-100 z-[999] overflow-hidden max-h-80 overflow-y-auto`}>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50">
                {type}
              </div>
              {items.map((s) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <button
                    key={`${s.label}-${idx}`}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-neutral-50 last:border-0 transition-colors ${
                      highlighted === idx ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="text-base leading-none flex-shrink-0">{s.emoji || '🔍'}</span>
                    <span className="flex-1 text-sm font-semibold truncate">{s.label}</span>
                    {s.sublabel && (
                      <span className="text-xs text-neutral-400 truncate max-w-[100px]">{s.sublabel}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
