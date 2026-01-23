import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('prescriptionCart');
    return saved ? JSON.parse(saved) : [];
  });

  const [submittedItems, setSubmittedItems] = useState(() => {
    const saved = localStorage.getItem('submittedPrescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prescriptionCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('submittedPrescriptions', JSON.stringify(submittedItems));
  }, [submittedItems]);

  const addToCart = (prescription) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === prescription.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...prescription, comment: '', addedAt: new Date().toISOString() }];
    });
  };

  const removeFromCart = (prescriptionId) => {
    setCartItems(prev => prev.filter(item => item.id !== prescriptionId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const submitCart = () => {
    const prescriptionIds = cartItems.map(item => item.id);
    setSubmittedItems(prev => [...new Set([...prev, ...prescriptionIds])]);
    setCartItems([]);
  };

  const removeFromSubmitted = (prescriptionId) => {
    setSubmittedItems(prev => prev.filter(id => id !== prescriptionId));
  };

  const updateCartItemComment = (prescriptionId, comment) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === prescriptionId ? { ...item, comment } : item
      )
    );
  };

  const isInCart = (prescriptionId) => {
    return cartItems.some(item => item.id === prescriptionId);
  };

  const isSubmitted = (prescriptionId) => {
    return submittedItems.includes(prescriptionId);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, submitCart, updateCartItemComment, isInCart, isSubmitted, removeFromSubmitted }}>
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