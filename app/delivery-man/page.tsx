"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import DeliveryRiderPanel from '@/src/components/DeliveryRiderPanel.jsx';
import ToastContainer from '@/src/components/ToastContainer.jsx';
import { useStoreData } from '@/src/context/StoreDataContext';

export default function DeliveryManPage() {
  const router = useRouter();
  const { fetchData } = useStoreData();

  return (
    <motion.div
      key="rider-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      <DeliveryRiderPanel
        onNavigateHome={() => {
          router.push('/');
          fetchData(true);
        }}
      />
      <ToastContainer />
    </motion.div>
  );
}
