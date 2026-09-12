"use client";
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { CartProvider } from '../src/context/CartContext.jsx';
import { StoreDataProvider } from '../src/context/StoreDataContext';

export default function Providers({
  children,
  initialData
}: {
  children: React.ReactNode;
  initialData?: any;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreDataProvider initialData={initialData}>
          {children}
        </StoreDataProvider>
      </CartProvider>
    </AuthProvider>
  );
}
