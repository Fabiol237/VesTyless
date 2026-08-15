'use client';
/**
 * VesTyle — Page Offline Enrichie avec Dexie.js
 * Affiche les données mises en cache : boutiques, produits, panier hors-ligne.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, Home, RefreshCw, ChevronLeft, ShoppingBag, Store, Clock, Heart } from 'lucide-react';
import { getCart, getAllCachedStores, getProductsByStore, getWishlist } from '@/lib/db';

export default function OfflinePage() {
  const [cart, setCart] = useState([]);
  const [stores, setStores] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores'); // stores | cart | wishlist

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cartData, storesData, wishlistData] = await Promise.all([
          getCart(),
          getAllCachedStores(),
          getWishlist(),
        ]);
        setCart(cartData);
        setStores(storesData.slice(0, 6));
        setWishlist(wishlistData);

        // Charger quelques produits depuis les boutiques cachées
        if (storesData.length > 0) {
          const firstStoreId = storesData[0]?.id;
          if (firstStoreId) {
            const prods = await getProductsByStore(firstStoreId);
            setProducts(prods.slice(0, 4));
          }
        }
      } catch (e) {
        console.warn('[OfflinePage] Erreur lecture Dexie:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const hasOfflineData = stores.length > 0 || cart.length > 0 || wishlist.length > 0;
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#111B21',
      color: 'white',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: '#25D366',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
          }}
        >
          <ChevronLeft size={18} />
          Retour
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: 20, padding: '6px 14px',
            color: '#25D366', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      </div>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '32px 20px 24px' }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <WifiOff size={32} color="#EF4444" />
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
          margin: '0 0 8px', color: 'white',
        }}>
          Vous êtes hors-ligne
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.5)',
          margin: 0, lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {hasOfflineData
            ? 'Vos données sont disponibles. Naviguez en mode hors-ligne.'
            : 'Connectez-vous pour accéder à votre contenu mis en cache.'}
        </p>
      </div>

      {/* ─── Stats rapides ───────────────────────────────────────────────────── */}
      {hasOfflineData && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, padding: '0 16px 20px',
        }}>
          {[
            { icon: '🏪', count: stores.length, label: 'Boutiques' },
            { icon: '🛍️', count: cart.length, label: 'Panier' },
            { icon: '❤️', count: wishlist.length, label: 'Favoris' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#25D366' }}>{stat.count}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Onglets ─────────────────────────────────────────────────────────── */}
      {hasOfflineData && (
        <div style={{
          display: 'flex', gap: 4, padding: '0 16px 16px',
          overflowX: 'auto',
        }}>
          {[
            { id: 'stores', label: '🏪 Boutiques', count: stores.length },
            { id: 'cart', label: '🛍️ Panier', count: cart.length },
            { id: 'wishlist', label: '❤️ Favoris', count: wishlist.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)'
                  : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tab.label} {tab.count > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  padding: '1px 6px',
                  fontSize: 11,
                  marginLeft: 4,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ─── Contenu des onglets ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Chargement des données en cache...
          </div>
        )}

        {/* Boutiques en cache */}
        {!loading && activeTab === 'stores' && (
          <>
            {stores.length === 0 ? (
              <EmptyState icon="🏪" label="Aucune boutique en cache" sub="Visitez des boutiques quand vous êtes connecté." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 100 }}>
                {stores.map(store => (
                  <div key={store.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {store.logo ? (
                        <img src={store.logo} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                      ) : '🏪'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        {store.city || 'Boutique locale'} · Mis en cache
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>›</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Panier local */}
        {!loading && activeTab === 'cart' && (
          <>
            {cart.length === 0 ? (
              <EmptyState icon="🛍️" label="Panier vide" sub="Ajoutez des produits quand vous êtes connecté." />
            ) : (
              <div style={{ paddingBottom: 100 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0, overflow: 'hidden',
                      }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '📦'
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name || 'Produit'}
                        </div>
                        <div style={{ fontSize: 12, color: '#25D366', marginTop: 2, fontWeight: 700 }}>
                          {item.price?.toLocaleString('fr-FR')} FCFA × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total panier */}
                <div style={{
                  marginTop: 16, padding: '14px 16px',
                  background: 'linear-gradient(135deg, rgba(37,211,102,0.1) 0%, rgba(18,140,126,0.1) 100%)',
                  border: '1px solid rgba(37,211,102,0.2)',
                  borderRadius: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Total panier</span>
                  <span style={{ color: '#25D366', fontWeight: 800, fontSize: 16 }}>
                    {cartTotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: 12,
                  fontSize: 12, color: 'rgba(251,191,36,0.8)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Clock size={14} />
                  Votre panier est sauvegardé. La commande sera envoyée dès reconnexion.
                </div>
              </div>
            )}
          </>
        )}

        {/* Wishlist */}
        {!loading && activeTab === 'wishlist' && (
          <>
            {wishlist.length === 0 ? (
              <EmptyState icon="❤️" label="Aucun favori" sub="Ajoutez des articles à vos favoris pour les retrouver ici." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 100 }}>
                {wishlist.map(item => (
                  <div key={item.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Heart size={20} color="#EC4899" fill="#EC4899" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'white' }}>
                        Produit #{item.productId?.slice?.(0, 8) || item.id}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        Ajouté le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Quand aucune donnée ────────────────────────────────────────────── */}
        {!loading && !hasOfflineData && (
          <div style={{ paddingTop: 12, paddingBottom: 80 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>
                Conseil Pro
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
                Naviguez dans VesTyle quand vous êtes connecté. Les boutiques et produits que vous consultez seront automatiquement mis en cache pour un accès hors-ligne.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bouton Accueil ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 28px',
        background: 'linear-gradient(to top, #111B21 60%, transparent)',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)',
          color: 'white', fontWeight: 700, fontSize: 15,
          padding: '14px 20px', borderRadius: 16,
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
        }}>
          <Home size={18} />
          Accueil
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon, label, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}
