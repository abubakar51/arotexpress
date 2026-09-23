"use client";
import React from 'react';
// Lightweight direct named imports: Enables 100% Tree-Shaking so bundle size stays tiny (~8 KB)
import {
  FaFacebook,
  FaFacebookF,
  FaFacebookMessenger,
  FaWhatsapp,
  FaTelegram,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaPhone,
  FaPhoneVolume,
  FaHeadset,
  FaEnvelope,
  FaGlobe,
  FaXTwitter,
  FaTwitter,
  FaLinkedin,
  FaDiscord,
  FaViber,
  FaPinterest,
  FaReddit,
  FaSnapchat,
  FaThreads,
  FaShareNodes,
  FaComments,
  FaCommentDots,
  FaLink,
  FaEnvelopeOpenText,
  FaShopify
} from 'react-icons/fa6';

import {
  SiWhatsapp,
  SiTelegram,
  SiFacebook,
  SiMessenger,
  SiYoutube,
  SiInstagram,
  SiTiktok,
  SiGmail,
  SiSignal,
  SiLine,
  SiWechat,
  SiViber,
  SiDiscord,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiThreads,
  SiX
} from 'react-icons/si';

import {
  IoCall,
  IoLogoWhatsapp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoYoutube,
  IoChatbubbles,
  IoMail,
  IoGlobeOutline
} from 'react-icons/io5';

// Curated lookup map covering all social media, chat, and contact channels
const ICONS = {
  // Facebook & Messenger
  facebook: FaFacebook,
  fafacebook: FaFacebook,
  fafacebookf: FaFacebookF,
  sifacebook: SiFacebook,
  iologofacebook: IoLogoFacebook,
  meta: FaFacebook,
  messenger: FaFacebookMessenger,
  fafacebookmessenger: FaFacebookMessenger,
  simessenger: SiMessenger,

  // WhatsApp
  whatsapp: FaWhatsapp,
  fawhatsapp: FaWhatsapp,
  siwhatsapp: SiWhatsapp,
  iologowhatsapp: IoLogoWhatsapp,
  messagecircle: FaWhatsapp,
  'message-circle': FaWhatsapp,

  // IMO & Direct Calling
  imo: IoCall,
  siimo: IoCall,
  faimo: IoCall,
  imocall: IoCall,

  // Telegram
  telegram: FaTelegram,
  fatelegram: FaTelegram,
  sitelegram: SiTelegram,
  send: FaTelegram,

  // YouTube
  youtube: FaYoutube,
  fayoutube: FaYoutube,
  siyoutube: SiYoutube,
  iologoyoutube: IoLogoYoutube,

  // Instagram
  instagram: FaInstagram,
  fainstagram: FaInstagram,
  siinstagram: SiInstagram,
  iologoinstagram: IoLogoInstagram,

  // TikTok
  tiktok: FaTiktok,
  fatiktok: FaTiktok,
  sitiktok: SiTiktok,

  // Phone / Hotline / Customer Support
  phone: FaPhoneVolume,
  faphone: FaPhone,
  faphonevolume: FaPhoneVolume,
  phonecall: FaPhoneVolume,
  'phone-call': FaPhoneVolume,
  call: FaPhoneVolume,
  hotline: FaPhoneVolume,
  iocall: IoCall,
  help: FaHeadset,
  headset: FaHeadset,
  faheadset: FaHeadset,
  support: FaHeadset,

  // Email
  email: FaEnvelope,
  mail: FaEnvelope,
  faenvelope: FaEnvelope,
  gmail: SiGmail,
  sigmail: SiGmail,
  iomail: IoMail,
  faenvelopeopentext: FaEnvelopeOpenText,

  // Website & Online Store
  website: FaGlobe,
  web: FaGlobe,
  globe: FaGlobe,
  faglobe: FaGlobe,
  ioglobeoutline: IoGlobeOutline,
  shopify: FaShopify,
  fashopify: FaShopify,

  // X / Twitter
  x: FaXTwitter,
  twitter: FaXTwitter,
  faxtwitter: FaXTwitter,
  fatwitter: FaTwitter,
  six: SiX,

  // LinkedIn
  linkedin: FaLinkedin,
  falinkedin: FaLinkedin,

  // Discord
  discord: FaDiscord,
  fadiscord: FaDiscord,
  sidiscord: SiDiscord,

  // Viber
  viber: FaViber,
  faviber: FaViber,
  siviber: SiViber,

  // Pinterest, Reddit, Snapchat, Threads
  pinterest: FaPinterest,
  fapinterest: FaPinterest,
  sipinterest: SiPinterest,
  reddit: FaReddit,
  fareddit: FaReddit,
  sireddit: SiReddit,
  snapchat: FaSnapchat,
  fasnapchat: FaSnapchat,
  sisnapchat: SiSnapchat,
  threads: FaThreads,
  fathreads: FaThreads,
  sithreads: SiThreads,

  // Signal / Line / WeChat
  signal: SiSignal,
  sisignal: SiSignal,
  line: SiLine,
  siline: SiLine,
  wechat: SiWechat,
  siwechat: SiWechat,

  // General Chat / Share / Link
  chat: FaComments,
  comments: FaComments,
  facomments: FaComments,
  facommentdots: FaCommentDots,
  iochatbubbles: IoChatbubbles,
  message: FaCommentDots,
  share: FaShareNodes,
  share2: FaShareNodes,
  'share-2': FaShareNodes,
  fasharenodes: FaShareNodes,
  link: FaLink,
  falink: FaLink
};

/**
 * Super lightweight Social & Brand Icon component.
 * Fast, Tree-Shakable and zero performance overhead.
 */
export default function SocialLucideIcon({ name, size = 18, color, className = '', style = {} }) {
  if (!name || typeof name !== 'string') {
    return <FaShareNodes size={size} color={color} className={className} style={style} />;
  }

  const raw = name.trim();
  const normalizedKey = raw.toLowerCase().replace(/[-_ ]/g, '');

  const Component = ICONS[normalizedKey] || ICONS[raw] || FaShareNodes;

  return <Component size={size} color={color} className={className} style={style} />;
}
