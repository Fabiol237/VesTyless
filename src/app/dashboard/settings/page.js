'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Settings, ArrowLeft, Globe, Palette, Megaphone,
  Truck, Loader2, CheckCircle2, Eye, Sparkles, ExternalLink,
  MapPin, Phone, MessageCircle, Sliders, ShieldCheck, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useDistance } from '@/hooks/useDistance';
import { businessTypeRegistry } from '@/lib/business-types/BusinessTypeRegistry';

export default function StoreSettingsPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: 'Douala',
    phone: '',
    whatsapp_number: '',
    slug: '',
    business_type: 'product',
    latitude: '',
    longitude: '',
  });

  const { requestLocation, userLocation, isLocating, error: gpsError } = useDistance();

  // Chargement des données de la boutique
  useEffect(() => {
    async function loadStore() {
      if (!session?.id) return;
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', session.id)
          .single();

        if (data && !error) {
          setStoreId(data.id);
          const loadedType = businessTypeRegistry.normalize(data.business_type || data.activity_type);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            city: data.city || 'Douala',
            phone: data.phone || '',
            whatsapp_number: data.whatsapp_number || data.phone || '',
            slug: data.slug || '',
            business_type: loadedType || data.business_type || data.activity_type || 'product',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement boutique:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storeId) return;

    setSaveStatus('saving');
    try {
      const analysis = businessTypeRegistry.analyze(formData.business_type);
      if (!analysis.canonicalId) {
        throw new Error(`Type d'activité non résolu (${analysis.status}) : ${analysis.reason || 'Veuillez sélectionner un type d\'activité valide dans la liste.'}`);
      }
      const canonicalBusinessType = analysis.canonicalId;
      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          description: formData.description,
          city: formData.city,
          phone: formData.phone,
          whatsapp_number: formData.whatsapp_number,
          business_type: canonicalBusinessType,
          latitude: formData.latitude,
          longitude: formData.longitude,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId);

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── EN-TÊTE PRINCIPAL ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                <ArrowLeft size={16} />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Settings size={22} className="text-purple-400" />
                Paramètres de la Boutique
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Gérez les informations fondamentales de votre établissement.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {storeId && (
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <Sliders size={14} />
                <span>Ouvrir le Studio Visuel</span>
              </Link>
            )}
            {formData.slug && (
              <a
                href={`/boutique/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                title="Voir la vitrine publique"
              >
                <Eye size={16} />
              </a>
            )}
          </div>
        </div>

        {/* ── BANNIÈRE ACCÈS STUDIO CRÉATEUR ── */}
        {storeId && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                Nouveau Moteur Vestine v2
              </span>
              <h3 className="text-base font-black text-white">Studio de Personnalisation Visuelle & IA</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Personnalisez votre logo, agencez vos sections, configurez vos formulaires dynamiques et visualisez le rendu en temps réel.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
            >
              <Sparkles size={15} className="text-purple-600" />
              <span>Lancer le Studio</span>
            </Link>
          </div>
        )}

        {/* ── FORMULAIRE D'INFORMATIONS PRINCIPALES ── */}
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            Informations Générales & Contact
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nom de la Boutique</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Ville / Localisation</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Douala, Yaoundé..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Briefcase size={13} className="text-purple-400" />
              Secteur d&apos;Activité & Identité Métier
            </label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {businessTypeRegistry.getAll().map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.emoji} {bt.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 leading-normal">
              Adapte automatiquement les fonctionnalités et modules recommandés pour votre activité. Vos produits et données existants sont intégralement préservés.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Description de l'Établissement</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Présentez brièvement vos prestations et articles..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageCircle size={13} className="text-emerald-400" />
                Numéro WhatsApp Commandes
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="Ex: 237690000000"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-blue-400" />
                Téléphone Appel Direct
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: 237670000000"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {saveStatus === 'saved' && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Modifications enregistrées avec succès !
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs font-bold text-rose-400">
                Erreur lors de l'enregistrement.
              </span>
            )}
            {saveStatus === 'idle' && <span />}

            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Sauvegarder les Paramètres</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
