"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';

const DAYS = [
  { id: 'sat', label: 'Sat', name: 'শনিবার' },
  { id: 'sun', label: 'Su', labelFull: 'Sun', name: 'রবিবার' },
  { id: 'mon', label: 'Mo', labelFull: 'Mon', name: 'সোমবার' },
  { id: 'tue', label: 'Tu', labelFull: 'Tue', name: 'মঙ্গলবার' },
  { id: 'wed', label: 'We', labelFull: 'Wed', name: 'বুধবার' },
  { id: 'thu', label: 'Th', labelFull: 'Thu', name: 'বৃহস্পতিবার' },
  { id: 'fri', label: 'Fr', labelFull: 'Fri', name: 'শুক্রবার' }
];

export default function Hero({ settings, categories = [], onExploreClick }) {
  // Current day default (Saturday = 6, Sunday = 0, etc.)
  const dayIndexToId = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayId = dayIndexToId[new Date().getDay()] || 'sat';
  const [selectedDay, setSelectedDay] = useState(todayId);

  // Derive featured items from database settings or default grocery items
  const featuredConfigs = settings?.featured_products && settings.featured_products.length > 0
    ? settings.featured_products
    : [
        { category_id: 1, brand_name: 'মিনিকেট' },
        { category_id: 5, brand_name: 'ফ্রেশ সয়াবিন তেল' },
        { category_id: 2, brand_name: 'মুগ ডাল' },
        { category_id: 7, brand_name: 'দেশি পেঁয়াজ' }
      ];

  // Resolve featured products dynamically from database categories
  const resolvedLedgerItems = featuredConfigs.map((fc) => {
    let cat = null;
    let brand = null;

    if (fc.brand_id) {
      for (const c of categories) {
        const found = c.brands?.find((b) => b.id === fc.brand_id);
        if (found) {
          cat = c;
          brand = found;
          break;
        }
      }
    }

    if (!brand) {
      cat = categories.find((c) => c.id === fc.category_id);
      if (!cat) return null;
      brand = cat.brands?.find((b) => b.name === fc.brand_name) || cat.brands?.[0];
    }
    if (!brand || !cat) return null;

    return {
      name: `${cat.bn} — ${brand.name}`,
      unit: brand.unit && brand.unit.trim() !== '' ? (brand.unit.startsWith('প্রতি') ? `/${brand.unit.replace('প্রতি', '').trim()}` : `/${brand.unit}`) : '',
      price: brand.price
    };
  }).filter(Boolean);

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <span className="eyebrow">Grocery, Delivered</span>
        <h1>
          {settings?.header_title ? (
            <span>
              {settings.header_title.split(' ')[0]}{' '}
              <span className="accent">
                {settings.header_title.split(' ').slice(1, 4).join(' ')}
              </span>
              <br />
              {settings.header_title.split(' ').slice(4).join(' ')}
            </span>
          ) : (
            <span>
              মুদি বাজারের <span className="accent">পুরো লিস্ট,</span>
              <br />
              এক জায়গায়।
            </span>
          )}
        </h1>
        <p className="lede">
          {settings?.header_subtitle ||
            'চাল-ডাল থেকে মাছ-মসলা — আড়তের মতো দরে, ঘরে বসে অর্ডার করুন। ব্র্যান্ড বেছে নিন, কার্টে যোগ করুন, ডেলিভারি নিশ্চিত করুন।'}
        </p>
        <motion.button
          className="cta"
          onClick={onExploreClick}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>লিস্ট দেখুন</span> <ArrowDown size={15} />
        </motion.button>
      </motion.div>

      {/* Featured Products Weekly Rate Card */}
      <motion.div
        className="ledger-card"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        {/* Days of Week Bar (Sat, Su, Mo, Tu, We, Th, Fr) */}
        <div className="rate-days-bar">
          {DAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`rate-day-btn ${selectedDay === d.id ? 'active' : ''}`}
              onClick={() => setSelectedDay(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Product Rate Items */}
        <div className="rate-items-list">
          {resolvedLedgerItems.length > 0 ? (
            resolvedLedgerItems.map((item, idx) => (
              <div className="rate-item-row" key={idx}>
                <span className="rate-item-name">{item.name}</span>
                <span className="rate-item-price">
                  ৳{toBengaliNumber(item.price)}{item.unit}
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '16px 0' }}>
              লোড হচ্ছে...
            </div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}

