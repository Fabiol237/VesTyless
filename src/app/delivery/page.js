'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── SVG Icons (bulletproof, no lucide-react) ──────────────────────────────
const IconLoader    = ({ s=40, c='' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={c}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>;
const IconNav      = ({ s=24 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const IconPin      = ({ s=16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconPhone    = ({ s=16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.39 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconCheck    = ({ s=20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const IconPkg      = ({ s=48 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>;
const IconMsg      = ({ s=16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconAlert    = ({ s=40 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconLogOut   = ({ s=18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconHome     = ({ s=22 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

const STATUS_LABELS = {
  pending:          { label: 'En attente',     color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400' },
  confirmed:        { label: 'Confirmée',       color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-400' },
  out_for_delivery: { label: 'En livraison',    color: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500' },
  delivered:        { label: 'Livrée ✓',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled:        { label: 'Annulée',         color: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-400' },
};

export default function DeliveryPage() {
  const { session, loading: authLoading, store } = useAuth();
  const router = useRouter();
  const [livreur, setLivreur] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState('active'); // 'active' | 'done'

  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.replace('/login'); return; }

    const init = async () => {
      // Vérifier que c'est bien un livreur
      const { data: liv, error: lErr } = await supabase
        .from('livreurs')
        .select('*, stores(name, logo_url, owner_id)')
        .eq('user_id', session.id)
        .maybeSingle();

      if (lErr || !liv) {
        // Ce n'est pas un livreur → le renvoyer au dashboard vendeur
        router.replace('/dashboard');
        return;
      }

      setLivreur(liv);

      // Charger les commandes assignées à ce livreur
      const { data: ords, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .eq('livreur_id', liv.id)
        .order('created_at', { ascending: false });

      if (!oErr) setOrders(ords || []);
      setLoading(false);
    };

    init();
  }, [session, authLoading, router]);

  // Souscription temps réel
  useEffect(() => {
    if (!livreur?.id) return;
    const channel = supabase
      .channel(`delivery-orders-${livreur.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `livreur_id=eq.${livreur.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        } else if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [livreur?.id]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const updates = { status: newStatus };
    if (newStatus === 'delivered') updates.can_print_invoice = true;

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
    setUpdatingId(null);
  };

  const openGPS = (order) => {
    // Essayer les coordonnées GPS d'abord, sinon l'adresse textuelle
    if (order.delivery_lat && order.delivery_lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`, '_blank');
    } else if (order.shipping_address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.shipping_address)}`, '_blank');
    } else {
      alert('Aucune adresse GPS disponible pour cette commande.');
    }
  };

  const sendWhatsApp = (phone, name, type) => {
    const msgs = {
      enRoute: `Bonjour ${name} 👋, je suis votre livreur VesTyle. Je suis actuellement *en route* vers vous ! Préparez-vous à recevoir votre colis 📦`,
      arrived: `Bonjour ${name} 👋, je suis *arrivé* devant chez vous. Merci de venir récupérer votre commande VesTyle 🚚`,
      delay:   `Bonjour ${name}, je vous informe d'un léger *retard* dans votre livraison. Je vous contacterai dès que possible. Merci de votre compréhension 🙏`,
    };
    const num = phone?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${num.startsWith('237') ? '' : '237'}${num}?text=${encodeURIComponent(msgs[type])}`, '_blank');
  };

  const handleExit = () => {
    console.log('Exiting Hub...', { hasStore: !!store, isOwner: livreur?.stores?.owner_id === session?.id });
    if (store?.slug || (livreur?.stores && livreur.stores.owner_id === session?.id)) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // ─── États de chargement / erreur ───────────────────────────────────────────
  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <IconLoader s={44} c="animate-spin text-emerald-600" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initialisation...</p>
    </div>
  );

  if (!livreur) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <IconLoader s={44} c="animate-spin text-emerald-600" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chargement du profil...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500"><IconAlert s={40} /></div>
      <h1 className="text-xl font-black text-slate-900">{error}</h1>
      <Link href="/login" className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold">Retour connexion</Link>
    </div>
  );

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const doneOrders   = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
  const displayOrders = tab === 'active' ? activeOrders : doneOrders;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white shadow-xl shadow-emerald-900/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              {livreur?.stores?.logo_url
                ? <img src={livreur.stores.logo_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                : <IconNav s={22} />
              }
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Hub Livreur</p>
              <h1 className="text-lg font-black leading-tight">{livreur?.name}</h1>
              <p className="text-[10px] font-bold opacity-60">{livreur?.stores?.name}</p>
            </div>
          </div>
          <button
            onClick={handleExit}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <IconLogOut s={15} /> Sortir
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">

        {/* ── Stats rapides ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Assignées', value: orders.length, color: 'from-slate-700 to-slate-600' },
            { label: 'En cours',  value: activeOrders.length, color: 'from-indigo-600 to-indigo-500' },
            { label: 'Livrées',   value: doneOrders.length,   color: 'from-emerald-600 to-emerald-500' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-3xl p-4 text-center shadow-lg`}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="bg-slate-200 p-1 rounded-2xl flex gap-1">
          {[
            { key: 'active', label: `En cours (${activeOrders.length})` },
            { key: 'done',   label: `Historique (${doneOrders.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === t.key ? 'bg-white shadow text-emerald-700' : 'text-slate-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Liste des commandes ─────────────────────────────────────────── */}
        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="flex justify-center mb-4 opacity-20"><IconPkg s={48} /></div>
            <p className="text-slate-400 font-bold text-sm">
              {tab === 'active' ? 'Aucune livraison en cours.' : 'Aucune livraison terminée.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map(order => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
              const isUpdating = updatingId === order.id;
              const isDone = order.status === 'delivered' || order.status === 'cancelled';

              return (
                <div key={order.id} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-100">

                  {/* En-tête commande */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Cmd #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <h2 className="text-xl font-black text-slate-900 mt-0.5">{order.customer_name}</h2>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${st.color}`}>
                        <span className={`w-2 h-2 rounded-full ${st.dot} ${!isDone ? 'animate-pulse' : ''}`}></span>
                        {st.label}
                      </div>
                    </div>

                    {/* Infos client */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                          <IconPin s={14} />
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-snug">
                          {order.shipping_address || 'Adresse à confirmer avec le client'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                          <IconPhone s={14} />
                        </div>
                        <a href={`tel:${order.customer_phone}`} className="text-sm text-blue-600 font-black">
                          {order.customer_phone}
                        </a>
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total commande</p>
                      <p className="text-lg font-black text-emerald-700">{Number(order.total_amount || 0).toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isDone && (
                    <div className="px-5 pb-5 space-y-3">
                      {/* Bouton GPS PRIORITAIRE */}
                      <button
                        onClick={() => openGPS(order)}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <IconNav s={20} /> Lancer l&apos;itinéraire GPS
                      </button>

                      {/* WhatsApp rapide */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'enRoute', label: '🚗 En route' },
                          { key: 'arrived', label: '📍 Arrivé' },
                          { key: 'delay',   label: '⏳ Retard' },
                        ].map(btn => (
                          <button
                            key={btn.key}
                            onClick={() => sendWhatsApp(order.customer_phone, order.customer_name, btn.key)}
                            className="flex flex-col items-center gap-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-100 transition-colors"
                          >
                            <IconMsg s={14} />
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      {/* Changer statut */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {order.status !== 'out_for_delivery' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => updateStatus(order.id, 'out_for_delivery')}
                            className="py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                          >
                            {isUpdating ? '...' : '🚚 En livraison'}
                          </button>
                        )}
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest col-span-full disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          {isUpdating ? <IconLoader s={16} c="animate-spin" /> : <IconCheck s={16} />}
                          Marquer comme Livré
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badge livré */}
                  {order.status === 'delivered' && (
                    <div className="mx-5 mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <IconCheck s={20} />
                      <div>
                        <p className="text-xs font-black text-emerald-800">Livraison confirmée</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Le client peut imprimer sa facture</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Nav Mobile ────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 lg:hidden">
        <button onClick={() => setTab('active')} className={`flex flex-col items-center gap-1 ${tab === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <IconHome s={22} />
          <span className="text-[9px] font-black uppercase">En cours</span>
        </button>
        <button onClick={() => setTab('done')} className={`flex flex-col items-center gap-1 ${tab === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <IconCheck s={22} />
          <span className="text-[9px] font-black uppercase">Historique</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-rose-400">
          <IconLogOut s={22} />
          <span className="text-[9px] font-black uppercase">Déconnexion</span>
        </button>
      </nav>
    </div>
  );
}
