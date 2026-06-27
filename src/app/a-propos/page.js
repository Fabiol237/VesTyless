import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-10">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          À propos de <span className="text-wa-teal">VESTYLE</span>
        </h1>
        
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Notre Mission</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-medium">
              VESTYLE est né d'une vision simple : connecter les passionnés de mode aux meilleures boutiques locales et internationales. Nous croyons que le style est une expression personnelle et que l'accès aux vêtements de qualité devrait être facile, rapide et fiable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Pourquoi VESTYLE ?</h2>
            <ul className="space-y-4">
              {[
                "Une sélection rigoureuse des meilleures boutiques partenaires.",
                "Une plateforme sécurisée pour toutes vos transactions.",
                "Un système de livraison rapide et transparent.",
                "Un service client dédié, à votre écoute 7j/7."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-lg">
                  <CheckCircle className="text-wa-teal shrink-0 mt-1" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Notre Équipe</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-medium">
              Basée en Afrique, notre équipe est composée d'experts en technologie, de passionnés de mode et de professionnels de la logistique. Ensemble, nous travaillons chaque jour pour vous offrir la meilleure expérience e-commerce possible.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
