"use client";
import React from 'react';
import { motion } from 'motion/react';
import { useStoreData } from '../context/StoreDataContext';
import SocialLucideIcon from './SocialLucideIcon.jsx';

export default function SocialButtons({ forceMode = null, className = '' }) {
  const { settings = {} } = useStoreData();

  // Settings
  const isEnabled = settings.socials_enabled !== false;
  const positionMode = forceMode || settings.socials_position || 'inline'; // 'inline' | 'fixed'
  const rawLinks = Array.isArray(settings.social_links) ? settings.social_links : [];

  // Filter active links and cap at 5
  const activeLinks = rawLinks
    .filter((link) => link && link.is_active !== false && (link.url || link.text || link.name))
    .slice(0, 5);

  if (!isEnabled || activeLinks.length === 0) {
    return null;
  }

  // FIXED FLOATING MODE
  if (positionMode === 'fixed') {
    return (
      <aside
        aria-label="সোশ্যাল মিডিয়া লিংকস"
        className={`social-buttons-fixed ${className}`}
        style={{
          position: 'fixed',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 85,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'auto'
        }}
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
              whileHover={{ scale: 1.05, x: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '50px',
                background: bgColor,
                color: textColor,
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '12.5px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                backdropFilter: 'blur(4px)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title={label}
            >
              <SocialLucideIcon name={link.icon || 'Share2'} size={16} color={textColor} />
              <span>{label}</span>
            </motion.a>
          );
        })}
      </aside>
    );
  }

  // INLINE MODE (Vertical list next to Hero Package Box)
  return (
    <div
      className={`hero-social-buttons-vertical ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'center',
        alignSelf: 'stretch',
        minWidth: '150px'
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
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
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: bgColor,
              color: textColor,
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.18s ease',
              lineHeight: 1.2
            }}
            title={label}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.15)',
                flexShrink: 0
              }}
            >
              <SocialLucideIcon name={link.icon || 'Share2'} size={14} color={textColor} />
            </div>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {label}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
}
