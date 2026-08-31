"use client";
/**
 * VesTyle — CartContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Context global du panier. Utilise un dual-write :
 *   - localStorage  : chargement instantané au montage (pas de flash vide)
 *   - Dexie.js      : persistance robuste qui survive aux refreshes/offline
 *
 * La logique MOQ (remises par paliers de quantité) est conservée intacte.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

// ─── Helpers Dexie (import dynamique pour éviter les erreurs SSR) ────────────
async function getDexieCart() {
  try {
    const { getCart } = await import('@/lib/db');
    return await getCart();
  } catch {
    return null;
  }
}

async function syncCartToDexie(cartItems) {
  try {
    const db = (await import('@/lib/db')).default;
    // Remplacer tout le contenu de la table cart
    await db.cart.clear();
    if (cartItems.length > 0) {
      await db.cart.bulkAdd(
        cartItems.map(item => ({
          productId: item.id,
          storeId: item.storeId || item.store_id || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.image_url || null,
          selectedVariants: item.selectedVariants || null,
          moq_tier1: item.moq_tier1 || null,
          moq_discount1: item.moq_discount1 || null,
          moq_tier2: item.moq_tier2 || null,
          moq_discount2: item.moq_discount2 || null,
          addedAt: item.addedAt || Date.now(),
          // Conserver les autres champs du produit
          ...item,
        }))
      );
    }
  } catch (e) {
    console.warn('[CartContext] Sync Dexie échouée (dégradé localStorage):', e);
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Chargement initial ────────────────────────────────────────────────────
  useEffect(() => {
    const loadCart = async () => {
      // 1. Chargement rapide depuis localStorage (synchrone, pas de flash)
      try {
        const savedCart = localStorage.getItem('vestyle_cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        }
      } catch (e) {
        console.warn('[CartContext] localStorage parse error:', e);
      }

      // 2. Tentative de récupération depuis Dexie (plus fiable / plus complet)
      const dexieCart = await getDexieCart();
      if (dexieCart && Array.isArray(dexieCart) && dexieCart.length > 0) {
        // Convertir le format Dexie (productId) → format du context (id)
        const normalizedCart = dexieCart.map(item => ({
          ...item,
          id: item.productId || item.id,
        }));
        setCart(normalizedCart);
      }

      setIsLoaded(true);
    };

    loadCart();
  }, []);

  // ─── Persistance à chaque changement ──────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    // localStorage (synchrone, rapide)
    try {
      localStorage.setItem('vestyle_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('[CartContext] localStorage write error:', e);
    }

    // Dexie (asynchrone, robuste) — en arrière-plan, sans bloquer
    syncCartToDexie(cart);
  }, [cart, isLoaded]);

  // ─── Actions du panier ─────────────────────────────────────────────────────
  const addToCart = useCallback((product, forceQuantity = null) => {
    setCart(current => {
      // Un produit est identique seulement s'il a les mêmes variantes
      const existing = current.find(item =>
        item.id === product.id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(product.selectedVariants)
      );

      const qty = forceQuantity !== null ? forceQuantity : (product.quantity || 1);

      if (existing) {
        return current.map(item =>
          (item.id === product.id && JSON.stringify(item.selectedVariants) === JSON.stringify(product.selectedVariants))
            ? { ...item, quantity: forceQuantity !== null ? qty : item.quantity + qty }
            : item
        );
      }
      return [...current, { ...product, quantity: qty, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(current => current.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(current => current.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    // Nettoyer Dexie aussi
    import('@/lib/db').then(({ clearCart: dexieClear }) => dexieClear()).catch(() => {});
  }, []);

  // ─── Calcul du prix avec paliers MOQ ──────────────────────────────────────
  const getItemUnitPrice = useCallback((item) => {
    let price = Number(item.price) || 0;
    const qty = item.quantity || 1;

    const moq1 = Number(item.moq_tier1);
    const disc1 = Number(item.moq_discount1);
    const moq2 = Number(item.moq_tier2);
    const disc2 = Number(item.moq_discount2);

    if (moq2 > 0 && disc2 > 0 && qty >= moq2) {
      price = Math.round(price * (1 - disc2 / 100));
    } else if (moq1 > 0 && disc1 > 0 && qty >= moq1) {
      price = Math.round(price * (1 - disc1 / 100));
    }

    return price;
  }, []);

  const total = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);
  const getCartTotal = useCallback(() => total, [total]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      total,
      updateQuantity,
      getCartTotal,
      getItemUnitPrice,
      isLoaded,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  // Fallback safe si le CartProvider n'est pas encore monté (SSR / hydratation)
  if (!ctx) return {
    cart: [],
    addToCart: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    updateQuantity: () => {},
    getCartTotal: () => 0,
    getItemUnitPrice: () => 0,
    total: 0,
    isLoaded: false,
  };
  return ctx;
};
