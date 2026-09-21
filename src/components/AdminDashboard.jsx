"use client";
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Wheat,
  Clock,
  Settings,
  Truck,
  CheckCircle2,
  XCircle,
  Banknote,
  Users,
  BarChart3,
  Plus,
  Package,
  TrendingUp,
  Calendar,
  Target,
  Printer,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { toBengaliNumber, normalizeOrderStatus, getOrderStatusBn } from '../utils/bengali.js';

export default function AdminDashboard({
  orders = [],
  categories = [],
  usersList = [],
  onNavigateTab,
  onOpenReceipt
}) {
  // Calculate total products
  const totalProductsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.brands?.length || 0), 0);
  }, [categories]);

  // Order status counts using normalized status
  const pendingOrders = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === 'pending'), [orders]);
  const processingOrders = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === 'processing'), [orders]);
  const shippedOrders = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === 'shipped'), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === 'delivered'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === 'cancelled'), [orders]);

  // Total sales from successful/active orders (excluding cancelled)
  const totalSales = useMemo(() => {
    return orders
      .filter((o) => normalizeOrderStatus(o.status) !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const deliveredSales = useMemo(() => {
    return orders
      .filter((o) => normalizeOrderStatus(o.status) === 'delivered')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  // Weekly Orders Calculation (Grouped by Day of Week: Sat to Fri)
  const weeklyChartData = useMemo(() => {
    const dayMap = {
      6: { key: 'sat', name: 'শনিবার', short: 'শনি', count: 0, sales: 0 },
      0: { key: 'sun', name: 'রবিবার', short: 'রবি', count: 0, sales: 0 },
      1: { key: 'mon', name: 'সোমবার', short: 'সোম', count: 0, sales: 0 },
      2: { key: 'tue', name: 'মঙ্গলবার', short: 'মঙ্গল', count: 0, sales: 0 },
      3: { key: 'wed', name: 'বুধবার', short: 'বুধ', count: 0, sales: 0 },
      4: { key: 'thu', name: 'বৃহস্পতিবার', short: 'বৃহঃ', count: 0, sales: 0 },
      5: { key: 'fri', name: 'শুক্রবার', short: 'শুক্র', count: 0, sales: 0 }
    };

    orders.forEach((ord) => {
      const d = ord.created_at ? new Date(ord.created_at) : new Date();
      const dayIdx = d.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayMap[dayIdx]) {
        dayMap[dayIdx].count += 1;
        if (ord.status !== 'cancelled') {
          dayMap[dayIdx].sales += Number(ord.total_amount) || 0;
        }
      }
    });

    return [
      dayMap[6], // Saturday
      dayMap[0], // Sunday
      dayMap[1], // Monday
      dayMap[2], // Tuesday
      dayMap[3], // Wednesday
      dayMap[4], // Thursday
      dayMap[5]  // Friday
    ];
  }, [orders]);

  // Top 5 recent orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const statCards = [
    {
      id: 'products',
      title: 'মোট পণ্য সম্ভার',
      sub: `${categories.length} টি ক্যাটাগরিতে`,
      val: totalProductsCount,
      unit: 'টি পণ্য',
      icon: Wheat,
      bg: '#FAF7EE',
      border: 'var(--ink)',
      accent: 'var(--green)',
      tab: 'products'
    },
    {
      id: 'pending',
      title: 'পেন্ডিং অর্ডার',
      sub: 'অনুমোদনের অপেক্ষায়',
      val: pendingOrders.length,
      unit: 'টি অর্ডার',
      icon: Clock,
      bg: '#FFF8E1',
      border: '#D97706',
      accent: '#B45309',
      tab: 'orders'
    },
    {
      id: 'processing',
      title: 'প্রসেসিং অর্ডার',
      sub: 'প্যাকিং ও প্রস্তুত চলছে',
      val: processingOrders.length,
      unit: 'টি অর্ডার',
      icon: Settings,
      bg: '#EFF6FF',
      border: '#2563EB',
      accent: '#1D4ED8',
      tab: 'orders'
    },
    {
      id: 'shipped',
      title: 'পাঠানো হয়েছে',
      sub: 'ডেলিভারিম্যানের কাছে অন-ওয়ে',
      val: shippedOrders.length,
      unit: 'টি অর্ডার',
      icon: Truck,
      bg: '#F3E8FF',
      border: '#9333EA',
      accent: '#7E22CE',
      tab: 'orders'
    },
    {
      id: 'delivered',
      title: 'ডেলিভার্ড সম্পন্ন',
      sub: 'সফলভাবে হস্তান্তর',
      val: deliveredOrders.length,
      unit: 'টি অর্ডার',
      icon: CheckCircle2,
      bg: '#ECFDF5',
      border: '#059669',
      accent: '#047857',
      tab: 'orders'
    },
    {
      id: 'cancelled',
      title: 'বাতিল অর্ডার',
      sub: 'গ্রাহক বা অ্যাডমিন বাতিল',
      val: cancelledOrders.length,
      unit: 'টি অর্ডার',
      icon: XCircle,
      bg: '#FEF2F2',
      border: '#DC2626',
      accent: '#B91C1C',
      tab: 'orders'
    },
    {
      id: 'sales',
      title: 'মোট সফল বিক্রয়',
      sub: `ডেলিভার্ড: ৳${toBengaliNumber(deliveredSales)}`,
      val: `৳${toBengaliNumber(totalSales)}`,
      isCustomVal: true,
      unit: 'টাকা',
      icon: Banknote,
      bg: '#F0FDF4',
      border: 'var(--green)',
      accent: 'var(--green)',
      tab: 'orders'
    },
    {
      id: 'users',
      title: 'নিবন্ধিত গ্রাহক',
      sub: 'মোট অ্যাকাউন্ট সংখ্যা',
      val: usersList.length,
      unit: 'জন',
      icon: Users,
      bg: '#FAF7EE',
      border: 'var(--ink)',
      accent: 'var(--ink)',
      tab: 'users'
    }
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Top Banner / Summary Greeting */}
      <div className="admin-dash-hero">
        <div>
          <h3 className="admin-dash-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={22} />
            <span>আড়ৎ এক্সপ্রেস — ব্যবসায়িক ড্যাশবোর্ড ও বিশ্লেষণ</span>
          </h3>
          <p className="admin-dash-sub">
            দৈনিক বিক্রয়, পণ্যের অবস্থা এবং অর্ডারের সর্বশেষ লাইভ পর্যবেক্ষণ
          </p>
        </div>
        <div className="admin-dash-actions">
          <motion.button
            className="admin-btn primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('products')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>নতুন পণ্য যোগ</span>
          </motion.button>
          <motion.button
            className="admin-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={16} />
            <span>অর্ডার তালিকা</span>
          </motion.button>
          <motion.button
            className="admin-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('reports_hub')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--ink)', color: 'var(--paper)' }}
          >
            <FileText size={16} />
            <span>রিপোর্টস ও প্রিন্ট</span>
          </motion.button>
        </div>
      </div>

      {/* Grid of 8 Metrics Cards */}
      <div className="dash-stat-grid">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <motion.div
              key={card.id}
              className="dash-stat-card"
              style={{
                backgroundColor: card.bg,
                borderColor: card.border
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => onNavigateTab(card.tab)}
            >
              <div className="dash-stat-top">
                <span className="dash-stat-label">{card.title}</span>
                <span className="dash-stat-icon" style={{ color: card.accent }}>
                  <IconComp size={20} />
                </span>
              </div>
              <div className="dash-stat-val" style={{ color: card.accent }}>
                {card.isCustomVal ? card.val : toBengaliNumber(card.val)}
                <span className="dash-stat-unit">{card.unit}</span>
              </div>
              <div className="dash-stat-sub">{card.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Section & Quick Info Row */}
      <div className="dash-middle-grid">
        {/* Weekly Orders & Sales Chart */}
        <div className="dash-chart-card">
          <div className="dash-card-header">
            <div>
              <h4 className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={18} />
                <span>সাপ্তাহিক অর্ডার ও বিক্রয়ের গ্রাফ (শনি—শুক্র)</span>
              </h4>
              <p className="dash-card-desc">সপ্তাহের প্রতিদিনের অর্ডার সংখ্যা এবং বিক্রয় চিত্র</p>
            </div>
            <div className="dash-chart-badge">
              মোট অর্ডার: <strong>{toBengaliNumber(orders.length)} টি</strong>
            </div>
          </div>

          <div style={{ width: '100%', height: 280, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d7c3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#211d16' }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: '#1F4B3F', fontSize: 11 }}
                  axisLine={{ stroke: '#1F4B3F' }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#D97706', fontSize: 11 }}
                  axisLine={{ stroke: '#D97706' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="dash-chart-tooltip">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                            <Calendar size={14} />
                            <span>{label}</span>
                          </div>
                          <div style={{ color: 'var(--green)', marginTop: '4px', fontWeight: 600 }}>
                            অর্ডার সংখ্যা: {toBengaliNumber(payload[0]?.value || 0)} টি
                          </div>
                          <div style={{ color: '#D97706', marginTop: '2px', fontWeight: 600 }}>
                            বিক্রয়: ৳{toBengaliNumber(payload[1]?.value || 0)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'count') return 'অর্ডার সংখ্যা (টি)';
                    if (value === 'sales') return 'বিক্রয় মূল্য (৳)';
                    return value;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#1F4B3F"
                  name="count"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  yAxisId="right"
                  dataKey="sales"
                  fill="#E3A230"
                  name="sales"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Summary Card */}
        <div className="dash-status-card">
          <h4 className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={18} />
            <span>অর্ডার স্ট্যাটাস সারাংশ</span>
          </h4>
          <p className="dash-card-desc">মোট {toBengaliNumber(orders.length)} টি অর্ডারের অনুপাত</p>

          <div className="dash-status-bars">
            <div className="dash-status-row">
              <div className="dash-status-label-wrap">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#D97706" /> অপেক্ষমান (Pending)
                </span>
                <strong>{toBengaliNumber(pendingOrders.length)} টি</strong>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${orders.length ? (pendingOrders.length / orders.length) * 100 : 0}%`,
                    backgroundColor: '#D97706'
                  }}
                ></div>
              </div>
            </div>

            <div className="dash-status-row">
              <div className="dash-status-label-wrap">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Settings size={13} color="#2563EB" /> প্রসেসিং (Processing)
                </span>
                <strong>{toBengaliNumber(processingOrders.length)} টি</strong>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${orders.length ? (processingOrders.length / orders.length) * 100 : 0}%`,
                    backgroundColor: '#2563EB'
                  }}
                ></div>
              </div>
            </div>

            <div className="dash-status-row">
              <div className="dash-status-label-wrap">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={13} color="#9333EA" /> পাঠানো হয়েছে (Shipped)
                </span>
                <strong>{toBengaliNumber(shippedOrders.length)} টি</strong>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${orders.length ? (shippedOrders.length / orders.length) * 100 : 0}%`,
                    backgroundColor: '#9333EA'
                  }}
                ></div>
              </div>
            </div>

            <div className="dash-status-row">
              <div className="dash-status-label-wrap">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="#059669" /> ডেলিভার্ড সম্পন্ন (Delivered)
                </span>
                <strong>{toBengaliNumber(deliveredOrders.length)} টি</strong>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${orders.length ? (deliveredOrders.length / orders.length) * 100 : 0}%`,
                    backgroundColor: '#059669'
                  }}
                ></div>
              </div>
            </div>

            <div className="dash-status-row">
              <div className="dash-status-label-wrap">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={13} color="#DC2626" /> বাতিল (Cancelled)
                </span>
                <strong>{toBengaliNumber(cancelledOrders.length)} টি</strong>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${orders.length ? (cancelledOrders.length / orders.length) * 100 : 0}%`,
                    backgroundColor: '#DC2626'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--rule)' }}>
            <motion.button
              type="button"
              className="admin-btn"
              style={{ width: '100%', fontSize: '13px', justifyContent: 'center' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab('orders')}
            >
              সব অর্ডার পরিচালনা করুন →
            </motion.button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dash-recent-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h4 className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} />
              <span>সাম্প্রতিক অর্ডারসমূহ</span>
            </h4>
            <p className="dash-card-desc">সরাসরি রসিদ প্রিন্ট ও দ্রুত নজরদারি</p>
          </div>
          <button
            className="admin-btn"
            style={{ fontSize: '12.5px' }}
            onClick={() => onNavigateTab('orders')}
          >
            সম্পূর্ণ তালিকা ({toBengaliNumber(orders.length)}) →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty">এখনও কোনো অর্ডার আসেনি।</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অর্ডার কোড</th>
                  <th>তারিখ ও সময়</th>
                  <th>গ্রাহক</th>
                  <th>আইটেম</th>
                  <th>মোট বিল</th>
                  <th>পেমেন্ট</th>
                  <th>স্ট্যাটাস</th>
                  <th style={{ textAlign: 'center' }}>রসিদ প্রিন্ট</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.order_code ? `dash-ord-${o.order_code}` : `dash-ord-${o.is_package ? 'pkg' : 'reg'}-${o.id}`}>
                    <td className="mono" style={{ fontWeight: 700 }}>
                      {o.order_code || `#ORD-${o.id}`}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {new Date(o.created_at).toLocaleDateString('bn-BD')}
                    </td>
                    <td>
                      <strong>{o.customer_name}</strong>
                      <div className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                        {o.customer_phone}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {o.items_json?.length || 0} টি আইটেম ({o.items_json?.map((i) => i.brand).join(', ')})
                    </td>
                    <td>
                      <strong className="mono" style={{ color: 'var(--green)', fontSize: '14px' }}>
                        ৳{toBengaliNumber(o.total_amount)}
                      </strong>
                    </td>
                    <td>
                      <span className="tag" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {o.payment_method}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${normalizeOrderStatus(o.status)}`}>
                        {getOrderStatusBn(o.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <motion.button
                        type="button"
                        className="admin-pos-print-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenReceipt(o)}
                        title="ক্যাশ মেমো / রসিদ প্রিন্ট করুন"
                      >
                        <Printer size={13} />
                        <span>রসিদ প্রিন্ট</span>
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
