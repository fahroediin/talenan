'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  // If loading, show the custom loading screen
  if (status === 'loading') {
    return (
      <div className="admin-loading-screen">
        <div className="brand-logo scale-up">
          <span className="brand-logo-text">Talenan</span>
        </div>
        <span className="loading-text">Memuat Sistem Talenan...</span>
        <style jsx>{`
          .admin-loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--canvas-cream);
            gap: 16px;
          }
          .scale-up {
            transform: scale(2);
            margin-bottom: 24px;
          }
          .loading-text {
            color: var(--slate-gray);
            font-size: 1.1rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Bypass layout wraps for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For other routes, block access if not logged in
  if (!session) {
    return null; // redirecting in useEffect
  }

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="admin-main-wrapper">
        <Header isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="admin-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background-color: var(--canvas-cream);
        }

        .admin-main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-content {
          padding: 24px 24px 48px 304px; /* account for sidebar width */
          flex: 1;
          transition: padding-left 0.25s ease;
        }

        .admin-layout.sidebar-collapsed .admin-content {
          padding-left: 24px;
        }
      `}</style>
    </div>
  );
}
