'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import { Calendar, Video, Mail, User, Clock, Plus, ExternalLink } from 'lucide-react';

interface InterviewItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  hrEmail: string;
  userEmail: string;
  meetLink: string;
  status: string;
  candidate: {
    name: string;
    email: string;
    jobPosting: {
      title: string;
    }
  }
}

export default function InterviewList() {
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = () => {
    fetch('/api/interviews')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setInterviews(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--slate-gray)' }}>{t('common.loading')}</div>;
  }

  return (
    <div className="interviews-view animate-fade-in">
      <div className="flex-between page-title-section">
        <div>
          <div className="eyebrow">{t('common.interviews')}</div>
          <h2 className="section-title">Jadwal Wawancara</h2>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="card empty-card text-center">
          <Calendar size={48} className="empty-icon" />
          <h3>Belum ada jadwal wawancara</h3>
          <p>Anda dapat menjadwalkan wawancara langsung melalui profil kandidat yang lolos screening threshold.</p>
          <Link href="/admin/candidates" className="btn btn-primary btn-pill mt-4">
            Lihat Kandidat Lolos
          </Link>
        </div>
      ) : (
        <div className="interviews-grid">
          {interviews.map((item) => (
            <div key={item.id} className="card interview-card">
              <div className="interview-header-card">
                <span className="interview-job-lbl">{item.candidate.jobPosting.title}</span>
                <span className={`status-badge-inline status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <h3 className="interview-title-lbl">{item.title}</h3>
              
              <div className="interview-time-row">
                <div className="time-meta-item">
                  <Calendar size={16} />
                  <span>{item.date}</span>
                </div>
                <div className="time-meta-item">
                  <Clock size={16} />
                  <span>{item.time} ({item.duration} menit)</span>
                </div>
              </div>

              <div className="participants-box">
                <div className="participant-item">
                  <User size={14} className="icon-c" />
                  <span>Kandidat: <strong>{item.candidate.name}</strong> ({item.candidate.email})</span>
                </div>
                <div className="participant-item">
                  <User size={14} className="icon-h" />
                  <span>HR: <strong>{item.hrEmail}</strong></span>
                </div>
                <div className="participant-item">
                  <User size={14} className="icon-u" />
                  <span>User: <strong>{item.userEmail}</strong></span>
                </div>
              </div>

              {item.meetLink && (
                <a 
                  href={item.meetLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary meet-link-btn"
                >
                  <Video size={18} />
                  <span>Gabung Google Meet</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .interviews-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          font-size: 2.25rem;
          margin-top: 8px;
        }

        .interviews-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 900px) {
          .interviews-grid {
            grid-template-columns: 1fr;
          }
        }

        .interview-card {
          background-color: var(--white);
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .interview-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .interview-job-lbl {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--slate-gray);
          text-transform: uppercase;
        }

        .status-badge-inline {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-scheduled { background-color: rgba(243, 156, 18, 0.15); color: #d35400; }
        .status-completed { background-color: rgba(46, 204, 113, 0.15); color: #27ae60; }
        .status-cancelled { background-color: rgba(231, 76, 60, 0.15); color: #c0392b; }

        .interview-title-lbl {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--ink-black);
          letter-spacing: -0.01em;
        }

        .interview-time-row {
          display: flex;
          gap: 16px;
          border-bottom: 1px solid var(--dust-taupe);
          padding-bottom: 16px;
        }

        .time-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: var(--charcoal);
        }

        .participants-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: var(--canvas-cream);
          padding: 16px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--dust-taupe);
        }

        .participant-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--charcoal);
        }

        .icon-c { color: var(--primary); }
        .icon-h { color: var(--link-blue); }
        .icon-u { color: var(--primary-press); }

        .meet-link-btn {
          width: 100%;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
        }

        .empty-card {
          padding: 80px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background-color: var(--white);
        }

        .empty-icon {
          color: var(--slate-gray);
          opacity: 0.5;
        }

        .empty-card h3 {
          font-size: 1.5rem;
          margin-top: 8px;
        }

        .empty-card p {
          color: var(--slate-gray);
          max-width: 480px;
        }

        .mt-4 { margin-top: 16px; }

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
