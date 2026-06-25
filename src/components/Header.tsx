'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n';
import { Globe, User, Menu } from 'lucide-react';

export default function Header({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const { data: session } = useSession();
  const { locale, setLocale } = useLanguage();

  return (
    <header className={`header-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="header-card">
        <div className="header-left">
          {onToggle && (
            <button onClick={onToggle} className="btn-toggle-sidebar" aria-label="Toggle Sidebar">
              <Menu size={20} />
            </button>
          )}
          <span className="welcome-text">
            Halo, <strong>{session?.user?.name || 'Administrator'}</strong>
          </span>
        </div>
        <div className="header-right">
          {/* Language selection toggles */}
          <button 
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="btn btn-secondary btn-pill lang-btn"
          >
            <Globe size={16} />
            <span>{locale === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
          </button>

          {/* User profile info */}
          <div className="user-profile">
            {session?.user?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                <User size={18} />
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{session?.user?.name || 'HR Admin'}</span>
              <span className="user-role">Recruiter</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header-container {
          padding: 24px 24px 0 304px; /* offset sidebar width */
          width: 100%;
          z-index: 90;
          transition: padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-container.collapsed {
          padding-left: 24px;
        }

        .header-card {
          background-color: var(--canvas-white);
          border-radius: var(--radius-full);
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(20, 20, 19, 0.04);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-toggle-sidebar {
          background: none;
          border: none;
          color: var(--slate-gray);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: var(--radius-md);
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .btn-toggle-sidebar:hover {
          background-color: var(--canvas-lavender);
          color: var(--primary);
        }

        .welcome-text {
          font-size: 1.05rem;
          color: var(--charcoal);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .lang-btn {
          padding: 6px 18px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 1px solid var(--dust-taupe);
          padding-left: 24px;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--dust-taupe);
        }

        .user-avatar-placeholder {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: var(--canvas-cream);
          color: var(--slate-gray);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--dust-taupe);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink-black);
          line-height: 1.2;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--slate-gray);
        }
      `}</style>
    </header>
  );
}
