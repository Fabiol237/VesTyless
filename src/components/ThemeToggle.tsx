'use client';

/**
 * VesTyle V1 — ThemeToggle
 * Bouton compact pour basculer entre le thème sombre et le thème clair.
 * S'intègre dans n'importe quelle topbar ou sidebar.
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/core/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-xl
        border transition-all duration-300 select-none
        ${isDark
          ? 'bg-[#162032] border-[#1E293B] text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white hover:border-[#334155]'
          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] hover:border-[#CBD5E1]'
        }
        ${className}
      `}
    >
      {/* Piste du toggle */}
      <div className={`
        relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0
        ${isDark ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}
      `}>
        {/* Poignée glissante */}
        <div className={`
          absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
          ${isDark
            ? 'translate-x-[18px] bg-[#334155]'
            : 'translate-x-0.5 bg-white'
          }
        `}>
          {isDark
            ? <Moon className="w-2.5 h-2.5 text-[#94A3B8]" />
            : <Sun className="w-2.5 h-2.5 text-[#F59E0B]" />
          }
        </div>
      </div>

      <span className="text-xs font-semibold whitespace-nowrap hidden sm:block">
        {isDark ? 'Sombre' : 'Clair'}
      </span>
    </button>
  );
}
