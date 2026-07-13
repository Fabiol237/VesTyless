'use client';
import { useState, useCallback } from 'react';

export default function SellerAssistantPanel({ storeId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Besoin d\'aide pour répondre à un client, générer un rapport ou faire des calculs robustes ?', ts: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [error, setError] = useState('');

  const safeExpression = useCallback((text) => {
    const cleaned = text.replace(/,/g, '.').match(/[-+*/().\d\s]+/g)?.join('')?.trim();
    if (!cleaned || cleaned.length > 200 || !/^[0-9+\-*/().\s]+$/.test(cleaned)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const value = Function('"use strict"; return (' + cleaned + ')')();
      if (typeof value !== 'number' || !Number.isFinite(value)) return null;
      return Math.round((value + Number.EPSILON) * 1000000) / 1000000;
    } catch {
      return null;
    }
  }, []);

  const downloadReport = () => {
    if (!storeId) return;
    setReportLoading(true);
    try {
      window.open(`/api/ai/weekly-report?storeId=${encodeURIComponent(storeId)}&format=html`, '_blank');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!storeId) return;
    setCsvLoading(true);
    try {
      window.open(`/api/ai/weekly-report?storeId=${encodeURIComponent(storeId)}&format=csv`, '_blank');
    } finally {
      setCsvLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    setError('');
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, ts: new Date() }]);

    const expr = safeExpression(msg.toLowerCase());
    if (expr !== null && /calc|calcul|addition|soustraction|multiplication|division|pourcentage|%/.test(msg.toLowerCase())) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `✅ Calcul effectué : ${expr}`, ts: new Date() }]);
      return;
    }

    setLoading(true);
    try {
      const action = msg.toLowerCase().includes('rapport')
        ? 'daily_summary'
        : msg.toLowerCase().includes('action') || msg.toLowerCase().includes('suggère')
        ? 'quick_actions'
        : 'suggest_reply';

      const res = await fetch('/api/ai/seller-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          action,
          messages: [{ role: 'user', content: msg }],
          period: '24h',
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.actions) {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Voici des actions prioritaires pour aujourd\'hui 👇', ts: new Date(), actions: data.actions }]);
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || '✅ Fait !', ts: new Date() }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${data.error}`, ts: new Date(), isError: true }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Erreur de connexion', ts: new Date(), isError: true }]);
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setOpen(true)}
          className="bg-purple-600 shadow-2xl shadow-purple-500/20 hover:shadow-purple-700/30 transition-all text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-black"
          aria-label="Ouvrir l'assistant vendeur"
        >
          🤖
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-sm flex items-end justify-end p-4 sm:p-6">
          <div className="w-full max-w-3xl h-[calc(100vh-48px)] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">🤖</div>
                <div>
                  <h3 className="text-white font-black text-sm">Assistant Vendeur</h3>
                  <p className="text-purple-200 text-[10px] font-bold">Boutique intelligente • Rapports, calculs, contrôle</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadReport}
                  disabled={reportLoading || !storeId}
                  className="bg-white/15 text-white text-xs font-black px-3 py-2 rounded-2xl hover:bg-white/25 transition-all disabled:opacity-40"
                >
                  {reportLoading ? 'Génération...' : 'Rapport PDF'}
                </button>
                <button
                  onClick={downloadCsv}
                  disabled={csvLoading || !storeId}
                  className="bg-white/15 text-white text-xs font-black px-3 py-2 rounded-2xl hover:bg-white/25 transition-all disabled:opacity-40"
                >
                  {csvLoading ? 'Export...' : 'Exporter CSV'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="bg-white/15 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/25 transition-all"
                  aria-label="Fermer l'assistant"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-[12px] text-slate-500">
                <strong>Garde-fous :</strong> Ne créez jamais de commande automatique depuis l'IA. Tous les calculs sont faits localement si possible. Les rapports ouvrent une page imprimable avec logo et signature.
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                        m.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : m.isError
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                      {m.actions && (
                        <div className="mt-3 space-y-2 border-t border-purple-100 pt-2">
                          {m.actions.map((a, j) => (
                            <a
                              key={j}
                              href={a.link || '#'}
                              className={`flex items-center justify-between p-2 rounded-xl text-[11px] font-bold ${
                                a.priority === 'high'
                                  ? 'bg-red-50 text-red-700'
                                  : a.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-green-50 text-green-700'
                              }`}
                            >
                              <span>{a.icon || '•'} {a.title}</span>
                              <span className="text-[9px] opacity-60">{a.priority}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Résume ma semaine, calculer 12*45, ou génère un rapport"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-5 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs hover:bg-purple-700 disabled:opacity-50 transition-all"
                  >
                    Envoyer
                  </button>
                </form>
                {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
