'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vestyle_user_prefs';

export function useUserPreferences() {
  const [prefs, setPrefs] = useState({
    history: [],
    favorites: [],
    searches: []
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse user prefs", e);
      }
    }
  }, []);

  // Save to localStorage
  const save = useCallback((newPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
  }, []);

  const addToHistory = useCallback((product) => {
    const newHistory = [
      product,
      ...prefs.history.filter(p => p.id !== product.id)
    ].slice(0, 10); // Keep last 10
    save({ ...prefs, history: newHistory });
  }, [prefs, save]);

  const toggleFavorite = useCallback((store) => {
    const isFav = prefs.favorites.some(s => s.id === store.id);
    const newFavs = isFav 
      ? prefs.favorites.filter(s => s.id !== store.id)
      : [store, ...prefs.favorites].slice(0, 10);
    save({ ...prefs, favorites: newFavs });
  }, [prefs, save]);

  const addSearch = useCallback((query) => {
    if (!query.trim()) return;
    const newSearches = [
      query.trim(),
      ...prefs.searches.filter(s => s !== query.trim())
    ].slice(0, 5);
    save({ ...prefs, searches: newSearches });
  }, [prefs, save]);

  const clearAll = useCallback(() => {
    save({ history: [], favorites: [], searches: [] });
  }, [save]);

  return {
    ...prefs,
    addToHistory,
    toggleFavorite,
    addSearch,
    clearAll
  };
}
