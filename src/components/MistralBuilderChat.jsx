'use client';
import { useState, useEffect, useRef } from 'react';

// ─── Icônes inline ────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const LoaderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/>
    <path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
    <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
  </svg>
);

const MicIcon = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    {active && <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5" opacity="0.4"/>}
  </svg>
);

// ─── Suggestions rapides ──────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { emoji: '🌟', text: 'Ajoute un grand hero plein écran avec dégradé violet' },
  { emoji: '🎠', text: 'Mets un carrousel d\'images en haut' },
  { emoji: '⭐', text: 'Ajoute une section avis clients élégante' },
  { emoji: '📊', text: 'Ajoute une barre de statistiques sombre' },
  { emoji: '❓', text: 'Ajoute une FAQ avec 3 questions' },
  { emoji: '⏱️', text: 'Crée un compte à rebours promotionnel' },
  { emoji: '🎨', text: 'Change le thème en mode luxe doré et sombre' },
  { emoji: '📝', text: 'Ajoute un bloc de texte pour présenter mon histoire' },
  { emoji: '🔗', text: 'Ajoute mes liens sociaux (Instagram, WhatsApp, TikTok)' },
  { emoji: '📧', text: 'Ajoute un formulaire de newsletter violet' },
];

// ─── Composant bulle de message ───────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot  = msg.role === 'assistant';
  const isUser = msg.role === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '12px',
      animation: 'bubbleIn 0.25s ease-out',
    }}>
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: isBot
          ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
          : 'linear-gradient(135deg,#059669,#10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        {isBot ? <BotIcon /> : <UserIcon />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
          : msg.isError
            ? '#fef2f2'
            : '#f1f5f9',
        color: isUser ? '#fff' : msg.isError ? '#dc2626' : '#1e293b',
        fontSize: '13px',
        lineHeight: '1.55',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, sans-serif',
        border: msg.isError ? '1px solid #fecaca' : 'none',
      }}>
        {/* Indicateur d'action réussie */}
        {isBot && msg.action && !msg.isError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            marginBottom: '6px', fontSize: '11px', color: '#22c55e', fontWeight: '700',
          }}>
            <CheckIcon /> Action appliquée
          </div>
        )}
        {msg.thinking ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#94a3b8',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function MistralBuilderChat({ storeId, onModulesUpdate, onThemeUpdate }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [history, setHistory]     = useState([]); // Pour undo
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Message de bienvenue
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: '✨ Bonjour ! Je suis Mistral, votre assistant design.\n\nDécrivez en langage naturel les modifications que vous souhaitez apporter à votre boutique.\n\nExemple : "Mets un grand hero avec fond violet et titre en dégradé doré"',
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    // Indicateur de chargement (thinking)
    setMessages(prev => [...prev, { role: 'assistant', thinking: true }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/builder-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, message: msg }),
      });

      const data = await res.json();

      // Supprimer l'indicateur thinking
      setMessages(prev => prev.filter(m => !m.thinking));

      if (!res.ok || data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ ${data.error || 'Une erreur est survenue. Réessayez.'}`,
          isError: true,
        }]);
      } else {
        // Sauvegarder l'état avant pour undo
        setHistory(prev => [...prev.slice(-9), {
          modules: data.previousModules,
          themeConfig: data.previousTheme,
          description: msg,
        }]);

        // Appliquer les changements sur le preview
        if (data.updatedModules) onModulesUpdate?.(data.updatedModules);
        if (data.themeConfig)    onThemeUpdate?.(data.themeConfig);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.assistantMessage || '✅ Modification appliquée !',
          action: data.toolCall,
        }]);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => !m.thinking));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Impossible de contacter l\'IA. Vérifiez votre connexion.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleUndo = async () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    if (last.modules)     onModulesUpdate?.(last.modules);
    if (last.themeConfig) onThemeUpdate?.(last.themeConfig);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `↩️ Annulé : "${last.description}"`,
    }]);
    // Persist undo to Supabase
    try {
      await fetch('/api/ai/builder-orchestrator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          modules: last.modules,
          themeConfig: last.themeConfig,
        }),
      });
    } catch {}
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#fff', fontFamily: 'Inter, sans-serif',
    }}>
      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        @keyframes spinAI { to { transform: rotate(360deg); } }
        .ai-input:focus { outline: none; border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .sugg-btn:hover { background: #f5f3ff !important; border-color: #7c3aed !important; color: #7c3aed !important; }
        .send-btn:hover { background: #6d28d9 !important; }
        .send-btn:disabled { background: #c4b5fd !important; cursor: not-allowed; }
        .undo-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Header ────────────────────────────────────── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <SparkleIcon />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>Mistral — Assistant IA</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px' }}>Maître d'orchestre de votre boutique</div>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleUndo}
            className="undo-btn"
            title="Annuler la dernière action"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <UndoIcon /> Annuler
          </button>
        )}
      </div>

      {/* ── Zone de messages ──────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column',
        scrollBehavior: 'smooth',
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions rapides ───────────────────────── */}
      {showSuggestions && messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Suggestions rapides
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {QUICK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="sugg-btn"
                onClick={() => sendMessage(s.text)}
                style={{
                  padding: '5px 10px', borderRadius: '20px',
                  border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#475569',
                  fontSize: '11px', fontWeight: '500',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                <span>{s.emoji}</span> {s.text.substring(0, 28)}{s.text.length > 28 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ─────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex', gap: '8px', alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }}
          placeholder="Décrivez vos modifications en français..."
          rows={2}
          style={{
            flex: 1, padding: '10px 13px', borderRadius: '12px',
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#1e293b', fontSize: '13px', lineHeight: '1.5',
            resize: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        {/* Bouton voix */}
        <button
          onClick={() => {
            if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
              alert('Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome.');
              return;
            }
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recog = new SR();
            recog.lang = 'fr-FR';
            recog.continuous = false;
            recog.interimResults = true;
            recog.onstart  = () => setIsListening(true);
            recog.onend    = () => setIsListening(false);
            recog.onerror  = () => setIsListening(false);
            recog.onresult = (e) => {
              const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
              setInput(transcript);
              if (e.results[0].isFinal) { setIsListening(false); setTimeout(() => sendMessage(), 100); }
            };
            recog.start();
          }}
          title="Commande vocale"
          style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: isListening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#f1f5f9',
            border: 'none', color: isListening ? '#fff' : '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <MicIcon active={isListening} />
        </button>
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          {loading
            ? <div style={{ animation: 'spinAI 0.8s linear infinite', display: 'flex' }}><LoaderIcon /></div>
            : <SendIcon />
          }
        </button>
      </div>

      {/* Badge bas */}
      <div style={{
        textAlign: 'center', padding: '6px',
        fontSize: '10px', color: '#94a3b8',
        borderTop: '1px solid #f1f5f9',
        background: '#f8fafc',
      }}>
        ⚡ Propulsé par <strong>Mistral AI</strong> · Validé · Temps réel
      </div>
    </div>
  );
}
