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
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ text: '', ratio: 0 });
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

  const initEngine = async () => {
    if (engine) return;
    setLoading(true);
    setError(null);
    try {
      const selectedModel = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
      
      const newEngine = await CreateMLCEngine(
        selectedModel,
        { 
          initProgressCallback: (info) => {
            setProgress({ text: info.text, ratio: info.progress });
          } 
        }
      );
      setEngine(newEngine);
    } catch (err) {
      console.error("WebLLM Error:", err);
      setError("Votre navigateur ne supporte pas WebGPU ou une erreur s'est produite lors du chargement de l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!engine && !loading && !error) {
      initEngine();
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !engine || isTyping) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Construction du contexte
      const productList = products.slice(0, 20).map(p => `- ${p.name} (${p.price} FCFA)`).join('\n');
      const systemPrompt = {
        role: 'system',
        content: `Tu es ${store.ai_name}, un assistant virtuel pour la boutique ${store.name}. 
${store.ai_prompt}
Voici la description de la boutique: ${store.description}.
Voici quelques produits disponibles :
${productList}
Règles :
- Parle en français.
- Sois concis (max 3 phrases par réponse).
- Si on demande d'acheter, dis de cliquer sur "Ajouter au panier" sur la page.
- N'invente pas de produits qui ne sont pas dans la liste.`
      };

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const reply = await engine.chat.completions.create({
        messages: [systemPrompt, ...history, userMsg]
      });

      setMessages(prev => [...prev, { role: 'assistant', content: reply.choices[0].message.content }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré un problème pour générer ma réponse." }]);
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
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[85] bg-indigo-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-110 active:scale-95 transition-all group"
      >
        <BotIcon size={28} className="group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BotIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{store.ai_name}</h3>
                <p className="text-[10px] text-indigo-200 flex items-center gap-1"><SparklesIcon size={10}/> Propulsé par Llama 3.2</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><XIcon size={20} /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Loader2Icon className="animate-spin text-indigo-600" size={32} />
                <div>
                  <p className="font-bold text-slate-700 text-sm">Chargement du cerveau IA...</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">La première fois, cela peut prendre 1 à 2 minutes. Les données restent dans votre navigateur.</p>
                </div>
                {progress.ratio > 0 && (
                  <div className="w-3/4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress.ratio * 100}%` }}></div>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 truncate w-64">{progress.text}</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                <AlertCircleIcon className="text-red-500" size={32} />
                <p className="text-sm font-bold text-slate-700">{error}</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading || !!error || isTyping}
                placeholder="Posez une question..."
                className="w-full bg-slate-100 rounded-full py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={loading || !!error || isTyping || !input.trim()}
                className="absolute right-1 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <SendIcon size={16} className="-ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
