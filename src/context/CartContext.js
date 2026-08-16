"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vestyle_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to parse cart:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('vestyle_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart, isLoaded]);

  const addToCart = (product, forceQuantity = null) => {
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
      return [...current, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(current => current.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const clearCart = () => setCart([]);

  // Calcul du prix unitaire selon la quantité et les paliers MOQ
  const getItemUnitPrice = (item) => {
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
  };

  const total = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);
  const getCartTotal = () => total;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, updateQuantity, getCartTotal, getItemUnitPrice }}>
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
  };
  return ctx;
};
