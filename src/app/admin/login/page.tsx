'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { Lock, Mail, ChevronRight, Globe } from 'lucide-react';

export default function AdminLogin() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState('admin@talenan.local');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/admin');
    }
  }, [session, router]);

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah!');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/admin' });
  };

  return (
    <div className="login-page pastel-mesh-bg">
      {/* Floating Language Switcher */}
      <div className="lang-switcher">
        <button 
          onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
          className="btn btn-secondary btn-pill"
          style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Globe size={14} />
          {locale === 'id' ? 'EN' : 'ID'}
        </button>
      </div>

      <div className="login-card-container">
        <div className="card login-card">
          <div className="brand-header">
            <div className="brand-logo">
              <span className="brand-logo-text">Talenan</span>
            </div>
            <div className="eyebrow login-eyebrow">RECRUITMENT SYSTEM</div>
          </div>

          <h2 className="login-title">Masuk ke Dashboard</h2>
          <p className="login-subtitle">Kelola proses seleksi CV dan wawancara kandidat secara otomatis.</p>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleDemoLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">{t('candidates.email')}</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? t('common.loading') : 'Masuk Demo Admin'}
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="divider">
            <span>atau</span>
          </div>

          <button onClick={handleGoogleLogin} className="btn btn-secondary google-login-btn">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.57 5.57 0 0 1 8.4 12.943a5.57 5.57 0 0 1 5.59-5.571c1.517 0 2.9.61 3.92 1.6l3.054-3.054A9.778 9.778 0 0 0 13.99 3.03a9.97 9.97 0 0 0-9.962 9.97 9.97 0 0 0 9.962 9.97c5.524 0 9.998-4.49 9.998-10.03 0-.61-.06-1.21-.163-1.8H12.24z"/>
            </svg>
            Masuk dengan Google
          </button>

          <div className="demo-credentials-info">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: <code>admin@talenan.local</code></p>
            <p>Password: <code>admin123</code></p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--canvas-cream);
          position: relative;
          overflow: hidden;
        }

        .lang-switcher {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
        }

        .login-card-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          padding: 24px;
        }

        .login-card {
          background-color: var(--canvas-white);
          border-radius: var(--radius-lg);
          padding: 48px;
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(20, 20, 19, 0.04);
        }

        .brand-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .brand-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -1px;
        }

        .login-eyebrow::before {
          display: none;
        }
        .login-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-gray);
          letter-spacing: 0.1em;
        }

        .login-title {
          font-size: 1.75rem;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          color: var(--slate-gray);
          font-size: 0.95rem;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-gray);
        }

        .input-with-icon .form-input {
          padding-left: 48px;
        }

        .login-btn {
          width: 100%;
          padding: 12px 24px;
          justify-content: space-between;
          margin-top: 8px;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--dust-taupe);
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--dust-taupe);
        }

        .divider span {
          padding: 0 10px;
          font-size: 0.85rem;
          color: var(--slate-gray);
        }

        .google-login-btn {
          width: 100%;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .google-icon {
          width: 18px;
          height: 18px;
        }

        .error-alert {
          background-color: rgba(231, 76, 60, 0.1);
          color: #c0392b;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-bottom: 24px;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }

        .demo-credentials-info {
          margin-top: 32px;
          padding: 16px;
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--charcoal);
          line-height: 1.6;
          border: 1px solid var(--dust-taupe);
        }
        
        .demo-credentials-info code {
          background: var(--white);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
