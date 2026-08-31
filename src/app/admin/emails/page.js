'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, Send, CheckCircle2, AlertCircle, Eye, RefreshCw,
  ShoppingBag, Bell, Truck, Sparkles, AlertTriangle, ShieldCheck,
  Smartphone, Monitor, ExternalLink
} from 'lucide-react';

const TEMPLATES = [
  { id: 'ORDER_CUSTOMER', name: '🛍️ Confirmation Commande Client', desc: 'Envoyé à l\'acheteur après paiement/validation', icon: ShoppingBag, color: 'text-blue-500' },
  { id: 'ORDER_VENDOR', name: '🔔 Alerte Nouvelle Vente Vendeur', desc: 'Envoyé au marchand avec contact WhatsApp direct', icon: Bell, color: 'text-emerald-500' },
  { id: 'STATUS_UPDATE', name: '🚚 Suivi & Statut Livraison', desc: 'Notification de prise en charge et livraison coursier', icon: Truck, color: 'text-indigo-500' },
  { id: 'WELCOME_SELLER', name: '✨ Bienvenue Commerçant (Boutique)', desc: 'Guide et étapes de démarrage pour le vendeur', icon: Sparkles, color: 'text-amber-500' },
  { id: 'WELCOME_BUYER', name: '🎉 Bienvenue Nouvel Acheteur', desc: 'Accueil et découverte des fonctionnalités VeStyle', icon: Sparkles, color: 'text-purple-500' },
  { id: 'STOCK', name: '⚠️ Alerte Stock Faible', desc: 'Avertissement critique d\'inventaire (< 5 unités)', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'GENERIC', name: '🛡️ Sécurité & Système', desc: 'Notifications générales et alertes de compte', icon: ShieldCheck, color: 'text-slate-500' },
];

export default function AdminEmailsStudio() {
  const [activeTemplate, setActiveTemplate] = useState('ORDER_CUSTOMER');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'

  // Envoi test
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  // Charger le rendu HTML
  const loadPreview = async (tplId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/emails/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: tplId })
      });
      const data = await res.json();
      if (data.html) {
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error('Erreur chargement preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview(activeTemplate);
  }, [activeTemplate]);

  // Envoyer un vrai email de test
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setSending(true);
    setSendSuccess('');
    setSendError('');

    try {
      const res = await fetch('/api/emails/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail.trim(),
          type: activeTemplate,
          subject: 'Test VeStyle Email Studio',
          data: {
            customerName: 'Acheteur Test',
            vendorName: 'Commerçant Test',
            storeName: 'Boutique VeStyle Test',
            orderId: 'VS-TEST-99',
            amount: 45000,
            productName: 'Sneakers VeStyle Signature',
            stock: 2,
            message: 'Ceci est un email de démonstration généré en direct par le Studio VeStyle.',
            statusTitle: 'Colis en cours de livraison',
            statusMessage: 'Votre livreur est à 5 minutes de votre position.',
            statusIcon: '🚀'
          }
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Échec de l\'envoi');
      }

      setSendSuccess(`Email envoyé avec succès à ${testEmail.trim()} !`);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête Studio */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Mail size={13} /> VeStyle Email Studio Pro
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Centre de Gestion &amp; Design des Emails
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Visualisez en temps réel et testez instantanément tous les emails transactionnels de la plateforme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
            >
              &larr; Retour Admin
            </Link>
          </div>
        </div>

        {/* Grille Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Colonne Gauche : Sélection des Templates & Formulaire de test (5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Liste des Templates */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                Templates Disponibles (6)
              </h2>
              <div className="space-y-1.5">
                {TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  const isActive = activeTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setActiveTemplate(tpl.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isActive
                          ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl bg-slate-800/80 ${tpl.color} shrink-0 mt-0.5`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold leading-snug">{tpl.name}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{tpl.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boîte d'Envoi de Test Direct */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Send size={16} /> Envoyer un Test Live
              </div>
              <p className="text-xs text-slate-400">
                Testez la réception réelle dans votre boîte de réception en moins de 2 secondes.
              </p>

              <form onSubmit={handleSendTest} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Votre email (ex: vous@gmail.com)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !testEmail}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Envoyer cet email maintenant
                    </>
                  )}
                </button>
              </form>

              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}
            </div>

          </div>

          {/* Colonne Droite : Preview Live (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Contrôles du Visualiseur */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Eye size={15} className="text-blue-400" /> Prévisualisation Haute Définition
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Desktop / Mobile */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor size={13} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} /> Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => loadPreview(activeTemplate)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  title="Rafraîchir"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Iframe Preview Container */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 sm:p-6 flex justify-center min-h-[640px] items-start">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
                  <RefreshCw size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-bold">Génération du template...</span>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white ${
                    viewMode === 'mobile' ? 'w-[375px] h-[680px]' : 'w-full h-[680px]'
                  }`}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
