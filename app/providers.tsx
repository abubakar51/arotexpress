"use client";
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { CartProvider } from '../src/context/CartContext.jsx';
import { PackageBoxProvider } from '../src/context/PackageBoxContext.jsx';
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
        <PackageBoxProvider>
          <StoreDataProvider initialData={initialData}>
            {children}
          </StoreDataProvider>
        </PackageBoxProvider>
      </CartProvider>
    </AuthProvider>
  );
}
