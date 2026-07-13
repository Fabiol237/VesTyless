'use client';
import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, t, getSavedLanguage, saveLanguage } from '@/lib/i18n';

const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z" fill="currentColor"/></svg>;
const CloseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChatIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const WhatsApp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>;

export default function StoreChatWidget({ storeId, storeSlug, primaryColor = '#6366f1', storeName = 'Boutique' }) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang]       = useState('fr');
  const [whatsapp, setWhatsapp] = useState(null);
  const [unread, setUnread]   = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { setLang(getSavedLanguage()); }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = t('chat.greeting', lang);
      setMessages([{ role: 'assistant', content: greeting, ts: new Date() }]);
      setUnread(0);
    }
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); setUnread(0); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: new Date() }]);
    setLoading(true);

    try {
      const history = messages.slice(-8);
      const res  = await fetch('/api/ai/store-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, storeSlug, message: msg, history }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Je suis désolé, je ne peux pas répondre pour l\'instant.';
      if (data.whatsapp) setWhatsapp(data.whatsapp);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: new Date() }]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Une erreur est survenue, réessayez.', ts: new Date() }]);
    }
    setLoading(false);
  };

  const suggestedQuestions = {
    fr: ['Quels sont vos prix ?', 'Livrez-vous ?', 'Comment commander ?', 'Quels produits avez-vous ?'],
    en: ['What are your prices?', 'Do you deliver?', 'How to order?', 'What products do you have?'],
    wo: ['Lan lay jirim yi?', 'Dañu dem ak?', 'Naka lañuy jënd?'],
  };

  const bubble = (color = primaryColor) => ({
    maxWidth: '80%', padding: '10px 14px', borderRadius: '16px',
    fontSize: '13px', lineHeight: 1.55, wordBreak: 'break-word',
  });

  return (
    <>
      <style>{`
        @keyframes chatBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes chatFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .chat-bubble:hover { transform: scale(1.05); }
      `}</style>

      {/* Widget flottant */}
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px' }}>

        {/* Panneau chat */}
        {open && (
          <div style={{ width:'340px', maxWidth:'calc(100vw - 48px)', background:'#fff', borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)', overflow:'hidden', animation:'chatFadeIn .25s ease-out', display:'flex', flexDirection:'column', maxHeight:'520px' }}>

            {/* Header */}
            <div style={{ padding:'14px 16px', background:`linear-gradient(135deg,${primaryColor},${primaryColor}dd)`, display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                💬
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontWeight:'800', fontSize:'13px' }}>{t('chat.title', lang)}</div>
                <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'11px' }}>{storeName}</div>
              </div>
              {/* Sélecteur langue */}
              <select value={lang} onChange={e => { setLang(e.target.value); saveLanguage(e.target.value); }}
                style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'6px', padding:'3px 6px', fontSize:'11px', fontFamily:'inherit', cursor:'pointer' }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ background:primaryColor }}>{l.flag} {l.label}</option>)}
              </select>
              <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><CloseIcon /></button>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px', background:'#f8fafc' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'6px' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:primaryColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0 }}>🤖</div>
                  )}
                  <div style={{
                    ...bubble(),
                    background: m.role === 'user' ? primaryColor : '#fff',
                    color:      m.role === 'user' ? '#fff' : '#1e293b',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius:  m.role === 'assistant' ? '4px' : '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display:'flex', gap:'6px', alignItems:'flex-end' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:primaryColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>🤖</div>
                  <div style={{ padding:'10px 14px', background:'#fff', borderRadius:'16px', borderBottomLeftRadius:'4px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'flex', gap:'4px', alignItems:'center', height:'16px' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#94a3b8', animation:`chatBounce .8s ${i*0.15}s ease-in-out infinite` }} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* Questions suggérées */}
              {messages.length <= 1 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'4px' }}>
                  {(suggestedQuestions[lang] || suggestedQuestions.fr).map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                      style={{ padding:'5px 10px', borderRadius:'12px', border:`1.5px solid ${primaryColor}40`, background:'#fff', color:primaryColor, fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* CTA WhatsApp */}
              {whatsapp && messages.length > 2 && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'#25d366', borderRadius:'12px', color:'#fff', fontWeight:'800', fontSize:'12px', textDecoration:'none' }}>
                  <WhatsApp /> Commander via WhatsApp
                </a>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding:'12px', borderTop:'1px solid #f1f5f9', display:'flex', gap:'8px', background:'#fff' }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                placeholder={t('chat.placeholder', lang)}
                style={{ flex:1, padding:'9px 14px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'13px', fontFamily:'inherit', outline:'none' }} />
              <button type="submit" disabled={!input.trim() || loading}
                style={{ width:'38px', height:'38px', borderRadius:'12px', background: input.trim() ? primaryColor : '#e2e8f0', border:'none', color: input.trim() ? '#fff' : '#94a3b8', cursor: input.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                <SendIcon />
              </button>
            </form>
          </div>
        )}

        {/* Bouton principal */}
        <button onClick={() => setOpen(o => !o)} className="chat-bubble"
          style={{ width:'56px', height:'56px', borderRadius:'50%', background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 24px ${primaryColor}50`, transition:'transform .2s', position:'relative' }}>
          {open ? <CloseIcon /> : <ChatIcon />}
          {!open && unread > 0 && (
            <div style={{ position:'absolute', top:'-2px', right:'-2px', width:'18px', height:'18px', borderRadius:'50%', background:'#ef4444', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'900', color:'#fff' }}>{unread}</div>
          )}
        </button>
      </div>
    </>
  );
}
