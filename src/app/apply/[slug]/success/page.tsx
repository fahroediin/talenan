'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

export default function ApplicationSuccess() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="success-page">
      <div className="success-card-container">
        <div className="card success-card text-center">
          <div className="brand-logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span className="brand-logo-text">Talenan</span>
          </div>

          <div className="check-icon-wrapper">
            <CheckCircle2 size={64} className="check-icon" />
          </div>

          <h2 className="success-title">Lamaran Berhasil Dikirim!</h2>
          <p className="success-desc">
            Terima kasih telah melamar. Lamaran Anda telah berhasil kami terima, dianalisis secara otomatis oleh sistem screening kami, dan diteruskan ke tim rekrutmen.
          </p>

          <p className="success-next-steps">
            Jika kualifikasi Anda sesuai dengan kebutuhan lowongan, tim kami akan segera menghubungi Anda melalui email untuk sesi wawancara.
          </p>

          <button onClick={() => router.push(`/apply/${slug}`)} className="btn btn-primary btn-pill return-btn">
            <span>Kembali ke Detail Lowongan</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--canvas-cream);
          padding: 24px;
        }

        .success-card-container {
          width: 100%;
          max-width: 560px;
        }

        .success-card {
          background-color: var(--white);
          padding: 60px 48px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .text-center {
          text-align: center;
        }

        .check-icon-wrapper {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: rgba(46, 204, 113, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px auto;
        }

        .check-icon {
          color: #2e7d32;
        }

        .success-title {
          font-size: 2rem;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          color: var(--ink-black);
        }

        .success-desc {
          color: var(--charcoal);
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .success-next-steps {
          color: var(--slate-gray);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 40px;
          padding: 16px;
          background-color: var(--canvas-cream);
          border-radius: var(--radius-md);
          border: 1px solid var(--dust-taupe);
        }

        .return-btn {
          margin: 0 auto;
          padding: 12px 32px;
        }
      `}</style>
    </div>
  );
}
