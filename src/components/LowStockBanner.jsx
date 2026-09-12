"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronRight, X, Package, Check, RefreshCw } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

export default function LowStockBanner({ categories = [], onOpenStockModal, onRefresh, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Find all low stock or stock-out items
  const lowStockItems = [];
  categories.forEach((cat) => {
    if (cat.brands && Array.isArray(cat.brands)) {
      cat.brands.forEach((brand) => {
        const isLow = (brand.stock !== undefined && brand.stock <= 10) || brand.force_stock_out;
        if (isLow) {
          lowStockItems.push({
            catId: cat.id,
            catBn: cat.bn,
            brand: brand
          });
        }
      });
    }
  });

  if (lowStockItems.length === 0 || dismissed) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400e' }}>
              ⚠️ অটোমেটিক লো-স্টক সতর্কতা! ({toBengaliNumber(lowStockItems.length)} টি পণ্যে স্টক কম)
            </div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>
              কিছু পণ্যের মজুত ১০ টির নিচে নেমে গেছে বা স্টক আউট হয়েছে। দ্রুত স্টক আপডেট করুন।
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.button
            type="button"
            className="admin-btn"
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: '6px 14px', fontSize: '12.5px', background: '#d97706', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>পণ্যসমূহ দেখুন</span>
            <ChevronRight size={14} />
          </motion.button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', padding: '4px' }}
            title="লুকান"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>

      {/* Low Stock Items List Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '600px', width: '95%', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div className="admin-modal-header" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                  <AlertTriangle size={18} color="#d97706" />
                  <span>লো-স্টক পণ্য তালিকা ({toBengaliNumber(lowStockItems.length)} টি)</span>
                </h4>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-modal-body" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lowStockItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        padding: '12px 14px',
                        borderRadius: '6px',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                          {item.brand.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                          ক্যাটাগরি: {item.catBn} · দর: ৳{toBengaliNumber(item.brand.price)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            className="mono font-bold"
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: item.brand.stock <= 0 || item.brand.force_stock_out ? '#fee2e2' : '#fef3c7',
                              color: item.brand.stock <= 0 || item.brand.force_stock_out ? '#991b1b' : '#92400e'
                            }}
                          >
                            {item.brand.force_stock_out ? 'স্টক আউট' : `মজুত: ${toBengaliNumber(item.brand.stock ?? 0)}`}
                          </span>
                        </div>
                        
                        {onOpenStockModal && (
                          <motion.button
                            type="button"
                            className="admin-btn secondary"
                            onClick={() => {
                              setShowModal(false);
                              onOpenStockModal(item.catId, item.brand);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            স্টক পরিবর্তন
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-modal-footer" style={{ background: 'var(--cream-card)' }}>
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setShowModal(false)}
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
