import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: "Comment puis-je passer une commande ?",
      a: "Pour passer une commande, ajoutez simplement les articles souhaités à votre panier, cliquez sur l'icône du panier, puis suivez les étapes de paiement sécurisé. Une fois la commande confirmée, vous recevrez un e-mail de confirmation."
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "Les délais de livraison varient en fonction de votre position géographique et de la boutique partenaire. En général, les livraisons locales prennent entre 24h et 48h."
    },
    {
      q: "Puis-je retourner un article ?",
      a: "Oui, vous pouvez retourner un article dans les 7 jours suivant la réception, à condition qu'il n'ait pas été porté et que l'étiquette soit toujours attachée. Contactez notre service client pour initier le retour."
    },
    {
      q: "Comment devenir vendeur sur VESTYLE ?",
      a: "C'est très simple ! Cliquez sur \"Devenir Vendeur\" dans le menu, créez votre compte boutique et commencez à ajouter vos articles. Notre équipe validera votre boutique dans les plus brefs délais."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-10">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Questions <span className="text-wa-teal">Fréquentes</span>
        </h1>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 text-lg">
                <span>{faq.q}</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown size={20} className="text-slate-400" />
                </span>
              </summary>
              <p className="text-slate-600 font-medium mt-4 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
