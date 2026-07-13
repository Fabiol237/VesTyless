'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// ─── Icônes SVG inline ─────────────────────────────────────────────────────
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const Loader2Icon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
    <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
  </svg>
);

// ─── Questions du formulaire ────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { id: 'ecommerce', label: 'Vente de Produits', emoji: '🛍️', desc: 'Vêtements, électronique, artisanat...' },
  { id: 'services', label: 'Prestations de Services', emoji: '🔧', desc: 'Plombier, coiffeur, coach...' },
  { id: 'restaurant', label: 'Restauration / Alimentation', emoji: '🍽️', desc: 'Restaurant, traiteur, pâtisserie...' },
  { id: 'creative', label: 'Créatif / Freelance', emoji: '🎨', desc: 'Designer, photographe, développeur...' },
  { id: 'events', label: 'Événements', emoji: '🎟️', desc: 'Concerts, conférences, fêtes...' },
  { id: 'wellness', label: 'Bien-être & Santé', emoji: '💆', desc: 'Thérapeute, coach sportif, yoga...' },
  { id: 'education', label: 'Éducation & Formation', emoji: '📚', desc: 'Cours en ligne, tutorat, workshops...' },
  { id: 'content', label: 'Créateur de Contenu', emoji: '📱', desc: 'Influenceur, YouTuber, blogger...' },
  { id: 'real_estate', label: 'Immobilier', emoji: '🏠', desc: 'Agent immobilier, location...' },
  { id: 'other', label: 'Autre', emoji: '✨', desc: 'Décrivez votre activité' },
];

const STEPS = [
  { id: 'activity', title: 'Votre Activité', subtitle: 'Quel type de créateur êtes-vous ?' },
  { id: 'details', title: 'Les Détails', subtitle: 'Décrivez votre activité en détail' },
  { id: 'audience', title: 'Votre Public', subtitle: 'À qui vous adressez-vous ?' },
  { id: 'features', title: 'Vos Besoins', subtitle: 'Quels outils souhaitez-vous ?' },
  { id: 'style', title: 'Votre Style', subtitle: 'Quelle ambiance pour votre boutique ?' },
  { id: 'generate', title: 'Génération IA', subtitle: 'Votre boutique se crée...' },
];

const FEATURES_OPTIONS = [
  { id: 'products', label: 'Vendre des produits', emoji: '📦' },
  { id: 'services', label: 'Proposer des services', emoji: '🎯' },
  { id: 'booking', label: 'Prendre des rendez-vous', emoji: '📅' },
  { id: 'events', label: 'Gérer des événements', emoji: '🎟️' },
  { id: 'portfolio', label: 'Montrer mon travail', emoji: '🖼️' },
  { id: 'blog', label: 'Partager du contenu', emoji: '✍️' },
  { id: 'restaurant', label: 'Afficher mon menu', emoji: '🍽️' },
  { id: 'online_payment', label: 'Accepter des paiements', emoji: '💳' },
  { id: 'newsletter', label: 'Collecter des emails', emoji: '📧' },
  { id: 'reviews', label: 'Afficher des avis', emoji: '⭐' },
  { id: 'contact', label: 'Formulaire de contact', emoji: '📬' },
  { id: 'devis', label: 'Recevoir des devis', emoji: '📋' },
];

const STYLE_OPTIONS = [
  { id: 'elegant', label: 'Élégant & Minimaliste', emoji: '🤍', colors: ['#1a1a2e', '#f8f9fa', '#6c63ff'] },
  { id: 'vibrant', label: 'Vibrant & Coloré', emoji: '🌈', colors: ['#ff006e', '#fb5607', '#ffbe0b'] },
  { id: 'dark', label: 'Sombre & Mystérieux', emoji: '🌙', colors: ['#0a0a0a', '#1a1a2e', '#7c3aed'] },
  { id: 'natural', label: 'Naturel & Organique', emoji: '🌿', colors: ['#2d6a4f', '#95d5b2', '#f8f7f2'] },
  { id: 'luxury', label: 'Luxe & Premium', emoji: '✨', colors: ['#1a1a1a', '#c9a84c', '#f5f5f0'] },
  { id: 'tech', label: 'Tech & Futuriste', emoji: '🚀', colors: ['#0f0f23', '#00f5ff', '#7b2ff7'] },
];

export default function OnboardingPage() {
  const { user, store } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    activityType: '',
    businessName: '',
    description: '',
    targetAudience: '',
    location: '',
    phone: '',
    selectedFeatures: [],
    style: '',
    hasExistingCustomers: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Si le vendeur a déjà une boutique, on pré-remplit ses infos
  useEffect(() => {
    if (mounted && store?.onboarding_data) {
      setFormData(prev => ({ ...prev, ...store.onboarding_data }));
    }
  }, [mounted, store]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(f => f !== featureId)
        : [...prev.selectedFeatures, featureId],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.activityType;
      case 1: return formData.businessName.length > 1 && formData.description.length > 10;
      case 2: return !!formData.targetAudience;
      case 3: return formData.selectedFeatures.length > 0;
      case 4: return !!formData.style;
      default: return true;
    }
  };

  const generateStore = async () => {
    setIsGenerating(true);
    setCurrentStep(5);
    const messages = [
      'Analyse de votre activité par l\'IA...', 'Sélection des modules adaptés...',
      'Génération de votre contenu...', 'Application de votre style...', 'Création des pages...', 'Finalisation...',
    ];
    for (let i = 0; i < messages.length; i++) {
      setGenerationMessage(messages[i]);
      setGenerationProgress(((i + 1) / messages.length) * 90);
      await new Promise(r => setTimeout(r, 900));
    }

    try {
      const response = await fetch('/api/ai/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, userId: user?.id, storeId: store?.id }),
      });
      const result = await response.json();
      setGenerationProgress(100);
      setGenerationMessage('Boutique créée avec succès ! ✨');
      await new Promise(r => setTimeout(r, 800));
      router.push(`/builder/${result.storeId}`);
    } catch (err) {
      console.error(err);
      setGenerationMessage('Erreur lors de la génération. Veuillez réessayer.');
      setIsGenerating(false);
    }
  };

  if (!mounted) return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2Icon size={32} />
    </div>
  );

  const step = STEPS[currentStep];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Fond animé */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: `${200 + i * 100}px`, height: `${200 + i * 100}px`,
            background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '99,102,241' : '168,85,247'},0.08) 0%, transparent 70%)`,
            top: `${10 + i * 18}%`, left: `${5 + i * 20}%`,
            animation: `float${i} ${8 + i * 2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* En-tête */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
          <ArrowLeftIcon /> Retour
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SparklesIcon />
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', background: 'linear-gradient(90deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            2VeStyle Builder
          </span>
        </div>

        {/* Progression des étapes */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {STEPS.slice(0, 5).map((s, i) => (
            <div key={i} style={{ width: i === currentStep ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i < currentStep ? '#a855f7' : i === currentStep ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Titre de l'étape */}
        {currentStep < 5 && (
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: '#a5b4fc', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Étape {currentStep + 1} / 5
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', margin: '0 0 12px', background: 'linear-gradient(135deg, #fff 30%, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {step.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: 0 }}>{step.subtitle}</p>
          </div>
        )}

        {/* ÉTAPE 0 : Type d'activité */}
        {currentStep === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {ACTIVITY_TYPES.map(act => (
              <button key={act.id} onClick={() => updateForm('activityType', act.id)} style={{
                padding: '20px', borderRadius: '16px', border: `2px solid ${formData.activityType === act.id ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                background: formData.activityType === act.id ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))' : 'rgba(255,255,255,0.04)',
                color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                transform: formData.activityType === act.id ? 'scale(1.02)' : 'scale(1)',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{act.emoji}</div>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{act.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{act.desc}</div>
                {formData.activityType === act.id && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ÉTAPE 1 : Détails */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { key: 'businessName', label: 'Nom de votre boutique / activité *', placeholder: 'Ex: Studio Lumière, Chez Marie...', type: 'text' },
              { key: 'description', label: 'Décrivez votre activité en détail *', placeholder: 'Je suis photographe spécialisé dans les mariages et portraits. Je propose aussi des formations photo...', type: 'textarea' },
              { key: 'location', label: 'Votre ville / localisation', placeholder: 'Ex: Yaoundé, Douala...', type: 'text' },
              { key: 'phone', label: 'Numéro de téléphone', placeholder: '+237 6XX XXX XXX', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea value={formData[field.key]} onChange={e => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder} rows={4}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }} />
                ) : (
                  <input type={field.type} value={formData[field.key]} onChange={e => updateForm(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ÉTAPE 2 : Public cible */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                Décrivez votre clientèle cible *
              </label>
              <textarea value={formData.targetAudience} onChange={e => updateForm('targetAudience', e.target.value)}
                placeholder="Ex: Jeunes professionnels de 25-35 ans qui cherchent des vêtements stylés et abordables, majoritairement femmes..." rows={3}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                Avez-vous déjà des clients existants ?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[['yes', 'Oui, j\'en ai déjà', '✅'], ['no', 'Non, je démarre', '🆕'], ['some', 'Quelques-uns', '🌱']].map(([val, lbl, emoji]) => (
                  <button key={val} onClick={() => updateForm('hasExistingCustomers', val)}
                    style={{ padding: '16px', borderRadius: '12px', border: `2px solid ${formData.hasExistingCustomers === val ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, background: formData.hasExistingCustomers === val ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{emoji}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{lbl}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Fonctionnalités */}
        {currentStep === 3 && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', textAlign: 'center' }}>
              Sélectionnez tout ce dont vous avez besoin (plusieurs choix possibles)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {FEATURES_OPTIONS.map(feat => {
                const isSelected = formData.selectedFeatures.includes(feat.id);
                return (
                  <button key={feat.id} onClick={() => toggleFeature(feat.id)} style={{
                    padding: '16px', borderRadius: '14px', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                    background: isSelected ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.2))' : 'rgba(255,255,255,0.04)',
                    color: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{feat.emoji}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', lineHeight: 1.3 }}>{feat.label}</div>
                    {isSelected && <div style={{ marginTop: '8px', width: '20px', height: '20px', background: '#6366f1', borderRadius: '50%', margin: '8px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : Style */}
        {currentStep === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {STYLE_OPTIONS.map(s => (
              <button key={s.id} onClick={() => updateForm('style', s.id)} style={{
                padding: '20px', borderRadius: '16px', border: `2px solid ${formData.style === s.id ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                background: formData.style === s.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {s.colors.map((c, i) => <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.emoji}</div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* ÉTAPE 5 : Génération IA */}
        {currentStep === 5 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '100px', height: '100px', margin: '0 auto 32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', animation: 'pulse 2s ease-in-out infinite' }}>
              ✨
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              L&apos;IA crée votre boutique
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '40px', fontSize: '16px' }}>{generationMessage}</p>

            {/* Barre de progression */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '8px', maxWidth: '400px', margin: '0 auto 16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${generationProgress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{Math.round(generationProgress)}%</p>
          </div>
        )}

        {/* Boutons de navigation */}
        {currentStep < 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', gap: '16px' }}>
            {currentStep > 0 ? (
              <button onClick={() => setCurrentStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                <ArrowLeftIcon /> Précédent
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button onClick={() => setCurrentStep(s => s + 1)} disabled={!canProceed()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', border: 'none', background: canProceed() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: canProceed() ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: canProceed() ? '0 8px 32px rgba(99,102,241,0.4)' : 'none' }}>
                Continuer <ArrowRightIcon />
              </button>
            ) : (
              <button onClick={generateStore} disabled={!canProceed() || isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}>
                <SparklesIcon /> Générer ma boutique IA
              </button>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes float0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,25px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,10px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-15px)} }
        @keyframes float4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,30px)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
