"use client";
import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Banknote,
  CheckCircle2,
  Package,
  Layers,
  Bike,
  User,
  PhoneCall
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

export default function DeliveryRiderReports({ rider, orders = [] }) {
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | 'this_week' | 'this_month' | 'all'

  const filteredOrders = orders.filter((o) => {
    if (dateFilter === 'all') return true;
    const date = o.delivered_at || o.created_at || '';
    if (!date) return false;

    const today = new Date();
    const orderDate = new Date(date);

    if (dateFilter === 'today') {
      return orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'this_week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return orderDate >= oneWeekAgo;
    } else if (dateFilter === 'this_month') {
      return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
    }
    return true;
  });

  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered' || o.status === 'ডেলিভার্ড');
  const activeOrders = filteredOrders.filter(o => o.status !== 'delivered' && o.status !== 'ডেলিভার্ড' && o.status !== 'cancelled' && o.status !== 'বাতিল');

  const totalDeliveredAmount = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalCashCollected = deliveredOrders.reduce((sum, o) => {
    const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
    return isCOD ? sum + (Number(o.total_amount) || 0) : sum;
  }, 0);

  const totalDigitalPaid = totalDeliveredAmount - totalCashCollected;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rider-reports-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Filter & Print Action */}
      <div className="admin-card no-print" style={{ padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={18} color="var(--green)" />
            <span>ডেলিভারি ও ক্যাশ কালেকশন রিপোর্ট</span>
          </h3>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            দিনভিত্তিক ডেলিভারি হিসেব এবং সংগৃহীত টাকার স্টেটমেন্ট
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--rule)',
              fontSize: '13px',
              background: '#ffffff'
            }}
          >
            <option value="today">আজকের রিপোর্ট</option>
            <option value="this_week">বিগত ৭ দিনের</option>
            <option value="this_month">চলতি মাসের</option>
            <option value="all">সর্বমোট (সকল)</option>
          </select>

          <button
            type="button"
            className="admin-btn primary"
            style={{ padding: '6px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={handlePrint}
          >
            <Printer size={14} />
            <span>প্রিন্ট / সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>মোট ডেলিভার্ড অর্ডার</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            {toBengaliNumber(deliveredOrders.length)} টি
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            মোট অর্ডার: {toBengaliNumber(filteredOrders.length)} টি
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>মোট সংগৃহীত ক্যাশ (COD)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ৳{toBengaliNumber(totalCashCollected)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            অফিসে জমাযোগ্য ক্যাশ টাকা
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>অনলাইন / পেইড ডেলিভারি</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
            ৳{toBengaliNumber(totalDigitalPaid)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            বিকাশ / নগদ / অগ্রিম পরিশোধিত
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>মোট ডেলিভারি মূল্য</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
            ৳{toBengaliNumber(totalDeliveredAmount)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            সর্বমোট পণ্য ও ডেলিভারি ফি
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="admin-card print-section" style={{ padding: '20px', borderRadius: '10px', background: '#ffffff' }}>
        
        {/* Printable Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--ink)', paddingBottom: '14px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>আড়ৎ এক্সপ্রেস — রাইডার ডেলিভারি শিট</h2>
          <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
            <strong>রাইডার:</strong> {rider?.name} ({rider?.phone}) | <strong>বাহন:</strong> {rider?.vehicle} | <strong>এলাকা:</strong> {rider?.area}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            রিপোর্ট তৈরির সময়: {new Date().toLocaleString('bn-BD')}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th>অর্ডার কোড</th>
                <th>কাস্টমারের নাম ও মোবাইল</th>
                <th>ডেলিভারি ঠিকানা</th>
                <th>পেমেন্ট মেথড</th>
                <th style={{ textAlign: 'right' }}>টাকার পরিমাণ</th>
                <th style={{ textAlign: 'center' }}>স্ট্যাটাস</th>
                <th>মন্তব্য / নোট</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    এই সময়সীমার মধ্যে কোনো ডেলিভারি রেকর্ড নেই।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const isDelivered = order.status === 'delivered' || order.status === 'ডেলিভার্ড';
                  const isCOD = !order.payment_method || order.payment_method.toLowerCase().includes('cash') || order.payment_method.includes('ক্যাশ');

                  return (
                    <tr key={order.order_code ? `rider-rpt-${order.order_code}` : `rider-rpt-${order.is_package ? 'pkg' : 'reg'}-${order.id}-${idx}`} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td className="mono" style={{ textAlign: 'center' }}>{toBengaliNumber(idx + 1)}</td>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--green)' }}>
                        <div>{order.order_code || `#ORD-${order.id}`}</div>
                        {(order.is_package || order.isPackage || (order.order_code && order.order_code.startsWith('PK-'))) && (
                          <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '3px', fontWeight: 700, display: 'inline-block', marginTop: '2px' }}>
                            প্যাকেজ
                          </span>
                        )}
                      </td>
                      <td>
                        <strong>{order.customer_name}</strong>
                        <div className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{order.customer_phone}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{order.delivery_address} {order.delivery_area ? `(${order.delivery_area})` : ''}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: isCOD ? '#b91c1c' : '#15803d' }}>
                          {isCOD ? 'ক্যাশ (COD)' : order.payment_method}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ৳{toBengaliNumber(order.total_amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isDelivered ? '#dcfce7' : '#fef3c7',
                            color: isDelivered ? '#15803d' : '#b45309'
                          }}
                        >
                          {isDelivered ? 'ডেলিভার্ড' : 'পেন্ডিং'}
                        </span>
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                        {order.delivery_note || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Signatures for Print */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '12px', fontWeight: 600 }}>
              রাইডারের স্বাক্ষর
            </div>
          </div>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '12px', fontWeight: 600 }}>
              অফিস / ক্যাশিয়ার স্বাক্ষর
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
