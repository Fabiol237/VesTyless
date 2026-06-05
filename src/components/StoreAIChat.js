'use client';
import { useState, useEffect, useRef } from 'react';
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

// ── Suggestions rapides ────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { emoji: '📦', label: 'Voir les produits' },
  { emoji: '💰', label: 'Calculer un total' },
  { emoji: '🛒', label: 'Ajouter au panier' },
  { emoji: '📞', label: 'Passer commande' },
];

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

  const chatSessionStartedRef = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Articles de CETTE boutique dans le panier
  const storeCartItems = cart.filter((item) => item.store_id === store?.id);
  const storeCartCount = storeCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const storeCartTotal = storeCartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

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
      // System prompt avec contexte boutique + panier actuel
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

          // Ajouter au panier
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

          // Passer une commande
          if (
            action.type === 'place_order' &&
            action.customer_name &&
            action.customer_phone
          ) {
            orderResult = await executeOrderPlacement(
              action.customer_name,
              action.customer_phone
            );
          }

          // Afficher le panier
          if (action.type === 'show_cart') showCart = true;
        }
      }

      // ── Ajouter la réponse IA dans le chat ──
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
          addedProducts,
          orderResult,
          showCart: showCart && (storeCartCount + addedProducts.length) > 0,
        },
      ]);
    } catch (err) {
      console.error('[StoreAIChat] Erreur:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, j'ai rencontré un problème technique. Pourriez-vous reformuler votre demande ?",
        },
      ]);
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

        {/* Badge panier */}
        {storeCartCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-emerald-400 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white">
            {storeCartCount}
          </span>
        ) : (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-wa-teal border-2 border-white" />
          </span>
        )}
      </button>

      {/* ── Fenêtre de chat ──────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[100] w-[350px] sm:w-[410px] h-[620px] max-h-[84vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-gradient-to-br from-wa-teal to-emerald-800 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BotIcon size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">{store.ai_name || 'Assistant IA'}</h3>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest flex items-center gap-1">
                  <SparklesIcon size={10} /> Expert IA • Mistral
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                  </div>

                  {/* Chips produits ajoutés au panier */}
                  {m.addedProducts?.length > 0 && (
                    <div className="space-y-1.5">
                      {m.addedProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 shadow-sm animate-fade-in"
                        >
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-emerald-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                              <PackageIcon size={16} className="text-emerald-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-emerald-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-emerald-600 font-bold">
                              {Number(p.price).toLocaleString()} FCFA
                            </p>
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

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping || placingOrder}
                placeholder="Posez votre question…"
                className="flex-1 bg-slate-100 rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-wa-teal/20 transition-all disabled:opacity-50 font-medium"
              />
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
              Propulsé par VesTyle AI • Mistral
            </p>
          </div>

        </div>
      )}
    </>
  );
}
