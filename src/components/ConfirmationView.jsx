"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCircle2, ArrowRight, Printer, Navigation, Copy, CheckCheck } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';
import CustomerInvoiceModal from './CustomerInvoiceModal.jsx';
import OrderTrackingModal from './OrderTrackingModal.jsx';

export default function ConfirmationView({ order, onContinueShopping }) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyCode = () => {
    if (order.order_code) {
      navigator.clipboard.writeText(order.order_code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <motion.div
      id="confirm-view"
      style={{ display: 'block' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <section className="section-wrap" style={{ paddingTop: '26px' }}>
        <div className="steps">
          <div className="step done">
            <span className="dot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} />
            </span>{' '}
            কার্ট
          </div>
          <div className="step-line"></div>
          <div className="step done">
            <span className="dot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} />
            </span>{' '}
            ডেলিভারি তথ্য
          </div>
          <div className="step-line"></div>
          <div className="step active">
            <span className="dot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} />
            </span>{' '}
            নিশ্চিতকরণ
          </div>
        </div>

        <motion.div
          className="confirm-box"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280, delay: 0.1 }}
        >
          <motion.div
            className="checkmark"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 350, delay: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Check size={32} strokeWidth={3} />
          </motion.div>
          <h2>অর্ডার সফল হয়েছে!</h2>
          <p>
            আপনার অর্ডারটি গ্রহণ করা হয়েছে। ২৪–৪৮ ঘণ্টার মধ্যে ডেলিভারি করা হবে।
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '14px 0 8px' }}>
            <div className="order-id mono" style={{ margin: 0 }}>{order.order_code}</div>
            <motion.button
              type="button"
              className="admin-btn secondary"
              style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={handleCopyCode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="অর্ডার কোড কপি করুন"
            >
              {copied ? <CheckCheck size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copied ? 'কপি হয়েছে!' : 'কপি'}</span>
            </motion.button>
          </div>

          <p id="confirm-summary">
            {toBengaliNumber(order.items_json?.length || 0)} ধরণের পণ্য · {order.delivery_area} এলাকায় পাঠানো হবে{' '}
            <strong>{order.customer_name}</strong> এর ঠিকানায়।
          </p>
          <p style={{ marginTop: '6px', fontSize: '13px' }}>
            পেমেন্ট মাধ্যম: <strong>{order.payment_method}</strong> | সর্বমোট: <strong className="mono">৳{toBengaliNumber(order.total_amount)}</strong>
          </p>

          {/* Action buttons for Customer Invoice & Live Tracking */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '20px 0 14px' }}>
            <motion.button
              type="button"
              className="admin-btn secondary"
              style={{ padding: '10px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              onClick={() => setInvoiceOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Printer size={15} />
              <span>ক্যাশ মেমো / ইনভয়েস ডাউনলোড</span>
            </motion.button>

            <motion.button
              type="button"
              className="admin-btn secondary"
              style={{ padding: '10px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              onClick={() => setTrackingOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Navigation size={15} />
              <span>লাইভ অর্ডার ট্র্যাকিং</span>
            </motion.button>
          </div>

          <motion.button
            className="cta"
            onClick={onContinueShopping}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
          >
            <span>কেনাকাটা চালিয়ে যান</span> <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      {/* Customer Cash Memo Invoice Modal */}
      {invoiceOpen && (
        <CustomerInvoiceModal
          isOpen={true}
          onClose={() => setInvoiceOpen(false)}
          order={order}
        />
      )}

      {/* Live Order Tracking Modal */}
      {trackingOpen && (
        <OrderTrackingModal
          isOpen={true}
          onClose={() => setTrackingOpen(false)}
          initialOrderCode={order.order_code}
        />
      )}
    </motion.div>
  );
}

