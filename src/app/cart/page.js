'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Trash2, ShoppingBag, Plus, Minus, ArrowRight, Loader2,
  Package, CheckCircle2, MapPin, Phone, User, AlertCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';

// ─── Validation helpers ────────────────────────────────────────────────────
function validateName(v) {
  const t = v.trim();
  if (!t) return 'Votre nom est requis.';
  if (t.length < 2) return 'Nom trop court (2 caractères min).';
  if (/\d/.test(t)) return 'Le nom ne doit pas contenir de chiffres.';
  return '';
}

function validatePhone(v) {
  const digits = v.replace(/\D/g, '');
  if (!digits) return 'Votre téléphone est requis.';
  if (digits.length < 8) return 'Numéro incomplet (8 chiffres min).';
  if (digits.length > 15) return 'Numéro trop long.';
  return '';
}

function validateAddress(v) {
  if (!v.trim()) return ''; // Optional, no error — just a hint
  if (v.trim().length < 5) return 'Adresse trop courte pour être précise.';
  return '';
}

// Inline field feedback
function FieldHint({ error, hint }) {
  if (error) return (
    <p className="flex items-center gap-1.5 text-[11px] text-rose-500 font-bold mt-1 ml-1 animate-fade-in">
      <AlertCircle size={11} /> {error}
    </p>
  );
  if (hint) return (
    <p className="flex items-center gap-1.5 text-[11px] text-blue-400 font-medium mt-1 ml-1">
      <Info size={11} /> {hint}
    </p>
  );
  return null;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { session } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [createdOrders, setCreatedOrders] = useState([]);
  const [submitError, setSubmitError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Touch states — only show errors after user has left the field
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });

  const nameErr    = validateName(name);
  const phoneErr   = validatePhone(phone);
  const addressErr = validateAddress(address);

  const formValid = !nameErr && !phoneErr && !addressErr && name.trim() && phone.trim();

  const handleBlur = (field) => setTouched(p => ({ ...p, [field]: true }));

  const total      = getCartTotal();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    // Mark all as touched to show all errors
    setTouched({ name: true, phone: true, address: true });
    if (!formValid) return;

    setSubmitError('');
    setLoading(true);
    try {
      let lat = null, lng = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, enableHighAccuracy: true })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* GPS refusé, on continue */ }
      }

      const storeIds  = [...new Set(cart.map(item => item.store_id))];
      const newOrders = [];

      for (const storeId of storeIds) {
        const storeItems = cart.filter(item => item.store_id === storeId);
        const storeTotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const { data, error: orderError } = await supabase.from('orders').insert([{
          store_id:       storeId,
          customer_name:  name.trim(),
          customer_phone: phone.replace(/\D/g, ''),
          shipping_address: address.trim() || null,
          total_amount:   storeTotal,
          order_items:    storeItems,
          delivery_lat:   lat,
          delivery_lng:   lng,
          status:         'pending',
        }]).select('id, created_at, store_id').single();

        if (orderError) {
          console.error('Supabase Insertion Error details:', JSON.stringify(orderError, null, 2));
          throw new Error(orderError.message || 'Erreur d\'insertion en base de données');
        }
        
        if (data) {
          newOrders.push({ id: data.id, created_at: data.created_at, store_id: data.store_id });

          // Post-order: notify vendor + update stock
          try {
            const { data: storeData } = await supabase.from('stores').select('owner_id, name').eq('id', storeId).single();
            if (storeData?.owner_id) {
              const { data: profileData } = await supabase.from('profiles').select('email').eq('id', storeData.owner_id).single();

              if (profileData?.email) {
                await fetch('/api/emails/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: profileData.email,
                    subject: `Nouvelle vente sur ${storeData.name} !`,
                    type: 'ORDER',
                    data: { message: `Le client ${name.trim()} vient de commander.`, amount: storeTotal.toLocaleString(), customer: name.trim() }
                  }),
                });
                await supabase.from('notifications').insert([{
                  user_id: storeData.owner_id, store_id: storeId, type: 'order_placed',
                  title: 'Nouvelle Commande !',
                  message: `${name.trim()} a commandé pour ${storeTotal.toLocaleString()} F.`,
                  related_order_id: data.id
                }]);
              }

              // Atomic stock reduction via RPC
              for (const item of storeItems) {
                const { data: newStock, error: stockError } = await supabase.rpc('decrement_stock', {
                  product_id: item.id,
                  quantity_to_decrement: item.quantity
                });

                if (stockError) {
                  console.error('Stock error for', item.name, ':', stockError);
                  continue; 
                }

                // Alert if stock becomes low
                if (newStock < 5 && storeData?.owner_id) {
                  const { data: pd } = await supabase.from('profiles').select('email').eq('id', storeData.owner_id).single();
                  if (pd?.email) {
                    await fetch('/api/emails/notify', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ to: pd.email, subject: `Alerte Stock : ${item.name}`, type: 'STOCK', data: { productName: item.name, stock: newStock, message: 'Stock faible !' } })
                    });
                    await supabase.from('notifications').insert([{
                      user_id: storeData.owner_id, store_id: storeId, type: 'stock_alert',
                      title: 'Stock Faible',
                      message: `Il reste ${newStock} exemplaire(s) de "${item.name}".`,
                      related_product_id: item.id
                    }]);
                  }
                }
              }
            }
          } catch (e) { console.error('Post-order non-critical error:', e); }
        }
      }

      if (newOrders.length > 0) {
        const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
        localStorage.setItem('vestyle_orders', JSON.stringify([...existing, ...newOrders]));
        clearCart();
        setCreatedOrders(newOrders);
      } else {
        throw new Error('Aucune commande n\'a pu être créée.');
      }

    } catch (err) {
      console.error('Final Checkout Error details:', err);
      setSubmitError(err?.message || 'Une erreur est survenue lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (createdOrders.length > 0) {
    return (
      <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-wa-green/10 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-lg shadow-wa-green/10">
            <CheckCircle2 size={48} className="text-wa-green" />
          </div>
          <h1 className="text-4xl font-black text-wa-teal-dark mb-4 tracking-tight">Commande validée !</h1>
          <p className="text-neutral-600 max-w-md mx-auto mb-8">
            Votre commande a bien été transmise. Suivez votre livraison ci-dessous.
          </p>
          <div className="flex flex-col gap-3 mb-10 w-full">
            {createdOrders.map((order, idx) => (
              <Link
                key={order.id}
                href={`/suivi/${order.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-wa-teal/20 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-wa-teal/10 rounded-full flex items-center justify-center text-wa-teal">
                    <Package size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Commande #{idx + 1}</p>
                    <p className="text-sm font-bold text-neutral-800">Suivre mon colis</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-wa-teal group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-wa-teal text-white rounded-full font-bold shadow-lg hover:bg-wa-teal-dark transition-all active:scale-95">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  // ── Main cart ───────────────────────────────────────────────────────────
  return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 sm:pt-32 pb-32">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-wa-teal rounded-full flex items-center justify-center shadow-sm">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-wa-teal-dark leading-none">Mon Panier</h1>
              {cart.length > 0 && <p className="text-sm text-neutral-500 mt-1">{totalItems} article{totalItems > 1 ? 's' : ''}</p>}
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-5 mx-auto">
              <ShoppingBag size={34} className="text-neutral-300" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Votre panier est vide</h2>
            <p className="text-neutral-500 text-sm mb-8">Ajoutez des produits depuis les boutiques locales.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-wa-green text-white px-8 py-3.5 rounded-full font-bold hover:bg-wa-teal transition-colors shadow-sm">
              Découvrir les boutiques
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Cart Items */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 flex flex-col gap-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package size={28} /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-wa-teal-dark text-sm leading-snug line-clamp-1">{item.name}</h3>
                        <p className="text-wa-teal font-black text-sm mt-1">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                        <p className="text-neutral-400 text-xs mt-0.5">{item.price.toLocaleString()} FCFA / unité</p>
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center bg-neutral-50 rounded-lg p-0.5 border border-neutral-100">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-wa-teal hover:bg-white rounded-md transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-wa-teal hover:bg-white rounded-md transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-neutral-50 px-6 py-4 flex justify-between items-center border-t border-neutral-100">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sous-total</span>
                  <span className="font-bold text-wa-teal-dark">{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden sticky top-32">
                <div className="p-6 border-b border-neutral-50">
                  <h2 className="text-lg font-bold text-wa-teal-dark">Finaliser la commande</h2>
                  <div className="flex justify-between text-base font-bold text-wa-teal-dark mt-4 pt-4 border-t border-neutral-100">
                    <span>Total</span>
                    <span className="text-wa-teal">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Informations de livraison</p>

                  {/* Nom */}
                  <div>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Nom complet *"
                        className={`w-full pl-9 pr-4 py-3 bg-neutral-50 border rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors ${
                          touched.name && nameErr ? 'border-rose-300 bg-rose-50' : 'border-neutral-200 focus:border-wa-teal'
                        }`}
                      />
                    </div>
                    <FieldHint
                      error={touched.name ? nameErr : ''}
                      hint={!touched.name ? 'Ex : Fatou Diallo' : ''}
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        placeholder="Téléphone *"
                        className={`w-full pl-9 pr-4 py-3 bg-neutral-50 border rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors ${
                          touched.phone && phoneErr ? 'border-rose-300 bg-rose-50' : 'border-neutral-200 focus:border-wa-teal'
                        }`}
                      />
                    </div>
                    <FieldHint
                      error={touched.phone ? phoneErr : ''}
                      hint={!touched.phone ? 'Ex : 07 00 00 00 00' : ''}
                    />
                  </div>

                  {/* Adresse */}
                  <div>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3.5 text-neutral-400" />
                      <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onBlur={() => handleBlur('address')}
                        placeholder="Adresse de livraison (recommandée)"
                        rows={2}
                        className={`w-full pl-9 pr-4 py-3 bg-neutral-50 border rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors resize-none ${
                          touched.address && addressErr ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 focus:border-wa-teal'
                        }`}
                      />
                    </div>
                    <FieldHint
                      error={touched.address ? addressErr : ''}
                      hint={!address.trim() ? 'Ajoutez une adresse pour faciliter la livraison.' : ''}
                    />
                  </div>

                  {submitError && (
                    <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                      <AlertCircle size={14} /> {submitError}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-14 bg-wa-green hover:bg-wa-teal text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 size={20} className="animate-spin" />
                      : <><span>Valider la commande</span> <ArrowRight size={18} /></>
                    }
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center mt-3">
                    En validant, le vendeur sera immédiatement notifié.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
