'use client';
import { useState } from 'react';
import { THEMES } from '@/app/boutique/[slug]/themes/index';
import { CheckCircle2, Eye, Palette } from 'lucide-react';

/**
 * ThemePicker — Composant sélecteur de thème de boutique.
 * 
 * Props:
 *   value: string — ID du thème actuel (ex: 'theme_01')
 *   onChange: (themeId: string) => void
 */
export default function ThemePicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const currentTheme = THEMES.find(t => t.id === value) || THEMES[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, background: '#F1F5F9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Palette size={20} color="#64748B" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0F172A' }}>Thème de votre boutique</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
            Actif : <strong style={{ color: '#0F172A' }}>{currentTheme.emoji} {currentTheme.name}</strong>
          </p>
        </div>
      </div>

      {/* Grid of themes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {THEMES.map(theme => {
          const isActive = value === theme.id;
          const isHovered = hovered === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                border: isActive ? `2px solid ${theme.primaryColor}` : '2px solid #E2E8F0',
                borderRadius: 16,
                padding: 0,
                cursor: 'pointer',
                background: '#fff',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                transform: isHovered && !isActive ? 'translateY(-3px)' : 'none',
                boxShadow: isActive
                  ? `0 8px 32px ${theme.primaryColor}33`
                  : isHovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              {/* Active checkmark */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 10,
                  width: 24, height: 24, background: theme.primaryColor,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 8px ${theme.primaryColor}66`
                }}>
                  <CheckCircle2 size={14} color="#fff" />
                </div>
              )}

              {/* Color preview banner */}
              <div style={{
                height: 72,
                background: theme.previewGradient,
                borderRadius: '14px 14px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <span style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{theme.emoji}</span>
                {/* subtle pattern overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 12px)'
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{theme.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 10 }}>
                  {theme.description}
                </p>
                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {theme.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      background: `${theme.primaryColor}15`,
                      color: theme.primaryColor,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 20,
                      border: `1px solid ${theme.primaryColor}30`
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Active bar at bottom */}
              {isActive && (
                <div style={{ height: 4, background: theme.primaryColor, borderRadius: '0 0 14px 14px' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Ideal for info */}
      {currentTheme && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Eye size={16} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idéal pour : </span>
            <span style={{ fontSize: 12, color: '#0F172A' }}>{currentTheme.idealFor}</span>
          </div>
        </div>
      )}
    </div>
  );
}
