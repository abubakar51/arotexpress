"use client";
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Activity, Calendar as CalendarIcon } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

export default function AdminReports({ orders = [] }) {
  const [timeFilter, setTimeFilter] = useState('7days'); // 'today', 'yesterday', '7days', '30days', 'all', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Process data for charts
  const processedData = useMemo(() => {
    // Only calculate delivered orders
    const validOrders = orders.filter(o => o.status === 'delivered' || o.status === 'ডেলিভার্ড');
    
    // Group by date (YYYY-MM-DD)
    const grouped = {};
    
    validOrders.forEach(order => {
      if (!order.created_at) return;
      
      const d = new Date(order.created_at);
      if (isNaN(d)) return;
      const date = d.toISOString().split('T')[0];
      
      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, cost: 0, profit: 0, orderCount: 0 };
      }
      
      let orderCost = 0;
      let orderRevenue = 0;

      if (Array.isArray(order.items_json)) {
        order.items_json.forEach(item => {
          const itemCost = Number(item.cost_price || 0) * Number(item.qty || 0);
          const itemRevenue = Number(item.price || 0) * Number(item.qty || 0);
          orderCost += itemCost;
          orderRevenue += itemRevenue;
        });
      } else {
        orderRevenue = Number(order.subtotal) || 0;
      }
      
      grouped[date].revenue += (orderRevenue || 0);
      grouped[date].cost += (orderCost || 0);
      grouped[date].profit += ((orderRevenue || 0) - (orderCost || 0));
      grouped[date].orderCount += 1;
    });

    let chartData = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Filter by time
    if (timeFilter === 'today') {
      chartData = chartData.filter(d => d.date === todayStr);
    } else if (timeFilter === 'yesterday') {
      chartData = chartData.filter(d => d.date === yesterdayStr);
    } else if (timeFilter === '7days') {
      chartData = chartData.slice(-7);
    } else if (timeFilter === '30days') {
      chartData = chartData.slice(-30);
    } else if (timeFilter === 'custom' && customStart && customEnd) {
      chartData = chartData.filter(d => d.date >= customStart && d.date <= customEnd);
    }

    // Format the date for the chart (DD-MM-YY)
    chartData = chartData.map(d => {
      const parts = d.date.split('-'); // YYYY, MM, DD
      return {
        ...d,
        displayDate: `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}` // DD-MM-YY
      };
    });

    return chartData;
  }, [orders, timeFilter, customStart, customEnd]);

  // Aggregate totals for cards
  const totals = useMemo(() => {
    return processedData.reduce((acc, day) => {
      acc.revenue += day.revenue;
      acc.cost += day.cost;
      acc.profit += day.profit;
      acc.orders += day.orderCount;
      return acc;
    }, { revenue: 0, cost: 0, profit: 0, orders: 0 });
  }, [processedData]);

  const formatCurrency = (val) => { 
    const num = Number(val) || 0; 
    if (num < 0) {
      return `- ৳ ${toBengaliNumber(Math.abs(Math.round(num)))}`;
    }
    return `৳ ${toBengaliNumber(Math.round(num))}`; 
  };

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--cream-card)', padding: '12px', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>তারিখ: {label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              {entry.name}: {formatCurrency(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>লাভ ও লস</h2>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'var(--paper)', padding: '6px', borderRadius: 'var(--radius)', border: '1px solid var(--rule)' }}>
          <button onClick={() => setTimeFilter('today')} className={`admin-btn ${timeFilter === 'today' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>আজ</button>
          <button onClick={() => setTimeFilter('yesterday')} className={`admin-btn ${timeFilter === 'yesterday' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>গতকাল</button>
          <button onClick={() => setTimeFilter('7days')} className={`admin-btn ${timeFilter === '7days' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>৭ দিন</button>
          <button onClick={() => setTimeFilter('30days')} className={`admin-btn ${timeFilter === '30days' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>৩০ দিন</button>
          <button onClick={() => setTimeFilter('all')} className={`admin-btn ${timeFilter === 'all' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>সব</button>
          <button onClick={() => setTimeFilter('custom')} className={`admin-btn ${timeFilter === 'custom' ? 'primary' : 'secondary'}`} style={{ padding: '6px 16px', border: 'none' }}>কাস্টম</button>
        </div>
      </div>

      {timeFilter === 'custom' && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--paper)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--rule)' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>শুরুর তারিখ:</span>
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: '6px', border: '1px solid var(--ink)', borderRadius: '4px', fontFamily: 'inherit' }} />
          <span style={{ fontWeight: 600, fontSize: '14px', marginLeft: '10px' }}>শেষ তারিখ:</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: '6px', border: '1px solid var(--ink)', borderRadius: '4px', fontFamily: 'inherit' }} />
        </div>
      )}

      {/* Grid of Total Cards using dashboard classes */}
      <div className="dash-stat-grid">
        <div className="dash-stat-card" style={{ backgroundColor: '#F0FDF4', borderColor: 'var(--green)' }}>
          <div className="dash-stat-top">
            <span className="dash-stat-label">মোট বিক্রয় মূল্য</span>
            <span className="dash-stat-icon" style={{ color: 'var(--green)' }}>
              <DollarSign size={20} />
            </span>
          </div>
          <div className="dash-stat-val-main mono" style={{ fontSize: '24px' }}>{formatCurrency(totals.revenue)}</div>
          <div className="dash-stat-sub">সম্পূর্ণ আয়</div>
        </div>

        <div className="dash-stat-card" style={{ backgroundColor: '#FEF2F2', borderColor: '#DC2626' }}>
          <div className="dash-stat-top">
            <span className="dash-stat-label">মোট ক্রয় মূল্য</span>
            <span className="dash-stat-icon" style={{ color: '#DC2626' }}>
              <Activity size={20} />
            </span>
          </div>
          <div className="dash-stat-val-main mono" style={{ fontSize: '24px' }}>{formatCurrency(totals.cost)}</div>
          <div className="dash-stat-sub">পণ্যের মূল দাম</div>
        </div>

        {/* Net Profit / Loss Card */}
        {(() => {
          const isLoss = totals.profit < 0;
          return (
            <div 
              className="dash-stat-card" 
              style={{ 
                backgroundColor: isLoss ? '#FEF2F2' : '#F0FDF4', 
                borderColor: isLoss ? '#DC2626' : 'var(--green)' 
              }}
            >
              <div className="dash-stat-top">
                <span className="dash-stat-label" style={{ color: isLoss ? '#DC2626' : 'inherit', fontWeight: isLoss ? 600 : 'normal' }}>
                  {isLoss ? 'নীট ক্ষতি (Net Loss)' : 'নীট লাভ (Net Profit)'}
                </span>
                <span className="dash-stat-icon" style={{ color: isLoss ? '#DC2626' : 'var(--green)' }}>
                  <TrendingUp size={20} style={{ transform: isLoss ? 'rotate(180deg)' : 'none' }} />
                </span>
              </div>
              <div 
                className="dash-stat-val-main mono" 
                style={{ 
                  fontSize: '24px', 
                  color: isLoss ? '#DC2626' : 'var(--green)',
                  fontWeight: 700
                }}
              >
                {formatCurrency(totals.profit)}
              </div>
              <div className="dash-stat-sub" style={{ color: isLoss ? '#DC2626' : 'var(--muted)' }}>
                {isLoss ? 'প্রকৃত ক্ষতি' : 'প্রকৃত লাভ'}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ background: 'var(--cream-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1.5px solid var(--ink)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>আয় ও লাভের চিত্র</h3>
        {processedData.length > 0 ? (
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--rule)" />
                <XAxis dataKey="displayDate" tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="revenue" name="বিক্রয়" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="cost" name="ক্রয়" stroke="var(--chili)" strokeWidth={2} fillOpacity={0.1} fill="transparent" />
                <Area type="monotone" dataKey="profit" name="লাভ" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <CalendarIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>কোনো তথ্য পাওয়া যায়নি</p>
            </div>
          </div>
        )}
      </div>
      
    </motion.div>
  );
}
