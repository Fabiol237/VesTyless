'use client';
/**
 * VesTyle — Page Offline Enrichie v2
 * Affiche les données mises en cache : boutiques, produits, panier, wishlist.
 * Nouveau : onglet Produits avec grille visuelle + badge Mode Avion premium.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, Home, RefreshCw, ChevronLeft, Clock, Heart, Plane } from 'lucide-react';
import { getCart, getAllCachedStores, getAllProducts, getWishlist } from '@/lib/db';

// Fallback si getAllProducts n'existe pas encore dans db.js
async function safeGetAllProducts() {
  try {
    const { default: db } = await import('@/lib/db');
    return await db.products.toArray();
  } catch {
    return [];
  }
}

export default function OfflinePage() {
  const [cart, setCart] = useState([]);
  const [stores, setStores] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cartData, storesData, wishlistData, allProducts] = await Promise.all([
          getCart(),
          getAllCachedStores(),
          getWishlist(),
          safeGetAllProducts(),
        ]);
        setCart(cartData);
        setStores(storesData.slice(0, 8));
        setWishlist(wishlistData);
        setProducts(allProducts.slice(0, 20));
      } catch (e) {
        console.warn('[OfflinePage] Erreur lecture Dexie:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const hasOfflineData = stores.length > 0 || cart.length > 0 || wishlist.length > 0 || products.length > 0;
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const tabs = [
    { id: 'stores', label: '🏪 Boutiques', count: stores.length },
    { id: 'products', label: '📦 Produits', count: products.length },
    { id: 'cart', label: '🛍️ Panier', count: cart.length },
    { id: 'wishlist', label: '❤️ Favoris', count: wishlist.length },
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #0d1117 0%, #111B21 60%, #0d1117 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ─── Badge Mode Avion premium ──────────────────────────────────────────── */}
      <style>{`
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .product-card:active { transform: scale(0.97); transition: transform 0.15s; }
      `}</style>

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
      <div style={{ textAlign: 'center', padding: '28px 20px 20px' }}>
        {/* Icône animée */}
        <div style={{
          position: 'relative',
          width: 80, height: 80,
          margin: '0 auto 16px',
          animation: 'floatBadge 3s ease-in-out infinite',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <WifiOff size={34} color="#EF4444" />
          </div>
          {/* Badge mode avion */}
          <div style={{
            position: 'absolute', top: -6, right: -6,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            borderRadius: 10, padding: '2px 6px',
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700, color: 'white',
            boxShadow: '0 2px 8px rgba(245,158,11,0.5)',
          }}>
            <Plane size={9} />
            AVION
          </div>
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
          margin: '0 0 8px', color: 'white',
        }}>
          Mode hors-ligne
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.5)',
          margin: 0, lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {hasOfflineData
            ? `${products.length + stores.length} éléments disponibles en cache`
            : 'Connectez-vous pour accéder à votre contenu mis en cache.'}
        </p>
      </div>

      {/* ─── Stats rapides ─────────────────────────────────────────────────────── */}
      {hasOfflineData && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8, padding: '0 16px 16px',
        }}>
          {[
            { icon: '📦', count: products.length, label: 'Produits' },
            { icon: '🏪', count: stores.length, label: 'Boutiques' },
            { icon: '🛍️', count: cart.length, label: 'Panier' },
            { icon: '❤️', count: wishlist.length, label: 'Favoris' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '10px 6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#25D366' }}>{stat.count}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Onglets ─────────────────────────────────────────────────────────── */}
      {hasOfflineData && (
        <div style={{
          display: 'flex', gap: 6, padding: '0 16px 14px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {tabs.map(tab => (
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
                flexShrink: 0,
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)'
                  : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(37,211,102,0.3)' : 'none',
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
      <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto', paddingBottom: 100 }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Chargement du cache...
          </div>
        )}

        {/* ── Produits en cache (grille visuelle) ──────────────────────────── */}
        {!loading && activeTab === 'products' && (
          <>
            {products.length === 0 ? (
              <EmptyState icon="📦" label="Aucun produit en cache"
                sub="Parcourez des boutiques en ligne pour que les produits soient mis en cache." />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
              }}>
                {products.map(product => (
                  <div
                    key={product.id}
                    className="product-card"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Image produit */}
                    <div style={{
                      width: '100%', paddingTop: '75%',
                      position: 'relative',
                      background: 'rgba(255,255,255,0.06)',
                    }}>
                      {product.image_url || product.image ? (
                        <img
                          src={product.image_url || product.image}
                          alt={product.name}
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                          }}
                          loading="lazy"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 32,
                        }}>📦</div>
                      )}
                      {/* Badge cache */}
                      <div style={{
                        position: 'absolute', top: 6, left: 6,
                        background: 'rgba(18,140,126,0.85)',
                        borderRadius: 6, padding: '2px 6px',
                        fontSize: 9, fontWeight: 700, color: 'white',
                        backdropFilter: 'blur(4px)',
                      }}>EN CACHE</div>
                    </div>
                    {/* Infos */}
                    <div style={{ padding: '10px 10px 12px' }}>
                      <div style={{
                        fontWeight: 600, fontSize: 12, color: 'white',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: 4,
                      }}>
                        {product.name || 'Produit'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#25D366' }}>
                        {product.price?.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Boutiques en cache ────────────────────────────────────────────── */}
        {!loading && activeTab === 'stores' && (
          <>
            {stores.length === 0 ? (
              <EmptyState icon="🏪" label="Aucune boutique en cache"
                sub="Visitez des boutiques quand vous êtes connecté." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                      fontSize: 20, flexShrink: 0, overflow: 'hidden',
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

        {/* ── Panier local ───────────────────────────────────────────────────── */}
        {!loading && activeTab === 'cart' && (
          <>
            {cart.length === 0 ? (
              <EmptyState icon="🛍️" label="Panier vide"
                sub="Ajoutez des produits quand vous êtes connecté." />
            ) : (
              <div>
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

        {/* ── Wishlist ───────────────────────────────────────────────────────── */}
        {!loading && activeTab === 'wishlist' && (
          <>
            {wishlist.length === 0 ? (
              <EmptyState icon="❤️" label="Aucun favori"
                sub="Ajoutez des articles à vos favoris pour les retrouver ici." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

        {/* ── Quand aucune donnée ─────────────────────────────────────────────── */}
        {!loading && !hasOfflineData && (
          <div style={{ paddingTop: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '28px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>💡</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 10px' }}>
                Conseil Pro
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
                Naviguez dans VesTyle quand vous êtes connecté. Les boutiques et produits consultés sont automatiquement mis en cache pour un accès hors-ligne.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bouton Accueil fixé en bas ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 28px',
        background: 'linear-gradient(to top, #0d1117 60%, transparent)',
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
