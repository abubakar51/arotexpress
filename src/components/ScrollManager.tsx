"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollManager() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // 1. Keep tracking scroll position for every path
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Don't save scroll 0 when on category modal or when body is locked
          if (document.body.style.overflow !== 'hidden' || window.scrollY > 0) {
            sessionStorage.setItem('scroll_pos_' + window.location.pathname, window.scrollY.toString());
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Restore scroll position smoothly upon navigating back to home from category
  useEffect(() => {
    const fromPath = prevPathname.current;
    const toPath = pathname;
    prevPathname.current = pathname;

    // If navigating between home ('/') and category ('/category/...'), restore home scroll position
    if (toPath === '/' && fromPath.startsWith('/category/')) {
      const savedPos = sessionStorage.getItem('scroll_pos_/');
      if (savedPos !== null) {
        const targetScroll = parseInt(savedPos, 10);
        // Instant restore + micro delay to ensure dynamic layout DOM height is ready
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
        const t1 = setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }, 30);
        const t2 = setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }, 120);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    } else if (toPath === '/') {
      const savedPos = sessionStorage.getItem('scroll_pos_/');
      if (savedPos !== null && window.location.hash === '') {
        const targetScroll = parseInt(savedPos, 10);
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
      }
    } else if (toPath !== '/' && !toPath.startsWith('/category/')) {
      // For completely new full pages (like /checkout, /admin, /profile), scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}
