'use client';
import { useState, useEffect } from 'react';
import { STORE_TEMPLATES, SECTORS, getTemplateById } from '@/lib/storeTemplates';
import {
  Clock, Calendar, Utensils, FileText, CheckCircle2,
  Lock, Layout, Sparkles, ChevronDown, Save, Loader2, Info
} from 'lucide-react';

/**
 * TemplateConfigurator — Panneau de Configuration Dynamique & Personnalisation du Template
 * S'adapte au secteur et template choisi avec floutage élégant des fonctionnalités non applicables.
 */
export default function TemplateConfigurator({
  store,
  onUpdateStore,
  activeTemplateId,
  onTemplateChange
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(activeTemplateId || store?.store_template || 'boutique_pro');
  const [activeSector, setActiveSector] = useState(null);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState('hours'); // 'hours' | 'reservation' | 'devis' | 'banner'

  const currentTemplate = getTemplateById(selectedTemplateId) || STORE_TEMPLATES[0];

  useEffect(() => {
    if (activeTemplateId) {
      setSelectedTemplateId(activeTemplateId);
      const tmpl = getTemplateById(activeTemplateId);
      if (tmpl) setActiveSector(tmpl.sector);
    } else if (store?.store_template) {
      setSelectedTemplateId(store.store_template);
      const tmpl = getTemplateById(store.store_template);
      if (tmpl) setActiveSector(tmpl.sector);
    }
  }, [activeTemplateId, store?.store_template]);

  // État local de la configuration layout_config
  const initialLayoutConfig = store?.layout_config || {};
  const [layoutConfig, setLayoutConfig] = useState({
    opening_hours: initialLayoutConfig.opening_hours || {
      monday:    { open: '08:00', close: '20:00', closed: false },
      tuesday:   { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday:  { open: '08:00', close: '20:00', closed: false },
      friday:    { open: '08:00', close: '20:00', closed: false },
      saturday:  { open: '09:00', close: '21:00', closed: false },
      sunday:    { open: '10:00', close: '18:00', closed: true }
    },
    reservations: initialLayoutConfig.reservations || {
      enabled: true,
      title: 'Réserver une Table / Rendez-vous',
      max_guests: 10,
      instant_whatsapp: true
    },
    devis: initialLayoutConfig.devis || {
      enabled: true,
      title: 'Demande de Devis Sur-Mesure',
      auto_response: true
    },
    hero_custom: initialLayoutConfig.hero_custom || {
      title: store?.name || 'Bienvenue dans notre espace',
      subtitle: store?.description || 'Découvrez notre savoir-faire et nos meilleures prestations.',
      cta_text: 'Explorer la Collection'
    }
  });

  const handleTemplateSelect = (tmplId) => {
    setSelectedTemplateId(tmplId);
    const tmpl = getTemplateById(tmplId);
    if (tmpl) {
      onTemplateChange?.(tmplId);
      if (onUpdateStore) {
        onUpdateStore({ store_template: tmplId, shop_theme: tmplId });
      }
    }
  };

  const handleConfigChange = (section, field, value) => {
    const updated = {
      ...layoutConfig,
      [section]: {
        ...layoutConfig[section],
        [field]: value
      }
    };
    setLayoutConfig(updated);
    triggerAutoSave(updated);
  };

  const handleHoursChange = (dayKey, field, value) => {
    const updated = {
      ...layoutConfig,
      opening_hours: {
        ...layoutConfig.opening_hours,
        [dayKey]: {
          ...layoutConfig.opening_hours[dayKey],
          [field]: value
        }
      }
    };
    setLayoutConfig(updated);
    triggerAutoSave(updated);
  };

  const triggerAutoSave = (newConfig) => {
    setSaving(true);
    if (onUpdateStore) {
      onUpdateStore({ layout_config: newConfig });
    }
    setTimeout(() => setSaving(false), 800);
  };

  const isSupported = (feature) => {
    if (!currentTemplate?.supports) return true;
    return currentTemplate.supports.includes(feature);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-8 text-left transition-all">
      
      {/* Header Panneau */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Layout size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Sélecteur & Configuration du Template
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase">Temps Réel</span>
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Template actif : <strong className="text-gray-900 font-extrabold">{currentTemplate.name}</strong> ({currentTemplate.sector})
            </p>
          </div>
        </div>

        {saving && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            <Loader2 className="animate-spin" size={14} /> Synchronisation...
          </div>
        )}
      </div>

      {/* ── SECTEUR & CHOIX DE TEMPLATE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">1. Choisir le Secteur & Template Visuel</label>
          <span className="text-xs font-bold text-gray-500">{STORE_TEMPLATES.length} templates disponibles</span>
        </div>

        {/* Grille des secteurs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SECTORS.map((sec) => {
            const isSecActive = (activeSector || currentTemplate.sector) === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSector(sec.id)}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${
                  isSecActive
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: sec.gradient }}>
                  {sec.emoji}
                </div>
                <div>
                  <div className="text-xs font-black text-gray-900">{sec.label}</div>
                  <div className="text-[10px] text-gray-400 font-medium">{sec.count} template{sec.count > 1 ? 's' : ''}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Templates du secteur sélectionné */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {STORE_TEMPLATES.filter(t => t.sector === (activeSector || currentTemplate.sector)).map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleTemplateSelect(tmpl.id)}
                className={`relative p-5 rounded-2xl text-left border-2 transition-all overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 bg-white shadow-lg ring-2 ring-indigo-500/20'
                    : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                }`}
              >
                <div className="h-20 -mx-5 -mt-5 mb-4 p-4 flex items-end justify-between relative overflow-hidden" style={{ background: tmpl.preview }}>
                  <span className="text-2xl filter drop-shadow-md">{tmpl.emoji}</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider bg-black/40 backdrop-blur-md border border-white/20">
                    {tmpl.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-900 text-sm">{tmpl.name}</h3>
                  {isSelected && <CheckCircle2 className="text-indigo-600 shrink-0" size={18} />}
                </div>

                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tmpl.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(tmpl.features || tmpl.specifications?.configurables?.map(c => c.label) || []).slice(0, 3).map((feat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">
                      {feat}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONFIGURATION DEEP DU TEMPLATE SELECTIONNE ── */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div>
          <h3 className="text-base font-black text-gray-900 tracking-tight">2. Paramètres & Modules du Template</h3>
          <p className="text-xs text-gray-400 font-medium">Seuls les modules compatibles avec le template sélectionné sont débloqués.</p>
        </div>

        {/* ACCORDION 1: HORAIRES D'OUVERTURE */}
        <div className={`rounded-2xl border transition-all overflow-hidden ${
          isSupported('opening_hours') ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50 opacity-60'
        }`}>
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'hours' ? null : 'hours')}
            className="w-full p-4 flex items-center justify-between bg-gray-50/60 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  Horaires d&apos;Ouverture & Statut Live
                  {!isSupported('opening_hours') && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-black rounded-md flex items-center gap-1">
                      <Lock size={10} /> Non inclus
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-medium">Bannière statut &quot;Ouvert / Fermé&quot; calculée en temps réel.</div>
              </div>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${openSection === 'hours' ? 'rotate-180' : ''}`} />
          </button>

          {openSection === 'hours' && (
            <div className="p-5 space-y-3 relative">
              {!isSupported('opening_hours') && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">Ce module n&apos;est pas activé sur ce template.</p>
                    <p className="text-[10px] text-gray-400">Passez sur un template Restaurant ou Artisan pour débloquer les horaires.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { day: 'Lundi', key: 'monday' },
                  { day: 'Mardi', key: 'tuesday' },
                  { day: 'Mercredi', key: 'wednesday' },
                  { day: 'Jeudi', key: 'thursday' },
                  { day: 'Vendredi', key: 'friday' },
                  { day: 'Samedi', key: 'saturday' },
                  { day: 'Dimanche', key: 'sunday' },
                ].map(({ day, key }) => {
                  const dayConf = layoutConfig.opening_hours[key] || { open: '08:00', close: '20:00', closed: false };
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                      <span className="text-xs font-extrabold text-gray-800 w-24">{day}</span>
                      <div className="flex items-center gap-2">
                        {!dayConf.closed ? (
                          <>
                            <input
                              type="time"
                              value={dayConf.open}
                              onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                            />
                            <span className="text-xs font-bold text-gray-400">-</span>
                            <input
                              type="time"
                              value={dayConf.close}
                              onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                            />
                          </>
                        ) : (
                          <span className="text-xs font-black text-rose-500 uppercase px-2 py-1 bg-rose-50 rounded-lg">Fermé</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleHoursChange(key, 'closed', !dayConf.closed)}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors ${
                            dayConf.closed ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {dayConf.closed ? 'Ouvrir' : 'Fermer'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 2: MODULE DE RÉSERVATION / RDV */}
        <div className={`rounded-2xl border transition-all overflow-hidden ${
          isSupported('reservations') ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50 opacity-60'
        }`}>
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'reservation' ? null : 'reservation')}
            className="w-full p-4 flex items-center justify-between bg-gray-50/60 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  Système de Réservation & Rendez-vous
                  {!isSupported('reservations') ? (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-black rounded-md flex items-center gap-1">
                      <Lock size={10} /> Non inclus
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black rounded-md">Débloqué</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-medium">Formulaire de réservation de table ou de créneau horodaté.</div>
              </div>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${openSection === 'reservation' ? 'rotate-180' : ''}`} />
          </button>

          {openSection === 'reservation' && (
            <div className="p-5 space-y-4 relative">
              {!isSupported('reservations') && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">Ce module n&apos;est pas disponible pour le template E-Commerce.</p>
                    <p className="text-[10px] text-gray-400">Basculez sur le secteur &quot;Artisan & Restaurant&quot; pour configurer les réservations.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <span className="text-xs font-extrabold text-gray-900">Activer le bouton de réservation rapide</span>
                  <input
                    type="checkbox"
                    checked={layoutConfig.reservations.enabled}
                    onChange={(e) => handleConfigChange('reservations', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Intitulé du bouton</label>
                  <input
                    type="text"
                    value={layoutConfig.reservations.title}
                    onChange={(e) => handleConfigChange('reservations', 'title', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 3: DEMANDE DE DEVIS SUR-MESURE */}
        <div className={`rounded-2xl border transition-all overflow-hidden ${
          isSupported('devis') ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50 opacity-60'
        }`}>
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'devis' ? null : 'devis')}
            className="w-full p-4 flex items-center justify-between bg-gray-50/60 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  Formulaire Devis Express
                  {!isSupported('devis') ? (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-black rounded-md flex items-center gap-1">
                      <Lock size={10} /> Non inclus
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md">Débloqué</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-medium">Pour les prestataires de services et devis personnalisés.</div>
              </div>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${openSection === 'devis' ? 'rotate-180' : ''}`} />
          </button>

          {openSection === 'devis' && (
            <div className="p-5 space-y-4 relative">
              {!isSupported('devis') && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">Module réservé au secteur Prestataire & Services.</p>
                    <p className="text-[10px] text-gray-400">Choisissez le template Agence ou Freelance pour l&apos;activer.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <span className="text-xs font-extrabold text-gray-900">Activer le formulaire de devis express</span>
                  <input
                    type="checkbox"
                    checked={layoutConfig.devis.enabled}
                    onChange={(e) => handleConfigChange('devis', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </label>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Titre du formulaire</label>
                  <input
                    type="text"
                    value={layoutConfig.devis.title}
                    onChange={(e) => handleConfigChange('devis', 'title', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 4: BANNIÈRES & TEXTES DU TEMPLATE */}
        <div className="rounded-2xl border border-gray-200 bg-white transition-all overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'banner' ? null : 'banner')}
            className="w-full p-4 flex items-center justify-between bg-gray-50/60 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900">Textes & Titre du Héros</div>
                <div className="text-[11px] text-gray-400 font-medium">Personalisez les accroches principales du template.</div>
              </div>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${openSection === 'banner' ? 'rotate-180' : ''}`} />
          </button>

          {openSection === 'banner' && (
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Titre de bienvenue</label>
                <input
                  type="text"
                  value={layoutConfig.hero_custom.title}
                  onChange={(e) => handleConfigChange('hero_custom', 'title', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Sous-titre / Description</label>
                <textarea
                  rows="2"
                  value={layoutConfig.hero_custom.subtitle}
                  onChange={(e) => handleConfigChange('hero_custom', 'subtitle', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Texte du Bouton d&apos;Action (CTA)</label>
                <input
                  type="text"
                  value={layoutConfig.hero_custom.cta_text}
                  onChange={(e) => handleConfigChange('hero_custom', 'cta_text', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                />
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
