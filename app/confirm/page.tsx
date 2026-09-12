"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import ConfirmationView from '@/src/components/ConfirmationView.jsx';
import StoreLayout from '@/app/StoreLayout';
import { useStoreData } from '@/src/context/StoreDataContext';

export default function ConfirmPage() {
  const router = useRouter();
  const { lastOrder } = useStoreData();

  return (
    <StoreLayout>
      <motion.div
        key="confirm-view"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        style={{ width: '100%' }}
      >
        <ConfirmationView
          order={lastOrder}
          onContinueShopping={() => router.push('/')}
        />
      </motion.div>
    </StoreLayout>
  );
}
