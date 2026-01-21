import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('prescriptionCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prescriptionCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (prescription) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === prescription.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...prescription, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromCart = (prescriptionId) => {
    setCartItems(prev => prev.filter(item => item.id !== prescriptionId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}