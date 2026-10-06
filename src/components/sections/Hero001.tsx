'use client';
import React from 'react';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { SectionComponentProps } from '../registry/SectionRegistry';

/**
 * Hero001 — Section Hero principale VesTyle
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX DT-07 : Variables CSS alignées sur le standard du renderer universel.
 * - var(--vst-radius-btn) → var(--btn-radius, 12px)
 * - var(--vst-radius-card) → var(--card-radius, 16px)
 * - var(--vst-font) → var(--font)
 */
export function Hero001({ content, metadata, styles, theme }: SectionComponentProps) {
  const storeName = String((metadata as any)?.name || metadata.slogan || 'Bienvenue dans notre boutique');
  const title = String(content.title || metadata.slogan || storeName);
  const subtitle = String(content.subtitle || metadata.description || 'Commandes directes et service personnalisé.');
  const ctaText = String(content.ctaText || 'Commander sur WhatsApp');
  const badgeText = String(content.badgeText || '✨ Boutique Officielle');
  const coverUrl = String(content.coverUrl || metadata.coverUrl || '');
  const whatsapp = String(metadata.whatsapp || metadata.phone || '').replace(/\D/g, '');

  const handleWhatsAppClick = () => {
    if (whatsapp && typeof window !== 'undefined') {
      const message = encodeURIComponent(`Bonjour ${(metadata as any)?.name || 'VesTyle'}, je visite votre boutique et je souhaite passer commande.`);
      window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    }
  };

  return (
    <section
      className="w-full relative overflow-hidden transition-colors"
      style={{
        paddingTop: (styles.paddingTop as string | number) ?? '64px',
        paddingBottom: (styles.paddingBottom as string | number) ?? '72px',
        backgroundColor: (styles.backgroundColor as string) || 'transparent',
      }}
    >
      {/* Fond Décoratif Subtil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${theme.primaryColor}22 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Badge d'Accroche */}
        {badgeText && (
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-md shadow-sm border animate-fade-in"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: theme.borderColor,
              color: theme.primaryColor,
            }}
          >
            <Sparkles size={13} />
            <span>{badgeText}</span>
          </div>
        )}

        {/* Titre Principal */}
        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6"
          style={{
            fontFamily: theme.headingFont ? `'${theme.headingFont}', var(--font)` : 'var(--font)',
            color: (styles.textColor as string) || theme.textColor,
          }}
        >
          {title}
        </h1>

        {/* Sous-Titre */}
        {subtitle && (
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-8"
            style={{
              color: theme.textMutedColor,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Bouton d'Action WhatsApp Principal */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              borderRadius: 'var(--btn-radius, 12px)',
              boxShadow: `0 8px 24px ${theme.primaryColor}35`,
            }}
          >
            <MessageCircle size={18} />
            <span>{ctaText}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Image / Bannière optionnelle si fournie */}
        {coverUrl && (
          <div
            className="mt-12 w-full max-w-4xl overflow-hidden border shadow-2xl"
            style={{
              borderColor: theme.borderColor,
              borderRadius: 'var(--card-radius, 16px)',
            }}
          >
            <img src={coverUrl} alt={title} className="w-full h-64 sm:h-96 object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
