"use client";
import React, { useState } from 'react';
import {
  User,
  KeyRound,
  Bike,
  MapPin,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock
} from 'lucide-react';

export default function DeliveryRiderProfile({
  rider,
  onUpdateProfile,
  onChangePassword,
  showToast
}) {
  // Profile edit form
  const [name, setName] = useState(rider?.name || '');
  const [vehicle, setVehicle] = useState(rider?.vehicle || 'মোটরসাইকেল');
  const [address, setAddress] = useState(rider?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await onUpdateProfile({ name, vehicle, address });
      showToast?.('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে');
    } catch (err) {
      showToast?.(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) {
      setPassError('বর্তমান পাসওয়ার্ড প্রদান করুন');
      return;
    }
    if (newPassword.length < 4) {
      setPassError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('নতুন পাসওয়ার্ড দুটি মিলছে না');
      return;
    }

    setSavingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setPassSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast?.('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে');
    } catch (err) {
      setPassError(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="rider-profile-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      
      {/* Rider Account Overview & Edit */}
      <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--rule)', paddingBottom: '12px' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '50%' }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>রাইডার তথ্য ও প্রোফাইল</h3>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>আপনার ব্যক্তিগত ও গাড়ির বিবরণ</span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              রাইডারের পুরো নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              মোবাইল নম্বর (লগইন ইউজারনেম)
            </label>
            <input
              type="text"
              value={rider?.phone || ''}
              disabled
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)', background: '#f8fafc', color: 'var(--muted)', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
              মোবাইল নম্বর পরিবর্তনের জন্য প্রধান অ্যাডমিনের সাথে যোগাযোগ করুন।
            </span>
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              বাহনের ধরন
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)', background: '#ffffff' }}
            >
              <option value="মোটরসাইকেল">মোটরসাইকেল</option>
              <option value="সাইকেল">সাইকেল</option>
              <option value="ভ্যান / পিকআপ">ভ্যান / পিকআপ</option>
              <option value="সিএনজি / অটো">সিএনজি / অটো</option>
              <option value="পায়ে হেঁটে">পায়ে হেঁটে</option>
            </select>
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              অ্যাসাইন করা ডেলিভারি এলাকা
            </label>
            <input
              type="text"
              value={rider?.area || ''}
              disabled
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)', background: '#f8fafc', color: 'var(--muted)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              বর্তমান ঠিকানা
            </label>
            <input
              type="text"
              placeholder="বাসা / রোড / এলাকা..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          </div>

          <button
            type="submit"
            className="admin-btn primary"
            disabled={savingProfile}
            style={{ marginTop: '8px', padding: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Save size={15} />
            <span>{savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সংরক্ষণ করুন'}</span>
          </button>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--rule)', paddingBottom: '12px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '50%' }}>
            <KeyRound size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>লগইন পাসওয়ার্ড পরিবর্তন</h3>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন</span>
          </div>
        </div>

        {passError && (
          <div style={{ padding: '10px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <AlertCircle size={15} />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div style={{ padding: '10px 12px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <CheckCircle2 size={15} />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              বর্তমান পাসওয়ার্ড *
            </label>
            <input
              type="password"
              placeholder="বর্তমান পাসওয়ার্ড লিখুন (ডিফল্ট: 123456)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              নতুন পাসওয়ার্ড *
            </label>
            <input
              type="password"
              placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          </div>

          <div className="field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              নতুন পাসওয়ার্ড পুনরায় লিখুন *
            </label>
            <input
              type="password"
              placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          </div>

          <button
            type="submit"
            className="admin-btn primary"
            disabled={savingPassword}
            style={{ marginTop: '8px', padding: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2563eb', borderColor: '#2563eb' }}
          >
            <Lock size={15} />
            <span>{savingPassword ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
