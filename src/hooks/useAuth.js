'use client';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, loading: false, profile: null, store: null };
  }
  return context;
}
