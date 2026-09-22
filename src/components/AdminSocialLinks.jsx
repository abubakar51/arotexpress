"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali.js';
import SocialLucideIcon from './SocialLucideIcon.jsx';
import { useStoreData } from '../context/StoreDataContext';
import { useCart } from '../context/CartContext.jsx';

// Suggested popular icons & brand defaults
const POPULAR_SUGGESTIONS = [
  { name: 'Facebook', icon: 'Facebook', text: 'ফেসবুক পেজ', bg_color: '#1877F2', text_color: '#ffffff' },
  { name: 'WhatsApp', icon: 'MessageCircle', text: 'হোয়াটসঅ্যাপ মেসেজ', bg_color: '#25D366', text_color: '#ffffff' },
  { name: 'IMO', icon: 'PhoneCall', text: 'ইমো কল ও চ্যাট', bg_color: '#00A4E4', text_color: '#ffffff' },
  { name: 'Telegram', icon: 'Send', text: 'টেলিগ্রাম গ্রুপ', bg_color: '#229ED9', text_color: '#ffffff' },
  { name: 'YouTube', icon: 'Youtube', text: 'ইউটিউব চ্যানেল', bg_color: '#FF0000', text_color: '#ffffff' },
  { name: 'Instagram', icon: 'Instagram', text: 'ইনস্টাগ্রাম পেজ', bg_color: '#E4405F', text_color: '#ffffff' },
  { name: 'Help/Hotline', icon: 'Phone', text: 'জরুরি হেল্পলাইন', bg_color: '#006C4C', text_color: '#ffffff' }
];

export default function AdminSocialLinks({ adminToken }) {
  const { settings = {}, fetchData } = useStoreData();
  const { showToast } = useCart();

  // Local state for social links configuration
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialsPosition, setSocialsPosition] = useState('inline'); // 'inline' | 'fixed'
  const [socialsEnabled, setSocialsEnabled] = useState(true);

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    url: '',
    icon: 'Share2',
    bg_color: '#006C4C',
    text_color: '#FFFFFF',
    is_active: true
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hydrate from settings
  useEffect(() => {
    if (settings) {
      if (Array.isArray(settings.social_links)) {
        setSocialLinks(settings.social_links);
      } else {
        setSocialLinks([
          { id: 'soc-1', name: 'Facebook', text: 'ফেসবুক পেজ', url: 'https://facebook.com', icon: 'Facebook', bg_color: '#1877F2', text_color: '#FFFFFF', is_active: true },
          { id: 'soc-2', name: 'WhatsApp', text: 'হোয়াটসঅ্যাপ মেসেজ', url: 'https://wa.me/8801712345678', icon: 'MessageCircle', bg_color: '#25D366', text_color: '#FFFFFF', is_active: true }
        ]);
      }
      setSocialsPosition(settings.socials_position || 'inline');
      setSocialsEnabled(settings.socials_enabled !== false);
    }
  }, [settings]);

  // Open Form for Adding New Link
  const handleOpenAdd = () => {
    if (socialLinks.length >= 5) {
      showToast?.('সর্বোচ্চ ৫টি সোশ্যাল লিংক যুক্ত করা যাবে');
      return;
    }
    setEditingId(null);
    setFormData({
      name: '',
      text: '',
      url: '',
      icon: 'Share2',
      bg_color: '#006C4C',
      text_color: '#FFFFFF',
      is_active: true
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Link
  const handleOpenEdit = (link) => {
    setEditingId(link.id);
    setFormData({
      name: link.name || '',
      text: link.text || '',
      url: link.url || '',
      icon: link.icon || 'Share2',
      bg_color: link.bg_color || '#006C4C',
      text_color: link.text_color || '#FFFFFF',
      is_active: link.is_active !== false
    });
    setIsFormOpen(true);
  };

  // Apply Quick Suggestion Preset
  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      text: preset.text,
      icon: preset.icon,
      bg_color: preset.bg_color,
      text_color: preset.text_color
    }));
  };

  // Save Item to list (in memory)
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim() || !formData.url.trim()) {
      showToast?.('অনুগ্রহ করে নাম, বাটন টেক্সট ও লিংক পূরণ করুন');
      return;
    }

    if (editingId) {
      // Update
      setSocialLinks((prev) =>
        prev.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item))
      );
    } else {
      // Add
      if (socialLinks.length >= 5) {
        showToast?.('সর্বোচ্চ ৫টি লিংক যোগ করা সম্ভব');
        return;
      }
      const newId = `soc-${Date.now()}`;
      setSocialLinks((prev) => [...prev, { ...formData, id: newId }]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // Delete Link
  const handleDeleteLink = (id) => {
    if (window.confirm('আপনি কি এই সোশ্যাল লিংকটি মুছে ফেলতে চান?')) {
      setSocialLinks((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = (id) => {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_active: !item.is_active } : item))
    );
  };

  // Move Up/Down
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;
    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSocialLinks(updated);
  };

  // Save All Settings to Backend API
  const handleSaveToBackend = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        social_links: socialLinks,
        socials_position: socialsPosition,
        socials_enabled: socialsEnabled
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'সেভ করতে সমস্যা হয়েছে');
      }

      setSaveSuccess(true);
      showToast?.('সোশ্যাল লিংক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      fetchData(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      showToast?.(err.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div className="admin-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={20} color="var(--green)" />
              <span>সোশ্যাল লিংকস ও কুইক বাটন ব্যবস্থাপনা</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
              ওয়েবসাইটের হিরো প্যাকেজ বক্সের ডানপাশে বা স্ক্রিনের পাশে সোশ্যাল মিডিয়া ও হেল্পলাইন বাটন যোগ ও কাস্টমাইজ করুন (সর্বোচ্চ ৫টি)।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="admin-btn primary"
              onClick={handleOpenAdd}
              disabled={socialLinks.length >= 5}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: socialLinks.length >= 5 ? 0.6 : 1,
                cursor: socialLinks.length >= 5 ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={16} />
              <span>নতুন লিংক যোগ করুন ({toBengaliNumber(socialLinks.length)}/৫)</span>
            </button>

            <button
              type="button"
              className="admin-btn primary"
              onClick={handleSaveToBackend}
              disabled={saving}
              style={{
                background: saveSuccess ? '#16a34a' : '#006C4C',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? 'সংরক্ষণ হচ্ছে...' : saveSuccess ? '✓ সংরক্ষিত হয়েছে' : 'পরিবর্তন সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Settings & Links List + Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Display Settings & List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Display & Position Controls */}
          <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} color="var(--green)" />
              <span>বাটন প্রদর্শন সেটিংস ও পজিশন</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Enable Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--rule)' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>সোশ্যাল বাটন চালু রাখুন</span>
                <input
                  type="checkbox"
                  checked={socialsEnabled}
                  onChange={(e) => setSocialsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--green)', cursor: 'pointer' }}
                />
              </label>

              {/* Position Selection */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  বাটন প্রদর্শনের ধরন (পজিশন):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSocialsPosition('inline')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `2px solid ${socialsPosition === 'inline' ? 'var(--green)' : 'var(--rule)'}`,
                      background: socialsPosition === 'inline' ? 'rgba(0, 108, 76, 0.06)' : '#ffffff',
                      color: socialsPosition === 'inline' ? 'var(--green)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    হিরো বক্সের পাশে ইনলাইন (স্বাভাবিক)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialsPosition('fixed')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: `2px solid ${socialsPosition === 'fixed' ? 'var(--green)' : 'var(--rule)'}`,
                      background: socialsPosition === 'fixed' ? 'rgba(0, 108, 76, 0.06)' : '#ffffff',
                      color: socialsPosition === 'fixed' ? 'var(--green)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    স্ক্রিনের ডানপাশে ফ্লোটিং (ফিক্সড)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links List */}
          <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                সংযুক্ত সোশ্যাল লিংকসমূহ ({toBengaliNumber(socialLinks.length)}/৫)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                ড্র্যাগ বা তীর চিহ্ন দিয়ে ক্রম পরিবর্তন করুন
              </span>
            </div>

            {socialLinks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted)', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>এখনো কোনো সোশ্যাল লিংক যুক্ত করা হয়নি।</p>
                <button
                  type="button"
                  className="admin-btn primary"
                  onClick={handleOpenAdd}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  প্রথম লিংক যোগ করুন
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {socialLinks.map((link, idx) => (
                  <div
                    key={link.id || `admin-soc-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: link.is_active !== false ? '#ffffff' : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid var(--rule)',
                      gap: '10px',
                      opacity: link.is_active !== false ? 1 : 0.6
                    }}
                  >
                    {/* Visual Pill & Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: link.bg_color || '#006C4C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: link.text_color || '#ffffff',
                          flexShrink: 0
                        }}
                      >
                        <SocialLucideIcon name={link.icon} size={16} color={link.text_color || '#ffffff'} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{link.text || link.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>({link.name})</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.url}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        title="উপরে নিন"
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 0.8 }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === socialLinks.length - 1}
                        title="নিচে নিন"
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: idx === socialLinks.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === socialLinks.length - 1 ? 0.3 : 0.8 }}
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(link.id)}
                        title={link.is_active !== false ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: link.is_active !== false ? '#dcfce7' : '#fee2e2',
                          color: link.is_active !== false ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {link.is_active !== false ? 'সক্রিয়' : 'বন্ধ'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(link)}
                        title="সম্পাদনা"
                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', color: 'var(--ink)' }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.id)}
                        title="মুছুন"
                        style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', color: '#b91c1c' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Interactive Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-card" style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} color="var(--green)" />
              <span>লাইভ প্রিভিউ (ইউজারদের যেমন দেখাবে)</span>
            </h3>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--rule)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                position: 'relative'
              }}
            >
              {!socialsEnabled ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
                  সোশ্যাল বাটন বর্তমানে বন্ধ রয়েছে। চালু করতে উপরের সুইচ অন করুন।
                </div>
              ) : socialLinks.filter(l => l.is_active !== false).length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
                  কোনো সক্রিয় সোশ্যাল লিংক নেই।
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '2px' }}>
                    {socialsPosition === 'inline' ? 'হিরো বক্সের পাশে ইনলাইন লিস্ট' : 'স্ক্রিনে ফ্লোটিং প্যানেল'}
                  </div>

                  {socialLinks.filter(l => l.is_active !== false).map((link, idx) => (
                    <div
                      key={`prev-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: socialsPosition === 'fixed' ? '50px' : '8px',
                        background: link.bg_color || '#006C4C',
                        color: link.text_color || '#ffffff',
                        fontWeight: '600',
                        fontSize: '12.5px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <SocialLucideIcon name={link.icon} size={15} color={link.text_color || '#ffffff'} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.text || link.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} />
              <span>সকল পরিবর্তন সম্পন্ন হলে "পরিবর্তন সংরক্ষণ করুন" বাটনে ক্লিক করুন।</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal / Dialog for Add & Edit Social Link */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: '520px', width: '90%', padding: '24px', borderRadius: '12px' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--rule)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {editingId ? 'সোশ্যাল লিংক সম্পাদনা' : 'নতুন সোশ্যাল লিংক যোগ'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Presets */}
              {!editingId && (
                <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--rule)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} color="#f59e0b" />
                    <span>দ্রুত প্রিসেট বেছে নিন (ঐচ্ছিক):</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POPULAR_SUGGESTIONS.map((preset, idx) => (
                      <button
                        key={`preset-${idx}`}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: '1px solid var(--rule)',
                          background: '#ffffff',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <SocialLucideIcon name={preset.icon} size={11} color={preset.bg_color} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Link Name */}
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>লিংক নাম (Platform / Name)</label>
                  <input
                    type="text"
                    placeholder="যেমন: Facebook, WhatsApp, IMO"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '13px' }}
                  />
                </div>

                {/* Button Text (Bangla allowed) */}
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>বাটন টেক্সট (Button Text / Label)</label>
                  <input
                    type="text"
                    placeholder="যেমন: আমাদের ফেসবুক পেজ, হোয়াটসঅ্যাপে মেসেজ"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '13px' }}
                  />
                </div>

                {/* Link URL */}
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>লিংক URL (Link Address)</label>
                  <input
                    type="text"
                    placeholder="যেমন: https://facebook.com/myarot বা https://wa.me/88017..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '13px' }}
                  />
                </div>

                {/* React Icon Name */}
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>আইকন নাম (React Lucide Icon)</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>যেমন: Facebook, MessageCircle, Phone, Send, XCircle</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="যেমন: Facebook, MessageCircle, Phone, Send, XCircle"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      required
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '13px' }}
                    />
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        background: formData.bg_color || '#006C4C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="আইকন প্রিভিউ"
                    >
                      <SocialLucideIcon name={formData.icon} size={20} color={formData.text_color || '#ffffff'} />
                    </div>
                  </div>
                </div>

                {/* Color Selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* BG Color */}
                  <div className="field">
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>বাটন ব্যাকগ্রাউন্ড কালার</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={formData.bg_color}
                        onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                        style={{ width: '38px', height: '38px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={formData.bg_color}
                        onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="field">
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>টেক্সট কালার</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        style={{ width: '38px', height: '38px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--rule)', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => setIsFormOpen(false)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="admin-btn primary"
                    style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {editingId ? 'আপডেট করুন' : 'যুক্ত করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
