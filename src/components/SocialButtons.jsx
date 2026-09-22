"use client";
import React from 'react';
import { motion } from 'motion/react';
import { useStoreData } from '../context/StoreDataContext';
import SocialLucideIcon from './SocialLucideIcon.jsx';

export default function SocialButtons({ variant = 'inline', className = '' }) {
  const { settings = {} } = useStoreData();

  // Master switch check
  const isEnabled = settings.socials_enabled !== false;
  const configuredPosition = settings.socials_position === 'fixed' ? 'fixed' : 'inline';

  // Strict Mutual Exclusion Check:
  // - If component is placed for 'fixed' display, only render when admin selected 'fixed'.
  // - If component is placed for 'inline' display, only render when admin selected 'inline'.
  if (variant === 'fixed' && configuredPosition !== 'fixed') {
    return null;
  }
  if (variant === 'inline' && configuredPosition === 'fixed') {
    return null;
  }

  const rawLinks = Array.isArray(settings.social_links) ? settings.social_links : [];

  // Filter active links and cap at 5
  const activeLinks = rawLinks
    .filter((link) => link && link.is_active !== false && (link.url || link.text || link.name))
    .slice(0, 5);

  if (!isEnabled || activeLinks.length === 0) {
    return null;
  }

  // 1. FIXED FLOATING MODE (Floating on the right side of the screen)
  if (variant === 'fixed') {
    return (
      <aside
        aria-label="সোশ্যাল মিডিয়া লিংকস"
        className={`social-buttons-fixed ${className}`}
      >
        {activeLinks.map((link, idx) => {
          const bgColor = link.bg_color || '#006C4C';
          const textColor = link.text_color || '#ffffff';
          const label = link.text || link.name || 'যোগাযোগ';

          return (
            <motion.a
              key={link.id || `fixed-soc-${idx}`}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              whileTap={{ scale: 0.93 }}
              className="social-btn-fixed"
              style={{
                background: bgColor,
                color: textColor
              }}
              title={label}
            >
              <SocialLucideIcon name={link.icon || 'Share2'} size={17} color={textColor} />
              <span className="social-btn-fixed-text">{label}</span>
            </motion.a>
          );
        })}
      </aside>
    );
  }

  // 2. INLINE MODE (Absolute beside Package Box on desktop/tablet without compressing it; stacks below on mobile)
  return (
    <div className={`hero-social-inline-container ${className}`}>
      <div className="hero-social-inline-title">
        <span>কানেক্ট থাকুন</span>
      </div>

      {activeLinks.map((link, idx) => {
        const bgColor = link.bg_color || '#006C4C';
        const textColor = link.text_color || '#ffffff';
        const label = link.text || link.name || 'যোগাযোগ';

        return (
          <motion.a
            key={link.id || `inline-soc-${idx}`}
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="hero-social-btn-inline"
            style={{
              background: bgColor,
              color: textColor
            }}
            title={label}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.18)',
                flexShrink: 0
              }}
            >
              <SocialLucideIcon name={link.icon || 'Share2'} size={13} color={textColor} />
            </div>
            <span>{label}</span>
          </motion.a>
        );
      })}
    </div>
  );
}
