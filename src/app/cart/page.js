'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Loader2, Package, CheckCircle2, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdOrders, setCreatedOrders] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const total = getCartTotal();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Veuillez entrer votre nom et numéro de téléphone pour la livraison.');
      return;
    }

    setLoading(true);
    try {
      // Obtenir la position GPS du client si possible
      let lat = null, lng = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, enableHighAccuracy: true });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (e) {
          console.warn("GPS non disponible ou refusé.", e);
        }
      }

      const storeIds = [...new Set(cart.map(item => item.store_id))];
      const newOrders = [];
      
      for (const storeId of storeIds) {
        const storeItems = cart.filter(item => item.store_id === storeId);
        const storeTotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const fullName = address ? `${name} (Adresse: ${address})` : name;
        
        const { data, error: orderError } = await supabase.from('orders').insert([{
          store_id: storeId,
          customer_name: fullName,
          customer_phone: phone,
          total_amount: storeTotal,
          order_items: storeItems,
          delivery_lat: lat,
          delivery_lng: lng
        }]).select('id, created_at, store_id').single();
        
        if (orderError) throw orderError;
        if (data) {
          newOrders.push({ id: data.id, created_at: data.created_at, store_id: data.store_id });
          
          // --- NOTIFICATION VENDEUR ET GESTION STOCK ---
          try {
            // 1. Récupérer l'infos du vendeur
            const { data: storeData } = await supabase
              .from('stores')
              .select('owner_id, name')
              .eq('id', storeId)
              .single();

            if (storeData?.owner_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', storeData.owner_id)
                .single();

              if (profileData?.email) {
                // 2.a Notification Email
                await fetch('/api/emails/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: profileData.email,
                    subject: `Nouvelle vente sur ${storeData.name} !`,
                    type: 'ORDER',
                    data: {
                      message: `Félicitations ! Le client ${name} vient de passer une commande sur votre boutique.`,
                      amount: storeTotal.toLocaleString(),
                      customer: name
                    }
                  })
                });

                // 2.b Notification dans la Cloche du Dashboard
                await supabase.from('notifications').insert([{
                  user_id: storeData.owner_id,
                  store_id: storeId,
                  type: 'order_placed',
                  title: 'Nouvelle Commande !',
                  message: `Le client ${name} a commandé pour ${storeTotal.toLocaleString()} F.`,
                  related_order_id: data.id
                }]);

                // 3. Mise à jour du stock et Alertes
                for (const item of storeItems) {
                   const { data: product } = await supabase
                     .from('products')
                     .select('stock_quantity, name')
                     .eq('id', item.id)
                     .single();
                   
                   if (product) {
                      const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
                      await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);

                      if (newStock < 5) {
                         // 3.a Alerte Email
                         await fetch('/api/emails/notify', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({
                             to: profileData.email,
                             subject: `Alerte Stock: ${product.name}`,
                             type: 'STOCK',
                             data: {
                               message: `Attention, votre stock s'épuise dangereusement.`,
                               productName: product.name,
                               stock: newStock
                             }
                           })
                         });

                         // 3.b Alerte dans la Cloche du Dashboard
                         await supabase.from('notifications').insert([{
                           user_id: storeData.owner_id,
                           store_id: storeId,
                           type: 'stock_alert',
                           title: 'Attention : Stock Faible',
                           message: `Il ne reste que ${newStock} exemplaires de "${product.name}".`,
                           related_product_id: item.id
                         }]);
                      }
                   }
                }
              }
            }
          } catch (notifErr) {
            console.error("Erreur post-commande:", notifErr);
          }
        }
      }
      
      // Save to localStorage (expire in 30 days handled when reading)
      const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
      localStorage.setItem('vestyle_orders', JSON.stringify([...existing, ...newOrders]));

      clearCart();
      setCreatedOrders(newOrders);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (createdOrders.length > 0) {
    return (
      <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-wa-green/10 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-lg shadow-wa-green/10">
            <CheckCircle2 size={48} className="text-wa-green" />
          </div>
          <h1 className="text-4xl font-black text-wa-teal-dark mb-4 tracking-tight">
            Commande validée !
          </h1>
          <p className="text-neutral-600 max-w-md mx-auto mb-8">
            Félicitations ! Votre commande a été transmise aux vendeurs. Vous pouvez suivre l'état de vos livraisons ci-dessous.
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
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-wa-teal text-white rounded-full font-bold shadow-lg hover:bg-wa-teal-dark transition-all active:scale-95"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 sm:pt-32 pb-32">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-wa-teal rounded-full flex items-center justify-center shadow-sm">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-wa-teal-dark leading-none">Mon Panier</h1>
              {cart.length > 0 && (
                <p className="text-sm text-neutral-500 mt-1">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
              )}
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-wa-green text-white px-8 py-3.5 rounded-full font-bold hover:bg-wa-teal transition-colors shadow-sm"
            >
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
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <Package size={28} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-wa-teal-dark text-sm leading-snug line-clamp-1">{item.name}</h3>
                        <p className="text-wa-teal font-black text-sm mt-1">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                        <p className="text-neutral-400 text-xs mt-0.5">{item.price.toLocaleString()} FCFA / unité</p>
                      </div>

                      {/* Qty & Delete */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center bg-neutral-50 rounded-lg p-0.5 border border-neutral-100">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-wa-teal hover:bg-white rounded-md transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-wa-teal hover:bg-white rounded-md transition-colors"
                          >
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

                {/* Delivery Form */}
                <div className="px-6 py-5 flex flex-col gap-4">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Informations de livraison</p>

                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nom complet *"
                      className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-wa-teal transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Téléphone *"
                      className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-wa-teal transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-3.5 text-neutral-400" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Adresse de livraison"
                      rows={2}
                      className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-wa-teal transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                      {error}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-14 bg-wa-green hover:bg-wa-teal text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>Valider la commande <ArrowRight size={18} /></>
                    )}
                  </button>
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
