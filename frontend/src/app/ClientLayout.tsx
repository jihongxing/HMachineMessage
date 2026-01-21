'use client';

import { useEffect } from 'react';
import { initAntiDebug, preventCopy } from '@/lib/antiDebug';
import { useThemeStore } from '@/lib/theme';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ui/Toast';
import ModalContainer from '@/components/ui/Modal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
    initAntiDebug();
    preventCopy();
  }, [initTheme]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-8">
        {children}
      </main>
      <ToastContainer />
      <ModalContainer />
    </>
  );
}
