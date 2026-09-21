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
  ShoppingBag,
  Copy,
  Filter,
  CalendarRange,
  RotateCcw
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';
import { copyToClipboard } from '../utils/clipboard.js';
import Pagination from './Pagination.jsx';

export default function DeliveryRiderOrders({
  orders = [],
  initialTab = 'active',
  onTabChange,
  onUpdateStatus,
  onOpenReceipt,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState(initialTab || 'active'); // 'active' | 'today' | 'pending_cash' | 'delivered' | 'all'
  
  // Date Filtering States
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'last_7_days' | 'this_month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // 'all' | 'regular' | 'package'
  
  // Copy state feedback
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Sync with initialTab prop when it changes
  useEffect(() => {
    if (initialTab) {
      setStatusTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab) => {
    setStatusTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleCopyPhone = async (orderId, phone, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const success = await copyToClipboard(phone);
    if (success) {
      setCopiedPhoneId(orderId);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    }
  };

  const handleCopyCode = async (orderId, code, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCodeId(orderId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  const handleResetFilters = () => {
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setOrderTypeFilter('all');
    setSearchTerm('');
  };
  
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
  }, [statusTab, dateFilter, customStartDate, customEndDate, orderTypeFilter, searchTerm]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter orders
  const filteredOrders = useMemo(() => {
    const today = new Date();
    const tStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return orders.filter((o) => {
      const isDelivered = o.status === 'delivered' || o.status === 'ডেলিভার্ড' || o.status === 'সম্পন্ন';
      const isCancelled = o.status === 'cancelled' || o.status === 'বাতিল';
      const isActive = !isDelivered && !isCancelled;
      const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
      const isPackage = Boolean(o.is_package || o.isPackage || (o.order_code && o.order_code.startsWith('PK-')) || (o.order_type === 'package'));

      // Status tab
      if (statusTab === 'active' && !isActive) return false;
      if (statusTab === 'delivered' && !isDelivered) return false;
      if (statusTab === 'today') {
        const d = o.delivered_at || o.created_at || '';
        if (!d.startsWith(tStr)) return false;
      }
      if (statusTab === 'pending_cash' && (!isActive || !isCOD)) return false;

      // Order type filter
      if (orderTypeFilter === 'regular' && isPackage) return false;
      if (orderTypeFilter === 'package' && !isPackage) return false;

      // Date filtering
      const rawDate = isDelivered && o.delivered_at ? o.delivered_at : (o.created_at || '');
      if (dateFilter !== 'all') {
        if (!rawDate) return false;
        const dObj = new Date(rawDate);
        const dStr = rawDate.slice(0, 10);

        if (dateFilter === 'today') {
          if (dStr !== tStr) return false;
        } else if (dateFilter === 'yesterday') {
          if (dStr !== yStr) return false;
        } else if (dateFilter === 'last_7_days') {
          if (dObj < sevenDaysAgo) return false;
        } else if (dateFilter === 'this_month') {
          if (dObj.getMonth() !== today.getMonth() || dObj.getFullYear() !== today.getFullYear()) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate && dStr < customStartDate) return false;
          if (customEndDate && dStr > customEndDate) return false;
        }
      }

      // Search query
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const code = (o.order_code || `#ORD-${o.id}`).toLowerCase();
      const name = (o.customer_name || '').toLowerCase();
      const phone = (o.customer_phone || '').toLowerCase();
      const address = (o.delivery_address || '').toLowerCase();
      const area = (o.delivery_area || '').toLowerCase();

      return code.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q) || area.includes(q);
    });
  }, [orders, statusTab, orderTypeFilter, dateFilter, customStartDate, customEndDate, searchTerm]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const activeCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'ডেলিভার্ড' && o.status !== 'সম্পন্ন' && o.status !== 'cancelled' && o.status !== 'বাতিল'
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'ডেলিভার্ড' || o.status === 'সম্পন্ন'
  ).length;

  const todayCount = orders.filter((o) => {
    const d = o.delivered_at || o.created_at || '';
    return d.startsWith(todayStr);
  }).length;

  const pendingCashOrders = orders.filter((o) => {
    const isDelivered = o.status === 'delivered' || o.status === 'ডেলিভার্ড' || o.status === 'সম্পন্ন';
    const isCancelled = o.status === 'cancelled' || o.status === 'বাতিল';
    const isActive = !isDelivered && !isCancelled;
    const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
    return isActive && isCOD;
  });

  const totalPendingCash = pendingCashOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  
  const todayDeliveredOrders = orders.filter((o) => {
    const isDelivered = o.status === 'delivered' || o.status === 'ডেলিভার্ড' || o.status === 'সম্পন্ন';
    const d = o.delivered_at || o.created_at || '';
    return isDelivered && d.startsWith(todayStr);
  });

  const todayCollectedCash = todayDeliveredOrders.reduce((sum, o) => {
    const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
    return isCOD ? sum + (Number(o.total_amount) || 0) : sum;
  }, 0);

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
      await onUpdateStatus(
        confirmModalOrder.id,
        'delivered',
        deliveryNote,
        confirmModalOrder.is_package || confirmModalOrder.is_package_order || (confirmModalOrder.order_type === 'package')
      );
      setConfirmModalOrder(null);
    } finally {
      setUpdating(false);
    }
  };

  const hasActiveCustomFilters = dateFilter !== 'all' || orderTypeFilter !== 'all' || searchTerm.trim() !== '';

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
              onClick={() => handleTabSelect('active')}
            >
              <Clock size={15} />
              <span>ডেলিভারি বাকি ({toBengaliNumber(activeCount)})</span>
            </button>

            <button
              type="button"
              className={`admin-btn ${statusTab === 'today' ? 'primary' : 'secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                background: statusTab === 'today' ? '#0284c7' : undefined,
                borderColor: statusTab === 'today' ? '#0284c7' : undefined,
                color: statusTab === 'today' ? '#ffffff' : undefined
              }}
              onClick={() => handleTabSelect('today')}
            >
              <Calendar size={15} />
              <span>আজকের ডেলিভারি ({toBengaliNumber(todayCount)})</span>
            </button>

            <button
              type="button"
              className={`admin-btn ${statusTab === 'pending_cash' ? 'primary' : 'secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                background: statusTab === 'pending_cash' ? '#ea580c' : undefined,
                borderColor: statusTab === 'pending_cash' ? '#ea580c' : undefined,
                color: statusTab === 'pending_cash' ? '#ffffff' : undefined
              }}
              onClick={() => handleTabSelect('pending_cash')}
            >
              <Banknote size={15} />
              <span>পেন্ডিং ক্যাশ কালেকশন ({toBengaliNumber(pendingCashOrders.length)})</span>
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
              onClick={() => handleTabSelect('delivered')}
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
              onClick={() => handleTabSelect('all')}
            >
              <span>সকল অর্ডার ({toBengaliNumber(orders.length)})</span>
            </button>
          </div>
        </div>

        {/* Live Cash Collection Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            background: '#F8FAF9',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--rule)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#fff7ed', color: '#ea580c', padding: '6px', borderRadius: '6px' }}>
              <Banknote size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>পেন্ডিং ক্যাশ কালেকশন</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ea580c' }}>
                ৳{toBengaliNumber(totalPendingCash)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ecfdf5', color: '#16a34a', padding: '6px', borderRadius: '6px' }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>আজকের সংগৃহীত ক্যাশ</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                ৳{toBengaliNumber(todayCollectedCash)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#eff6ff', color: '#0284c7', padding: '6px', borderRadius: '6px' }}>
              <Calendar size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>আজকের ডেলিভারি সম্পন্ন</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                {toBengaliNumber(todayDeliveredOrders.length)} টি অর্ডার
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter & Search Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          {/* Date Presets Dropdown / Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
              <CalendarRange size={15} color="var(--green)" />
              <span>তারিখ ফিল্টার:</span>
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--rule)',
                fontSize: '12.5px',
                fontWeight: 600,
                background: dateFilter !== 'all' ? '#ecfdf5' : '#ffffff',
                color: dateFilter !== 'all' ? '#15803d' : 'inherit'
              }}
            >
              <option value="all">📅 সকল তারিখ (All Time)</option>
              <option value="today">আজকের অর্ডার (Today)</option>
              <option value="yesterday">গতকালের অর্ডার (Yesterday)</option>
              <option value="last_7_days">বিগত ৭ দিন (Last 7 Days)</option>
              <option value="this_month">চলতি মাস (This Month)</option>
              <option value="custom">কাস্টম তারিখ রেঞ্জ (Custom Date)...</option>
            </select>
          </div>

          {/* Custom Date Pickers when 'custom' is selected */}
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--rule)',
                  fontSize: '12px',
                  background: '#ffffff'
                }}
                title="শুরুর তারিখ"
              />
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>থেকে</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--rule)',
                  fontSize: '12px',
                  background: '#ffffff'
                }}
                title="শেষের তারিখ"
              />
            </div>
          )}

          {/* Order Source Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--rule)',
                fontSize: '12.5px',
                fontWeight: 600,
                background: '#ffffff'
              }}
            >
              <option value="all">📦 সব পার্সেল</option>
              <option value="regular">🛒 সাধারণ পণ্য</option>
              <option value="package">🎁 প্যাকেজ অর্ডার</option>
            </select>
          </div>

          {/* Reset button if active filters */}
          {hasActiveCustomFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="admin-btn secondary"
              style={{
                padding: '5px 10px',
                fontSize: '11.5px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#fee2e2',
                borderColor: '#fca5a5',
                color: '#b91c1c'
              }}
              title="সকল ফিল্টার রিসেট করুন"
            >
              <RotateCcw size={12} />
              <span>রিসেট</span>
            </button>
          )}

          {/* Filter Result Count Badge */}
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
            মোট প্রদর্শিত: <strong style={{ color: 'var(--ink)' }}>{toBengaliNumber(filteredOrders.length)}</strong> টি অর্ডার
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
            {searchTerm || dateFilter !== 'all' || orderTypeFilter !== 'all'
              ? 'আপনার নির্বাচিত ফিল্টার বা সার্চের সাথে কোনো অর্ডারের মিল নেই। ফিল্টার পরিবর্তন বা রিসেট করে দেখুন।'
              : statusTab === 'active'
              ? 'আপনার কোনো পেন্ডিং ডেলিভারি বাকি নেই! সব অর্ডার সফলভাবে সম্পন্ন হয়েছে।'
              : 'এই তালিকায় কোনো রেকর্ড পাওয়া যায়নি।'}
          </p>
          {hasActiveCustomFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="admin-btn secondary"
              style={{ marginTop: '14px', padding: '6px 14px', fontSize: '12.5px' }}
            >
              <RotateCcw size={13} />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>
      )}

      {/* Orders Cards */}
      {!loading && paginatedOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {paginatedOrders.map((order) => {
            const isDelivered = order.status === 'delivered' || order.status === 'ডেলিভার্ড' || order.status === 'সম্পন্ন';
            const isCancelled = order.status === 'cancelled' || order.status === 'বাতিল';
            const isCOD = !order.payment_method || order.payment_method.toLowerCase().includes('cash') || order.payment_method.includes('ক্যাশ');
            const code = order.order_code || `#ORD-${order.id}`;

            return (
              <div
                key={order.order_code ? `rider-ord-${order.order_code}` : `rider-ord-${order.is_package ? 'pkg' : 'reg'}-${order.id}`}
                className="rider-card-modern"
                style={{
                  borderLeft: `5px solid ${isDelivered ? '#16a34a' : isCancelled ? '#ef4444' : '#eab308'}`
                }}
              >
                {/* Top: Order Code, Date & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green)' }}>
                          {code}
                        </span>
                        <button
                          type="button"
                          className="quick-icon-btn small"
                          onClick={(e) => handleCopyCode(order.id, code, e)}
                          title="অর্ডার কোড কপি করুন"
                          style={{ padding: '3px 6px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        >
                          {copiedCodeId === order.id ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                        </button>
                      </div>

                      {(order.is_package || order.isPackage || (order.order_code && order.order_code.startsWith('PK-'))) && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Package size={12} /> প্যাকেজ অর্ডার
                        </span>
                      )}
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
                  {/* Customer row + Direct Phone Call & Copy button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>গ্রাহকের নাম:</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                        {order.customer_name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(order.id, order.customer_phone, e)}
                        className="quick-icon-btn"
                        title="গ্রাহকের নম্বর কপি করুন"
                        style={{
                          padding: '6px 10px',
                          background: '#ffffff',
                          border: '1px solid var(--rule)',
                          borderRadius: 'var(--radius-pill)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {copiedPhoneId === order.id ? (
                          <>
                            <Check size={13} color="var(--green)" />
                            <span style={{ color: 'var(--green)', fontWeight: 700 }}>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>কপি</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${order.customer_phone}`}
                        className="rider-phone-pill"
                        title="গ্রাহককে সরাসরি কল দিন"
                      >
                        <PhoneCall size={14} />
                        <span className="mono">{order.customer_phone}</span>
                        <span style={{ fontSize: '11px', background: '#15803d', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', marginLeft: '2px' }}>কল</span>
                      </a>
                    </div>
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
                    <span>পণ্যসমূহ ({toBengaliNumber(order.items_json?.length || (order.items && order.items.length) || 0)} টি আইটেম):</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(order.items_json || order.items || []).map((item, idx) => (
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
                        <strong>{item.brand || item.product_name || item.name}</strong> — {toBengaliNumber(item.qty || item.quantity || 1)} {item.unit || ''} (৳{toBengaliNumber((item.price || item.unit_price || 0) * (item.qty || item.quantity || 1))})
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
                        fontSize: '13px',
                        color: '#16a34a',
                        fontWeight: 700,
                        background: '#dcfce7',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>ডেলিভারি সম্পন্ন হয়েছে</span>
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
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {/* Delivery Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOrder && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmModalOrder(null)}
          >
            <motion.div
              className="admin-modal"
              style={{ maxWidth: '440px' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header" style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px', borderRadius: '8px' }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>ডেলিভারি সম্পন্ন নিশ্চিতকরণ</h3>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {confirmModalOrder.order_code || `#ORD-${confirmModalOrder.id}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="quick-icon-btn"
                  onClick={() => setConfirmModalOrder(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmDelivered} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '14px' }}>
                
                {/* Summary Info */}
                <div style={{ background: '#F8FAF9', padding: '12px', borderRadius: '8px', border: '1px solid var(--rule)' }}>
                  <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                    গ্রাহক: <strong>{confirmModalOrder.customer_name}</strong>
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                    ঠিকানা: <span style={{ color: 'var(--ink)' }}>{confirmModalOrder.delivery_address}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--rule)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>আদায়যোগ্য টাকা:</span>
                    <span className="mono" style={{ fontSize: '16px', fontWeight: 800, color: '#b91c1c' }}>
                      ৳{toBengaliNumber(confirmModalOrder.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Delivery Note Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                    ডেলিভারি নোট / মন্তব্য (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="যেমন: টাকা বুঝে পেয়েছি, বা কোনো মন্তব্য..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--rule)',
                      fontSize: '13.5px',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => setConfirmModalOrder(null)}
                    disabled={updating}
                  >
                    ফিরে যান
                  </button>

                  <button
                    type="submit"
                    className="rider-confirm-btn"
                    style={{ flex: 2, padding: '10px' }}
                    disabled={updating}
                  >
                    {updating ? (
                      <span>আপডেট হচ্ছে...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>হ্যাঁ, সম্পন্ন হয়েছে</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
