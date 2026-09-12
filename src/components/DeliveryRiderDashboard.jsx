"use client";
import React from 'react';
import { motion } from 'motion/react';
import {
  Package,
  CheckCircle2,
  Clock,
  Bike,
  Banknote,
  PhoneCall,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

export default function DeliveryRiderDashboard({
  rider,
  orders = [],
  stats,
  onNavigateTab,
  onOpenOrderModal,
  onQuickMarkDelivered
}) {
  const activeOrders = orders.filter(o => 
    o.status !== 'delivered' && o.status !== 'ডেলিভার্ড' && o.status !== 'cancelled' && o.status !== 'বাতিল'
  );
  const deliveredOrders = orders.filter(o => 
    o.status === 'delivered' || o.status === 'ডেলিভার্ড'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDelivered = deliveredOrders.filter(o => {
    const d = o.delivered_at || o.created_at;
    return d && d.startsWith(todayStr);
  });

  const totalCashCollected = deliveredOrders.reduce((sum, o) => {
    const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
    return isCOD ? sum + (Number(o.total_amount) || 0) : sum;
  }, 0);

  const pendingCashToCollect = activeOrders.reduce((sum, o) => {
    const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
    return isCOD ? sum + (Number(o.total_amount) || 0) : sum;
  }, 0);

  return (
    <div className="rider-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Welcome & Rider Info Banner */}
      <div
        className="admin-card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>
              <ShieldCheck size={14} />
              <span>ভেরিফায়েড ডেলিভারি রাইডার</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              স্বাগতম, {rider?.name || 'রাইডার'}!
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span><Bike size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> বাহন: <strong>{rider?.vehicle || 'মোটরসাইকেল'}</strong></span>
              <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> এলাকা: <strong>{rider?.area || 'ঢাকা'}</strong></span>
              <span><PhoneCall size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> <strong>{rider?.phone}</strong></span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>আজকের তারিখ</div>
            <div style={{ fontSize: '14px', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        
        {/* Total Assigned */}
        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>মোট অ্যাসাইন করা</span>
            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px', borderRadius: '8px' }}>
              <Package size={18} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>
            {toBengaliNumber(orders.length)} <span style={{ fontSize: '13px', fontWeight: 500 }}>টি</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
            সার্বমোট প্রাপ্ত ডেলিভারি দায়িত্ব
          </div>
        </div>

        {/* Pending / In Progress */}
        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #eab308' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>ডেলিভারি বাকি (চলমান)</span>
            <span style={{ background: '#fefce8', color: '#ca8a04', padding: '6px', borderRadius: '8px' }}>
              <Clock size={18} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ca8a04' }}>
            {toBengaliNumber(activeOrders.length)} <span style={{ fontSize: '13px', fontWeight: 500 }}>টি</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
            এখনো ডেলিভারি সম্পন্ন হয়নি
          </div>
        </div>

        {/* Completed / Delivered */}
        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>সফল ডেলিভারি</span>
            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a' }}>
            {toBengaliNumber(deliveredOrders.length)} <span style={{ fontSize: '13px', fontWeight: 500 }}>টি</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
            আজ সম্পন্ন: <strong>{toBengaliNumber(todayDelivered.length)} টি</strong>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>গৃহীত ক্যাশ (সংগৃহীত)</span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '6px', borderRadius: '8px' }}>
              <Banknote size={18} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
            ৳{toBengaliNumber(totalCashCollected)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
            বাকি কালেকশন: ৳{toBengaliNumber(pendingCashToCollect)}
          </div>
        </div>

      </div>

      {/* Active Orders Section */}
      <div className="admin-card" style={{ padding: '20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#eab308" />
              <span>জরুরি ডেলিভারি তালিকা ({toBengaliNumber(activeOrders.length)})</span>
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>
              এই অর্ডারগুলো দ্রুত কাস্টমারের ঠিকানায় পৌঁছে দিয়ে "ডেলিভার্ড" নিশ্চিত করুন।
            </p>
          </div>
          <button
            type="button"
            className="admin-btn secondary"
            style={{ fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => onNavigateTab('orders')}
          >
            <span>সকল অর্ডার দেখুন</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', background: 'var(--cream)', borderRadius: '8px', border: '1px dashed var(--rule)' }}>
            <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>কোনো পেন্ডিং ডেলিভারি নেই!</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
              আপনার অ্যাসাইন করা সকল অর্ডার সফলভাবে ডেলিভারি সম্পন্ন হয়েছে।
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {activeOrders.slice(0, 6).map((order) => {
              const isCOD = !order.payment_method || order.payment_method.toLowerCase().includes('cash') || order.payment_method.includes('ক্যাশ');
              return (
                <div
                  key={order.id}
                  style={{
                    border: '1px solid var(--rule)',
                    borderRadius: '8px',
                    padding: '14px',
                    background: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>
                        {order.order_code || `#ORD-${order.id}`}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: '#fef3c7',
                          color: '#b45309',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        {order.status === 'shipped' ? 'পথে রয়েছে' : 'ডেলিভারি বাকি'}
                      </span>
                    </div>

                    {/* Customer */}
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px', color: 'var(--ink)' }}>
                      {order.customer_name}
                    </div>

                    {/* Phone & Direct Call */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {order.customer_phone}
                      </span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#dcfce7',
                          color: '#15803d',
                          textDecoration: 'none',
                          fontWeight: 600,
                          lineHeight: 1
                        }}
                      >
                        <PhoneCall size={12} />
                        <span>কল দিন</span>
                      </a>
                    </div>

                    {/* Address */}
                    <div style={{ fontSize: '12.5px', color: 'var(--ink)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                      <span>{order.delivery_address || 'ঠিকানা দেওয়া নেই'} {order.delivery_area ? `(${order.delivery_area})` : ''}</span>
                    </div>

                    {/* Items brief */}
                    <div style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--cream)', padding: '6px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                      <strong>পণ্য:</strong> {order.items_json?.map(i => `${i.brand} (${i.qty} ${i.unit || ''})`).join(', ') || 'পণ্য তালিকা'}
                    </div>

                    {/* Total & Payment */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingTop: '4px', borderTop: '1px dashed var(--rule)' }}>
                      <span>কালেকশন:</span>
                      <span style={{ fontWeight: 800, color: isCOD ? '#b91c1c' : '#15803d' }}>
                        ৳{toBengaliNumber(order.total_amount)} ({isCOD ? 'ক্যাশ অন ডেলিভারি' : order.payment_method})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="admin-btn secondary"
                      style={{ fontSize: '12px', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => onOpenOrderModal(order)}
                    >
                      <span>বিস্তারিত</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn primary"
                      style={{ fontSize: '12px', padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#16a34a', borderColor: '#16a34a' }}
                      onClick={() => onQuickMarkDelivered(order)}
                    >
                      <CheckCircle2 size={14} />
                      <span>ডেলিভার্ড করুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
