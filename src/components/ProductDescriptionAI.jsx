'use client';
import { useState } from 'react';

export default function ProductDescriptionAI({ productName, category, onDescriptionGenerated }) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [lang, setLang] = useState('fr');
  const [length, setLength] = useState('medium');
  const [error, setError] = useState('');

  const generate = async () => {
    if (!productName?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, category, tone, lang, length }),
      });
      const data = await res.json();
      if (data.success) {
        setDescription(data.description);
        onDescriptionGenerated?.(data.description);
      } else throw new Error(data.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg">✨</div>
        <div>
          <h3 className="font-black text-slate-900 text-sm">Génération IA</h3>
          <p className="text-xs text-slate-400 font-medium">Mistral génère une description optimisée</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select value={tone} onChange={e => setTone(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
          <option value="professional">Professionnel</option>
          <option value="luxury">Luxe</option>
          <option value="casual">Décontracté</option>
          <option value="urgent">Urgent/Promo</option>
          <option value="seo">SEO</option>
        </select>
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
          <option value="wo">Wolof</option>
          <option value="ff">Peul</option>
        </select>
        <select value={length} onChange={e => setLength(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
          <option value="short">Court</option>
          <option value="medium">Moyen</option>
          <option value="long">Long</option>
        </select>
      </div>

      <button onClick={generate} disabled={loading || !productName?.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération...</> : <>✨ Générer la description</>}
      </button>

      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

      {description && (
        <div className="relative">
          <textarea value={description} readOnly rows={5}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 font-medium resize-none"
            onClick={e => { e.target.select(); navigator.clipboard.writeText(description); }}
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-bold bg-white px-2 py-1 rounded-lg shadow-sm">
            Cliquez pour copier
          </span>
        </div>
      )}
    </div>
  );
}
