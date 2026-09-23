"use client";
import React from 'react';
import * as Fa6Icons from 'react-icons/fa6';
import * as SiIcons from 'react-icons/si';
import * as BsIcons from 'react-icons/bs';
import * as Io5Icons from 'react-icons/io5';
import * as MdIcons from 'react-icons/md';
import * as LuIcons from 'react-icons/lu';

/**
 * Dynamic Universal React-Icons Resolver
 * Just like Lucide, you can type ANY React-Icons name (e.g. FaFacebook, FaWhatsapp, SiTelegram, BsInstagram, LuPhone, etc.)
 * and it will automatically find and render that icon dynamically.
 */
export default function SocialLucideIcon({ name, size = 18, color, className = '', style = {} }) {
  if (!name || typeof name !== 'string') {
    const Fallback = Fa6Icons.FaShareNodes || LuIcons.LuShare2;
    return <Fallback size={size} color={color} className={className} style={style} />;
  }

  const raw = name.trim();

  // 1. Direct match by exact name in any React-Icons family
  let Component =
    Fa6Icons[raw] ||
    SiIcons[raw] ||
    BsIcons[raw] ||
    Io5Icons[raw] ||
    MdIcons[raw] ||
    LuIcons[raw];

  // 2. If user didn't write prefix (e.g. wrote "Whatsapp" or "Facebook" or "Phone")
  if (!Component) {
    const formatted = raw
      .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());

    // Try FontAwesome 6 (Fa), SimpleIcons (Si), Bootstrap (Bs), Lucide (Lu), Ionicons (Io), Material (Md)
    Component =
      Fa6Icons[`Fa${formatted}`] ||
      SiIcons[`Si${formatted}`] ||
      BsIcons[`Bs${formatted}`] ||
      LuIcons[`Lu${formatted}`] ||
      Io5Icons[`IoLogo${formatted}`] ||
      Io5Icons[`Io${formatted}`] ||
      MdIcons[`Md${formatted}`];
  }

  // 3. Lowercase-tolerant search across popular families if still not found
  if (!Component) {
    const lower = raw.toLowerCase().replace(/[-_ ]/g, '');
    const faKey = Object.keys(Fa6Icons).find((k) => k.toLowerCase() === lower || k.toLowerCase() === `fa${lower}`);
    if (faKey) Component = Fa6Icons[faKey];
    
    if (!Component) {
      const siKey = Object.keys(SiIcons).find((k) => k.toLowerCase() === lower || k.toLowerCase() === `si${lower}`);
      if (siKey) Component = SiIcons[siKey];
    }

    if (!Component) {
      const luKey = Object.keys(LuIcons).find((k) => k.toLowerCase() === lower || k.toLowerCase() === `lu${lower}`);
      if (luKey) Component = LuIcons[luKey];
    }
  }

  const FinalComponent = Component || Fa6Icons.FaShareNodes || LuIcons.LuShare2;

  return <FinalComponent size={size} color={color} className={className} style={style} />;
}
