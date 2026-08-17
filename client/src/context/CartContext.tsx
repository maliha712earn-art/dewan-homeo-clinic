import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('dewan_cart_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('dewan_cart_items');
      }
    }
  }, []);

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('dewan_cart_items', JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.status === 'OUT_OF_STOCK' || product.stock <= 0) {
      showToast('পণ্যটি বর্তমানে স্টকে নেই।', 'error');
      return;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast(`স্টকে সর্বোচ্চ ${product.stock} টি পণ্য রয়েছে।`, 'error');
        return;
      }

      updated = [...items];
      updated[existingIndex].quantity = newQty;
      showToast(`কার্টে "${product.nameBn || product.name}" এর পরিমাণ বাড়ানো হয়েছে (${newQty} টি)।`, 'success');
    } else {
      if (quantity > product.stock) {
        showToast(`স্টকে সর্বোচ্চ ${product.stock} টি পণ্য রয়েছে।`, 'error');
        return;
      }
      updated = [...items, { id: product.id, product, quantity }];
      showToast(`"${product.nameBn || product.name}" কার্টে যোগ করা হয়েছে।`, 'success');
    }

    saveItems(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = items.find((i) => i.product.id === productId);
    if (item && quantity > item.product.stock) {
      showToast(`স্টকে সর্বোচ্চ ${item.product.stock} টি পণ্য রয়েছে।`, 'error');
      return;
    }

    const updated = items.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
    saveItems(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((i) => i.product.id !== productId);
    saveItems(updated);
    showToast('পণ্য কার্ট থেকে সরিয়ে নেওয়া হয়েছে।', 'info');
  };

  const clearCart = () => {
    saveItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice && item.product.discountPrice > 0
      ? item.product.discountPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
