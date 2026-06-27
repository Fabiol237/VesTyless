import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-10">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
          Contactez-<span className="text-wa-teal">Nous</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Envoyez-nous un message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nom complet</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-wa-teal/30 focus:border-wa-teal transition-all outline-none font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adresse Email</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-wa-teal/30 focus:border-wa-teal transition-all outline-none font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                <textarea rows="5" className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-wa-teal/30 focus:border-wa-teal transition-all outline-none font-medium resize-none"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-wa-teal text-white font-black rounded-2xl hover:bg-wa-teal-dark transition-colors mt-2">
                Envoyer le message
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 bg-wa-chat text-wa-teal rounded-2xl flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Email</h3>
                <p className="text-slate-500 font-medium mt-1">support@vestyle.com</p>
                <p className="text-xs text-slate-400 mt-1">Nous répondons sous 24h.</p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Téléphone</h3>
                <p className="text-slate-500 font-medium mt-1">+237 600 00 00 00</p>
                <p className="text-xs text-slate-400 mt-1">Lun-Ven, 8h - 18h</p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Bureaux</h3>
                <p className="text-slate-500 font-medium mt-1">Douala, Cameroun</p>
                <p className="text-xs text-slate-400 mt-1">Quartier Akwa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
