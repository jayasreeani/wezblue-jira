'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoginPage from '@/components/auth/LoginPage';

export default function LoginRoutePage() {
  const { isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  return <LoginPage />;
}
