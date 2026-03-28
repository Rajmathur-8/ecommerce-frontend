'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReduxCart } from '../hooks/useReduxCart';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';

interface AppContextType {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useReduxCart>;
  products: ReturnType<typeof useProducts>;
  wishlist: ReturnType<typeof useWishlist>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();
  const cart = useReduxCart();
  const products = useProducts();
  const wishlist = useWishlist();

  const value: AppContextType = {
    auth,
    cart,
    products,
    wishlist
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 