"use client";
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { CartProvider } from '../src/context/CartContext.jsx';
import { StoreDataProvider } from '../src/context/StoreDataContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreDataProvider>
          {children}
        </StoreDataProvider>
      </CartProvider>
    </AuthProvider>
  );
}
