"use client";
import React from 'react';
import { motion } from 'motion/react';
import { useStoreData } from '../context/StoreDataContext';
import SocialLucideIcon from './SocialLucideIcon.jsx';

export default function SocialButtons({ variant = 'inline', className = '' }) {
  const { settings = {} } = useStoreData();

  // Master switch
  const isEnabled = settings.socials_enabled !== false;
  const configuredPosition = settings.socials_position === 'fixed' ? 'fixed' : 'inline';
  const displayMode = settings.socials_display_mode || 'both'; // 'both' | 'icon_only' | 'text_only'
  const mobileBehavior = settings.socials_mobile_behavior || 'auto_floating'; // 'auto_floating' | 'follow_position' | 'hidden'
  const shape = settings.socials_shape || (configuredPosition === 'fixed' ? 'pill' : 'rounded'); // 'pill' | 'rounded' | 'square'
  const size = settings.socials_size || 'md'; // 'sm' | 'md' | 'lg'

  // Variant routing:
  // When mobileBehavior is 'auto_floating':
  // - Fixed floating component is mounted for mobile screens even if position is inline.
  if (variant === 'fixed') {
    if (configuredPosition !== 'fixed' && mobileBehavior !== 'auto_floating') {
      return null;
    }
  }

  if (variant === 'inline') {
    if (configuredPosition === 'fixed') {
      return null;
    }
  }

  const rawLinks = Array.isArray(settings.social_links) ? settings.social_links : [];
  const activeLinks = rawLinks
    .filter((link) => link && link.is_active !== false && (link.url || link.text || link.name))
    .slice(0, 5);

  if (!isEnabled || activeLinks.length === 0) {
    return null;
  }

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 19
  };
  const iconPixelSize = iconSizes[size] || 16;

  // 1. FIXED FLOATING VARIANT
  if (variant === 'fixed') {
    const isDesktopHidden = configuredPosition !== 'fixed'; // Only rendered for mobile auto-floating on small screens
    const mobileClasses = [
      mobileBehavior === 'hidden' ? 'mobile-hide' : '',
      mobileBehavior === 'auto_floating' ? 'mobile-auto-floating' : '',
      isDesktopHidden ? 'desktop-hide' : ''
    ].filter(Boolean).join(' ');

    return (
      <aside
        aria-label="সোশ্যাল মিডিয়া লিংকস"
        className={`social-buttons-fixed ${mobileClasses} ${className}`}
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
              className={`social-btn-fixed shape-${shape} size-${size} mode-${displayMode}`}
              style={{
                background: bgColor,
                color: textColor
              }}
              title={label}
            >
              {displayMode !== 'text_only' && (
                <SocialLucideIcon name={link.icon || 'FaShareNodes'} size={iconPixelSize} color={textColor} />
              )}
              {displayMode !== 'icon_only' && (
                <span className="social-btn-fixed-text">{label}</span>
              )}
            </motion.a>
          );
        })}
      </aside>
    );
  }

  // 2. INLINE VARIANT (Beside Hero Package Box)
  const inlineMobileClass = (mobileBehavior === 'auto_floating' || mobileBehavior === 'hidden')
    ? 'mobile-hide-inline'
    : '';

  return (
    <div className={`hero-social-inline-container ${inlineMobileClass} ${className}`}>
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
            className={`hero-social-btn-inline shape-${shape} size-${size} mode-${displayMode}`}
            style={{
              background: bgColor,
              color: textColor
            }}
            title={label}
          >
            {displayMode !== 'text_only' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: displayMode === 'icon_only' ? 'auto' : '20px',
                  height: displayMode === 'icon_only' ? 'auto' : '20px',
                  borderRadius: '4px',
                  background: displayMode === 'icon_only' ? 'transparent' : 'rgba(255, 255, 255, 0.18)',
                  flexShrink: 0
                }}
              >
                <SocialLucideIcon name={link.icon || 'FaShareNodes'} size={iconPixelSize} color={textColor} />
              </div>
            )}
            {displayMode !== 'icon_only' && (
              <span>{label}</span>
            )}
          </motion.a>
        );
      })}
    </div>
  );
}
