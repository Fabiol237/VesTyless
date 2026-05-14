'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Check, ChevronDown, Loader2 } from 'lucide-react';

export default function CategorySearch({ selectedId, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Récupérer le nom de la catégorie sélectionnée au chargement
  useEffect(() => {
    if (selectedId) {
      supabase.from('global_categories').select('name').eq('id', selectedId).single()
        .then(({ data }) => {
          if (data) setSelectedName(data.name);
        }).catch(err => console.warn("Table global_categories non prête"));
    }
  }, [selectedId]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('global_categories')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .limit(10);
        
        if (!error && data) setResults(data);
      } catch (e) {
        console.warn("Recherche catégorie indisponible");
      }
      setLoading(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-wa-teal transition-colors"
      >
        <span className={selectedName ? 'text-neutral-900 font-bold' : 'text-neutral-400'}>
          {selectedName || 'Rechercher une catégorie...'}
        </span>
        <ChevronDown size={18} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-neutral-100 flex items-center gap-2">
            <Search size={16} className="text-neutral-400" />
            <input 
              autoFocus
              className="flex-1 text-sm outline-none bg-transparent"
              placeholder="Tapez (ex: Chemise, Robe...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <Loader2 size={14} className="animate-spin text-wa-teal" />}
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {results.length > 0 ? (
              results.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => {
                    onSelect(cat.id, cat.name);
                    setSelectedName(cat.name);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-neutral-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  {selectedId === cat.id && <Check size={16} className="text-wa-teal" />}
                </div>
              ))
            ) : query.length >= 2 ? (
              <div className="px-4 py-8 text-center text-neutral-400 text-sm italic">
                Aucune catégorie correspondante...
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-neutral-400 text-sm">
                Commencez à taper pour chercher
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
