"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { updateAppMeta } from '../utils/meta.js';

interface CachedStoreData {
  groups: any[];
  categories: any[];
  settings: any;
  paymentMethods: any[];
  deliveryAreas: any[];
  defaultDeliveryFee: number;
  timestamp: number;
}

const CACHE_STORAGE_KEY = 'arot_store_cache_v1';
const DEDUPE_INTERVAL_MS = 5000; // 5 seconds deduplication window

let memoryCache: CachedStoreData | null = null;

const getInitialCache = (): CachedStoreData | null => {
  if (memoryCache && Array.isArray(memoryCache.categories) && memoryCache.categories.length > 0) {
    return memoryCache;
  }
  if (typeof window !== 'undefined') {
    try {
      // Check sessionStorage first for tab-scoped freshness
      const rawSession = sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          memoryCache = parsed;
          return parsed;
        }
      }
      // Fallback to localStorage for instant startup across sessions
      const rawLocal = localStorage.getItem(CACHE_STORAGE_KEY);
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          memoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      // Ignore parse or storage access errors
    }
  }
  return null;
};

const saveCache = (data: CachedStoreData) => {
  memoryCache = data;
  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(CACHE_STORAGE_KEY, serialized);
      localStorage.setItem(CACHE_STORAGE_KEY, serialized);
    } catch (e) {
      // Ignore storage quota errors
    }
  }
};

function hasDataChanged(prev: any, next: any): boolean {
  if (prev === next) return false;
  if (!prev && next) return true;
  if (prev && !next) return true;
  try {
    return JSON.stringify(prev) !== JSON.stringify(next);
  } catch {
    return true;
  }
}

interface StoreDataContextType {
  groups: any[];
  categories: any[];
  settings: any;
  paymentMethods: any[];
  deliveryAreas: any[];
  defaultDeliveryFee: number;
  loading: boolean;
  isRevalidating: boolean;
  activeGroupTab: string;
  setActiveGroupTab: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  lastOrder: any;
  setLastOrder: React.Dispatch<React.SetStateAction<any>>;
  activeGroups: any[];
  activeCategories: any[];
  fetchData: (force?: boolean) => Promise<void>;
  handleScrollToGroup: (groupKey: string) => void;
}

const StoreDataContext = createContext<StoreDataContextType | null>(null);

export function StoreDataProvider({ children }: { children: React.ReactNode }) {
  const initialCache = getInitialCache();

  // Initialize immediately from stale cache to render instantly without layout flashes
  const [groups, setGroups] = useState<any[]>(() => initialCache?.groups || []);
  const [categories, setCategories] = useState<any[]>(() => initialCache?.categories || []);
  const [settings, setSettings] = useState<any>(() => initialCache?.settings || null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>(() => initialCache?.paymentMethods || []);
  const [deliveryAreas, setDeliveryAreas] = useState<any[]>(() => initialCache?.deliveryAreas || []);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(() => initialCache?.defaultDeliveryFee ?? 60);

  // If we already have cached categories, loading is immediately false
  const [loading, setLoading] = useState<boolean>(() => !initialCache || !initialCache.categories?.length);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [activeGroupTab, setActiveGroupTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastOrder, setLastOrder] = useState<any>(null);

  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);

  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const paymentMethodsRef = useRef(paymentMethods);
  paymentMethodsRef.current = paymentMethods;
  const deliveryAreasRef = useRef(deliveryAreas);
  deliveryAreasRef.current = deliveryAreas;
  const defaultDeliveryFeeRef = useRef(defaultDeliveryFee);
  defaultDeliveryFeeRef.current = defaultDeliveryFee;

  // Stale-While-Revalidate fetch logic:
  // 1. If cached data is present, keep UI responsive and visible immediately (loading=false)
  // 2. Perform background revalidation fetch to get latest products, prices, and settings
  // 3. Only trigger component updates if newly fetched data is actually different
  const fetchData = useCallback(async (force: boolean = false) => {
    const now = Date.now();

    // Prevent overlapping parallel fetches
    if (isFetchingRef.current) {
      return;
    }

    // Deduplicate rapid consecutive revalidations unless forced (e.g. after admin update)
    if (!force && (now - lastFetchTimeRef.current < DEDUPE_INTERVAL_MS)) {
      return;
    }

    isFetchingRef.current = true;
    const hasExistingData = categoriesRef.current.length > 0 || groupsRef.current.length > 0;

    // If there is no existing data at all, show initial skeleton/loading
    if (!hasExistingData) {
      setLoading(true);
    } else {
      setIsRevalidating(true);
    }

    try {
      const [catRes, setRes, payRes, areaRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/settings'),
        fetch('/api/payment-methods'),
        fetch('/api/delivery-areas')
      ]);

      let newGroups = groupsRef.current;
      let newCategories = categoriesRef.current;
      let newSettings = settingsRef.current;
      let newPaymentMethods = paymentMethodsRef.current;
      let newDeliveryAreas = deliveryAreasRef.current;
      let newDeliveryFee = defaultDeliveryFeeRef.current;

      if (catRes.ok) {
        const data = await catRes.json();
        const fetchedGroups = Array.isArray(data.groups) ? data.groups : [];
        const fetchedCats = Array.isArray(data.categories) ? data.categories : [];

        if (fetchedCats.length > 0 || fetchedGroups.length > 0) {
          if (hasDataChanged(groupsRef.current, fetchedGroups)) {
            newGroups = fetchedGroups;
            setGroups(fetchedGroups);
          }
          if (hasDataChanged(categoriesRef.current, fetchedCats)) {
            newCategories = fetchedCats;
            setCategories(fetchedCats);
          }
        }
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData && typeof setData === 'object') {
          if (hasDataChanged(settingsRef.current, setData)) {
            newSettings = setData;
            setSettings(setData);
            updateAppMeta(setData);
          }
          if (typeof setData.default_delivery_fee === 'number' && defaultDeliveryFeeRef.current !== setData.default_delivery_fee) {
            newDeliveryFee = setData.default_delivery_fee;
            setDefaultDeliveryFee(setData.default_delivery_fee);
          }
        }
      }

      if (payRes.ok) {
        const payData = await payRes.json();
        if (Array.isArray(payData)) {
          if (hasDataChanged(paymentMethodsRef.current, payData)) {
            newPaymentMethods = payData;
            setPaymentMethods(payData);
          }
        }
      }

      if (areaRes.ok) {
        const areaData = await areaRes.json();
        if (areaData) {
          const areas = Array.isArray(areaData.areas) ? areaData.areas : [];
          if (hasDataChanged(deliveryAreasRef.current, areas)) {
            newDeliveryAreas = areas;
            setDeliveryAreas(areas);
          }
          if (typeof areaData.default_delivery_fee === 'number' && defaultDeliveryFeeRef.current !== areaData.default_delivery_fee) {
            newDeliveryFee = areaData.default_delivery_fee;
            setDefaultDeliveryFee(areaData.default_delivery_fee);
          }
        }
      }

      // Persist latest data to memoryCache and local/session storage
      saveCache({
        groups: newGroups,
        categories: newCategories,
        settings: newSettings,
        paymentMethods: newPaymentMethods,
        deliveryAreas: newDeliveryAreas,
        defaultDeliveryFee: newDeliveryFee,
        timestamp: Date.now()
      });

      lastFetchTimeRef.current = Date.now();
    } catch (err) {
      console.error('StoreDataContext stale-while-revalidate error:', err);
      // Even if network fails, existing cached data remains seamlessly available to the user
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setIsRevalidating(false);
    }
  }, []);

  // Initial background revalidation on mount
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Window visibility / focus revalidation: refresh in the background when returning to tab
  useEffect(() => {
    const handleRevalidate = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData(false);
      }
    };

    window.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);
    return () => {
      window.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
    };
  }, [fetchData]);

  useEffect(() => {
    if (settings) {
      updateAppMeta(settings);
    }
  }, [settings]);

  const activeGroups = useMemo(() => {
    return groups.filter((g) => g.is_active !== false);
  }, [groups]);

  const activeCategories = useMemo(() => {
    const activeGroupKeys = new Set(activeGroups.map((g) => g.key));
    return categories.filter((c) => activeGroupKeys.has(c.group));
  }, [activeGroups, categories]);

  const handleScrollToGroup = useCallback((groupKey: string) => {
    setActiveGroupTab(groupKey);
    const doScroll = () => {
      const el = document.getElementById(`group-${groupKey}`);
      if (el) {
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight : 110;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - (headerOffset + 14);

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    };

    if (window.location.pathname !== '/') {
      window.location.href = `/#group-${groupKey}`;
    } else {
      doScroll();
    }
  }, []);

  return (
    <StoreDataContext.Provider
      value={{
        groups,
        categories,
        settings,
        paymentMethods,
        deliveryAreas,
        defaultDeliveryFee,
        loading,
        isRevalidating,
        activeGroupTab,
        setActiveGroupTab,
        searchQuery,
        setSearchQuery,
        lastOrder,
        setLastOrder,
        activeGroups,
        activeCategories,
        fetchData,
        handleScrollToGroup
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within StoreDataProvider');
  }
  return context;
}
