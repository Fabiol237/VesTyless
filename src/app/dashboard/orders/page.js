'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart, Search, Loader2, CheckCircle2,
  DollarSign, MessageCircle, Calendar, Phone, MapPin,
  Truck, XCircle, User, Package, Printer, ArrowUpDown
} from 'lucide-react';

// ─── Status Definitions ──────────────────────────────────────────────────
const STATUS_OPTS = [
  { id: 'active',     label: 'En cours',      desc: 'Commandes à traiter' },
  { id: 'archive',    label: 'Archives',      desc: 'Historique complet' },
];

const ST = {
  pending:    { bar:'#F59E0B', grad:'linear-gradient(135deg,#F59E0B,#FCD34D,#F59E0B)', bg:'#FFFBEB', border:'#FDE68A', label:'🆕 Nouvelle',      accent:'#D97706' },
  processing: { bar:'#3B82F6', grad:'linear-gradient(135deg,#3B82F6,#93C5FD,#3B82F6)', bg:'#EFF6FF', border:'#BFDBFE', label:'🛠️ Préparation',   accent:'#1D4ED8' },
  shipped:    { bar:'#8B5CF6', grad:'linear-gradient(135deg,#8B5CF6,#C4B5FD,#8B5CF6)', bg:'#F5F3FF', border:'#DDD6FE', label:'🚚 En livraison',  accent:'#6D28D9' },
  delivered:  { bar:'#10B981', grad:'linear-gradient(135deg,#10B981,#6EE7B7,#10B981)', bg:'#ECFDF5', border:'#A7F3D0', label:'✅ Livrée',         accent:'#059669' },
  cancelled:  { bar:'#EF4444', grad:'linear-gradient(135deg,#EF4444,#FCA5A5,#EF4444)', bg:'#FFF1F2', border:'#FECDD3', label:'❌ Annulée',        accent:'#DC2626' },
};

function norm(s) { return (s||'pending').toLowerCase().trim(); }
function shortId(id) { return (id||'').slice(0,8).toUpperCase(); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'; }
function fmtAmt(a) { return Number(a||0).toLocaleString('fr-FR')+' F'; }

function OrderTicket({ order, onStatusChange, isUpdating, livreurs, onAssignLivreur, onToggleInvoice, currentUserId }) {
  const st = norm(order.status);
  const s = ST[st]||ST.pending;
  const items = order.items||order.order_items||[];
  
  // Find if current user is one of the livreurs
  const myLivreurProfile = livreurs.find(l => l.user_id === currentUserId);

  // Authenticity URL
  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/suivi/${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;

  const sendWhatsApp = () => {
    const label = ST[st]?.label||st;
    const msg = `Bonjour ${order.customer_name} 👋\nVotre commande Vestyle #${shortId(order.id)} est maintenant : ${label}.\nSuivi authentique : ${trackingUrl}`;
    window.open(`https://wa.me/${(order.customer_phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="relative w-full print:shadow-none mb-6" style={{ filter:'drop-shadow(0 8px 30px rgba(0,0,0,0.08))' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .tshim { background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%); background-size:200% 100%; animation:shimmer 4s infinite linear; }
        @media print { 
          .no-print, header, nav, aside, footer, .tabs-selector, .controls-search { display:none!important }
          body { background: white!important; padding: 0!important; margin: 0!important; }
          .print-full { width: 100%!important; margin: 0!important; box-shadow: none!important; filter: none!important; border: 1px solid #eee!important; border-radius: 0!important; }
          .print-ticket-only { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; background: white; }
          @page { margin: 1cm; }
        }
      `}</style>

      <div className="rounded-[24px] overflow-hidden border bg-white print:border-gray-200" style={{ borderColor: s.border }}>

        {/* HEADER – Gold / Status Gradient */}
        <div className="relative px-6 py-5 overflow-hidden" style={{ background: s.grad }}>
          <div className="absolute inset-0 tshim pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage:'radial-gradient(white 1.5px,transparent 1.5px)', backgroundSize:'15px 15px' }} />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex gap-4">
              {/* QR Code on Ticket - Authenticity Mark */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-inner hidden sm:flex items-center justify-center">
                <img src={qrUrl} alt="QR Code Authentification" className="w-full h-full" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80 mb-0.5">CERTIFICAT D&apos;AUTHENTICITÉ VESTYLE</p>
                <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white drop-shadow-sm flex items-center gap-2">
                  #{shortId(order.id)}
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">ORIGINAL</span>
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-white/80">
                  <span className="flex items-center gap-1"><Calendar size={11}/> {fmtDate(order.created_at)}</span>
                  <span className="flex items-center gap-1 uppercase tracking-wider italic">Source: Vestyle Marketplace</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/70">TOTAL À RÉGLER</p>
              <p className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{fmtAmt(order.total_amount)}</p>
            </div>
          </div>
        </div>

        {/* Notched Separator */}
        <div className="relative flex items-center h-0 overflow-visible no-print" style={{ backgroundColor: s.bg }}>
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 z-10 shadow-inner" />
          <div className="flex-1 mx-6 border-t-2 border-dashed opacity-30" style={{ borderColor: s.accent }} />
          <div className="absolute -right-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 z-10 shadow-inner" />
        </div>

        {/* MAIN CONTENT */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8" style={{ background: `linear-gradient(to bottom, ${s.bg}, white)` }}>
          
          {/* Section 1: Client & Logistics (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: s.accent }}>COORDONNÉES CLIENT</p>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: s.bar+'15' }}>
                  <User size={16} style={{ color: s.bar }} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-gray-900 text-sm truncate">{order.customer_name||'Client Anonyme'}</p>
                  <p className="text-xs text-gray-500 font-bold">{order.customer_phone}</p>
                </div>
              </div>
            </div>
            
            {order.shipping_address && (
              <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={10}/> Destination
                </p>
                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{order.shipping_address}</p>
              </div>
            )}

            <div className="flex gap-2 no-print">
              <button onClick={sendWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-black rounded-xl text-xs hover:scale-[1.02] transition-all shadow-md shadow-green-500/10">
                <MessageCircle size={14}/> WhatsApp
              </button>
              <a href={`tel:${order.customer_phone}`} className="w-12 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
                <Phone size={16}/>
              </a>
            </div>
          </div>

          {/* Section 2: Order Detail (5 cols) */}
          <div className="md:col-span-5 border-l border-r border-gray-100 px-0 md:px-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: s.accent }}>DÉTAIL DE LA VENTE</p>
            <div className="space-y-2">
              {items.map((item,i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg font-black text-[10px] text-gray-400">
                      {item.quantity||1}
                    </span>
                    <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.name||item.product_name}</span>
                  </div>
                  <span className="font-black text-gray-900">{fmtAmt((item.price||0)*(item.quantity||1))}</span>
                </div>
              ))}
            </div>

            {/* Verification Watermark */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between opacity-40 grayscale">
               <div className="flex flex-col">
                  <p className="text-[8px] font-black uppercase tracking-widest">Digital ID</p>
                  <p className="text-[10px] font-mono">{order.id.split('-')[0].toUpperCase()}</p>
               </div>
               <div className="w-12 h-12 border-4 border-gray-300 rounded-full flex items-center justify-center font-black text-[8px] rotate-[-15deg]">
                 AUTHENTIC
               </div>
            </div>
          </div>

          {/* Section 3: Status & Management (3 cols) */}
          <div className="md:col-span-3 space-y-4 no-print">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: s.accent }}>STATUT ACTUEL</p>
              <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm border" style={{ backgroundColor: s.bg, borderColor: s.border, color: s.accent }}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {s.label}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400">ACTION LOGISTIQUE</p>
              
              {/* Assignation Livreur */}
              <div className="space-y-1">
                <select 
                  value={order.livreur_id || ''} 
                  onChange={(e) => onAssignLivreur(order.id, e.target.value)}
                  className="w-full p-2.5 text-[10px] font-bold border border-gray-200 rounded-xl bg-white outline-none focus:border-wa-teal transition-all"
                >
                  <option value="">Assigner un livreur...</option>
                  {livreurs.map(l => (
                    <option key={l.id} value={l.id}>{l.name} {l.user_id === currentUserId ? '(Vous)' : ''}</option>
                  ))}
                </select>
                
                {myLivreurProfile && order.livreur_id !== myLivreurProfile.id && (
                  <button 
                    onClick={() => onAssignLivreur(order.id, myLivreurProfile.id)}
                    className="w-full py-1.5 px-2 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck size={10} /> Me l&apos;assigner
                  </button>
                )}
              </div>

              {st==='pending'&&<button disabled={isUpdating} onClick={()=>onStatusChange(order,'processing')} className="w-full py-3 text-white text-[11px] font-black rounded-xl shadow-lg transition-all active:scale-95" style={{background:s.grad}}>✅ ACCEPTER & PRÉPARER</button>}
              {st==='processing'&&<button disabled={isUpdating} onClick={()=>onStatusChange(order,'shipped')} className="w-full py-3 text-white text-[11px] font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95" style={{background:s.grad}}><Truck size={14}/> EXPÉDIER LE COLIS</button>}
              {(st==='processing'||st==='shipped')&&<button disabled={isUpdating} onClick={()=>onStatusChange(order,'delivered')} className="w-full py-3 bg-emerald-500 text-white text-[11px] font-black rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"><CheckCircle2 size={14}/> MARQUER LIVRÉ</button>}
              
              {/* Facture Toggle */}
              <button 
                onClick={() => onToggleInvoice(order.id, !order.can_print_invoice)}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                  order.can_print_invoice ? 'bg-wa-teal text-white border-wa-teal' : 'bg-white text-gray-400 border-gray-200'
                }`}
              >
                <Printer size={12} /> {order.can_print_invoice ? 'Facture Activée' : 'Autoriser Facture'}
              </button>

              {st!=='cancelled'&&st!=='delivered'&&<button disabled={isUpdating} onClick={()=>onStatusChange(order,'cancelled')} className="w-full py-2 text-rose-400 hover:text-rose-600 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"><XCircle size={12}/> Annuler la commande</button>}
            </div>
          </div>
        </div>

        {/* FOOTER – Serial strip for traceability */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100" style={{ background: 'linear-gradient(to right, #F9FAFB, white)' }}>
          <div className="flex gap-4">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Réf: VESTYLE-LOGISTIC-{order.id.slice(0,12).toUpperCase()}</span>
             <span className="hidden sm:inline text-[9px] font-bold text-gray-300">|</span>
             <span className="hidden sm:inline text-[9px] font-bold text-gray-400 uppercase">Généré le {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-gray-900 tracking-tighter italic">AUTHENTIC VESTYLE ORDER</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Orders Page ─────────────────────────────────────────────
export default function OrdersPage() {
  const { store, session } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab]   = useState('active'); // 'active' or 'archive'
  const [sortBy, setSortBy]         = useState('date_desc');
  const [updatingId, setUpdatingId] = useState(null);
  const [pageError, setPageError]   = useState('');
  const [livreurs, setLivreurs]     = useState([]);
  
  const fetchOrders = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true); setPageError('');
    try {
      const [ordersRes, livreursRes] = await Promise.all([
        supabase.from('orders').select('*').eq('store_id', store.id).order('created_at', { ascending: false }),
        supabase.from('livreurs').select('*').eq('store_id', store.id)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      setOrders(ordersRes.data || []);
      setLivreurs(livreursRes.data || []);
    } catch (err) { 
      console.error(err);
      setPageError('Erreur lors du chargement des commandes.'); 
    }
    finally { setLoading(false); }
  }, [store?.id]);

  useEffect(()=>{ fetchOrders(); },[fetchOrders]);

  useEffect(()=>{
    if (!store?.id) return;
    const ch = supabase.channel(`orders-realtime-${store.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'orders',filter:`store_id=eq.${store.id}`},fetchOrders)
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[store?.id, fetchOrders]);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      console.log(`Updating order ${order.id} to status: ${newStatus}`);
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)
        .select();

      if (error) {
        console.error('Database update failed:', error);
        throw new Error(error.message || 'La mise à jour a échoué en base de données.');
      }
      
      if (!data || data.length === 0) {
        console.warn('No rows updated. Check RLS policies.');
        throw new Error('Mise à jour impossible. Vérifiez vos permissions.');
      }

      console.log('Update successful:', data[0]);

      // Email Notification (non-blocking)
      if (order.customer_email && ['processing','shipped','delivered'].includes(newStatus)) {
        const msgs={processing:'🛠️ Votre commande est en préparation',shipped:'🚚 Votre colis est en route !',delivered:'✅ Livraison confirmée. Merci !'};
        fetch('/api/emails/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:order.customer_email,subject:msgs[newStatus],type:'status_update'})}).catch(() => {});
      }
      
      setOrders(prev=>prev.map(o=>o.id===order.id?{...o,status:newStatus}:o));
    } catch (e) {
      console.error('Status change error:', e);
      alert(`Erreur: ${e.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignLivreur = async (orderId, livreurId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ livreur_id: livreurId || null })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, livreur_id: livreurId } : o));
    } catch (err) {
      alert("Erreur lors de l'assignation du livreur.");
    }
  };

  const handleToggleInvoice = async (orderId, enabled) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ can_print_invoice: enabled })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, can_print_invoice: enabled } : o));
    } catch (err) {
      alert("Erreur lors de l'activation de la facture.");
    }
  };

  const handlePrint = () => window.print();

  // Logic: Split between Active and Archive
  const activeOrders  = orders.filter(o => !['delivered', 'cancelled'].includes(norm(o.status)));
  const archiveOrders = orders.filter(o => ['delivered', 'cancelled'].includes(norm(o.status)));
  
  const currentList = activeTab === 'active' ? activeOrders : archiveOrders;

  const filtered = currentList.filter(o=>{
    const t = searchTerm.toLowerCase();
    return !t || (o.customer_name||'').toLowerCase().includes(t) || (o.customer_phone||'').includes(t) || (o.id||'').toLowerCase().includes(t) || shortId(o.id).toLowerCase().includes(t);
  }).sort((a,b) => {
    if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'date_asc')  return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'amount_desc') return Number(b.total_amount) - Number(a.total_amount);
    if (sortBy === 'amount_asc')  return Number(a.total_amount) - Number(b.total_amount);
    return 0;
  });

  const revenue = orders.filter(o=>norm(o.status)==='delivered').reduce((s,o)=>s+Number(o.total_amount||0),0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <ShoppingCart size={24} />
            </div>
            Gestion des Flux
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium italic">Suivi authentifié de vos transactions en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 px-5 py-3 rounded-2xl flex-1 md:flex-initial">
             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Ventes Livrées</p>
             <p className="text-xl font-black text-amber-700">{fmtAmt(revenue)}</p>
          </div>
          <button onClick={handlePrint} className="no-print p-3.5 bg-gray-900 text-white hover:bg-gray-800 rounded-2xl transition-all shadow-xl" title="Imprimer le flux">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="no-print flex items-center p-1.5 bg-gray-100 rounded-[24px] w-full max-w-md mx-auto sm:mx-0 shadow-inner">
        {STATUS_OPTS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-md border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
            <span className="text-[10px] font-bold opacity-60">
              {tab.id === 'active' ? activeOrders.length : archiveOrders.length} commande{ (tab.id === 'active' ? activeOrders.length : archiveOrders.length) > 1 ? 's' : '' }
            </span>
          </button>
        ))}
      </div>

      {/* CONTROLS & SEARCH */}
      <div className="no-print flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300 transition-colors group-focus-within:text-amber-500" />
          <input 
            type="search" 
            placeholder="Rechercher par Client, Téléphone ou #ID..." 
            value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm">
           <ArrowUpDown size={16} className="text-gray-300" />
           <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="text-xs font-black text-gray-900 outline-none bg-transparent uppercase tracking-wider cursor-pointer">
             <option value="date_desc">Plus Récentes</option>
             <option value="date_asc">Plus Anciennes</option>
             <option value="amount_desc">Prix Décroissant</option>
             <option value="amount_asc">Prix Croissant</option>
           </select>
        </div>
      </div>

      {/* LIST OF TICKETS */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-amber-400" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement des données logistiques...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 py-24 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <Package size={32} className="text-gray-200" />
             </div>
             <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Aucune commande {activeTab === 'active' ? 'en cours' : 'dans les archives'}</p>
             <button onClick={fetchOrders} className="mt-4 text-amber-500 font-bold text-xs hover:underline uppercase tracking-tighter">Rafraîchir le flux</button>
          </div>
        ) : (
          filtered.map(order => (
            <OrderTicket 
              key={order.id} 
              order={order} 
              onStatusChange={handleStatusChange} 
              isUpdating={updatingId===order.id} 
              livreurs={livreurs}
              onAssignLivreur={handleAssignLivreur}
              onToggleInvoice={handleToggleInvoice}
              currentUserId={session?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
