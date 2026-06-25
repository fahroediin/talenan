'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CalendarDays, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { name: t('common.dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('common.jobs'), path: '/admin/jobs', icon: Briefcase },
    { name: t('common.candidates'), path: '/admin/candidates', icon: Users },
    { name: t('common.interviews'), path: '/admin/interviews', icon: CalendarDays },
    { name: t('common.settings'), path: '/admin/settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-card">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="brand-logo-text">Talenan</span>
          </div>
          {onToggle && (
            <button onClick={onToggle} className="btn-collapse-sidebar" aria-label="Toggle Sidebar">
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    href={item.path} 
                    className={`nav-btn ${active ? 'nav-btn-active' : ''}`}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn-logout">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .sidebar-container {
          padding: 24px 0 24px 24px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          z-index: 100;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-container.collapsed {
          transform: translateX(-300px);
        }

        .sidebar-card {
          pointer-events: auto;
          background-color: var(--primary-deep);
          border-radius: var(--radius-lg);
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--primary-tint);
        }

        .sidebar-brand {
          margin-bottom: 24px;
          padding-left: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-collapse-sidebar {
          background: none;
          border: none;
          color: var(--dust-taupe);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: var(--radius-md);
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .btn-collapse-sidebar:hover {
          background-color: var(--primary-tint);
          color: var(--canvas-white);
        }

        .sidebar-brand :global(.brand-logo::before) {
          color: var(--canvas-cream);
        }
        
        .sidebar-brand :global(.brand-logo-text) {
          color: var(--canvas-white);
        }

        .sidebar-nav {
          flex: 1;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          color: var(--dust-taupe);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          color: var(--canvas-white);
          background-color: var(--primary-tint);
          opacity: 1;
        }

        .nav-btn-active {
          color: var(--canvas-white);
          background-color: var(--primary-press);
          opacity: 1;
        }
        .nav-btn-active:hover {
          color: var(--canvas-white);
          background-color: var(--primary-press);
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .sidebar-footer {
          border-top: 1px solid var(--primary-tint);
          padding-top: 24px;
        }

        .btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--dust-taupe);
          font-weight: 500;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-logout:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--canvas-white);
        }
      `}</style>
    </aside>
  );
}
