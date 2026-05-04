"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { SocketProvider } from '@/context/SocketContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Public route — no auth needed
    if (pathname === '/') {
      setReady(true);
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
      // Not logged in — send to login page
      router.replace('/');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  // Login page — no shell
  if (pathname === '/') {
    return <main>{children}</main>;
  }

  // Show nothing while checking auth to avoid flash
  if (!ready) return null;

  return (
    <SocketProvider>
      <Sidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}
