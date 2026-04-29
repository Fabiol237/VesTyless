"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      if (typeof window === 'undefined') return [];
      const savedCart = localStorage.getItem('vestyle_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to parse cart:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vestyle_cart', JSON.stringify(cart));
      }
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
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

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const getCartTotal = () => total;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, updateQuantity, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
