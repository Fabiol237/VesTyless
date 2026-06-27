import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-10">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Mentions <span className="text-wa-teal">Légales</span>
        </h1>
        
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Éditeur du site</h2>
            <p className="text-slate-600 font-medium">
              Le site VESTYLE est édité par la société VESTYLE S.A.S., au capital de 10 000 000 FCFA, immatriculée au Registre du Commerce et du Crédit Mobilier sous le numéro RC/DLA/2026/B/1234, dont le siège social est situé à Douala, Cameroun.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Hébergement</h2>
            <p className="text-slate-600 font-medium">
              Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Propriété Intellectuelle</h2>
            <p className="text-slate-600 font-medium">
              L'ensemble de ce site relève des législations camerounaise et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Données Personnelles</h2>
            <p className="text-slate-600 font-medium">
              Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Vous pouvez exercer ce droit en nous contactant à support@vestyle.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
