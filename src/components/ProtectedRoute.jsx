"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ isAllowed, redirectPath, children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAllowed) {
      if (pathname !== redirectPath && pathname !== redirectPath + '/') {
        router.replace(redirectPath);
      }
    }
  }, [isAllowed, pathname, redirectPath, router]);

  if (!isAllowed && pathname !== redirectPath && pathname !== redirectPath + '/') {
    return null;
  }

  return <>{children}</>;
}
