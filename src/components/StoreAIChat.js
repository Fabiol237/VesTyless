'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// ── Icônes SVG inline ──────────────────────────────────────────────────────
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
const CartIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
const CheckCircleIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
);
const PackageIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.55 4.24"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/>
  </svg>
);
const ArrowRightIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const MicIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);
const VolumeIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);
const VolumeOffIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

// ── Suggestions rapides ────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { emoji: '📦', label: 'Voir les produits' },
  { emoji: '💰', label: 'Calculer un total' },
  { emoji: '🛒', label: 'Ajouter au panier' },
  { emoji: '📞', label: 'Passer commande' },
];

// ── Utilitaires TTS (Text-to-Speech) ──────────────────────────────────────
function speakText(text, onStart, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  // Annuler la parole précédente
  window.speechSynthesis.cancel();

  // Nettoyer le texte des markdown **bold** etc.
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/━+/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  const utter = new SpeechSynthesisUtterance(cleanText);
  utter.lang = 'fr-FR';
  utter.rate = 1.0;
  utter.pitch = 1.05;
  utter.volume = 1;

  // Choisir une voix française si disponible
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.lang.startsWith('fr'))
    || voices[0];
  if (frVoice) utter.voice = frVoice;

  utter.onstart = () => onStart?.();
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utter);
}

// ── Composant principal ────────────────────────────────────────────────────
export default function StoreAIChat({ store, products }) {
  const { cart, addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis **${store?.ai_name || 'votre assistant'}** de la boutique **${store?.name || 'VesTyle'}**. 🛍️\n\nJe peux vous aider à trouver des produits, les ajouter à votre panier et même passer commande directement ici ! Comment puis-je vous aider ?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ── Voice states ──
  const [voiceEnabled, setVoiceEnabled] = useState(true);  // TTS activé par défaut
  const [isListening, setIsListening] = useState(false);   // STT en cours
  const [isSpeaking, setIsSpeaking] = useState(false);     // TTS en cours
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef(null);
  const chatSessionStartedRef = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Articles de CETTE boutique dans le panier
  const storeCartItems = cart.filter((item) => item.store_id === store?.id);
  const storeCartCount = storeCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const storeCartTotal = storeCartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // ── Détecter le support voix ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasTts = 'speechSynthesis' in window;
      setVoiceSupported(hasSpeechRecognition);
      setTtsSupported(hasTts);

      // Pré-charger les voix
      if (hasTts) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Arrêter la voix quand on ferme le chat ──
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      setIsSpeaking(false);
      setIsListening(false);
    }
  }, [isOpen]);

  // ── STT : Démarrer/arrêter la reconnaissance vocale ──
  const toggleListening = useCallback(() => {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Arrêter le TTS si en cours
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimTranscript(interim);
      if (final.trim()) {
        setInput(final.trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (e) => {
      console.warn('[STT] Erreur:', e.error);
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      // Auto-envoyer si du texte a été capturé
      setTimeout(() => {
        setInput(prev => {
          if (prev.trim()) {
            // Déclencher l'envoi via le form
            document.getElementById('ai-chat-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
          return prev;
        });
      }, 300);
    };

    recognition.start();
  }, [isListening, isSpeaking, voiceSupported]);

  // ── Passer une commande via Supabase ──────────────────────────────────
  const executeOrderPlacement = async (customerName, customerPhone) => {
    if (!store?.id || storeCartItems.length === 0) return null;
    try {
      setPlacingOrder(true);
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          store_id: store.id,
          customer_name: customerName,
          customer_phone: customerPhone.replace(/\D/g, ''),
          total_amount: storeCartTotal,
          order_items: storeCartItems,
          status: 'pending',
        }])
        .select('id, created_at')
        .single();

      if (error) throw error;

      // Notifier le vendeur (non bloquant)
      fetch('/api/emails/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: store.owner_email || 'admin@vestyle.com',
          subject: `🛍️ Nouvelle commande IA sur ${store.name} !`,
          type: 'ORDER',
          data: {
            message: `${customerName} a passé une commande via le chatbot IA pour un total de ${storeCartTotal.toLocaleString()} FCFA.`,
            amount: storeCartTotal.toLocaleString(),
            customer: customerName,
          },
        }),
      }).catch(() => {});

      // Notif interne Supabase (non bloquant)
      supabase.from('notifications').insert([{
        user_id: store.owner_id || null,
        store_id: store.id,
        type: 'order_placed',
        title: '🛍️ Nouvelle commande via IA !',
        message: `${customerName} a commandé pour ${storeCartTotal.toLocaleString()} F via le chatbot.`,
        related_order_id: order.id,
      }]).catch(() => {});

      return order;
    } catch (err) {
      console.error('[StoreAIChat] Erreur commande:', err);
      return null;
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Envoyer un message ─────────────────────────────────────────────────
  const sendMessage = async (e, overrideInput) => {
    e?.preventDefault();
    const text = overrideInput || input;
    if (!text.trim() || isTyping) return;

    // Arrêter le TTS en cours
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    // Notifier le vendeur à la première interaction
    if (!chatSessionStartedRef.current) {
      chatSessionStartedRef.current = true;
      fetch('/api/emails/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: store?.owner_email || 'admin@vestyle.com',
          subject: `💬 Nouveau client sur ${store?.name}`,
          type: 'MESSAGE',
          data: { message: `Un client interagit avec votre assistant IA.` },
        }),
      }).catch(() => {});
    }

    const userMsg = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const systemPrompt = {
        role: 'system',
        content: `Tu es ${store?.ai_name || "l'assistant IA"} de la boutique "${store?.name || 'VesTyle'}".
${store?.ai_prompt ? `Instructions spéciales: ${store.ai_prompt}` : ''}
Description boutique: ${store?.description || 'Boutique de mode'}.
Panier actuel du client: ${
  storeCartCount > 0
    ? `${storeCartCount} article(s) • Total: ${storeCartTotal.toLocaleString()} FCFA`
    : 'Vide'
}.`,
      };

      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemPrompt, ...history, userMsg],
          storeId: store?.id,
          tts: false,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // ── Exécuter les actions retournées par Mistral ──
      const addedProducts = [];
      let orderResult = null;
      let showCart = false;

      if (Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.type === 'add_to_cart' && action.product?.id) {
            const productToAdd = {
              id: action.product.id,
              name: action.product.name,
              price: Number(action.product.price) || 0,
              image_url: action.product.image_url || null,
              store_id: store.id,
              store_name: store.name,
              quantity: 1,
            };
            addToCart(productToAdd);
            addedProducts.push(productToAdd);
            showCart = true;
          }
          if (action.type === 'place_order' && action.customer_name && action.customer_phone) {
            orderResult = await executeOrderPlacement(action.customer_name, action.customer_phone);
          }
          if (action.type === 'show_cart') showCart = true;
        }
      }

      // ── Ajouter la réponse IA dans le chat ──
      const aiMessage = {
        role: 'assistant',
        content: data.content,
        addedProducts,
        orderResult,
        showCart: showCart && (storeCartCount + addedProducts.length) > 0,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // ── TTS : Lire la réponse à voix haute si voix activée ──
      if (voiceEnabled && ttsSupported && data.content) {
        speakText(
          data.content,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }

    } catch (err) {
      console.error('[StoreAIChat] Erreur:', err);
      const errMsg = "Désolé, j'ai rencontré un problème technique. Pourriez-vous reformuler votre demande ?";
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
      if (voiceEnabled && ttsSupported) {
        speakText(errMsg, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (!store?.ai_enabled) return null;

  return (
    <>
      {/* ── Bouton flottant ──────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[85] bg-wa-teal text-white p-4 rounded-full shadow-[0_0_24px_rgba(18,140,126,0.45)] hover:scale-110 active:scale-95 transition-all group"
        aria-label="Ouvrir le chat IA"
      >
        <BotIcon size={28} className="group-hover:animate-bounce" />

        {/* Indicateur vocal actif */}
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white" />
          </span>
        )}

        {/* Badge panier */}
        {!isSpeaking && storeCartCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-emerald-400 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white">
            {storeCartCount}
          </span>
        ) : !isSpeaking ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-wa-teal border-2 border-white" />
          </span>
        ) : null}
      </button>

      {/* ── Fenêtre de chat ──────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] w-[350px] sm:w-[410px] h-[640px] max-h-[88vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-gradient-to-br from-wa-teal to-emerald-800 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              {/* Avatar IA avec animation "parle" */}
              <div className={`relative w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${isSpeaking ? 'ring-2 ring-emerald-300 ring-offset-1 ring-offset-transparent' : ''}`}>
                <BotIcon size={24} />
                {/* Ondes sonores quand l'IA parle */}
                {isSpeaking && (
                  <div className="absolute -bottom-1 -right-1 flex gap-[2px] items-end">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-emerald-300 rounded-full"
                        style={{
                          height: `${6 + i * 3}px`,
                          animation: `soundWave 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
                  {store.ai_name || 'Assistant IA'}
                  {isSpeaking && (
                    <span className="text-[9px] bg-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                      Parle…
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest flex items-center gap-1">
                  <SparklesIcon size={10} /> Expert IA • Mistral
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Activer/Désactiver voix IA */}
              {ttsSupported && (
                <button
                  onClick={() => {
                    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
                    setVoiceEnabled(v => !v);
                  }}
                  title={voiceEnabled ? 'Désactiver la voix IA' : 'Activer la voix IA'}
                  className={`p-2 rounded-xl transition-all ${voiceEnabled ? 'bg-emerald-400/30 hover:bg-emerald-400/50' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {voiceEnabled ? <VolumeIcon size={14} /> : <VolumeOffIcon size={14} />}
                </button>
              )}

              {/* Mini panier dans le header */}
              {storeCartCount > 0 && (
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors border border-white/10"
                >
                  <CartIcon size={12} />
                  {storeCartCount} art.
                </Link>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>

          {/* Bandeau panier si articles présents */}
          {storeCartCount > 0 && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-emerald-700">
                <CartIcon size={13} />
                <span className="text-[11px] font-black">{storeCartCount} article(s) • {storeCartTotal.toLocaleString()} FCFA</span>
              </div>
              <Link href="/cart" className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline-offset-2 hover:underline">
                Voir le panier <ArrowRightIcon size={10} />
              </Link>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[90%] space-y-2">

                  {/* Bulle message */}
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-wa-teal text-white rounded-br-sm font-medium'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm leading-relaxed'
                  }`}>
                    {m.content}

                    {/* Bouton rejouer la voix pour les messages IA */}
                    {m.role === 'assistant' && ttsSupported && voiceEnabled && i > 0 && (
                      <button
                        onClick={() => speakText(m.content, () => setIsSpeaking(true), () => setIsSpeaking(false))}
                        className="ml-2 inline-flex items-center gap-1 text-[9px] text-slate-400 hover:text-wa-teal transition-colors"
                        title="Relire ce message"
                      >
                        <VolumeIcon size={10} />
                      </button>
                    )}
                  </div>

                  {/* Chips produits ajoutés au panier */}
                  {m.addedProducts?.length > 0 && (
                    <div className="space-y-1.5">
                      {m.addedProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 shadow-sm animate-fade-in">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-emerald-100" />
                          ) : (
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                              <PackageIcon size={16} className="text-emerald-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-emerald-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-emerald-600 font-bold">{Number(p.price).toLocaleString()} FCFA</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <CheckCircleIcon size={15} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600">Ajouté</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton voir panier */}
                  {m.showCart && (
                    <Link
                      href="/cart"
                      className="flex items-center justify-between gap-2 bg-wa-teal hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black transition-colors shadow-md shadow-wa-teal/20 group"
                    >
                      <span className="flex items-center gap-1.5">
                        <CartIcon size={13} />
                        Voir le panier ({storeCartCount + (m.addedProducts?.length || 0)} art.)
                      </span>
                      <span className="flex items-center gap-1">
                        {storeCartTotal.toLocaleString()} F
                        <ArrowRightIcon size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  )}

                  {/* Confirmation commande */}
                  {m.orderResult && (
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl space-y-2 shadow-lg">
                      <p className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircleIcon size={14} /> Commande Confirmée !
                      </p>
                      <p className="text-[11px] text-emerald-100">
                        Référence : <span className="font-black text-white">#{m.orderResult.id?.slice(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-[11px] text-emerald-100">
                        Montant : <span className="font-black text-white">{storeCartTotal.toLocaleString()} FCFA</span>
                      </p>
                      <Link
                        href={`/suivi/${m.orderResult.id}`}
                        className="flex items-center justify-center gap-1.5 text-[10px] font-black bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl transition-colors mt-1"
                      >
                        Suivre ma commande <ArrowRightIcon size={10} />
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* Transcript vocal en cours */}
            {(isListening && interimTranscript) && (
              <div className="flex justify-end">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-wa-teal/20 border border-wa-teal/30 text-sm text-wa-teal font-medium italic">
                  {interimTranscript}…
                </div>
              </div>
            )}

            {/* Indicateur de frappe */}
            {(isTyping || placingOrder) && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  {placingOrder ? (
                    <>
                      <Loader2Icon size={14} className="animate-spin text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-bold">Validation de la commande…</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-wa-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides (affiché seulement au début) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Suggestions rapides</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(null, q.label)}
                    className="shrink-0 text-[10px] font-black bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition-all"
                  >
                    {q.emoji} {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie + bouton microphone */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">

            {/* Indicateur microphone actif */}
            {isListening && (
              <div className="mb-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-3 py-2">
                <div className="flex gap-[3px] items-center">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="w-[3px] bg-red-500 rounded-full"
                      style={{
                        height: `${8 + Math.random() * 12}px`,
                        animation: `soundWave 0.4s ease-in-out ${i * 0.08}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-red-600">Écoute en cours… Parlez maintenant</span>
                <button
                  onClick={toggleListening}
                  className="ml-auto text-[9px] font-black text-red-500 hover:text-red-700 underline"
                >
                  Annuler
                </button>
              </div>
            )}

            <form id="ai-chat-form" onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping || placingOrder || isListening}
                placeholder={isListening ? 'Écoute…' : 'Posez votre question…'}
                className="flex-1 bg-slate-100 rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all disabled:opacity-50 font-medium"
              />

              {/* Bouton microphone */}
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isTyping || placingOrder}
                  title={isListening ? 'Arrêter l\'écoute' : 'Parler à l\'IA'}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse'
                      : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 shadow-slate-100/50'
                  } disabled:opacity-50`}
                >
                  <MicIcon size={18} />
                </button>
              )}

              {/* Bouton envoyer */}
              <button
                type="submit"
                disabled={isTyping || placingOrder || !input.trim()}
                className="w-11 h-11 bg-wa-teal text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-wa-teal/20 active:scale-95 shrink-0"
              >
                {isTyping || placingOrder
                  ? <Loader2Icon size={16} className="animate-spin" />
                  : <SendIcon size={16} />
                }
              </button>
            </form>

            <p className="text-[9px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">
              {voiceEnabled && ttsSupported ? '🎤 Voix activée • ' : ''}Propulsé par VesTyle AI • Mistral
            </p>
          </div>

        </div>
      )}

      {/* ── Animation CSS pour les ondes sonores ─────────────────────────── */}
      <style jsx global>{`
        @keyframes soundWave {
          0%   { transform: scaleY(0.4); opacity: 0.6; }
          100% { transform: scaleY(1.2); opacity: 1; }
        }
      `}</style>
    </>
  );
}
