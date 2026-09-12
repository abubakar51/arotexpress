"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Customer Authentication state (stored in arot_customer_token)
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('arot_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('arot_customer_token') || null;
  });

  // Admin Authentication state (strictly separated in arot_admin_token)
  const [adminUser, setAdminUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('arot_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('arot_admin_token') || null;
  });

  const [customerLoading, setCustomerLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('arot_customer_token');
  });
  const [adminLoading, setAdminLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('arot_admin_token');
  });
  const loading = customerLoading || adminLoading;

  const [isChecking, setIsChecking] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('arot_customer_token') || !!localStorage.getItem('arot_admin_token');
  });

  useEffect(() => {
    if (!customerLoading && !adminLoading) {
      setIsChecking(false);
    }
  }, [customerLoading, adminLoading]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  // Hydrate Customer User
  useEffect(() => {
    if (token) {
      setCustomerLoading(true);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              throw new Error('AUTH_FAILED');
            }
            throw new Error('NETWORK_ERROR');
          }
          return res.json();
        })
        .then(data => {
          if (data.user?.role !== 'admin') {
            setUser(data.user);
            localStorage.setItem('arot_customer_user', JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem('arot_customer_user');
          }
        })
        .catch((err) => {
          if (err.message === 'AUTH_FAILED') {
            localStorage.removeItem('arot_customer_token');
            localStorage.removeItem('arot_customer_user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setCustomerLoading(false));
    } else {
      setUser(null);
      setCustomerLoading(false);
    }
  }, [token]);

  // Hydrate Admin User
  useEffect(() => {
    if (adminToken) {
      setAdminLoading(true);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              throw new Error('AUTH_FAILED');
            }
            throw new Error('NETWORK_ERROR');
          }
          return res.json();
        })
        .then(data => {
          if (data.user?.role === 'admin') {
            setAdminUser(data.user);
            localStorage.setItem('arot_admin_user', JSON.stringify(data.user));
          } else {
            setAdminUser(null);
            localStorage.removeItem('arot_admin_user');
          }
        })
        .catch((err) => {
          if (err.message === 'AUTH_FAILED') {
            localStorage.removeItem('arot_admin_token');
            localStorage.removeItem('arot_admin_user');
            setAdminToken(null);
            setAdminUser(null);
          }
        })
        .finally(() => setAdminLoading(false));
    } else {
      setAdminUser(null);
      setAdminLoading(false);
    }
  }, [adminToken]);

  // Customer Login (Never logs into admin panel)
  const login = async (phone, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে');
    }
    localStorage.setItem('arot_customer_token', data.token);
    localStorage.setItem('arot_customer_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setAuthModalOpen(false);
    if (postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
    return data.user;
  };

  // Dedicated Admin Login (Never logs into customer frontend)
  const adminLogin = async (username, password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে');
    }
    localStorage.setItem('arot_admin_token', data.token);
    localStorage.setItem('arot_admin_user', JSON.stringify(data.user));
    setAdminToken(data.token);
    setAdminUser(data.user);
    return data.user;
  };

  // Customer Register
  const register = async (name, phone, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'নিবন্ধন ব্যর্থ হয়েছে');
    }
    localStorage.setItem('arot_customer_token', data.token);
    localStorage.setItem('arot_customer_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setAuthModalOpen(false);
    if (postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
    return data.user;
  };

  // Update Customer Profile
  const updateProfile = async (updates) => {
    const res = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে');
    }
    if (data.token) {
      localStorage.setItem('arot_customer_token', data.token);
      setToken(data.token);
    }
    localStorage.setItem('arot_customer_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Update Admin Profile
  const updateAdminProfile = async (updates) => {
    const res = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'অ্যাডমিন প্রোফাইল আপডেট ব্যর্থ হয়েছে');
    }
    if (data.token) {
      localStorage.setItem('arot_admin_token', data.token);
      setAdminToken(data.token);
    }
    localStorage.setItem('arot_admin_user', JSON.stringify(data.user));
    setAdminUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('arot_customer_token');
    localStorage.removeItem('arot_customer_user');
    setToken(null);
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('arot_admin_token');
    localStorage.removeItem('arot_admin_user');
    setAdminToken(null);
    setAdminUser(null);
  };

  const openAuthModal = (tab = 'login', callback = null) => {
    setAuthModalTab(tab);
    setPostAuthCallback(() => callback);
    setAuthModalOpen(true);
  };

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fcfcfc' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(22, 163, 74, 0.2)', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        // Customer auth
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        // Admin auth (completely isolated)
        adminUser,
        adminToken,
        adminLogin,
        adminLogout,
        updateAdminProfile,
        // Common
        loading,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

