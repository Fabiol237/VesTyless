import { useState, useEffect, useRef } from 'react';

// Bulletproof SVG Icons (Bypassing Lucide/Turbopack bug)
const BotIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const SendIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const Loader2Icon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
const SparklesIcon = ({ size = 10, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/></svg>
);
const AlertCircleIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
import { CreateMLCEngine } from '@mlc-ai/web-llm';

export default function StoreAIChat({ store, products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Bonjour ! Je suis ${store.ai_name}, l'assistant de ${store.name}. Comment puis-je vous aider aujourd'hui ?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Construction du contexte
      const productList = products.slice(0, 15).map(p => `- ${p.name} (${p.price} FCFA)`).join('\n');
      const systemPrompt = {
        role: 'system',
        content: `Tu es ${store.ai_name}, un assistant virtuel premium pour la boutique ${store.name}. 
${store.ai_prompt || ''}
Description de la boutique: ${store.description || ''}.
Produits disponibles :
${productList}
Règles strictes :
- Réponds toujours en français.
- Sois poli, élégant et concis.
- N'invente jamais de produits.
- Guide le client vers le panier pour acheter.`
      };

      const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemPrompt, ...history, userMsg]
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré une petite difficulté technique. Pourriez-vous reformuler ?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!store?.ai_enabled) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={handleOpen}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[85] bg-wa-teal text-white p-4 rounded-full shadow-[0_0_20px_rgba(18,140,126,0.4)] hover:scale-110 active:scale-95 transition-all group"
      >
        <BotIcon size={28} className="group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-wa-teal border-2 border-white"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 border border-slate-100">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-wa-teal to-emerald-800 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BotIcon size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">{store.ai_name}</h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest flex items-center gap-1">
                  <SparklesIcon size={10}/> Expert IA Boutique
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <XIcon size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-wa-teal text-white rounded-br-sm font-medium' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm leading-relaxed'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={sendMessage} className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isTyping}
                placeholder="Posez votre question..."
                className="flex-1 bg-slate-100 rounded-2xl py-4 px-5 text-sm outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all disabled:opacity-50 font-medium"
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="w-12 h-12 bg-wa-teal text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-wa-teal/20 active:scale-95"
              >
                <SendIcon size={18} />
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest opacity-60">
              Propulsé par VesTyle AI • Hugging Face
            </p>
          </div>
        </div>
      )}
    </>
  );
}
