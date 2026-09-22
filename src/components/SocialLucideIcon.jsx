"use client";
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Share2 } from 'lucide-react';

/**
 * Dynamically resolves and renders any Lucide icon by name with casing and naming tolerance.
 * Fallbacks cleanly to Share2 if the icon is not found.
 */
export default function SocialLucideIcon({ name, size = 18, color, className = '', style = {} }) {
  if (!name || typeof name !== 'string') {
    return <Share2 size={size} color={color} className={className} style={style} />;
  }

  const raw = name.trim();
  // Try exact match
  let Component = LucideIcons[raw];

  // Try PascalCase: e.g. "facebook" -> "Facebook", "message-circle" -> "MessageCircle", "x-circle" -> "XCircle"
  if (!Component) {
    const pascal = raw
      .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());
    Component = LucideIcons[pascal];
  }

  // Try lowercased lookup across all exports
  if (!Component) {
    const lower = raw.toLowerCase().replace(/[-_ ]/g, '');
    const foundKey = Object.keys(LucideIcons).find(
      (k) => k.toLowerCase() === lower || k.toLowerCase() === `${lower}icon`
    );
    if (foundKey) {
      Component = LucideIcons[foundKey];
    }
  }

  // Fallback icon
  const FinalComponent = Component || Share2;

  return <FinalComponent size={size} color={color} className={className} style={style} />;
}
