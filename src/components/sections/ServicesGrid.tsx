'use client';
import React from 'react';
import { Sparkles, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { SectionComponentProps } from '../registry/SectionRegistry';

/**
 * ServicesGrid — Grille de services VesTyle
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX DT-07 : Variables CSS alignées sur le standard du renderer universel.
 * - var(--vst-radius-btn) → var(--btn-radius, 12px)
 * - var(--vst-radius-card) → var(--card-radius, 16px)
 */
export interface ServiceItem {
  id?: string;
  name: string;
  description?: string;
  price?: number | string;
  duration?: string;
  badge?: string;
}

export function ServicesGrid({ content, metadata, styles, theme }: SectionComponentProps) {
  const title = String(content.title || 'Nos Prestations & Services');
  const subtitle = String(content.subtitle || 'Des services sur-mesure de haute qualité.');
  const showBookingButton = content.showBookingButton !== false;
  const whatsapp = String(metadata.whatsapp || metadata.phone || '').replace(/\D/g, '');

  const rawServices = (Array.isArray(content.services) && content.services.length > 0)
    ? content.services
    : (Array.isArray(content.items) && content.items.length > 0)
      ? content.items
      : [
          {
            id: 'srv_1',
            name: 'Consultation & Prestation Standard',
            description: 'Prise en charge complète, accompagnement personnalisé et garantie qualité.',
            price: '15 000 FCFA',
            duration: '45 min',
            badge: 'POPULAIRE',
          },
          {
            id: 'srv_2',
            name: 'Formule Premium Complète',
            description: 'Prestation haut de gamme avec finitions exclusives et suivi prioritaire.',
            price: '35 000 FCFA',
            duration: '1h 30',
            badge: 'EXCLUSIF',
          },
          {
            id: 'srv_3',
            name: 'Intervention Express sur Rendez-vous',
            description: 'Créneau garanti en priorité avec résultat immédiat.',
            price: '25 000 FCFA',
            duration: '30 min',
          },
        ];

  const handleBookService = (serviceName: string) => {
    if (whatsapp && typeof window !== 'undefined') {
      const message = encodeURIComponent(`Bonjour ${(metadata as any)?.name || 'VesTyle'}, je souhaite réserver ou avoir des informations sur : ${serviceName}.`);
      window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    }
  };

  return (
    <section
      className="w-full px-4 sm:px-6 py-12 relative"
      style={{
        paddingTop: (styles.paddingTop as string | number) ?? '48px',
        paddingBottom: (styles.paddingBottom as string | number) ?? '64px',
        backgroundColor: (styles.backgroundColor as string) || 'transparent',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2
            className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{
              fontFamily: theme.headingFont ? `'${theme.headingFont}', var(--font)` : 'var(--font)',
              color: (styles.textColor as string) || theme.textColor,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base font-medium" style={{ color: theme.textMutedColor }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Grille responsive de cartes de services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rawServices.map((service: ServiceItem, idx: number) => {
            const sName = service.name || `Service ${idx + 1}`;
            const sDesc = service.description || '';
            const sPrice = service.price
              ? (typeof service.price === 'number'
                  ? `${service.price.toLocaleString('fr-FR')} ${metadata.currency || 'FCFA'}`
                  : service.price)
              : null;
            const sDuration = service.duration || null;
            const sBadge = service.badge || null;

            return (
              <div
                key={service.id || idx}
                className="flex flex-col justify-between p-6 border backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: theme.borderColor,
                  borderRadius: 'var(--card-radius, 16px)',
                }}
              >
                <div>
                  {/* Badge & Durée */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {sBadge ? (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${theme.primaryColor}20`,
                          color: theme.primaryColor,
                          border: `1px solid ${theme.primaryColor}40`,
                        }}
                      >
                        {sBadge}
                      </span>
                    ) : <span />}

                    {sDuration && (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: theme.textMutedColor }}>
                        <Clock size={12} />
                        <span>{sDuration}</span>
                      </span>
                    )}
                  </div>

                  {/* Nom du service */}
                  <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: theme.textColor }}>
                    {sName}
                  </h3>

                  {/* Description */}
                  {sDesc && (
                    <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: theme.textMutedColor }}>
                      {sDesc}
                    </p>
                  )}
                </div>

                {/* Tarif & Bouton de Réservation */}
                <div className="pt-4 border-t flex items-center justify-between gap-3 mt-auto" style={{ borderColor: theme.borderColor }}>
                  {sPrice && (
                    <div className="text-base sm:text-lg font-black" style={{ color: theme.primaryColor }}>
                      {sPrice}
                    </div>
                  )}

                  {showBookingButton && (
                    <button
                      type="button"
                      onClick={() => handleBookService(sName)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer ml-auto"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                        borderRadius: 'var(--btn-radius, 12px)',
                      }}
                    >
                      <MessageCircle size={13} />
                      <span>Réserver</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
