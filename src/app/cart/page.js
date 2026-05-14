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

            {/* Cart Items Grouped by Store */}
            <div className="flex-1 flex flex-col gap-6">
              {Object.entries(
                cart.reduce((acc, item) => {
                  if (!acc[item.store_id]) acc[item.store_id] = { name: item.store_name || 'Boutique', items: [] };
                  acc[item.store_id].items.push(item);
                  return acc;
                }, {})
              ).map(([storeId, storeData]) => {
                const storeTotal = storeData.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                
                const sendWhatsApp = async () => {
                  setTouched({ name: true, phone: true, address: true });
                  if (!formValid) {
                    setSubmitError('Veuillez remplir vos informations de livraison avant de commander sur WhatsApp.');
                    return;
                  }
                  
                  try {
                    setLoading(true);
                    const { data: storeInfo } = await supabase.from('stores').select('whatsapp_number, name').eq('id', storeId).single();
                    const targetNumber = storeInfo?.whatsapp_number || '237690000000'; // Fallback
                    
                    let message = `*COMMANDE VESTYLE*\n\n`;
                    message += `Bonjour *${storeInfo?.name || 'Boutique'}*, je souhaite commander :\n\n`;
                    storeData.items.forEach(item => {
                      let itemText = `• ${item.quantity}x ${item.name}`;
                      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
                        const variantsStr = Object.entries(item.selectedVariants)
                          .map(([type, val]) => `${type}: ${val}`)
                          .join(', ');
                        itemText += ` (${variantsStr})`;
                      }
                      itemText += ` — ${(item.price * item.quantity).toLocaleString()} F\n`;
                      message += itemText;
                    });
                    message += `\n*TOTAL : ${storeTotal.toLocaleString()} FCFA*\n\n`;
                    message += `*INFOS LIVRAISON*\n`;
                    message += `👤 Nom : ${name.trim()}\n`;
                    message += `📞 Tél : ${phone}\n`;
                    if (address.trim()) message += `📍 Adresse : ${address.trim()}\n`;
                    
                    const waUrl = `https://wa.me/${targetNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(waUrl, '_blank');
                    
                    // Enregistrer la commande silencieusement dans la base
                    supabase.from('orders').insert([{
                      store_id: storeId,
                      customer_name: name.trim(),
                      customer_phone: phone.replace(/\D/g, ''),
                      shipping_address: address.trim() || null,
                      total_amount: storeTotal,
                      order_items: storeData.items,
                      status: 'pending',
                    }]).select('id, created_at').single().then(({ data: orderData }) => {
                      if (orderData) {
                        const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
                        localStorage.setItem('vestyle_orders', JSON.stringify([...existing, orderData]));
                      }
                    }).catch(console.error);
                    
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                };

                return (
                  <div key={storeId} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden animate-fade-in">
                    <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-wa-teal" />
                        <h3 className="font-black text-wa-teal-dark text-sm uppercase tracking-widest">{storeData.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-neutral-400">{storeData.items.length} article(s)</span>
                    </div>
                    
                    <div className="p-5 flex flex-col gap-5">
                      {storeData.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 group">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                            {item.image_url
                              ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package size={28} /></div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-wa-teal-dark text-sm leading-snug line-clamp-1">{item.name}</h3>
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.selectedVariants).map(([type, val]) => (
                                  <span key={type} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-500 font-bold">
                                    {type}: {val}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-wa-teal font-black text-sm mt-1">{(item.price * item.quantity).toLocaleString()} FCFA</p>
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

                    <div className="p-4 bg-emerald-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Boutique</p>
                        <p className="text-lg font-black text-wa-teal-dark">{storeTotal.toLocaleString()} F</p>
                      </div>
                      <button 
                        onClick={sendWhatsApp}
                        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-green-500/20 transition-all active:scale-95"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        COMMANDER SUR WHATSAPP
                      </button>
                    </div>
                  </div>
                );
              })}
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
