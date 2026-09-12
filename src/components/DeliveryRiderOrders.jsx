"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  MapPin,
  FileText,
  Check,
  X,
  AlertCircle,
  Banknote,
  Calendar,
  Layers,
  Receipt,
  Package,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';
import Pagination from './Pagination.jsx';

export default function DeliveryRiderOrders({
  orders = [],
  onUpdateStatus,
  onOpenReceipt,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('active'); // 'active' | 'delivered' | 'all'
  
  // Delivery confirmation modal
  const [confirmModalOrder, setConfirmModalOrder] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, searchTerm]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isDelivered = o.status === 'delivered' || o.status === 'ডেলিভার্ড';
      const isCancelled = o.status === 'cancelled' || o.status === 'বাতিল';
      const isActive = !isDelivered && !isCancelled;

      if (statusTab === 'active' && !isActive) return false;
      if (statusTab === 'delivered' && !isDelivered) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const code = (o.order_code || `#ORD-${o.id}`).toLowerCase();
      const name = (o.customer_name || '').toLowerCase();
      const phone = (o.customer_phone || '').toLowerCase();
      const address = (o.delivery_address || '').toLowerCase();
      const area = (o.delivery_area || '').toLowerCase();

      return code.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q) || area.includes(q);
    });
  }, [orders, statusTab, searchTerm]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const activeCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'ডেলিভার্ড' && o.status !== 'cancelled' && o.status !== 'বাতিল'
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'ডেলিভার্ড'
  ).length;

  // Open delivery confirm modal
  const handleOpenConfirmModal = (order) => {
    setConfirmModalOrder(order);
    const isCOD = !order.payment_method || order.payment_method.toLowerCase().includes('cash') || order.payment_method.includes('ক্যাশ');
    setDeliveryNote(isCOD ? `নগদ ৳${toBengaliNumber(order.total_amount)} গ্রহণ করা হয়েছে।` : 'পণ্য হস্তান্তর সম্পন্ন।');
  };

  // Submit delivery confirmation
  const handleConfirmDelivered = async (e) => {
    e.preventDefault();
    if (!confirmModalOrder) return;
    setUpdating(true);
    try {
      await onUpdateStatus(confirmModalOrder.id, 'delivered', deliveryNote);
      setConfirmModalOrder(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rider-orders-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header & Filter Controls */}
      <div
        className="admin-card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              ডেলিভারি অর্ডারের তালিকা
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              অ্যাসাইন করা অর্ডার দেখে গ্রাহককে পণ্য পৌঁছে দিন এবং ডেলিভারি নিশ্চিত করুন।
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`admin-btn ${statusTab === 'active' ? 'primary' : 'secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                background: statusTab === 'active' ? '#eab308' : undefined,
                borderColor: statusTab === 'active' ? '#eab308' : undefined,
                color: statusTab === 'active' ? '#ffffff' : undefined
              }}
              onClick={() => setStatusTab('active')}
            >
              <Clock size={15} />
              <span>ডেলিভারি বাকি ({toBengaliNumber(activeCount)})</span>
            </button>

            <button
              type="button"
              className={`admin-btn ${statusTab === 'delivered' ? 'primary' : 'secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                background: statusTab === 'delivered' ? '#16a34a' : undefined,
                borderColor: statusTab === 'delivered' ? '#16a34a' : undefined,
                color: statusTab === 'delivered' ? '#ffffff' : undefined
              }}
              onClick={() => setStatusTab('delivered')}
            >
              <CheckCircle2 size={15} />
              <span>ডেলিভার্ড সম্পন্ন ({toBengaliNumber(deliveredCount)})</span>
            </button>

            <button
              type="button"
              className={`admin-btn ${statusTab === 'all' ? 'primary' : 'secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)'
              }}
              onClick={() => setStatusTab('all')}
            >
              <span>সকল অর্ডার ({toBengaliNumber(orders.length)})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="অর্ডার কোড, গ্রাহকের নাম, মোবাইল নম্বর বা ঠিকানা দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--rule)',
              fontSize: '13.5px',
              background: '#F8FAF9',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={`skel-r-${s}`}
              className="admin-card animate-pulse"
              style={{ padding: '20px', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="skel-block" style={{ width: '40%', height: '18px' }}></div>
              <div className="skel-block" style={{ width: '70%', height: '14px' }}></div>
              <div className="skel-block" style={{ width: '100%', height: '50px' }}></div>
              <div className="skel-block" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div
          className="admin-card"
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#F1F5F3',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <Layers size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>
            কোনো অর্ডার পাওয়া যায়নি
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
            {searchTerm
              ? 'আপনার সার্চের সাথে কোনো অর্ডারের মিল নেই। অন্য শব্দ দিয়ে খুঁজে দেখুন।'
              : statusTab === 'active'
              ? 'আপনার কোনো পেন্ডিং ডেলিভারি বাকি নেই! সব অর্ডার সফলভাবে সম্পন্ন হয়েছে।'
              : 'এই তালিকায় কোনো রেকর্ড পাওয়া যায়নি।'}
          </p>
        </div>
      )}

      {/* Orders Cards */}
      {!loading && paginatedOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {paginatedOrders.map((order) => {
            const isDelivered = order.status === 'delivered' || order.status === 'ডেলিভার্ড';
            const isCancelled = order.status === 'cancelled' || order.status === 'বাতিল';
            const isCOD = !order.payment_method || order.payment_method.toLowerCase().includes('cash') || order.payment_method.includes('ক্যাশ');

            return (
              <div
                key={order.id}
                className="rider-card-modern"
                style={{
                  borderLeft: `5px solid ${isDelivered ? '#16a34a' : isCancelled ? '#ef4444' : '#eab308'}`
                }}
              >
                {/* Top: Order Code, Date & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green)' }}>
                        {order.order_code || `#ORD-${order.id}`}
                      </span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: isDelivered ? '#dcfce7' : isCancelled ? '#fee2e2' : '#fef9c3',
                          color: isDelivered ? '#15803d' : isCancelled ? '#b91c1c' : '#a16207',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isDelivered ? (
                          <>
                            <CheckCircle2 size={13} /> ডেলিভার্ড সম্পন্ন
                          </>
                        ) : isCancelled ? (
                          <>
                            <AlertCircle size={13} /> বাতিল
                          </>
                        ) : (
                          <>
                            <Clock size={13} /> ডেলিভারি বাকি
                          </>
                        )}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{new Date(order.created_at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Payment Amount Display */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: isCOD ? '#b91c1c' : '#15803d' }}>
                      ৳{toBengaliNumber(order.total_amount)}
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isCOD ? '#fee2e2' : '#dcfce7',
                        color: isCOD ? '#b91c1c' : '#15803d',
                        display: 'inline-block'
                      }}
                    >
                      {isCOD ? 'নগদ সংগ্রহ (COD)' : 'অনলাইন পেইড'}
                    </span>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div
                  style={{
                    background: '#F8FAF9',
                    border: '1px solid var(--rule)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Customer row + Direct Phone Call button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>গ্রাহকের নাম:</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                        {order.customer_name}
                      </div>
                    </div>

                    <a
                      href={`tel:${order.customer_phone}`}
                      className="rider-phone-pill"
                      title="গ্রাহককে কল দিন"
                    >
                      <PhoneCall size={14} />
                      <span className="mono">{order.customer_phone}</span>
                      <span style={{ fontSize: '11px', background: '#15803d', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', marginLeft: '2px' }}>কল</span>
                    </a>
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', borderTop: '1px dashed var(--rule)', paddingTop: '8px' }}>
                    <MapPin size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.4' }}>
                      {order.delivery_area && (
                        <strong style={{ color: 'var(--green)', marginRight: '6px' }}>
                          [{order.delivery_area}]
                        </strong>
                      )}
                      <span>{order.delivery_address || 'ঠিকানা দেওয়া হয়নি'}</span>
                    </div>
                  </div>
                </div>

                {/* Products List Summary */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} color="var(--green)" />
                    <span>পণ্যসমূহ ({toBengaliNumber(order.items_json?.length || 0)} টি আইটেম):</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {order.items_json?.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          color: 'var(--ink)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {item.productId ? (
                          <span style={{ color: '#15803d', fontWeight: 800, fontSize: '11px', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                            #{item.productId}
                          </span>
                        ) : null}
                        <strong>{item.brand || item.name}</strong> — {toBengaliNumber(item.qty)} {item.unit || ''} (৳{toBengaliNumber(item.price * item.qty)})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delivery Note if any */}
                {order.delivery_note && (
                  <div
                    style={{
                      fontSize: '12.5px',
                      padding: '8px 12px',
                      background: '#eff6ff',
                      borderLeft: '3px solid #3b82f6',
                      borderRadius: '6px',
                      color: '#1e40af'
                    }}
                  >
                    <strong>ডেলিভারি নোট:</strong> {order.delivery_note}
                  </div>
                )}

                {/* Action Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    borderTop: '1px solid var(--rule)',
                    paddingTop: '12px'
                  }}
                >
                  {/* Receipt button */}
                  <button
                    type="button"
                    className="admin-btn secondary"
                    style={{
                      fontSize: '12.5px',
                      padding: '8px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onClick={() => onOpenReceipt(order)}
                  >
                    <Receipt size={15} />
                    <span>ক্যাশ মেমো / রসিদ</span>
                  </button>

                  {/* PRIMARY ACTION: ONE SIMPLE PROMINENT BUTTON */}
                  {!isDelivered && (
                    <motion.button
                      type="button"
                      className="rider-confirm-btn"
                      style={{ maxWidth: '240px' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenConfirmModal(order)}
                    >
                      <CheckCircle2 size={18} />
                      <span>ডেলিভারি সম্পন্ন নিশ্চিত করুন</span>
                    </motion.button>
                  )}

                  {isDelivered && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#16a34a',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>সফলভাবে ডেলিভারি সম্পন্ন</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredOrders.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOrder && (
          <div
            className="admin-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmModalOrder(null);
            }}
          >
            <motion.div
              className="admin-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '420px', width: '92%' }}
            >
              <div className="admin-modal-header" style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span>ডেলিভারি সম্পন্ন নিশ্চিতকরণ</span>
                </h4>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setConfirmModalOrder(null)}
                  aria-label="বন্ধ করুন"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmDelivered} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
                <div style={{ background: '#F8FAF9', padding: '14px', borderRadius: '10px', border: '1px solid var(--rule)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>অর্ডার কোড:</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green)' }}>
                    {confirmModalOrder.order_code || `#ORD-${confirmModalOrder.id}`}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--ink)', marginTop: '8px' }}>
                    <strong>গ্রাহক:</strong> {confirmModalOrder.customer_name} ({confirmModalOrder.customer_phone})
                  </div>

                  <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: (!confirmModalOrder.payment_method || confirmModalOrder.payment_method.toLowerCase().includes('cash') || confirmModalOrder.payment_method.includes('ক্যাশ')) ? '#fef2f2' : '#f0fdf4', border: '1px solid var(--rule)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>কালেকশন স্ট্যাটাস:</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: (!confirmModalOrder.payment_method || confirmModalOrder.payment_method.toLowerCase().includes('cash') || confirmModalOrder.payment_method.includes('ক্যাশ')) ? '#b91c1c' : '#15803d' }}>
                      {(!confirmModalOrder.payment_method || confirmModalOrder.payment_method.toLowerCase().includes('cash') || confirmModalOrder.payment_method.includes('ক্যাশ'))
                        ? `নগদ গ্রহণ করবেন: ৳${toBengaliNumber(confirmModalOrder.total_amount)}`
                        : 'অনলাইন পেইড (টাকা নেওয়া লাগবে না)'}
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                    ডেলিভারি নোট বা মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="যেমন: নগদ টাকা গ্রহণ করা হয়েছে..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--rule)',
                      fontSize: '13.5px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => setConfirmModalOrder(null)}
                    style={{ padding: '10px', fontSize: '13.5px', justifyContent: 'center' }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="rider-confirm-btn"
                    disabled={updating}
                    style={{ padding: '10px', fontSize: '13.5px' }}
                  >
                    {updating ? 'আপডেট হচ্ছে...' : 'হ্যাঁ, ডেলিভার্ড'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
