"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import AdminPanel from '@/src/components/AdminPanel.jsx';
import ToastContainer from '@/src/components/ToastContainer.jsx';
import { useStoreData } from '@/src/context/StoreDataContext';

export default function AdminTabPage() {
  const router = useRouter();
  const { fetchData } = useStoreData();

  return (
    <motion.div
      key="admin-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      <AdminPanel
        onNavigateHome={() => {
          router.push('/');
          fetchData(true);
        }}
      />
      <ToastContainer />
    </motion.div>
  );
}
