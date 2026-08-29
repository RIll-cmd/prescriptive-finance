'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 select-none">
      <div className="w-9 h-9 rounded-full border-2 border-[#C57CF9]/20 border-t-[#C57CF9] animate-spin" />
      <span className="text-[0.8rem] text-white/40 font-medium tracking-wide">
        Initializing Financial OS...
      </span>
    </div>
  );
}
