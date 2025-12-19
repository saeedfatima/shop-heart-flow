// Cart context for managing shopping cart state with localStorage persistence
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductColor, ProductSize } from '@/types/product';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: ProductColor, size: ProductSize, quantity: number) => void;
  removeFromCart: (productId: string, colorName: string, sizeName: string) => void;
  updateQuantity: (productId: string, colorName: string, sizeName: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Generate a unique key for cart item identification
  const getItemKey = (productId: string, colorName: string, sizeName: string) => {
    return `${productId}-${colorName}-${sizeName}`;
  };

  const addToCart = (product: Product, color: ProductColor, size: ProductSize, quantity: number) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColor.name === color.name &&
          item.selectedSize.name === size.name
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        toast({
          title: 'Cart updated',
          description: `${product.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: 'Added to cart',
          description: `${product.name} (${color.name}, ${size.name}) added to your cart`,
        });
        return [...prevItems, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });
  };

  const removeFromCart = (productId: string, colorName: string, sizeName: string) => {
    setItems(prevItems => {
      const item = prevItems.find(
        item =>
          item.product.id === productId &&
          item.selectedColor.name === colorName &&
          item.selectedSize.name === sizeName
      );
      if (item) {
        toast({
          title: 'Removed from cart',
          description: `${item.product.name} removed from your cart`,
        });
      }
      return prevItems.filter(
        item =>
          !(item.product.id === productId &&
            item.selectedColor.name === colorName &&
            item.selectedSize.name === sizeName)
      );
    });
  };

  const updateQuantity = (productId: string, colorName: string, sizeName: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, colorName, sizeName);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId &&
        item.selectedColor.name === colorName &&
        item.selectedSize.name === sizeName
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    // Free shipping over $100
    return subtotal > 100 ? 0 : 12;
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getShipping,
        getTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
