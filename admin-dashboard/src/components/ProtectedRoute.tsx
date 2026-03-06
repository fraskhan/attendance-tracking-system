'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
    }
  }, [router]);

  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  return <>{children}</>;
}
