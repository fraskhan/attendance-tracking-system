'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && (!isAuthenticated() || !isAdmin())) {
      router.push('/');
    }
  }, [router, isClient]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  return <>{children}</>;
}
