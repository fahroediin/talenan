'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Briefcase, Users, Calendar, Award, ChevronRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  totalInterviews: number;
  avgScore: number;
  recentCandidates: Array<{
    id: string;
    name: string;
    email: string;
    score: number;
    status: string;
    createdAt: string;
    jobPosting: {
      title: string;
    }
  }>;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  const statCards = [
    { title: t('dashboard.totalJobs'), val: stats?.totalJobs || 0, icon: Briefcase, color: 'var(--primary)', link: '/admin/jobs' },
    { title: t('dashboard.activeCandidates'), val: stats?.totalCandidates || 0, icon: Users, color: 'var(--primary-tint)', link: '/admin/candidates' },
    { title: t('dashboard.upcomingInterviews'), val: stats?.totalInterviews || 0, icon: Calendar, color: 'var(--link-blue)', link: '/admin/interviews' },
    { title: t('dashboard.averageScore'), val: `${stats?.avgScore || 0}%`, icon: Award, color: 'var(--semantic-success)', link: '#' },
  ];

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="page-title-section">
        <div className="eyebrow">{t('common.dashboard')}</div>
        <h2 className="section-title">Ringkasan Rekrutmen</h2>
      </div>

      {/* Grid Stats */}
      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card stat-card card-lifted">
              <div className="stat-icon-wrapper" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{card.val}</span>
                <span className="stat-title">{card.title}</span>
              </div>
              {card.link !== '#' && (
                <Link href={card.link} className="stat-arrow">
                  <ArrowUpRight size={18} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="dashboard-content-grid">
        {/* Recent Applications Card */}
        <div className="card recent-app-card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.recentApplications')}</h3>
            <Link href="/admin/candidates" className="btn btn-secondary btn-pill text-sm">
              Lihat Semua
            </Link>
          </div>

          <div className="recent-list">
            {!stats?.recentCandidates || stats.recentCandidates.length === 0 ? (
              <div className="empty-state">Belum ada lamaran masuk.</div>
            ) : (
              stats.recentCandidates.map((candidate) => (
                <div key={candidate.id} className="recent-item">
                  <div className="recent-info">
                    <span className="candidate-name">{candidate.name}</span>
                    <span className="candidate-job">{candidate.jobPosting.title}</span>
                  </div>
                  <div className="recent-meta">
                    <span className="score-badge" style={{ 
                      backgroundColor: candidate.score >= 70 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(211, 84, 0, 0.1)',
                      color: candidate.score >= 70 ? '#27ae60' : '#d35400'
                    }}>
                      Skor: {Math.round(candidate.score)}%
                    </span>
                    <span className={`status-badge-inline status-${candidate.status.toLowerCase()}`}>
                      {t(`candidates.${candidate.status.toLowerCase()}`)}
                    </span>
                    <Link href={`/admin/candidates/${candidate.id}`} className="view-details-arrow">
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info card (Slack branding signature) */}
        <div className="card promo-card">
          <div className="brand-logo-backdrop"></div>
          
          <div className="promo-content">
            <div className="eyebrow" style={{ color: '#FFFFFF' }}>FITUR UNGGULAN</div>
            <h3 className="promo-title">Otomatisasi Seleksi CV</h3>
            <p className="promo-text">
              Unggah CV dalam format PDF atau Gambar, sistem kami menggunakan OCR untuk mengekstrak data kandidat, menyaring sesuai requirement lowongan, dan memberikan rekomendasi interview secara instan.
            </p>
            <div className="promo-actions">
              <Link href="/admin/jobs/new" className="btn btn-secondary btn-pill">
                Buat Lowongan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .section-title {
          font-size: 2.25rem;
          margin-top: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--ink-black);
          line-height: 1.1;
        }

        .stat-title {
          font-size: 0.9rem;
          color: var(--slate-gray);
          font-weight: 500;
        }

        .stat-arrow {
          position: absolute;
          top: 24px;
          right: 24px;
          color: var(--slate-gray);
          transition: color 0.2s ease;
        }
        .stat-arrow:hover {
          color: var(--primary);
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .recent-app-card {
          background-color: var(--white);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--dust-taupe);
        }
        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-info {
          display: flex;
          flex-direction: column;
        }

        .candidate-name {
          font-weight: 700;
          color: var(--ink-black);
        }

        .candidate-job {
          font-size: 0.85rem;
          color: var(--slate-gray);
        }

        .recent-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .score-badge {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Inherits unified status badges from globals.css */

        .view-details-arrow {
          color: var(--slate-gray);
          display: flex;
          align-items: center;
        }
        .view-details-arrow:hover {
          color: var(--primary);
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--slate-gray);
        }

        /* Promo / Info Card */
        .promo-card {
          background-color: var(--primary);
          color: var(--canvas-white);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid var(--primary-tint);
        }

        .brand-logo-backdrop {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 140px;
          height: 140px;
          background-color: var(--primary-press);
          border-radius: var(--radius-xl);
          opacity: 0.4;
          transform: rotate(15deg);
          pointer-events: none;
          z-index: 1;
        }

        .promo-content {
          position: relative;
          z-index: 2;
        }

        .promo-title {
          color: var(--canvas-cream);
          font-size: 2rem;
          margin-top: 12px;
          margin-bottom: 16px;
        }

        .promo-text {
          color: var(--granite);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
