'use client';
import { useState, useEffect, useRef } from 'react';

// ── Icônes SVG inline (évite les bugs Turbopack/Lucide) ──
const BotIcon = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);
const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const SendIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const Loader2Icon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/>
    <path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
    <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
  </svg>
);
const SparklesIcon = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3 1.91 5.81L19 12l-5.09 3.19L12 21l-1.91-5.81L5 12l5.09-3.19L12 3Z"/>
  </svg>
);
const VolumeIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    {active ? (
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    ) : (
      <>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </>
    )}
  </svg>
);

// Lecture audio base64 MP3
function playBase64Audio(base64) {
  const audio = new Audio(`data:audio/mp3;base64,${base64}`);
  audio.play().catch(console.warn);
  return audio;
}

export default function StoreAIChat({ store, products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Bonjour ! Je suis ${store?.ai_name || 'l\'assistant'}, votre conseiller pour ${store?.name || 'cette boutique'}. Comment puis-je vous aider ?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [playingIdx, setPlayingIdx] = useState(null);
  const chatSessionStartedRef = useRef(false);
  const messagesEndRef = useRef(null);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Notification vendeur au premier message
    if (!chatSessionStartedRef.current) {
      chatSessionStartedRef.current = true;
      fetch('/api/emails/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: store?.owner_email || 'admin@vestyle.com',
          subject: `Nouveau message sur ${store?.name}`,
          type: 'MESSAGE',
          data: { message: `Un client discute avec votre assistant IA.` }
        })
      }).catch(() => {});
    }

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const productList = (products || []).slice(0, 15)
        .map(p => `- ${p.name} (${p.price} FCFA)`)
        .join('\n');

      const systemPrompt = {
        role: 'system',
        content: `Tu es ${store?.ai_name || 'l\'assistant IA'}, conseiller virtuel premium de la boutique ${store?.name || 'cette boutique'}.
${store?.ai_prompt || ''}
Description: ${store?.description || ''}.
Produits disponibles:
${productList}
Règles: réponds en français, sois élégant et concis, n'invente pas de produits, guide vers l'achat.`
      };

      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemPrompt, ...history, userMsg],
          tts: ttsEnabled
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newMsgIdx = messages.length + 1; // index futur du message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        audioBase64: data.audioBase64 || null
      }]);

      // Lecture automatique si TTS activé
      if (ttsEnabled && data.audioBase64) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
        setPlayingIdx(newMsgIdx);
        currentAudioRef.current = playBase64Audio(data.audioBase64);
        currentAudioRef.current.onended = () => setPlayingIdx(null);
      }

    } catch (err) {
      console.error('[StoreAIChat] Erreur:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une difficulté technique. Pourriez-vous reformuler ?'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlayAudio = (msg, idx) => {
    if (!msg.audioBase64) return;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); }
    if (playingIdx === idx) { setPlayingIdx(null); return; }
    setPlayingIdx(idx);
    currentAudioRef.current = playBase64Audio(msg.audioBase64);
    currentAudioRef.current.onended = () => setPlayingIdx(null);
  };

  if (!store?.ai_enabled) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[85] bg-wa-teal text-white p-4 rounded-full shadow-[0_0_20px_rgba(18,140,126,0.4)] hover:scale-110 active:scale-95 transition-all group"
        aria-label="Ouvrir le chat IA"
      >
        <BotIcon size={28} className="group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-wa-teal border-2 border-white"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] w-[350px] sm:w-[400px] h-[580px] max-h-[82vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-gradient-to-br from-wa-teal to-emerald-800 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BotIcon size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">{store.ai_name}</h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest flex items-center gap-1">
                  <SparklesIcon size={10} /> Expert IA • Gemini
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle TTS */}
              <button
                onClick={() => setTtsEnabled(v => !v)}
                title={ttsEnabled ? 'Désactiver la voix' : 'Activer la voix (Google TTS)'}
                className={`p-2 rounded-xl transition-colors ${ttsEnabled ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-emerald-200'}`}
              >
                <VolumeIcon size={18} active={ttsEnabled} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <XIcon size={20} />
              </button>
            </div>
          </div>

          {/* TTS Banner */}
          {ttsEnabled && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2">
              <VolumeIcon size={12} className="text-emerald-600" active />
              <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Voix activée — Google TTS</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm relative ${
                  m.role === 'user'
                    ? 'bg-wa-teal text-white rounded-br-sm font-medium'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm leading-relaxed'
                }`}>
                  {m.content}
                  {/* Bouton lecture audio pour les messages assistant */}
                  {m.role === 'assistant' && m.audioBase64 && (
                    <button
                      onClick={() => handlePlayAudio(m, i)}
                      className={`mt-2 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                        playingIdx === i
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <VolumeIcon size={10} active={playingIdx === i} />
                      {playingIdx === i ? 'En cours…' : 'Écouter'}
                    </button>
                  )}
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

          {/* Input */}
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
                {isTyping ? <Loader2Icon size={18} className="animate-spin" /> : <SendIcon size={18} />}
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest opacity-60">
              Propulsé par VesTyle AI • Google Gemini
            </p>
          </div>
        </div>
      )}
    </>
  );
}
