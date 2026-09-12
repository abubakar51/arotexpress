"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Package,
  Settings,
  LogOut,
  ShoppingBag,
  Check,
  RotateCcw,
  FileText,
  Navigation,
  Bike,
  Phone,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { toBengaliNumber } from '../utils/bengali.js';
import CustomerInvoiceModal from './CustomerInvoiceModal.jsx';
import OrderTrackingModal from './OrderTrackingModal.jsx';

export default function ProfileView({ onBackToHome }) {
  const { user, token, logout, updateProfile } = useAuth();
  const { showToast, addBulkToCart } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'settings'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modals for Customer invoice and live tracking
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [trackingOrderCode, setTrackingOrderCode] = useState(null);

  const [name, setName] = useState(user ? user.name : '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (token) {
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch((err) => console.error('Fetch orders error:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [token]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg({ text: '', type: '' });

    if (!name.trim()) {
      setUpdateMsg({ text: 'নাম খালি রাখা যাবে না', type: 'error' });
      return;
    }

    if (newPassword && !oldPassword) {
      setUpdateMsg({
        text: 'নতুন পাসওয়ার্ড সেট করতে বর্তমান পাসওয়ার্ড দিন',
        type: 'error'
      });
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        name: name.trim(),
        password: oldPassword || undefined,
        new_password: newPassword || undefined
      });
      setUpdateMsg({ text: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      showToast('প্রোফাইল তথ্য আপডেট হয়েছে');
    } catch (err) {
      setUpdateMsg({ text: err.message || 'আপডেট করতে ত্রুটি হয়েছে', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBn = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s === 'pending' || s === 'পেন্ডিং') return 'পেন্ডিং';
    if (s === 'processing' || s === 'প্রসেসিং') return 'প্রসেসিং';
    if (s === 'shipped' || s === 'পাঠানো হয়েছে' || s === 'ডেলিভারিতে আছে' || s === 'ডেলিভারিতে পাঠানো হয়েছে' || s === 'অন-ওয়ে') return 'ডেলিভারিতে আছে';
    if (s === 'delivered' || s === 'ডেলিভার্ড' || s === 'সম্পন্ন' || s === 'ডেলিভারি সম্পন্ন') return 'ডেলিভার্ড';
    if (s === 'cancelled' || s === 'বাতিল') return 'বাতিল';
    return status || 'পেন্ডিং';
  };

  const getStatusClass = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s === 'pending' || s === 'পেন্ডিং') return 'status-pending';
    if (s === 'processing' || s === 'প্রসেসিং') return 'status-processing';
    if (s === 'shipped' || s === 'পাঠানো হয়েছে' || s === 'ডেলিভারিতে আছে' || s === 'অন-ওয়ে') return 'status-shipped';
    if (s === 'delivered' || s === 'ডেলিভার্ড' || s === 'সম্পন্ন' || s === 'ডেলিভারি সম্পন্ন') return 'status-delivered';
    if (s === 'cancelled' || s === 'বাতিল') return 'status-cancelled';
    return 'status-pending';
  };

  if (!user) {
    return (
      <motion.div
        className="section-wrap"
        style={{ paddingTop: '40px', textAlign: 'center' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>অনুগ্রহ করে লগইন করুন</h2>
        <motion.button
          className="cta"
          onClick={onBackToHome}
          style={{ marginTop: '16px' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          হোম পেজে যান
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="section-wrap"
      style={{ paddingTop: '26px' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
    >
      <motion.button
        className="breadcrumb"
        onClick={onBackToHome}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> <span>হোম পেজে ফিরে যান</span>
      </motion.button>

      <div className="profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', margin: 0 }}>স্বাগতম, {user.name}!</h2>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              মোবাইল: <strong className="mono">{user.phone}</strong>
            </div>
          </div>
          <motion.button
            className="admin-btn danger"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              logout();
              onBackToHome();
              showToast('লগআউট করা হয়েছে');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={15} /> <span>লগআউট</span>
          </motion.button>
        </div>

        <div className="profile-nav-tabs">
          <button
            className={`profile-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={16} />
            <span>আমার অর্ডারসমূহ ({toBengaliNumber(orders.length)})</span>
          </button>
          <button
            className={`profile-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={16} />
            <span>প্রোফাইল সেটিংস</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingOrders ? (
                <p>অর্ডার লোড হচ্ছে...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', marginBottom: '8px' }}>
                    <ShoppingBag size={40} />
                  </div>
                  <p>আপনি এখনও কোনো অর্ডার করেননি।</p>
                  <motion.button
                    className="cta"
                    style={{ marginTop: '14px', padding: '8px 16px', fontSize: '13px' }}
                    onClick={onBackToHome}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    বাজার শুরু করুন
                  </motion.button>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <motion.div
                    className="order-card"
                    key={order.id || order.order_code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                  >
                    <div className="order-header">
                      <div>
                        <strong>অর্ডার কোড: </strong>
                        <span className="mono" style={{ fontWeight: 700 }}>
                          {order.order_code}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--muted)', marginLeft: '10px' }}>
                          {new Date(order.created_at).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusBn(order.status)}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                      <strong>ঠিকানা:</strong> {order.delivery_address}, {order.delivery_area} | <strong>পেমেন্ট:</strong> {order.payment_method}
                      {order.trx_id && (
                        <span> (TrxID: <span className="mono">{order.trx_id}</span>)</span>
                      )}
                    </div>

                    <div style={{ background: '#F8FAF9', border: '1px solid var(--rule)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                      <strong>পণ্যসমূহ:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        {order.items_json?.map((it, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {it.brand} ({it.catBn || it.unit}) ×{toBengaliNumber(it.qty)}</span>
                            <span className="mono">৳{toBengaliNumber(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px dashed var(--rule)', marginTop: '8px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>ডেলিভারি ফি সহ মোট:</span>
                        <span className="mono" style={{ color: 'var(--green-dim)' }}>৳{toBengaliNumber(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Assigned Rider Info (if present) */}
                    {order.delivery_rider_name && (
                      <div style={{ marginTop: '10px', padding: '10px 14px', background: 'var(--md-primary-container)', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534' }}>
                          <Bike size={15} color="#15803d" />
                          <span>ডেলিভারি রাইডার: <strong>{order.delivery_rider_name}</strong></span>
                        </div>
                        {order.delivery_rider_phone && (
                          <a href={`tel:${order.delivery_rider_phone}`} style={{ color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            <Phone size={12} /> {order.delivery_rider_phone}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Order Action Buttons: Re-order, Cash Memo Invoice, Live Tracking */}
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--rule)', paddingTop: '10px' }}>
                      {/* 1-Click Re-order Button */}
                      <motion.button
                        type="button"
                        className="admin-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', fontWeight: 700 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (order.items_json && order.items_json.length > 0) {
                            addBulkToCart(order.items_json);
                          } else {
                            showToast('অর্ডারে কোনো পণ্য পাওয়া যায়নি');
                          }
                        }}
                        title="এক ক্লিকে পুনরায় এই অর্ডারটি কার্টে যোগ করুন"
                      >
                        <RotateCcw size={13} />
                        <span>১-ক্লিকে পুনরায় অর্ডার</span>
                      </motion.button>

                      {/* Live Tracking Button */}
                      <motion.button
                        type="button"
                        className="admin-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTrackingOrderCode(order.order_code)}
                        title="অর্ডারের বর্তমান লাইভ অবস্থা ট্র্যাক করুন"
                      >
                        <Navigation size={13} />
                        <span>অর্ডার ট্র্যাক</span>
                      </motion.button>

                      {/* Cash Memo Invoice Modal */}
                      <motion.button
                        type="button"
                        className="admin-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedOrderForInvoice(order)}
                        title="ক্যাশ মেমো / ইনভয়েস ভিউ ও ডাউনলোড করুন"
                      >
                        <Printer size={13} />
                        <span>ক্যাশ মেমো</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.form
              key="settings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleProfileUpdate}
              style={{ maxWidth: '440px' }}
            >
              {updateMsg.text && (
                <div
                  style={{
                    background: updateMsg.type === 'success' ? 'var(--md-primary-container)' : '#ffeded',
                    color: updateMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${updateMsg.type === 'success' ? '#A7F3D0' : '#FECDD3'}`,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    marginBottom: '14px'
                  }}
                >
                  {updateMsg.text}
                </div>
              )}

              <div className="field">
                <label htmlFor="user-name-edit">আপনার নাম</label>
                <input
                  id="user-name-edit"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="user-phone-locked">মোবাইল নম্বর (পরিবর্তনযোগ্য নয়)</label>
                <input
                  id="user-phone-locked"
                  type="text"
                  value={user.phone}
                  disabled
                  style={{ background: '#e5decb', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ borderTop: '1px dashed var(--rule)', margin: '18px 0', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>পাসওয়ার্ড পরিবর্তন করতে চাইলে:</h4>

                <div className="field">
                  <label htmlFor="user-old-pass">বর্তমান পাসওয়ার্ড</label>
                  <input
                    id="user-old-pass"
                    type="password"
                    placeholder="বর্তমান পাসওয়ার্ড দিন"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="user-new-pass">নতুন পাসওয়ার্ড</label>
                  <input
                    id="user-new-pass"
                    type="password"
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={updating}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {updating ? 'আপডেট হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Customer Cash Memo Invoice Modal */}
      {selectedOrderForInvoice && (
        <CustomerInvoiceModal
          isOpen={true}
          onClose={() => setSelectedOrderForInvoice(null)}
          order={selectedOrderForInvoice}
        />
      )}

      {/* Live Order Tracking Modal */}
      {trackingOrderCode && (
        <OrderTrackingModal
          isOpen={true}
          onClose={() => setTrackingOrderCode(null)}
          initialOrderCode={trackingOrderCode}
        />
      )}
    </motion.div>
  );
}

