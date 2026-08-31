'use client';
import { useState, useMemo } from 'react';
import { Smartphone, Monitor, ExternalLink, Sparkles, Check } from 'lucide-react';
import TemplateBoutique from '@/templates/TemplateBoutique';
import TemplateBoutiquePro from '@/templates/TemplateBoutiquePro';
import TemplatePresta from '@/templates/TemplatePresta';
import TemplateResto from '@/templates/TemplateResto';
import TemplateTechPro from '@/templates/TemplateTechPro';
import { getTemplateById } from '@/lib/storeTemplates';

// Jeux de données de démonstration contextuels par secteur
const SECTOR_MOCKS = {
  restaurant: [
    { id: 'resto-1', name: 'Ndolé Royal au Capitaine Fumé', title: 'Ndolé Royal au Capitaine Fumé', price: 6500, category: 'Plats Chauds', images: ['/hero_slide_1.png'], description: 'Préparé selon la recette traditionnelle avec crevettes fraîches et plantains mûrs.' },
    { id: 'resto-2', name: 'Poulet DG Signature du Chef', title: 'Poulet DG Signature du Chef', price: 7500, category: 'Spécialités', images: ['/hero_slide_2.png'], description: 'Morceaux de poulet fermier sautés aux légumes croquants et rondelles dorées.' },
    { id: 'resto-3', name: 'Cocktail Hibiscus & Gingembre Givré', title: 'Cocktail Hibiscus & Gingembre Givré', price: 2500, category: 'Boissons & Cocktails', images: ['/hero_slide_3.png'], description: 'Infusion de bissap bio avec une touche de menthe sauvage.' },
  ],
  tech_pro: [
    { id: 'tech-1', name: 'iPhone 15 Pro Max 256GB Titane', title: 'iPhone 15 Pro Max 256GB Titane', price: 780000, category: 'Smartphones', images: ['/icon-512.png'], description: 'Puce A17 Pro, garantie officielle 12 mois constructeur.' },
    { id: 'tech-2', name: 'MacBook Pro M3 16-inch Retina', title: 'MacBook Pro M3 16-inch Retina', price: 1450000, category: 'Ordinateurs', images: ['/og-image.png'], description: '36GB RAM unifiée, 512GB SSD ultra-rapide.' },
    { id: 'tech-3', name: 'AirPods Max Audio Spatial Réduction Bruit', title: 'AirPods Max Audio Spatial Réduction Bruit', price: 320000, category: 'Accessoires Audio', images: ['/icon-192.png'], description: 'Son haute fidélité avec autonomie de 20 heures.' },
  ],
  boutique_luxe: [
    { id: 'luxe-1', name: 'Robe du Soir en Soie Sauvage & Dorures', title: 'Robe du Soir en Soie Sauvage & Dorures', price: 185000, category: 'Haute Couture', images: ['/hero-bg.png'], description: 'Couture faite main avec finitions en fil d\'or et coupe cintrée.' },
    { id: 'luxe-2', name: 'Montre Chronographe Automatique Or Rose', title: 'Montre Chronographe Automatique Or Rose', price: 340000, category: 'Joaillerie & Horlogerie', images: ['/og-image.png'], description: 'Mouvement suisse avec verre saphir inrayable.' },
    { id: 'luxe-3', name: 'Parfum d\'Exception Oud & Ambre Noir', title: 'Parfum d\'Exception Oud & Ambre Noir', price: 75000, category: 'Parfumerie Rare', images: ['/icon-512.png'], description: 'Sillage envoûtant et longue tenue de 24 heures.' },
  ],
  sante_pharma: [
    { id: 'pharma-1', name: 'Complexe Multivitamines & Immunité Forte', title: 'Complexe Multivitamines & Immunité Forte', price: 12500, category: 'Compléments & Énergie', images: ['/icon-192.png'], description: 'Formule enrichie en Zinc, Vitamine C et Spiruline.' },
    { id: 'pharma-2', name: 'Sérum Dermatologique Hydratation Intense', title: 'Sérum Dermatologique Hydratation Intense', price: 18000, category: 'Dermo-Cosmétique', images: ['/icon-512.png'], description: 'Recommandé par les dermatologues pour peaux sensibles.' },
  ],
  supermarche_frais: [
    { id: 'frais-1', name: 'Panier Maraîcher Frais de Saison (5kg)', title: 'Panier Maraîcher Frais de Saison (5kg)', price: 8500, category: 'Fruits & Légumes', images: ['/hero_slide_1.png'], description: 'Tomates, carottes, poivrons et herbes récoltés le matin même.' },
    { id: 'frais-2', name: 'Sac de Riz Parfumé Long Grain 25kg', title: 'Sac de Riz Parfumé Long Grain 25kg', price: 19500, category: 'Épicerie Lourde', images: ['/hero_slide_2.png'], description: 'Qualité premium, cuisson parfaite et incollable.' },
  ],
  artisan_beaute: [
    { id: 'spa-1', name: 'Soin du Visage Éclat & Massage Relaxant (1h)', title: 'Soin du Visage Éclat & Massage Relaxant (1h)', price: 25000, category: 'Soins Visage & Corps', images: ['/hero-bg.png'], description: 'Démaquillage profond, gommage doux et modelage aux huiles bio.' },
    { id: 'spa-2', name: 'Pose Complète Onglerie Gel & Nail Art', title: 'Pose Complète Onglerie Gel & Nail Art', price: 15000, category: 'Onglerie & Beauté Mains', images: ['/icon-512.png'], description: 'Tenue garantie 4 semaines avec motif personnalisé.' },
  ],
  presta_services: [
    { id: 'b2b-1', name: 'Création d\'Identité Visuelle & Logo Pro', title: 'Création d\'Identité Visuelle & Logo Pro', price: 150000, category: 'Design & Branding', images: ['/og-image.png'], description: 'Charte graphique complète, déclinaisons print & web et fichiers sources.' },
    { id: 'b2b-2', name: 'Pack Stratégie Marketing & Réseaux Sociaux', title: 'Pack Stratégie Marketing & Réseaux Sociaux', price: 220000, category: 'Marketing Digital', images: ['/icon-512.png'], description: 'Gestion mensuelle de vos campagnes Facebook, Instagram et TikTok.' },
  ],
  boutique_livres_scolaires: [
    { id: 'edu-1', name: 'Pack Réussite Baccalauréat Scientifique 2026', title: 'Pack Réussite Baccalauréat Scientifique 2026', price: 14000, category: 'Manuels & Exercices', images: ['/icon-192.png'], description: 'Annales corrigées, fiches de synthèse et résumés de cours.' },
    { id: 'edu-2', name: 'Dictionnaire Illustré des Sciences & Langues', title: 'Dictionnaire Illustré des Sciences & Langues', price: 18500, category: 'Ouvrages de Référence', images: ['/icon-512.png'], description: 'Plus de 50 000 définitions et planches anatomiques en couleur.' },
  ],
  default: [
    { id: 'mock-1', name: 'Article Vedette Exclusif', title: 'Article Vedette Exclusif', price: 15000, category: 'Tendance', images: ['/hero-bg.png'] },
    { id: 'mock-2', name: 'Édition Spéciale VeStyle', title: 'Édition Spéciale VeStyle', price: 25000, category: 'Nouveautés', images: ['/icon-512.png'] },
    { id: 'mock-3', name: 'Pack Premium Collection', title: 'Pack Premium Collection', price: 35000, category: 'Populaire', images: ['/og-image.png'] },
  ]
};

export default function StoreLivePreview({ formData, storeId }) {
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [copied, setCopied] = useState(false);

  const templateId = formData.store_template || formData.shop_theme || 'boutique_pro';
  const templateConfig = getTemplateById(templateId);

  const spatial = formData.layout_config?.spatial || {};

  const themeVars = {
    '--prim': formData.theme_color || templateConfig.theme?.primaryColor || '#128C7E',
    '--sec': formData.secondary_color || templateConfig.theme?.secondaryColor || '#F3F4F6',
    '--font': formData.font_family || templateConfig.theme?.fontFamily || 'Inter',
    '--bg': formData.secondary_color || '#FAF8F6',
    '--fg': formData.secondary_color === '#1C0A00' || formData.secondary_color === '#0F172A' ? '#FFFFFF' : '#111827',
    '--logo-pos': spatial.logoPosition || 'left',
    '--card-radius': spatial.cardRadius === 'sharp' ? '0px' : spatial.cardRadius === 'pill' ? '28px' : '16px',
    '--grid-layout': spatial.gridStyle || 'grid_2',
  };

  // Sélectionner les produits de démonstration adaptés au secteur et à la typologie (Produits / Services / Hybride)
  const mockProducts = useMemo(() => {
    const baseMocks = SECTOR_MOCKS[templateId] || SECTOR_MOCKS.default;
    if (spatial.businessType === 'services') {
      return [
        { id: 'srv-1', name: 'Consultation & Prestation Complète (1h)', title: 'Consultation & Prestation Complète (1h)', price: 25000, category: 'Services', images: ['/hero_slide_1.png'], description: 'Prise en charge personnalisée avec livrables et suivi direct.' },
        { id: 'srv-2', name: 'Pack Forfait Sérénité Mensuel', title: 'Pack Forfait Sérénité Mensuel', price: 65000, category: 'Abonnements', images: ['/hero_slide_2.png'], description: 'Assistance dédiée 7j/7 et interventions prioritaires.' },
      ];
    }
    return baseMocks;
  }, [templateId, spatial.businessType]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/boutique/${formData.slug || storeId || ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTemplateComponent = () => {
    const props = {
      store: {
        ...formData,
        id: storeId,
        name: formData.name || templateConfig.name || 'Ma Boutique',
        description: formData.description || templateConfig.description || 'Découvrez nos prestations et produits exclusifs.',
        phone: formData.whatsapp_number || formData.phone || '',
      },
      themeVars,
      storeId,
      currency: 'FCFA',
      productsProp: mockProducts,
      isMobile: deviceMode === 'mobile',
    };

    switch (templateId) {
      case 'boutique_luxe':
        return <TemplateBoutique {...props} />;
      case 'tech_pro':
        return <TemplateTechPro {...props} />;
      case 'restaurant':
        return <TemplateResto {...props} />;
      case 'presta_services':
        return <TemplatePresta {...props} />;
      case 'boutique_pro':
      case 'sante_pharma':
      case 'supermarche_frais':
      case 'artisan_beaute':
      case 'boutique_livres_scolaires':
      default:
        return <TemplateBoutiquePro {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl rounded-[32px] border border-white/10 p-5 shadow-2xl overflow-hidden text-left">
      {/* Barre d'outils du simulateur */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceMode === 'mobile' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              Mobile
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceMode === 'desktop' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              Desktop
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
            <span>{templateConfig.emoji}</span>
            <span>{templateConfig.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-white/5 transition-all"
            title="Copier le lien public de la boutique"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Sparkles size={13} className="text-amber-400" />}
            {copied ? 'Copié !' : 'Copier lien'}
          </button>

          {formData.slug && (
            <a
              href={`/boutique/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all"
            >
              <ExternalLink size={13} />
              Voir en direct
            </a>
          )}
        </div>
      </div>

      {/* Zone du simulateur */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden bg-slate-950/60 rounded-2xl border border-white/5 relative">
        {deviceMode === 'mobile' ? (
          /* Châssis de smartphone ultra-élégant */
          <div className="w-[340px] h-[640px] max-h-[75vh] bg-black rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
            </div>

            {/* Écran du téléphone */}
            <div className={`w-full h-full bg-[#FAF9F6] rounded-[34px] overflow-y-auto no-scrollbar relative pt-6 text-left ${templateConfig.animationClass || ''}`}>
              {renderTemplateComponent()}
            </div>

            {/* Barre d'accueil iPhone en bas */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full pointer-events-none" />
          </div>
        ) : (
          /* Écran Desktop */
          <div className={`w-full h-[640px] max-h-[75vh] bg-[#FAF9F6] rounded-2xl overflow-y-auto custom-scrollbar border border-white/10 shadow-2xl relative text-left ${templateConfig.animationClass || ''}`}>
            {renderTemplateComponent()}
          </div>
        )}
      </div>
    </div>
  );
}
