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
        if (data) newOrders.push({ id: data.id, created_at: data.created_at, store_id: data.store_id });
      }
      
      // Save to localStorage (expire in 30 days handled when reading)
      const existing = JSON.parse(localStorage.getItem('vestyle_orders') || '[]');
      localStorage.setItem('vestyle_orders', JSON.stringify([...existing, ...newOrders]));

      clearCart();
      setCreatedOrders(newOrders);
    } catch (e) {
      console.error(e);
      setError('Erreur lors de la validation : ' + (e.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  if (createdOrders.length > 0) {
    return (
      <main className="bg-wa-bg min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-20 h-20 bg-wa-green rounded-full flex items-center justify-center mb-6 shadow-md">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-wa-teal-dark mb-4">
            Commande validée !
          </h1>
          <p className="text-neutral-600 max-w-md mx-auto mb-8">
            Votre commande a été transmise au(x) vendeur(s). Ils vous contacteront rapidement pour la livraison.
          </p>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-wa-teal text-white rounded-full font-bold shadow-sm hover:bg-wa-teal-dark transition-all"
          >
            Retour à l'accueil
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
              
                {cart.map((item) => (
                  <div>
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
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-wa-teal transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-5 text-center text-neutral-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-wa-teal transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              

              {/* Clear Cart */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-red-500 underline underline-offset-2 transition-colors"
                >
                  Vider le panier
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm sticky top-28 overflow-hidden">

                {/* Summary Header */}
                <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
                  <h3 className="font-black text-neutral-900 text-base">Résumé</h3>
                  <div className="flex justify-between text-sm text-neutral-500 mt-3">
                    <span>Sous-total ({totalItems} art.)</span>
                    <span className="font-semibold text-neutral-800">{total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500 mt-1.5">
                    <span>Livraison</span>
                    <span className="font-semibold text-emerald-500">Offerte</span>
                  </div>
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

